import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import Sandbox from "@e2b/code-interpreter";

export const helloWorld = inngest.createFunction(
	{ id: "hello-world" },
	{ event: "agent/hello" },

	async ({ event, step }) => {
		
		const sandboxId = await step.run("get-sandbox-id", async () => {
			const sandbox = await Sandbox.create("shubhamsuman2005/we-build");
			return sandbox.sandboxId;
		})
		
		const helloAgent = createAgent({
			name: "Hello Agent",
			description: "An agent that says hello",
			system: "You are a helpful assistant that always greats the world with a friendly message.",
			model: gemini({
				model: "gemini-2.5-flash",
			}),
		});
		const { output } = await helloAgent.run("Say hello to the world!");

		const sandboxUrl = await step.run("get-sandbox-url", async () => { 
			const sandbox = await Sandbox.connect(sandboxId);
			const host = sandbox.getHost(3000);

			return `http://${host}`;
		})

		return {
			message: output[0].content,
		};
	},
);
