import { Action, z } from "@botpress/runtime";

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
	async handler({ input, ai }) {
		try {
			const complexityInstructions = {
				beginner:
					"Use basic geometries, simple materials, straightforward animations",
				intermediate:
					"Use multiple objects, MeshStandardMaterial with lights, complex animations",
				advanced:
					"Use custom shaders, post-processing, instancing, advanced techniques",
			};

			const prompt = `Generate a complete, runnable Three.js code sample for: "${input.concept}"

Complexity: ${input.complexity}
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

Style: ${complexityInstructions[input.complexity || "beginner"]}

Return ONLY valid TypeScript/JavaScript code ready to run in browser.
No markdown, no extra comments, no explanations.`;

			const { output } = await ai.generate({
				model: "gpt-4o",
				messages: [{ role: "user", content: prompt }],
				temperature: 0.8,
				max_tokens: 2000,
			});

			let code = output?.content || "";
			code = code.replace(/```(?:typescript|javascript|ts|js)?\n?/g, "");
			code = code.replace(/```\n?$/g, "");
			code = code.trim();

			if (!code || code.length < 50) {
				return { success: false, error: "Failed to generate valid code" };
			}

			const titlePrompt = `Create a short title (max 4 words, use underscores) for: "${input.concept}". Return ONLY the title.`;
			const titleResult = await ai.generate({
				model: "gpt-4o-mini",
				messages: [{ role: "user", content: titlePrompt }],
				temperature: 0.7,
				max_tokens: 20,
			});

			const title =
				titleResult.output?.content?.trim().replace(/[^a-z0-9_\s]/gi, "_") ||
				"custom_example";

			const explanationPrompt = `Explain in 1-2 sentences what this does: "${input.concept}" (${input.complexity} complexity). Be concise.`;
			const explanationResult = await ai.generate({
				model: "gpt-4o-mini",
				messages: [{ role: "user", content: explanationPrompt }],
				temperature: 0.5,
				max_tokens: 100,
			});

			const explanation =
				explanationResult.output?.content?.trim() ||
				`A ${input.complexity} Three.js example demonstrating ${input.concept}`;

			return { success: true, code, title, explanation };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});
