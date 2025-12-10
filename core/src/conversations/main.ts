import { Conversation } from "@botpress/runtime";
import playgroundDocs from "../knowledge/playground-docs";
import { Knowledge } from "@botpress/runtime";

export default new Conversation({
	channel: "*",
	async handler({ message, execute }: { message: { type: string; payload: { text: string } }; execute: (options: { instructions: string; knowledge: Knowledge[] }) => Promise<void> }) {
		if (message?.type !== "text") {
			return;
		}

		await execute({
			instructions: `You are an assistant for the Three.js Playground. Be concise. The user said: "${message.payload.text}"` + 
			`Your one source of truth is the Three.js Playground documentation provided to you. Use it to answer the user's question.` +
			`If the user's question is not related to anything in the documentation, respond asserting that your purpose is to help with Three.js Playground examples.`,
			knowledge: [playgroundDocs],
		});
	},
});
