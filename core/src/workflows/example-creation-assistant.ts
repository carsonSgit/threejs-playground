import { Workflow, z, adk } from "@botpress/runtime";

const COMPLEXITY_INSTRUCTIONS: Record<string, string> = {
	beginner:
		"Use basic geometries (Box, Sphere, Torus), simple MeshBasicMaterial or MeshPhongMaterial, straightforward rotation animations",
	intermediate:
		"Use multiple objects, MeshStandardMaterial with PBR properties, PointLight/SpotLight, complex animation with sine/cosine, groups and hierarchies",
	advanced:
		"Use custom ShaderMaterial/RawShaderMaterial, post-processing (EffectComposer, passes), instancing (InstancedMesh), advanced techniques like ray marching or GPU particles",
};

function cleanCode(raw: string): string {
	let code = raw.replace(/```(?:typescript|javascript|ts|js)?\n?/g, "");
	code = code.replace(/```\n?$/g, "");
	return code.trim();
}

export default new Workflow({
	name: "exampleCreationAssistant",
	description:
		"Multi-step creative workflow that plans a 3D scene, generates code in stages (geometry → materials → animation), and delivers a polished Three.js visualization",
	timeout: "5m",
	input: z.object({
		userRequest: z
			.string()
			.describe("The user's request for creating a new example"),
		concept: z
			.string()
			.describe("The Three.js concept they want to implement"),
		complexity: z
			.enum(["beginner", "intermediate", "advanced"])
			.optional()
			.default("beginner"),
		additionalRequirements: z.string().optional(),
		userId: z.string().optional(),
		conversationId: z.string().optional(),
	}),
	state: z.object({
		currentPhase: z.string().default("planning"),
		sceneGraph: z.string().optional(),
		baseCode: z.string().optional(),
		styledCode: z.string().optional(),
		finalCode: z.string().optional(),
		title: z.string().optional(),
		explanation: z.string().optional(),
	}),
	output: z.object({
		success: z.boolean(),
		code: z.string().optional(),
		title: z.string().optional(),
		explanation: z.string().optional(),
		sampleId: z.string().optional(),
		message: z.string(),
	}),
	async handler({ input, state, step, client }) {
		const complexity = input.complexity || "beginner";
		const styleGuide =
			COMPLEXITY_INSTRUCTIONS[complexity] ||
			COMPLEXITY_INSTRUCTIONS.beginner;
		const extras = input.additionalRequirements
			? `\nAdditional requirements: ${input.additionalRequirements}`
			: "";

		try {
			// Step 1: Plan the scene
			await step.progress("Planning scene structure...");
			const sceneGraph = await step("plan-scene", async () => {
				return await adk.zai.text(
					`You are a Three.js creative director. Plan a 3D scene for: "${input.concept}"\n\nComplexity: ${complexity} (${styleGuide})\n${extras}\n\nDescribe the scene structure:\n1. Scene objects (geometries, groups, hierarchy)\n2. Materials and textures to use\n3. Lighting setup\n4. Camera position and type\n5. Animation plan (what moves, how)\n6. Any post-processing effects (if advanced)\n\nBe specific about Three.js classes and values.`,
					{ temperature: 0.7, length: "medium" },
				);
			});
			state.sceneGraph = sceneGraph;
			state.currentPhase = "base-geometry";

			if (input.conversationId) {
				await step("notify-planning-done", async () => {
					await client.createMessage({
						conversationId: input.conversationId as string,
						type: "text",
						payload: {
							text: "Scene planned! Generating base geometry...",
						},
						tags: {},
					} as Parameters<typeof client.createMessage>[0]);
				});
			}

			// Step 2: Generate base code
			await step.progress(
				"Generating base geometry and scene setup...",
			);
			const baseCode = await step("generate-base", async () => {
				const raw = await adk.zai.text(
					`Generate the FIRST STAGE of a Three.js scene. Base setup only.\n\nScene plan:\n${sceneGraph}\n\nGenerate code that includes:\n- import * as THREE from "three"\n- Import any needed addons from "three/addons/"\n- Scene creation, camera setup, renderer setup\n- All geometries and mesh creation (with placeholder BasicMaterial if needed)\n- Window resize handler\n- Empty animation loop: renderer.setAnimationLoop(() => { renderer.render(scene, camera) })\n- Cleanup/dispose function\n\nStyle: ${styleGuide}\n${extras}\n\nReturn ONLY valid JavaScript/TypeScript code. No markdown, no explanations.`,
					{ temperature: 0.7, length: 2000 },
				);
				return cleanCode(raw);
			});
			state.baseCode = baseCode;
			state.currentPhase = "materials";

			// Step 3: Add materials and lighting
			await step.progress("Adding materials, lighting, and shaders...");
			const styledCode = await step("add-materials", async () => {
				const raw = await adk.zai.text(
					`Enhance this Three.js code by replacing placeholder materials with proper ones and adding lighting.\n\nScene plan:\n${sceneGraph}\n\nCurrent code:\n${baseCode}\n\nEnhancements:\n- Replace BasicMaterial with appropriate materials per the plan\n- Add lighting (ambient, point, spot, directional as planned)\n- Set proper material properties (roughness, metalness, colors, emissive)\n- Keep ALL existing geometry, scene setup, and structure intact\n\nStyle: ${styleGuide}\n${extras}\n\nReturn the COMPLETE updated code. No markdown, no explanations.`,
					{ temperature: 0.6, length: 2500 },
				);
				return cleanCode(raw);
			});
			state.styledCode = styledCode;
			state.currentPhase = "animation";

			// Step 4: Add animation and effects
			await step.progress("Adding animation and post-processing...");
			const finalCode = await step("add-animation", async () => {
				const raw = await adk.zai.text(
					`Complete this Three.js code by adding animation, interactivity, and post-processing.\n\nScene plan:\n${sceneGraph}\n\nCurrent code:\n${styledCode}\n\nFinal enhancements:\n- Fill in animation loop with smooth, creative animations per the plan\n- Use time-based animation (clock.getElapsedTime() or deltaTime)\n- Add post-processing effects if planned (EffectComposer, etc.)\n- Add subtle interactivity if appropriate (mouse tracking)\n- Ensure cleanup/dispose handles all resources\n- Make it visually polished and impressive\n\nStyle: ${styleGuide}\n${extras}\n\nReturn the COMPLETE final code. No markdown, no explanations.`,
					{ temperature: 0.7, length: 3000 },
				);
				return cleanCode(raw);
			});
			state.finalCode = finalCode;
			state.currentPhase = "finishing";

			// Step 5: Generate title
			const title = await step("generate-title", async () => {
				const raw = await adk.zai.text(
					`Create a short title (max 4 words, use underscores between words) for: "${input.concept}". Return ONLY the title.`,
					{ temperature: 0.7, length: "short" },
				);
				return (
					raw.trim().replace(/[^a-z0-9_\s]/gi, "_") ||
					"custom_example"
				);
			});
			state.title = title;

			// Step 6: Generate explanation
			const explanation = await step(
				"generate-explanation",
				async () => {
					const raw = await adk.zai.text(
						`Explain in 2-3 sentences what this Three.js visualization does and what techniques it showcases: "${input.concept}" (${complexity} complexity). Be concise.`,
						{ temperature: 0.5, length: "short" },
					);
					return raw.trim();
				},
			);
			state.explanation = explanation;

			const sampleId = `sample_${Date.now()}_${Math.random().toString(36).substring(7)}`;

			if (input.conversationId) {
				await step("notify-complete", async () => {
					await client.createMessage({
						conversationId: input.conversationId as string,
						type: "text",
						payload: {
							text: `"${title}" is ready!\n\n${explanation}\n\nThe code is available in the Code Sandbox.`,
						},
						tags: {},
					} as Parameters<typeof client.createMessage>[0]);
				});
			}

			return {
				success: true,
				code: finalCode,
				title,
				explanation,
				sampleId,
				message: `Generated: "${title}"\n\n${explanation}\n\nCreated in 4 stages: scene planning → base geometry → materials & lighting → animation & effects.`,
			};
		} catch (error) {
			const errorMsg =
				error instanceof Error
					? error.message
					: "Unknown error during creation";

			if (input.conversationId) {
				try {
					await client.createMessage({
						conversationId: input.conversationId,
						type: "text",
						payload: {
							text: `Creation workflow failed at "${state.currentPhase}" phase: ${errorMsg}`,
						},
						tags: {},
					} as Parameters<typeof client.createMessage>[0]);
				} catch {
					// Swallow notification failure
				}
			}

			return {
				success: false,
				message: errorMsg,
			};
		}
	},
});
