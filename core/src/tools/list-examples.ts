import { Autonomous, z } from "@botpress/runtime";
import listExamplesAction from "../actions/list-examples";

export const listExamplesTool = new Autonomous.Tool({
	name: "list_examples",
	description:
		"List all available Three.js playground examples. Use this when the user asks about available examples, wants to browse, or needs to see what's in the playground.",
	input: z.object({
		category: z
			.string()
			.optional()
			.describe("Filter by category: 'effects', 'shaders', or 'particles'"),
		tag: z.string().optional().describe("Filter by a specific tag"),
	}),
	output: z.object({
		examples: z.array(
			z.object({
				name: z.string(),
				slug: z.string(),
				description: z.string(),
				tags: z.array(z.string()),
				path: z.string(),
				category: z.string(),
			}),
		),
		count: z.number(),
	}),
	handler: async ({ category, tag }: { category?: string; tag?: string }) => {
		const result = await listExamplesAction.handler({
			input: { category, tag },
		} as unknown as Parameters<typeof listExamplesAction.handler>[0]);

		if (result.count === 0) {
			throw new Autonomous.ThinkSignal(
				"No examples found",
				"No examples matched the filter criteria. Try browsing without filters, or suggest the user try a different category (effects, shaders, particles).",
			);
		}

		return result;
	},
});
