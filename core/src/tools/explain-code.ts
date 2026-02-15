import { Autonomous, adk, z } from "@botpress/runtime";

/**
 * Code Explanation Generator — transforms Three.js code into rich, structured
 * educational content with annotated code, concept breakdowns, doc links,
 * and actionable "try changing this" suggestions.
 */
export const explainCodeTool = new Autonomous.Tool({
	name: "explain_code",
	description:
		"Explain any Three.js code in depth. Returns annotated code with inline comments, a breakdown of Three.js concepts used, difficulty assessment, and specific suggestions for things the user can try changing to learn. Use when a user asks to explain code, understand an example, or wants to learn from existing code.",
	input: z.object({
		code: z.string().describe("The Three.js code to explain"),
		focusArea: z
			.string()
			.optional()
			.describe(
				"Optional area to focus the explanation on (e.g. 'shaders', 'animation loop', 'materials')",
			),
	}),
	output: z.object({
		annotatedCode: z
			.string()
			.describe("The code with educational inline comments added"),
		concepts: z.array(
			z.object({
				name: z.string(),
				description: z.string(),
				docUrl: z.string().optional(),
			}),
		),
		difficulty: z.enum(["beginner", "intermediate", "advanced"]),
		tryThis: z
			.array(z.string())
			.describe("3-5 actionable suggestions for modifications"),
		summary: z.string().describe("1-2 sentence overview of the code"),
	}),
	handler: async ({
		code,
		focusArea,
	}: {
		code: string;
		focusArea?: string;
	}) => {
		const focusClause = focusArea
			? ` Pay special attention to ${focusArea}-related sections.`
			: "";

		// 1. Annotate code with educational inline comments
		let annotatedCode: string;
		try {
			annotatedCode = await adk.zai.rewrite(
				code,
				`Add clear, educational inline comments to this Three.js code. Explain WHY each section exists — not just WHAT it does. Cover the purpose of each Three.js class, method, and pattern used. Keep ALL original code intact; only add comments.${focusClause}`,
			);
		} catch (e) {
			console.warn("[explain_code] annotation failed:", e);
			annotatedCode = code;
		}

		// 2. Extract Three.js concepts used
		let concepts: {
			name: string;
			description: string;
			docUrl?: string;
		}[] = [];
		try {
			concepts = await adk.zai.extract(
				code,
				z.array(
					z.object({
						name: z
							.string()
							.describe(
								"Three.js concept or class name (e.g. 'MeshStandardMaterial', 'requestAnimationFrame', 'ShaderMaterial')",
							),
						description: z
							.string()
							.describe(
								"What this concept does and why it matters in this code",
							),
						docUrl: z
							.string()
							.optional()
							.describe(
								"Link to Three.js docs, e.g. https://threejs.org/docs/#api/en/materials/MeshStandardMaterial",
							),
					}),
				),
				{
					instructions:
						"Identify every Three.js concept, class, or technique used in this code. For each, provide the name, a beginner-friendly description, and the official Three.js documentation URL where applicable (use https://threejs.org/docs/#api/en/ format). Include broader concepts like 'animation loop', 'scene graph', 'dispose pattern' alongside specific classes.",
				},
			);
		} catch (e) {
			console.warn("[explain_code] concept extraction failed:", e);
		}

		// 3. Assess difficulty
		let difficulty: "beginner" | "intermediate" | "advanced" = "beginner";
		try {
			const assessment = await adk.zai.extract(
				code,
				z.object({
					difficulty: z
						.enum(["beginner", "intermediate", "advanced"])
						.describe(
							"beginner = basic geometry + simple materials, intermediate = multiple objects + lights + standard materials, advanced = shaders + post-processing + instancing",
						),
				}),
				{
					instructions:
						"Assess the complexity of this Three.js code based on the techniques used.",
				},
			);
			difficulty = assessment.difficulty;
		} catch (e) {
			console.warn("[explain_code] difficulty assessment failed:", e);
		}

		// 4. Generate "try changing this" suggestions
		let tryThis: string[] = [];
		try {
			const suggestionsText = await adk.zai.text(
				`You are a Three.js teacher. Given this code, suggest 3-5 specific, actionable modifications the user can make to learn from it. Each suggestion should tell the user exactly what to change (variable name, value, or line) and what visual effect they'll see.${focusClause}

Code:
${code.slice(0, 3000)}

Format each suggestion as a single clear sentence starting with a verb (e.g. "Change the roughness value from 0.5 to 0.0 to see a mirror-like reflection").`,
				{ temperature: 0.8, length: "medium" },
			);

			tryThis = await adk.zai.extract(
				suggestionsText,
				z.array(z.string().describe("A single actionable suggestion")),
				{
					instructions:
						"Extract each suggestion as a standalone string. Return 3-5 suggestions.",
				},
			);
		} catch (e) {
			console.warn("[explain_code] suggestion generation failed:", e);
			tryThis = [
				"Try changing color values to see how the visual appearance changes",
				"Modify geometry parameters (segments, size) and observe the mesh detail",
				"Adjust the camera position to see the scene from different angles",
			];
		}

		// 5. Generate summary
		let summary: string;
		try {
			summary = await adk.zai.text(
				`Summarize this Three.js code in 1-2 sentences. Mention the key visual effect and primary techniques used.${focusClause}\n\nCode:\n${code.slice(0, 2000)}`,
				{ temperature: 0.3, length: "short" },
			);
			summary = summary.trim();
		} catch (e) {
			console.warn("[explain_code] summary generation failed:", e);
			summary =
				"A Three.js visualization using various 3D rendering techniques.";
		}

		return {
			annotatedCode,
			concepts,
			difficulty,
			tryThis,
			summary,
		};
	},
});
