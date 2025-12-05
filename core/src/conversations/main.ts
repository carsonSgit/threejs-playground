import { Conversation } from "@botpress/runtime";
import playgroundDocs from "../knowledge/playground-docs";

export default new Conversation({
	channel: "*",
	async handler({ message, execute }) {
		if (message?.type !== "text") {
			return;
		}

		await execute({
			instructions: `You are an assistant for the Three.js Playground. Be concise. The user said: "${message.payload.text}"`,
			knowledge: [playgroundDocs],
		});
	},
});
