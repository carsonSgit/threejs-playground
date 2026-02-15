import { DataSource, Knowledge } from "@botpress/runtime";

/**
 * Three.js official documentation knowledge base.
 * Uses curated URLs since threejs.org has no sitemap.xml or llms.txt.
 *
 * Covers: core API, geometries, materials, lights, cameras, animation, math, and manual/tutorials.
 */
export const threejsDocs = new Knowledge({
	name: "threejs-docs",
	description:
		"Three.js official documentation covering core API, materials, geometries, lights, cameras, animation, and rendering",
	sources: [
		DataSource.Website.fromUrls(
			[
				// Manual / Tutorials
				"https://threejs.org/manual/#en/fundamentals",
				"https://threejs.org/manual/#en/responsive",
				"https://threejs.org/manual/#en/primitives",
				"https://threejs.org/manual/#en/scenegraph",
				"https://threejs.org/manual/#en/materials",
				"https://threejs.org/manual/#en/textures",
				"https://threejs.org/manual/#en/lights",
				"https://threejs.org/manual/#en/cameras",
				"https://threejs.org/manual/#en/shadows",
				"https://threejs.org/manual/#en/fog",
				"https://threejs.org/manual/#en/custom-buffergeometry",
				"https://threejs.org/manual/#en/post-processing",

				// Geometries
				"https://threejs.org/docs/#api/en/geometries/BoxGeometry",
				"https://threejs.org/docs/#api/en/geometries/SphereGeometry",
				"https://threejs.org/docs/#api/en/geometries/PlaneGeometry",
				"https://threejs.org/docs/#api/en/geometries/TorusKnotGeometry",
				"https://threejs.org/docs/#api/en/geometries/IcosahedronGeometry",
				"https://threejs.org/docs/#api/en/core/BufferGeometry",

				// Materials
				"https://threejs.org/docs/#api/en/materials/MeshStandardMaterial",
				"https://threejs.org/docs/#api/en/materials/MeshPhongMaterial",
				"https://threejs.org/docs/#api/en/materials/ShaderMaterial",
				"https://threejs.org/docs/#api/en/materials/MeshBasicMaterial",
				"https://threejs.org/docs/#api/en/materials/PointsMaterial",

				// Renderer
				"https://threejs.org/docs/#api/en/renderers/WebGLRenderer",

				// Lights
				"https://threejs.org/docs/#api/en/lights/AmbientLight",
				"https://threejs.org/docs/#api/en/lights/DirectionalLight",
				"https://threejs.org/docs/#api/en/lights/PointLight",
				"https://threejs.org/docs/#api/en/lights/SpotLight",

				// Cameras
				"https://threejs.org/docs/#api/en/cameras/PerspectiveCamera",
				"https://threejs.org/docs/#api/en/cameras/OrthographicCamera",

				// Animation
				"https://threejs.org/docs/#api/en/animation/AnimationMixer",
				"https://threejs.org/docs/#api/en/animation/AnimationClip",

				// Core
				"https://threejs.org/docs/#api/en/core/Object3D",
				"https://threejs.org/docs/#api/en/core/Raycaster",

				// Math
				"https://threejs.org/docs/#api/en/math/Vector3",
				"https://threejs.org/docs/#api/en/math/Color",
				"https://threejs.org/docs/#api/en/math/MathUtils",
			],
			{ id: "threejs-docs" },
		),
	],
});
