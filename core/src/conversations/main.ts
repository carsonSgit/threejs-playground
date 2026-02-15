import { Conversation, user, z } from "@botpress/runtime";
import playgroundDocs from "../knowledge/playground-docs";
import { generateCodeTool } from "../tools/generate-code";
import { getExampleDetailsTool } from "../tools/get-example-details";
import { listExamplesTool } from "../tools/list-examples";

/**
 * Build a user context string from persisted user state for personalized instructions.
 */
function buildUserContext(): string {
	const parts: string[] = [];

	const complexity = user.state.preferences?.complexityLevel;
	if (complexity) {
		parts.push(`User skill level: ${complexity}`);
	}

	const preferredCategory = user.state.preferences?.preferredCategory;
	if (preferredCategory) {
		parts.push(`Preferred category: ${preferredCategory}`);
	}

	const recent = user.state.recentlyViewedExamples;
	if (recent && recent.length > 0) {
		const slugs = recent.slice(0, 5).map((r) => r.slug);
		parts.push(`Recently viewed examples: ${slugs.join(", ")}`);
	}

	const favorites = user.state.favoriteExamples;
	if (favorites && favorites.length > 0) {
		parts.push(`Favorite examples: ${favorites.join(", ")}`);
	}

	return parts.length > 0 ? parts.join("\n") : "New user (no history yet)";
}

export default new Conversation({
	channel: "*",

	state: z.object({
		lastExampleViewed: z.string().optional(),
		messageCount: z.number().default(0),
	}),

	async handler({ message, execute, state, conversation }) {
		if (message?.type !== "text") {
			return;
		}

		state.messageCount = (state.messageCount || 0) + 1;

		await conversation.startTyping();

		try {
			const userContext = buildUserContext();
			const userMessage = message?.payload?.text || "";

			await execute({
				instructions: `You are a friendly, knowledgeable Three.js Playground assistant. You help users explore interactive 3D visualizations, understand Three.js concepts, and generate custom code.

## Your Personality
- Enthusiastic about 3D graphics and creative coding
- Patient with beginners, technically precise with advanced users
- Proactive: suggest related examples or next steps after answering

## User Context
${userContext}

## Available Tools
- **list_examples**: Browse the playground's example gallery. Use when users want to explore, browse, or discover examples.
- **get_example_details**: Get in-depth info about a specific example (features, technologies, complexity). Use when users ask about a particular example.
- **generate_threejs_code**: Generate custom Three.js code using AI. Use when users want to create, build, or generate any 3D visualization.

## Code Generation Guidelines
When a user asks to create or generate something:
1. Extract a specific, creative concept from their request
2. Match complexity to their skill level (check user context above)
3. Include any special requirements they mention
4. After generating, let them know the code is ready in the Code Sandbox
5. Briefly explain what makes the generated code interesting

Aim for visually stunning, creative results. Avoid generic "rotating cube" examples. Think:
- "Particle system forming a DNA helix with animated color gradients"
- "Morphing icosahedron with dual wireframe and normal materials"
- "Procedural terrain with vertex displacement, fog, and dynamic lighting"
- "Spiral galaxy with instanced stars, glow effects, and orbital motion"

## Response Style
- Keep responses concise but informative
- Use markdown formatting for code and emphasis
- When listing examples, format them clearly with names and descriptions
- After showing example details, suggest what the user might try next

The user said: "${userMessage}"`,
				knowledge: [playgroundDocs],
				tools: [listExamplesTool, getExampleDetailsTool, generateCodeTool],
				hooks: {
					onBeforeTool: async ({ tool, input }) => {
						console.log(`[Tool Call] ${tool.name}`, JSON.stringify(input));
					},
					onAfterTool: async ({ tool, output }) => {
						console.log(
							`[Tool Result] ${tool.name}`,
							typeof output === "object"
								? JSON.stringify(output).slice(0, 200)
								: output,
						);
					},
					onTrace: ({ trace, iteration }) => {
						console.log(`[Trace] iteration=${iteration} type=${trace.type}`);
					},
				},
			});
		} catch (error) {
			console.error("[Conversation Error]", error);
			await conversation.stopTyping();
			// NOTE: conversation.send() has type inference issues with channel:"*"
			// so we use the raw client API to send the error message
			const sendError = conversation.send as (msg: {
				type: string;
				payload: { text: string };
			}) => Promise<unknown>;
			await sendError({
				type: "text",
				payload: {
					text: "I ran into an issue processing your request. Could you try rephrasing or asking something else?",
				},
			});
		}
	},
});
