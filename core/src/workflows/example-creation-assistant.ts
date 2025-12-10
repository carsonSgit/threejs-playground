import { Workflow, z } from "@botpress/runtime";
import generateThreejsCodeAction from "../actions/generate-threejs-code";
import listExamplesAction from "../actions/list-examples";

export default new Workflow({
	name: "exampleCreationAssistant",
	input: z.object({
		userRequest: z
			.string()
			.describe("The user's request for creating a new example"),
		concept: z.string().describe("The Three.js concept they want to implement"),
		complexity: z
			.enum(["beginner", "intermediate", "advanced"])
			.optional()
			.default("beginner"),
		additionalRequirements: z.string().optional(),
		userId: z.string().optional(),
	}),
	output: z.object({
		success: z.boolean(),
		code: z.string().optional(),
		title: z.string().optional(),
		explanation: z.string().optional(),
		sampleId: z.string().optional(),
		message: z.string(),
	}),
	async handler({ input }) {
		try {
			const codeResult = await generateThreejsCodeAction.handler({
				input: {
					concept: input.concept,
					complexity: input.complexity,
					additionalRequirements: input.additionalRequirements,
				},
			} as unknown as Parameters<typeof generateThreejsCodeAction.handler>[0]);

			if (!codeResult.success || !codeResult.code) {
				return {
					success: false,
					message: codeResult.error || "Failed to generate code.",
				};
			}

			const sampleId = `sample_${Date.now()}_${Math.random().toString(36).substring(7)}`;

			const allExamples = await listExamplesAction.handler({
				input: {},
			} as unknown as Parameters<typeof listExamplesAction.handler>[0]);

			return {
				success: true,
				code: codeResult.code,
				title: codeResult.title,
				explanation: codeResult.explanation,
				sampleId,
				message: `Generated: "${codeResult.title}"\n\n${codeResult.explanation}\n\nCode ready in Code Sandbox. ${allExamples.count} examples available.`,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});
