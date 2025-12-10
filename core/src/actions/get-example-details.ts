import { Action, z } from "@botpress/runtime";

const EXAMPLE_DETAILS: Record<
	string,
	{
		name: string;
		slug: string;
		description: string;
		tags: string[];
		path: string;
		category: string;
		features: string[];
		technologies: string[];
		complexity: "beginner" | "intermediate" | "advanced";
		documentationPath: string;
	}
> = {
	"ascii-earth": {
		name: "ASCII Earth",
		slug: "ascii-earth",
		description:
			"Rotating Earth rendered with ASCII characters using AsciiEffect. Features interactive orbit controls and real-time texture processing.",
		tags: ["ascii", "effects", "textures"],
		path: "/examples/ascii-earth",
		category: "effects",
		features: [
			"ASCII character rendering",
			"Orbit controls for interaction",
			"Real-time texture processing",
			"Texture darkening for better ASCII effect",
		],
		technologies: ["Three.js", "AsciiEffect", "OrbitControls", "TextureLoader"],
		complexity: "intermediate",
		documentationPath: "ascii-earth.md",
	},
	"boiling-star": {
		name: "Boiling Star",
		slug: "boiling-star",
		description:
			"Procedural star simulation with multi-layered simplex noise, dynamic surface warping, corona layer, and bloom post-processing.",
		tags: ["shaders", "noise", "bloom"],
		path: "/examples/boiling-star",
		category: "shaders",
		features: [
			"4D simplex noise with derivatives",
			"Custom shader-based star surface",
			"Volumetric corona effects",
			"GPU particle flare system",
			"Post-processing bloom",
		],
		technologies: [
			"Three.js",
			"Custom GLSL Shaders",
			"Simplex Noise",
			"EffectComposer",
			"UnrealBloomPass",
		],
		complexity: "advanced",
		documentationPath: "boiling-star.md",
	},
	"particle-network": {
		name: "Particle Network",
		slug: "particle-network",
		description:
			"Dynamic particle system using BufferGeometry drawRange. Particles connect within proximity, creating organic network visualizations.",
		tags: ["particles", "drawrange", "dynamic"],
		path: "/examples/particle-network",
		category: "particles",
		features: [
			"Dynamic particle system",
			"Distance-based connections",
			"Real-time UI controls",
			"BufferGeometry drawRange optimization",
			"Boundary collision physics",
		],
		technologies: [
			"Three.js",
			"BufferGeometry",
			"Points",
			"LineSegments",
			"OrbitControls",
		],
		complexity: "intermediate",
		documentationPath: "particle-network.md",
	},
};

export default new Action({
	name: "getExampleDetails",
	description:
		"Get detailed information about a specific Three.js playground example",
	input: z.object({
		slug: z
			.string()
			.describe(
				"The slug of the example (e.g., 'ascii-earth', 'boiling-star')",
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
	async handler({ input }) {
		const example = EXAMPLE_DETAILS[input.slug.toLowerCase()];

		if (!example) {
			return {
				example: null,
				found: false,
			};
		}

		return {
			example,
			found: true,
		};
	},
});
