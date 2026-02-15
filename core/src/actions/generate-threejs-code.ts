import { Action, adk, z } from "@botpress/runtime";

export default new Action({
	name: "generateThreejsCode",
	description:
		"Generate a complete Three.js code sample based on user requirements using AI",
	input: z.object({
		concept: z.string().describe("The Three.js concept or effect to implement"),
		complexity: z
			.enum(["beginner", "intermediate", "advanced"])
			.optional()
			.default("beginner"),
		additionalRequirements: z.string().optional(),
	}),
	output: z.object({
		success: z.boolean(),
		code: z.string().optional(),
		title: z.string().optional(),
		explanation: z.string().optional(),
		error: z.string().optional(),
	}),
	async handler({ input }) {
		try {
			const complexityInstructions: Record<string, string> = {
				beginner:
					"Use basic geometries, simple materials, straightforward animations",
				intermediate:
					"Use multiple objects, MeshStandardMaterial with lights, complex animations",
				advanced:
					"Use custom shaders, post-processing, instancing, advanced techniques",
			};

			const complexity = input.complexity || "beginner";

			const codePrompt = `Generate a complete, runnable Three.js code sample for: "${input.concept}"

Complexity: ${complexity}
${input.additionalRequirements ? `Requirements: ${input.additionalRequirements}` : ""}

Must include:
- import * as THREE from "three"
- Import addons from "three/addons/"
- Scene, camera, renderer setup
- Geometries, materials, meshes
- Animation loop with renderer.setAnimationLoop
- Window resize handling
- Cleanup function (dispose geometries, materials, renderer)
- Modern Three.js (r150+)
- Creative and visually interesting (NOT basic cubes)

Style: ${complexityInstructions[complexity]}

Return ONLY valid TypeScript/JavaScript code ready to run in browser.
No markdown, no extra comments, no explanations.`;

			let code = await adk.zai.text(codePrompt, {
				temperature: 0.8,
				length: 2000,
			});

			code = code.replace(/```(?:typescript|javascript|ts|js)?\n?/g, "");
			code = code.replace(/```\n?$/g, "");
			code = code.trim();

			if (!code || code.length < 50) {
				return { success: false, error: "Failed to generate valid code" };
			}

			const titlePrompt = `Create a short title (max 4 words, use underscores) for: "${input.concept}". Return ONLY the title.`;
			const title =
				(
					await adk.zai.text(titlePrompt, {
						temperature: 0.7,
						length: 20,
					})
				)
					.trim()
					.replace(/[^a-z0-9_\s]/gi, "_") || "custom_example";

			const explanationPrompt = `Explain in 1-2 sentences what this does: "${input.concept}" (${complexity} complexity). Be concise.`;
			const explanation =
				(
					await adk.zai.text(explanationPrompt, {
						temperature: 0.5,
						length: 100,
					})
				).trim() ||
				`A ${complexity} Three.js example demonstrating ${input.concept}`;

			return { success: true, code, title, explanation };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});
