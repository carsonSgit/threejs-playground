import { Autonomous, user, z } from "@botpress/runtime";
import getExampleDetailsAction from "../actions/get-example-details";

export const getExampleDetailsTool = new Autonomous.Tool({
	name: "get_example_details",
	description:
		"Get detailed information about a specific Three.js playground example including features, technologies used, complexity level, and documentation path. Use this when the user asks about a specific example or wants to learn more about it.",
	input: z.object({
		slug: z
			.string()
			.describe(
				"The slug of the example (e.g., 'ascii-earth', 'boiling-star', 'particle-network')",
			),
	}),
	output: z.object({
		example: z
			.object({
				name: z.string(),
				slug: z.string(),
				description: z.string(),
				tags: z.array(z.string()),
				path: z.string(),
				category: z.string(),
				features: z.array(z.string()),
				technologies: z.array(z.string()),
				complexity: z.enum(["beginner", "intermediate", "advanced"]),
				documentationPath: z.string(),
			})
			.nullable(),
		found: z.boolean(),
	}),
	handler: async ({ slug }: { slug: string }) => {
		const result = await getExampleDetailsAction.handler({
			input: { slug },
		} as unknown as Parameters<typeof getExampleDetailsAction.handler>[0]);

		if (!result.found) {
			throw new Autonomous.ThinkSignal(
				"Example not found",
				`No example found with slug "${slug}". Available examples: ascii-earth, boiling-star, particle-network. Ask the user to check the slug or use list_examples to browse.`,
			);
		}

		// Track recently viewed examples in user state
		const now = new Date().toISOString();
		if (!user.state.recentlyViewedExamples) {
			user.state.recentlyViewedExamples = [];
		}
		user.state.recentlyViewedExamples = [
			{ slug, viewedAt: now },
			...user.state.recentlyViewedExamples.filter(
				(e: { slug: string; viewedAt: string }) => e.slug !== slug,
			),
		].slice(0, 10);

		return result;
	},
});
