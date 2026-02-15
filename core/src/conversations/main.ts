import { Autonomous, adk, Conversation, user, z } from "@botpress/runtime";
import playgroundDocs from "../knowledge/playground-docs";
import { shaderResources } from "../knowledge/shader-resources";
import { threejsDocs } from "../knowledge/threejs-docs";
import { generateCodeTool } from "../tools/generate-code";
import { getExampleDetailsTool } from "../tools/get-example-details";
import { listExamplesTool } from "../tools/list-examples";
import { suggestNextTopicTool } from "../tools/suggest-next-topic";
import { explainCodeTool } from "../tools/explain-code";
import startCreationWorkflowAction from "../actions/start-creation-workflow";

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

	// Include skill levels if available
	const state = user.state as Record<string, unknown>;
	const skillLevels = state.skillLevels as
		| Record<string, number | undefined>
		| undefined;
	if (skillLevels) {
		const skills = Object.entries(skillLevels)
			.filter(([, v]) => v !== undefined && v !== null)
			.map(([k, v]) => `${k}: ${v}/5`);
		if (skills.length > 0) {
			parts.push(`Skill levels: ${skills.join(", ")}`);
		}
	}

	const totalGenerations = state.totalGenerations as number | undefined;
	if (totalGenerations && totalGenerations > 0) {
		parts.push(`Total code generations: ${totalGenerations}`);
	}

	return parts.length > 0 ? parts.join("\n") : "New user (no history yet)";
}

/**
 * Per-tool timing map. Populated in onBeforeTool, consumed in onAfterTool.
 */
const toolTimings = new Map<string, number>();

/**
 * Run Zai quality checks on generated Three.js code.
 * Returns issues found, or empty array if code looks good.
 */
async function analyzeCodeQuality(
	code: string,
): Promise<{ label: string; passed: boolean; note: string }[]> {
	const results: { label: string; passed: boolean; note: string }[] = [];

	try {
		const disposalCheck = await adk.zai.check(
			code,
			"properly disposes of Three.js resources (geometry, material, renderer) in cleanup or unmount",
		);
		const disposalPassed = Boolean(disposalCheck);
		results.push({
			label: "resourceDisposal",
			passed: disposalPassed,
			note: disposalPassed
				? "Resources cleaned up"
				: "Missing dispose() calls for geometry/material/renderer",
		});
	} catch (e) {
		console.warn("[Quality] disposal check failed:", e);
	}

	try {
		const perfCheck = await adk.zai.check(
			code,
			"avoids common Three.js performance pitfalls like creating objects in the animation loop, unnecessary cloning, or missing requestAnimationFrame cleanup",
		);
		const perfPassed = Boolean(perfCheck);
		results.push({
			label: "performance",
			passed: perfPassed,
			note: perfPassed
				? "No obvious performance issues"
				: "Potential performance issue detected",
		});
	} catch (e) {
		console.warn("[Quality] perf check failed:", e);
	}

	return results;
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

		// Increment total generations counter on each message
		const stateRef = user.state as Record<string, unknown>;
		const prevTotal = (stateRef.totalGenerations as number) || 0;
		stateRef.totalGenerations = prevTotal + 1;

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
- **suggest_next_topic**: Suggest what the user should learn next based on their profile. Use proactively after several interactions or when the user asks "what should I learn next?"
- **explain_code**: Explain any Three.js code in depth with annotated comments, concept breakdown, difficulty assessment, and "try changing this" suggestions. Use when user asks to explain code or understand an example.
- **startCreationWorkflow**: Launch a multi-step creation workflow that plans a scene, generates code in stages (geometry → materials → animation), and sends progress updates. Use for complex scene requests where step-by-step creation is better than one-shot generation.

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
				knowledge: [playgroundDocs, threejsDocs, shaderResources],
				tools: [
					listExamplesTool,
					getExampleDetailsTool,
					generateCodeTool,
					suggestNextTopicTool,
					explainCodeTool,
					(startCreationWorkflowAction as unknown as { asTool: () => InstanceType<typeof Autonomous.Tool> }).asTool(),
				],
				hooks: {
					onBeforeTool: async ({ tool, input }) => {
						const startTime = Date.now();
						toolTimings.set(tool.name, startTime);
						console.log(
							JSON.stringify({
								event: "tool_start",
								tool: tool.name,
								input:
									typeof input === "object"
										? JSON.stringify(input).slice(0, 300)
										: String(input).slice(0, 300),
								timestamp: new Date(startTime).toISOString(),
							}),
						);
					},
					onAfterTool: async ({ tool, output }) => {
						const startTime = toolTimings.get(tool.name);
						const duration = startTime ? Date.now() - startTime : -1;
						toolTimings.delete(tool.name);

						const outputSummary =
							typeof output === "object"
								? JSON.stringify(output).slice(0, 300)
								: String(output).slice(0, 300);

						console.log(
							JSON.stringify({
								event: "tool_end",
								tool: tool.name,
								durationMs: duration,
								outputPreview: outputSummary,
								timestamp: new Date().toISOString(),
							}),
						);

						// Run Zai quality analysis on generated code
						if (
							tool.name === "generate_threejs_code" &&
							output &&
							typeof output === "object"
						) {
							const result = output as { success?: boolean; code?: string };
							if (result.success && result.code) {
								const qualityResults = await analyzeCodeQuality(result.code);
								const issues = qualityResults.filter((r) => !r.passed);

								console.log(
									JSON.stringify({
										event: "code_quality",
										tool: tool.name,
										checks: qualityResults.length,
										issues: issues.length,
										details: qualityResults,
										timestamp: new Date().toISOString(),
									}),
								);

								// If critical issues found, signal the AI to mention them
								if (issues.length > 0) {
									const issueNotes = issues
										.map((i) => `- ${i.label}: ${i.note}`)
										.join("\n");
									throw new Autonomous.ThinkSignal(
										"Code quality concerns detected",
										`The generated code has potential issues:\n${issueNotes}\n\nConsider mentioning these to the user and suggesting improvements.`,
									);
								}
							}
						}
					},
					onTrace: ({ trace, iteration }) => {
						console.log(
							JSON.stringify({
								event: "trace",
								iteration,
								traceType: trace.type,
								timestamp: new Date().toISOString(),
							}),
						);
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
