import { Autonomous, context, user, z } from "@botpress/runtime";
import generateThreejsCodeAction from "../actions/generate-threejs-code";

export const generateCodeTool = new Autonomous.Tool({
	name: "generate_threejs_code",
	description:
		"Generate custom Three.js code samples using AI. Use for creating visualizations, effects, or animations. Be creative and specific with the concept.",
	input: z.object({
		concept: z
			.string()
			.describe(
				"The Three.js concept to implement (e.g., 'Particle system forming a DNA helix with color gradients')",
			),
		complexity: z
			.enum(["beginner", "intermediate", "advanced"])
			.optional()
			.describe("Complexity level of the generated code"),
		additionalRequirements: z
			.string()
			.optional()
			.describe("Extra requirements or constraints for the code"),
	}),
	output: z.object({
		success: z.boolean(),
		code: z.string().optional(),
		title: z.string().optional(),
		explanation: z.string().optional(),
		error: z.string().optional(),
	}),
	handler: async ({
		concept,
		complexity,
		additionalRequirements,
	}: {
		concept: string;
		complexity?: "beginner" | "intermediate" | "advanced";
		additionalRequirements?: string;
	}) => {
		// Infer complexity from user preferences if not specified
		const effectiveComplexity =
			complexity || user.state.preferences?.complexityLevel || "beginner";

		const result = await generateThreejsCodeAction.handler({
			input: {
				concept,
				complexity: effectiveComplexity,
				additionalRequirements,
			},
		} as unknown as Parameters<typeof generateThreejsCodeAction.handler>[0]);

		if (!result.success) {
			throw new Autonomous.ThinkSignal(
				"Code generation failed",
				`Failed to generate code: ${result.error}. Try rephrasing the concept or simplifying the requirements.`,
			);
		}

		// Emit codeSampleGenerated event
		try {
			const client = context.get("client");
			await client.createEvent({
				type: "codeSampleGenerated",
				payload: {
					sampleId: `sample_${Date.now()}_${Math.random().toString(36).substring(7)}`,
					title: result.title || "untitled",
					code: result.code || "",
					concept,
					explanation: result.explanation || "",
					complexity: effectiveComplexity,
					userId: user.state ? String(Date.now()) : undefined,
				},
			});
		} catch (eventError) {
			// Don't fail the tool if event emission fails
			console.error("Failed to emit codeSampleGenerated event:", eventError);
		}

		return result;
	},
});
