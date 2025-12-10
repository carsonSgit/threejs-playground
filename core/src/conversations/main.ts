import { Conversation, Autonomous, z } from "@botpress/runtime";
import playgroundDocs from "../knowledge/playground-docs";
import listExamplesAction from "../actions/list-examples";
import getExampleDetailsAction from "../actions/get-example-details";
import generateCodeSnippetAction from "../actions/generate-code-snippet";

export default new Conversation({
	channel: "*",
	state: z.object({
		lastExampleViewed: z.string().optional(),
	}),
	async handler({ message, execute, state }: any) {
		if ((message as any)?.type !== "text") {
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
				return await (listExamplesAction.handler as any)({
					input: input as any,
				});
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
				const result = await (getExampleDetailsAction.handler as any)({
					input: input as any,
				});
				if (result.found && result.example && state) {
					(state as any).lastExampleViewed = input.slug;
				}
				return result;
			},
		});

		const generateCodeSnippetTool = new Autonomous.Tool({
			name: "generate_code_snippet",
			description:
				"Generate a working code snippet or working example code for Three.js concepts. Use this when the user asks for code examples, wants to see how to implement something, or needs help with Three.js programming.",
			input: z.object({
				concept: z
					.string()
					.describe("The Three.js concept or feature to generate code for"),
				exampleSlug: z
					.string()
					.optional()
					.describe("Optional: base the snippet on a specific example"),
				complexity: z
					.enum(["simple", "intermediate", "advanced"])
					.optional()
					.describe("Desired complexity level"),
			}),
			output: z.object({
				code: z.string(),
				language: z.string(),
				explanation: z.string(),
			}),
			handler: async (input: {
				concept: string;
				exampleSlug?: string;
				complexity?: "simple" | "intermediate" | "advanced";
			}) => {
				return await (generateCodeSnippetAction.handler as any)({
					input: input as any,
				});
			},
		});

		await (execute as any)({
			instructions: `You are a helpful AI assistant for the Three.js Playground project. Your role is to:
			1. **Help users explore examples**: Guide users through the available Three.js examples, explain what each one does, and help them understand the code and concepts.
			2. **Answer technical questions**: Use the playground documentation to answer questions about Three.js, WebGL, shaders, effects, and the specific implementations in the playground.
			3. **Provide code assistance**: Help users understand code patterns, generate snippets, and explain Three.js concepts based on the playground examples.
			4. **Be conversational and helpful**: Keep responses concise but informative. Use the tools available to fetch real information about examples rather than making things up.
			
			## Available Examples:
			- **ascii-earth**: Rotating Earth rendered with ASCII characters
			- **boiling-star**: Procedural star with shaders and particle effects
			- **particle-network**: Dynamic particle system with connection lines

			## Guidelines:
			- When users ask about examples, use the list_examples tool first
			- When they ask about a specific example, use get_example_details tool
			- When they need code help, use generate_code_snippet tool
			- Always reference the documentation when explaining concepts
			- Be encouraging and help users learn Three.js concepts
			- If asked about something not in the documentation, politely redirect to Three.js Playground topics

			The user said: "${(message as any)?.payload?.text || ""}"`,
			knowledge: [playgroundDocs],
			tools: [listExamplesTool, getExampleDetailsTool, generateCodeSnippetTool],
		});
	},
});
