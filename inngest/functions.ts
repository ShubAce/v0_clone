import { inngest } from "./client";
import { gemini, createAgent, createTool, createNetwork } from "@inngest/agent-kit";
import Sandbox from "@e2b/code-interpreter";
import z from "zod";
import { PROMPT } from "@/prompt";
import { lastAssistantTextMessageContent } from "./utils";
import db from "@/lib/db";
import { MessageRole, MessageType } from "@/src/generated/enums";

const buildRecoveryPrompt = (value: unknown) => {
	const basePrompt = typeof value === "string" ? value : JSON.stringify(value);

	return `${basePrompt}

CRITICAL: Your previous response did not produce a valid completion.
Use native tool calls only with strict JSON arguments matching the tool schemas.
Do not output pseudo tool calls as text.`;
};

export const codeAgentFunction = inngest.createFunction(
	{ id: "code-agent" },
	{ event: "agent-code/run" },

	async ({ event, step }) => {
		// Step 1: create sandbox and get its ID
		const sandboxId = await step.run("get-sandbox-id", async () => {
			const sandbox = await Sandbox.create("shubhamsuman2005/we-build");
			return sandbox.sandboxId;
		});

		const codeAgent = createAgent({
			name: "Code Agent",
			description: "An expert coding Agent that can write and execute code in a sandbox environment.",
			system: PROMPT,
			model: gemini({
				model: "gemini-2.5-flash", // use a verified stable model ID
				defaultParameters: {
					generationConfig: {
						temperature: 0.2,
					},
				},
			}),
			tools: [
				// ─── terminal ─────────────────────────────────────────────────────────
				createTool({
					name: "terminal",
					description: "Use the terminal to run commands",
					parameters: z.object({
						command: z.string(),
					}),
					// Use the outer `step` from inngest.createFunction — NOT the one
					// destructured from the tool handler context (that one can be undefined).
					handler: async ({ command }) => {
						return await step.run("terminal", async () => {
							const buffers = { stdout: "", stderr: "" };

							try {
								const sandbox = await Sandbox.connect(sandboxId);
								const safeCommand = `export PNPM_STORE_DIR=/pnpm/store; pnpm config set store-dir /pnpm/store --global >/dev/null 2>&1 || true; ${command}`;

								let result = await sandbox.commands.run(safeCommand, {
									cwd: "/home/user",
									onStdout: (data) => {
										buffers.stdout += data;
									},
									onStderr: (data) => {
										buffers.stderr += data;
									},
								});

								const combinedOutput = `${result.stdout || ""}\n${result.stderr || ""}`;

								if (combinedOutput.includes("ERR_PNPM_UNEXPECTED_STORE")) {
									buffers.stdout = "";
									buffers.stderr = "";
									const repairAndRetry = `export PNPM_STORE_DIR=/pnpm/store; pnpm config set store-dir /pnpm/store --global; pnpm install; ${command}`;
									result = await sandbox.commands.run(repairAndRetry, {
										cwd: "/home/user",
										onStdout: (data) => {
											buffers.stdout += data;
										},
										onStderr: (data) => {
											buffers.stderr += data;
										},
									});
								}

								// stdout can be empty even on success — fall back to buffer
								return result.stdout || buffers.stdout || "(no output)";
							} catch (err) {
								console.error(`Command failed: ${err}`);
								return `Command failed: ${err}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
							}
						});
					},
				}),

				// ─── createOrUpdateFiles ───────────────────────────────────────────────
				createTool({
					name: "createOrUpdateFiles",
					description: "Create or update files in the sandbox. If a file already exists it will be overwritten.",
					parameters: z.object({
						files: z.array(
							z.object({
								path: z.string(),
								content: z.string(),
							}),
						),
					}),
					handler: async ({ files }, { network }) => {
						const updatedFiles = await step.run("createOrUpdateFiles", async () => {
							try {
								// Guard: network.state.data may not be initialised yet
								const existingFiles: Record<string, string> = (network?.state?.data?.files as Record<string, string>) ?? {};

								const sandbox = await Sandbox.connect(sandboxId);

								// Write every requested file
								for (const file of files) {
									const absolutePath = file.path.startsWith("/") ? file.path : `/home/user/${file.path}`;
									await sandbox.files.write(absolutePath, file.content);
									existingFiles[file.path] = file.content;
								}

								return existingFiles;
							} catch (err) {
								console.error(`Failed to create or update files: ${err}`);
								return null;
							}
						});

						// Persist updated file map back into network state
						if (updatedFiles && network) {
							if (!network.state.data) network.state.data = {};
							network.state.data.files = updatedFiles;
						}

						// Always return a string — models need a result to continue reasoning
						return updatedFiles
							? `Successfully wrote ${files.length} file(s): ${files.map((f) => f.path).join(", ")}`
							: "Error: failed to write one or more files.";
					},
				}),

				// ─── readFiles ─────────────────────────────────────────────────────────
				createTool({
					name: "readFiles",
					description: "Read files from the sandbox.",
					parameters: z.object({
						files: z.array(z.string()),
					}),
					handler: async ({ files }) => {
						return await step.run("readFiles", async () => {
							try {
								const sandbox = await Sandbox.connect(sandboxId);
								const contents: { path: string; content: string }[] = [];

								for (const file of files) {
									const content = await sandbox.files.read(file);
									contents.push({ path: file, content });
								}

								return JSON.stringify(contents);
							} catch (err) {
								console.error(`Failed to read files: ${err}`);
								return `Error: Failed to read files: ${err}`;
							}
						});
					},
				}),
			],

			lifecycle: {
				onResponse: async ({ result, network }) => {
					const lastAssistantMessageText = lastAssistantTextMessageContent(result);

					if (lastAssistantMessageText && network) {
						if (lastAssistantMessageText.includes("<task_summary>")) {
							if (!network.state.data) network.state.data = {};
							network.state.data.summary = lastAssistantMessageText;
						}
					}

					return result;
				},
			},
		});

		const network = createNetwork({
			name: "Coding-Agent-Network",
			agents: [codeAgent],
			maxIter: 10,
			router: async ({ network }) => {
				const summary = (network.state.data?.summary as string) || "";
				if (summary) return; // done — no next agent
				return codeAgent;
			},
		});

		// First run
		let result = await network.run(event.data.value);

		let hasSummary = Boolean(result.state.data?.summary);
		let hasFiles = Object.keys((result.state.data?.files as object) || {}).length > 0;

		if (!hasSummary || !hasFiles) {
			result = await network.run(buildRecoveryPrompt(event.data.value));
			hasSummary = Boolean(result.state.data?.summary);
			hasFiles = Object.keys((result.state.data?.files as object) || {}).length > 0;
		}

		const isError = !hasSummary || !hasFiles;

		const sandboxUrl = await step.run("get-sandbox-url", async () => {
			const sandbox = await Sandbox.connect(sandboxId);
			return `http://${sandbox.getHost(3000)}`;
		});

		await step.run("save-result", async () => {
			if (isError) {
				return await db.message.create({
					data: {
						projectId: event.data.projectId,
						content: "Something went wrong while generating files. Please try again.",
						role: MessageRole.ASSISTANT,
						type: MessageType.ERROR,
					},
				});
			}
			return await db.message.create({
				data: {
					projectId: event.data.projectId,
					content: result.state.data.summary,
					role: MessageRole.ASSISTANT,
					type: MessageType.RESULT,
					fragment: {
						create: {
							sandboxUrl: sandboxUrl,
							title: "Untitled",
							files: result.state.data.files,
						},
					},
				},
			});
		});

		return {
			url: sandboxUrl,
			title: "Untitled",
			files: result.state.data?.files ?? {},
			summary: (result.state.data?.summary as string) || "No summary available",
		};
	},
);
