import { Action, z } from "@botpress/runtime";

export interface Example {
	name: string;
	slug: string;
	description: string;
	tags: string[];
	path: string;
	category: string;
}

const EXAMPLES: Example[] = [
	{
		name: "ASCII Earth",
		slug: "ascii-earth",
		description:
			"Rotating Earth rendered with ASCII characters using AsciiEffect. Features interactive orbit controls and real-time texture processing.",
		tags: ["ascii", "effects", "textures"],
		path: "/examples/ascii-earth",
		category: "effects",
	},
	{
		name: "Boiling Star",
		slug: "boiling-star",
		description:
			"Procedural star simulation with multi-layered simplex noise, dynamic surface warping, corona layer, and bloom post-processing.",
		tags: ["shaders", "noise", "bloom"],
		path: "/examples/boiling-star",
		category: "shaders",
	},
	{
		name: "Particle Network",
		slug: "particle-network",
		description:
			"Dynamic particle system using BufferGeometry drawRange. Particles connect within proximity, creating organic network visualizations.",
		tags: ["particles", "drawrange", "dynamic"],
		path: "/examples/particle-network",
		category: "particles",
	},
];

export default new Action({
	name: "listExamples",
	description: "List all available Three.js playground examples",
	input: z.object({
		category: z
			.string()
			.optional()
			.describe("Filter by category (effects, shaders, particles)"),
		tag: z.string().optional().describe("Filter by tag"),
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
	async handler({ input }) {
		let filtered = EXAMPLES;

		if (input.category) {
			filtered = filtered.filter(
				(ex) => ex.category.toLowerCase() === input.category?.toLowerCase(),
			);
		}

		if (input.tag) {
			filtered = filtered.filter((ex) =>
				ex.tags.some((tag) => tag.toLowerCase() === input.tag?.toLowerCase()),
			);
		}

		return {
			examples: filtered,
			count: filtered.length,
		};
	},
});
