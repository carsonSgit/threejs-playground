import { Action, z } from "@botpress/runtime";
import exampleCreationAssistant from "../workflows/example-creation-assistant";

export default new Action({
	name: "startCreationWorkflow",
	description:
		"Start the multi-step Three.js creation workflow. Returns a workflow ID. The workflow plans a scene, generates code in stages (geometry → materials → animation), and sends progress updates to the conversation.",
	input: z.object({
		concept: z.string().describe("The Three.js concept to implement"),
		complexity: z
			.enum(["beginner", "intermediate", "advanced"])
			.optional()
			.default("beginner"),
		additionalRequirements: z.string().optional(),
		conversationId: z
			.string()
			.optional()
			.describe("Conversation ID for progress updates"),
	}),
	output: z.object({
		workflowId: z.string(),
		message: z.string(),
	}),
	async handler({ input }) {
		const instance = await exampleCreationAssistant.start({
			userRequest: input.concept,
			concept: input.concept,
			complexity: input.complexity,
			additionalRequirements: input.additionalRequirements,
			conversationId: input.conversationId,
		} as unknown as Parameters<typeof exampleCreationAssistant.start>[0]);

		return {
			workflowId: instance.id,
			message: `Creation workflow started (ID: ${instance.id}). The bot will plan a scene, generate base geometry, add materials, and finish with animation. Progress updates will be sent to the conversation.`,
		};
	},
});
