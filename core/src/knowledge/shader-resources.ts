import { DataSource, Knowledge } from "@botpress/runtime";

/**
 * GLSL shader programming resources knowledge base.
 * Covers Book of Shaders fundamentals, WebGL shader techniques,
 * and Three.js ShaderMaterial usage.
 */
export const shaderResources = new Knowledge({
	name: "shader-resources",
	description:
		"GLSL shader programming resources covering Book of Shaders fundamentals, WebGL shader techniques, and Three.js ShaderMaterial usage",
	sources: [
		DataSource.Website.fromUrls(
			[
				// Book of Shaders — key chapters
				"https://thebookofshaders.com/01/",
				"https://thebookofshaders.com/02/",
				"https://thebookofshaders.com/03/",
				"https://thebookofshaders.com/05/",
				"https://thebookofshaders.com/06/",
				"https://thebookofshaders.com/07/",
				"https://thebookofshaders.com/08/",
				"https://thebookofshaders.com/09/",
				"https://thebookofshaders.com/10/",
				"https://thebookofshaders.com/11/",

				// WebGL Fundamentals — shader pages
				"https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html",
				"https://webglfundamentals.org/webgl/lessons/webgl-image-processing.html",

				// Three.js shader materials
				"https://threejs.org/docs/#api/en/materials/ShaderMaterial",
				"https://threejs.org/docs/#api/en/materials/RawShaderMaterial",
				"https://threejs.org/manual/#en/custom-buffergeometry",

				// Shadertoy reference
				"https://www.shadertoy.com/howto",
			],
			{ id: "shader-resources" },
		),
	],
});
