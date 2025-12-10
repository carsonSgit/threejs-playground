import { Workflow, z } from "@botpress/runtime";
import listExamplesAction from "../actions/list-examples";
import generateCodeSnippetAction from "../actions/generate-code-snippet";

export default new Workflow({
	name: "exampleCreationAssistant",
	input: z.object({
		userRequest: z.string().describe("The user's request for creating a new example"),
		concept: z.string().optional().describe("The Three.js concept they want to implement"),
		complexity: z
			.enum(["beginner", "intermediate", "advanced"])
			.optional()
			.describe("Desired complexity level"),
	}),
	output: z.object({
		success: z.boolean(),
		suggestions: z.array(z.string()).optional(),
		codeTemplate: z.string().optional(),
		message: z.string(),
	}),
	async handler({ input }) {
		try {
			const allExamples = await (listExamplesAction.handler as any)({
				input: {},
			});

			let codeTemplate: string | undefined;
			if (input.concept) {
				const codeResult = await (generateCodeSnippetAction.handler as any)({
					input: {
						concept: input.concept,
						complexity: input.complexity || "intermediate",
					},
				});
				codeTemplate = codeResult.code;
			}

			const suggestions = [
				"Review similar examples in the playground for patterns",
				"Consider using Three.js best practices from existing examples",
				"Ensure proper cleanup in useEffect return function",
				"Use OrbitControls for interactive examples",
				"Handle window resize events for responsive design",
			];

			if (input.complexity === "beginner") {
				suggestions.push("Start with basic geometries and materials");
				suggestions.push("Use built-in Three.js effects before custom shaders");
			} else if (input.complexity === "advanced") {
				suggestions.push("Consider custom shaders for unique effects");
				suggestions.push("Use post-processing for enhanced visuals");
			}

			return {
				success: true,
				suggestions,
				codeTemplate,
				message: `I've prepared suggestions for creating your example. Review the ${allExamples.count} existing examples for patterns and best practices.`,
			};
		} catch (error) {
			return {
				success: false,
				message: `Error preparing example creation assistance: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	},
});

