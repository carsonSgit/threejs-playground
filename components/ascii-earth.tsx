"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";

export default function AsciiEarth() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		// Scene setup
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		camera.position.set(0, 0, 3);

		// Renderer setup
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);

		// ASCII Effect setup
		const effect = new AsciiEffect(renderer, " .=+*#%", { invert: true });
		effect.setSize(window.innerWidth, window.innerHeight);
		renderer.domElement.style.display = "none";

		containerRef.current.appendChild(renderer.domElement);
		containerRef.current.appendChild(effect.domElement);
		effect.domElement.style.position = "relative";
		effect.domElement.style.left = "-150px";

		// Controls
		const controls = new OrbitControls(camera, effect.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		// Load Earth texture
		const textureLoader = new THREE.TextureLoader();
		const earthTexture = textureLoader.load(
			"/assets/textures/earth_daymap.jpg",
		);

		earthTexture.colorSpace = THREE.SRGBColorSpace;

		// Darken the texture for better ASCII effect
		earthTexture.onUpdate = () => {
			if (!earthTexture.image) return;

			earthTexture.image.onload = null;
			const canvas = document.createElement("canvas");
			canvas.width = earthTexture.image.width;
			canvas.height = earthTexture.image.height;
			const ctx = canvas.getContext("2d");

			if (!ctx) return;

			ctx.drawImage(earthTexture.image, 0, 0);
			const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imgData.data;

			for (let i = 0; i < data.length; i += 4) {
				data[i] *= 0.5; // R
				data[i + 1] *= 0.5; // G
				data[i + 2] *= 0.5; // B
			}

			ctx.putImageData(imgData, 0, 0);
			earthTexture.image = canvas as any;
			earthTexture.needsUpdate = true;
		};

		// Create Earth sphere
		const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
		const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
		const earth = new THREE.Mesh(earthGeometry, earthMaterial);

		scene.add(earth);

		// Animation loop
		function animate(): void {
			earth.rotation.y += 0.002;
			earth.rotation.x += 0.003;

			controls.update();
			effect.render(scene, camera);
		}

		renderer.setAnimationLoop(animate);

		// Handle window resize
		const handleResize = () => {
			const w = window.innerWidth;
			const h = window.innerHeight;

			camera.aspect = w / h;
			camera.updateProjectionMatrix();

			renderer.setSize(w, h);
			effect.setSize(w, h);
		};

		window.addEventListener("resize", handleResize);

		// Cleanup
		return () => {
			window.removeEventListener("resize", handleResize);
			renderer.setAnimationLoop(null);
			controls.dispose();
			earthGeometry.dispose();
			earthMaterial.dispose();
			earthTexture.dispose();
			renderer.dispose();

			if (containerRef.current) {
				containerRef.current.innerHTML = "";
			}
		};
	}, []);

	return <div ref={containerRef} className="w-full h-full" />;
}
