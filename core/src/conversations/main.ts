import { Autonomous, Conversation, z } from "@botpress/runtime";
import generateThreejsCodeAction from "../actions/generate-threejs-code";
import getExampleDetailsAction from "../actions/get-example-details";
import listExamplesAction from "../actions/list-examples";
import playgroundDocs from "../knowledge/playground-docs";

export default new Conversation({
	channel: "*",
	state: z.object({
		lastExampleViewed: z.string().optional(),
	}),
	async handler({ message, execute, state }) {
		if (message?.type !== "text") {
			return;
		}

		const listExamplesTool = new Autonomous.Tool({
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
			handler: async (input: { category?: string; tag?: string }) => {
				return await listExamplesAction.handler({
					input,
				} as unknown as Parameters<typeof listExamplesAction.handler>[0]);
			},
		});

		const getExampleDetailsTool = new Autonomous.Tool({
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
			handler: async (input: { slug: string }) => {
				const result = await getExampleDetailsAction.handler({
					input,
				} as unknown as Parameters<typeof getExampleDetailsAction.handler>[0]);
				if (result.found && result.example && state) {
					state.lastExampleViewed = input.slug;
				}
				return result;
			},
		});

		const generateCodeTool = new Autonomous.Tool({
			name: "generate_threejs_code",
			description:
				"Generate custom Three.js code samples. Use for creating visualizations, effects, or animations, be creative.",
			input: z.object({
				concept: z.string().describe("Three.js concept to implement"),
				complexity: z.enum(["beginner", "intermediate", "advanced"]).optional(),
				additionalRequirements: z.string().optional(),
			}),
			output: z.object({
				success: z.boolean(),
				code: z.string().optional(),
				title: z.string().optional(),
				explanation: z.string().optional(),
				error: z.string().optional(),
			}),
			handler: async (input: {
				concept: string;
				complexity?: "beginner" | "intermediate" | "advanced";
				additionalRequirements?: string;
			}) => {
				const result = await generateThreejsCodeAction.handler({
					input,
				} as unknown as Parameters<
					typeof generateThreejsCodeAction.handler
				>[0]);

				if (result.success && result.code) {
					const sampleId = `sample_${Date.now()}_${Math.random().toString(36).substring(7)}`;
					console.log("Code generated:", {
						sampleId,
						title: result.title,
						concept: input.concept,
					});
				}

				return result;
			},
		});

		await execute({
			instructions: `You are a Three.js Playground assistant. Help users explore examples and generate Three.js code.

Available Tools:
- list_examples: Browse available examples in the playground
- get_example_details: Get detailed info about a specific example
- generate_threejs_code: Generate custom Three.js code samples using AI (USE THIS for code generation requests!)

When users ask to create, generate, or build Three.js visualizations:
1. Use the generate_threejs_code tool with creative, specific concepts
2. AVOID generic examples like "rotating cube" - be creative and unique!
3. Consider the user's skill level when setting complexity
4. After generating, tell the user the code has been created and they can see it in the Code Sandbox

When generating code via the tool:
- Extract the specific concept/effect the user wants
- Determine appropriate complexity (beginner/intermediate/advanced)
- Include any special requirements they mentioned
- Make it visually interesting and unique!

Examples of good concepts to generate:
- "Particle system forming a DNA helix with color gradients"
- "Morphing icosahedron with wireframe and normal materials"
- "Procedural terrain with vertex displacement and fog"
- "Spiral galaxy with instanced stars and glow effects"

The user said: "${message?.payload?.text || ""}"`,
			knowledge: [playgroundDocs],
			tools: [listExamplesTool, getExampleDetailsTool, generateCodeTool],
		});
	},
});
