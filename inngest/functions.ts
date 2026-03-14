import { inngest } from "./client";
import { gemini, createAgent, createTool, createNetwork } from "@inngest/agent-kit";
import Sandbox from "@e2b/code-interpreter";
import z from "zod";
import { PROMPT } from "@/prompt";
import { lastAssistantTextMessageContent } from "./utils";

export const codeAgentFunction = inngest.createFunction(
	{ id: "code-agent" },
	{ event: "agent-code/run" },

	async ({ event, step }) => {
		//step 1: create a sandbox and get the sandbox id
		const sandboxId = await step.run("get-sandbox-id", async () => {
			const sandbox = await Sandbox.create("shubhamsuman2005/we-build");
			return sandbox.sandboxId;
		});

		const codeAgent = createAgent({
			name: "Code Agent",
			description: "An expert coding Agent that can write and execute code in a sandbox environment.",
			system: PROMPT,
			model: gemini({
				model: "gemini-2.5-flash",
			}),
			tools: [
				//terminal
				createTool({
					name: "terminal",
					description: "Use the terminal to run commands",
					parameters: z.object({
						command: z.string(),
					}),
					handler: async ({ command }, { step }) => {
						return await step?.run("terminal", async () => {
							const buffers = {
								stdout: "",
								stderr: "",
							};
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
								return result.stdout;
							} catch (err) {
								console.log(`Command failed: ${err}\n stdout: ${buffers.stdout}\n stderr: ${buffers.stderr}`);
								return `Command failed: ${err}\n stdout: ${buffers.stdout}\n stderr: ${buffers.stderr}`;
							}
						});
					},
				}),
				//creteorupdate
				createTool({
					name: "createOrUpdateFiles",
					description: "Create or update a file in the sandbox. If the file already exists, it will be updated with the new content.",
					parameters: z.object({
						files: z.array(
							z.object({
								path: z.string(),
								content: z.string(),
							}),
						),
					}),
					handler: async ({ files }, { step, network }) => {
						const newFiles = await step?.run("createOrUpdateFiles", async () => {
							try {
								const updatedFiles = network?.state?.data.files || {};

								const sandbox = await Sandbox.connect(sandboxId);

								for (const file of files) {
									await sandbox.files.write(file.path, file.content);
									updatedFiles[file.path] = file.content;
								}
								return updatedFiles;
							} catch (err) {
								console.log(`Failed to create or update file: ${err}`);
								return {
									error: `Failed to create or update file: ${err}`,
								};
							}
						});
						if (typeof newFiles === "object") {
							network.state.data.files = newFiles;
						}
					},
				}),

				//readfiles
				createTool({
					name: "readFiles",
					description: "Read files from the sandbox.",
					parameters: z.object({
						files: z.array(z.string()),
					}),
					handler: async ({ files }, { step }) => {
						return await step?.run("readFiles", async () => {
							try {
								const sandbox = await Sandbox.connect(sandboxId);
								const contents = [];

								for (const file of files) {
									const content = await sandbox.files.read(file);
									contents.push({
										path: file,
										content,
									});
								}
								return JSON.stringify(contents);
							} catch (err) {
								console.log(`Failed to read files: ${err}`);
								return "Error" + `Failed to read files: ${err}`;
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
				const summary = network.state.data.summary || "";
				if (summary) {
					return;
				}
				return codeAgent;
			},
		});

		const result = await network.run(event.data.value);
		const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

		const sandboxUrl = await step.run("get-sandbox-url", async () => {
			const sandbox = await Sandbox.connect(sandboxId);
			const host = sandbox.getHost(3000);

			return `http://${host}`;
		});

		return {
			url: sandboxUrl,
			title: "Untitled",
			files: result.state.data.files,
			summary: result.state.data.summary || "No summary available",
		};
	},
);
