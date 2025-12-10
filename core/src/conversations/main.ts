import { Conversation, Autonomous, z } from "@botpress/runtime";
import playgroundDocs from "../knowledge/playground-docs";
import listExamplesAction from "../actions/list-examples";
import getExampleDetailsAction from "../actions/get-example-details";

interface MessagePayload {
	type: string;
	payload?: {
		text?: string;
	};
}

interface HandlerParams {
	message: MessagePayload;
	execute: (params: {
		instructions: string;
		knowledge: unknown[];
		tools: Autonomous.Tool[];
	}) => Promise<void>;
	state: {
		lastExampleViewed?: string;
	};
}

export default new Conversation({
	channel: "*",
	state: z.object({
		lastExampleViewed: z.string().optional(),
	}),
	async handler({ message, execute, state }: HandlerParams) {
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
				return await listExamplesAction.handler({ input } as unknown as Parameters<typeof listExamplesAction.handler>[0]);
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
				const result = await getExampleDetailsAction.handler({ input } as unknown as Parameters<typeof getExampleDetailsAction.handler>[0]);
				if (result.found && result.example && state) {
					state.lastExampleViewed = input.slug;
				}
				return result;
			},
		});



		await execute({
			instructions: `You are a Three.js Playground assistant. Help users explore examples and generate Three.js code.

Tools:
- list_examples: Browse available examples
- get_example_details: Get details about a specific example

When generating code, create complete runnable examples with:
- import * as THREE from "three"
- Scene, camera, renderer, geometry, material, animation loop
- Window resize handling

The user said: "${message?.payload?.text || ""}"`,
			knowledge: [playgroundDocs],
			tools: [listExamplesTool, getExampleDetailsTool],
		});
	},
});
