"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// Simplex noise for smooth organic motion
const simplexNoise3D = `
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// Chrome sphere vertex shader with organic deformation
const chromeVertexShader = `
${simplexNoise3D}

uniform float uTime;
uniform float uNoiseScale;
uniform float uNoiseStrength;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vReflect;

void main() {
  // Create organic pulsating deformation
  float noise1 = snoise(position * uNoiseScale + uTime * 0.4);
  float noise2 = snoise(position * uNoiseScale * 2.0 - uTime * 0.3);
  float noise3 = snoise(position * uNoiseScale * 0.5 + uTime * 0.2);
  
  float displacement = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2) * uNoiseStrength;
  
  vec3 newPosition = position + normal * displacement;
  
  // Recalculate normal with noise derivative approximation
  float eps = 0.01;
  float n1 = snoise((position + vec3(eps, 0.0, 0.0)) * uNoiseScale + uTime * 0.4);
  float n2 = snoise((position + vec3(0.0, eps, 0.0)) * uNoiseScale + uTime * 0.4);
  float n3 = snoise((position + vec3(0.0, 0.0, eps)) * uNoiseScale + uTime * 0.4);
  
  vec3 gradient = vec3(n1 - noise1, n2 - noise1, n3 - noise1) / eps;
  vec3 deformedNormal = normalize(normal - gradient * uNoiseStrength * 0.5);
  
  vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  vec3 worldNormal = normalize((modelMatrix * vec4(deformedNormal, 0.0)).xyz);
  vNormal = worldNormal;
  
  vec3 I = normalize(worldPosition.xyz - cameraPosition);
  vReflect = reflect(I, worldNormal);
  
  vec4 mvPosition = viewMatrix * worldPosition;
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

// Chrome/liquid metal fragment shader
const chromeFragmentShader = `
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vReflect;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vNormal);
  vec3 reflectDir = normalize(vReflect);
  
  // Create a studio-like environment reflection
  // Top light (bright)
  float topLight = smoothstep(-0.2, 1.0, reflectDir.y);
  
  // Bottom fill (darker gray)
  float bottomFill = smoothstep(0.3, -1.0, reflectDir.y) * 0.4;
  
  // Side gradients
  float sideGradient = abs(reflectDir.x) * 0.15;
  
  // Create the base chrome color from environment
  vec3 envColor = vec3(0.92, 0.92, 0.94) * topLight;
  envColor += vec3(0.5, 0.52, 0.55) * bottomFill;
  envColor += vec3(0.85, 0.85, 0.88) * sideGradient;
  
  // Add some variation based on reflection angle
  float horizonLine = 1.0 - smoothstep(0.0, 0.15, abs(reflectDir.y));
  envColor = mix(envColor, vec3(0.7, 0.72, 0.75), horizonLine * 0.5);
  
  // Fresnel effect - edges are brighter/different
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);
  
  // Base metallic color (slightly warm silver)
  vec3 baseColor = vec3(0.88, 0.87, 0.86);
  
  // Mix environment reflection with base color (high metalness)
  vec3 finalColor = mix(baseColor * 0.1, envColor, 0.95);
  
  // Add fresnel rim lighting
  vec3 rimColor = vec3(0.95, 0.95, 0.97);
  finalColor = mix(finalColor, rimColor, fresnel * 0.6);
  
  // Specular highlights from multiple light sources
  vec3 light1 = normalize(vec3(0.5, 1.0, 0.5));
  vec3 light2 = normalize(vec3(-0.3, 0.8, 0.6));
  vec3 light3 = normalize(vec3(0.0, 0.3, 1.0));
  
  vec3 halfDir1 = normalize(light1 + viewDir);
  vec3 halfDir2 = normalize(light2 + viewDir);
  vec3 halfDir3 = normalize(light3 + viewDir);
  
  float spec1 = pow(max(dot(normal, halfDir1), 0.0), 128.0);
  float spec2 = pow(max(dot(normal, halfDir2), 0.0), 64.0);
  float spec3 = pow(max(dot(normal, halfDir3), 0.0), 32.0);
  
  finalColor += vec3(1.0) * spec1 * 0.8;
  finalColor += vec3(0.95, 0.95, 0.98) * spec2 * 0.4;
  finalColor += vec3(0.9, 0.92, 0.95) * spec3 * 0.25;
  
  // Subtle dark accents in concave areas
  float ao = 0.5 + 0.5 * dot(normal, vec3(0.0, 1.0, 0.0));
  finalColor *= (0.85 + 0.15 * ao);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface SphereConfig {
	position: THREE.Vector3;
	basePosition: THREE.Vector3;
	scale: number;
	rotationSpeed: THREE.Vector3;
	orbitRadius: number;
	orbitSpeed: number;
	orbitPhase: number;
	noiseScale: number;
	noiseStrength: number;
}

export default function Blob() {
	const containerRef = useRef<HTMLDivElement>(null);
	const initializedRef = useRef(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [loadProgress, setLoadProgress] = useState(0);

	useEffect(() => {
		if (!containerRef.current || initializedRef.current) return;
		// Prevent double initialization if container already has content
		if (containerRef.current.children.length > 0) return;
		
		initializedRef.current = true;

		let cleanup: (() => void) | null = null;
		let rafId: number | null = null;

		// Use requestAnimationFrame to ensure DOM is ready and container has dimensions
		rafId = requestAnimationFrame(() => {
			if (!containerRef.current) return;
			// Double-check container is still empty (in case of race condition)
			if (containerRef.current.children.length > 0) {
				initializedRef.current = false;
				return;
			}

			// Scene setup
			const scene = new THREE.Scene();
			scene.background = new THREE.Color(0xffffff);

			const camera = new THREE.PerspectiveCamera(
				45,
				window.innerWidth / window.innerHeight,
				0.1,
				1000,
			);
			camera.position.set(0, 0, 12);

			const renderer = new THREE.WebGLRenderer({
				antialias: true,
				powerPreference: "high-performance",
			});
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 1.0;
			containerRef.current.appendChild(renderer.domElement);

		// Create chrome spheres
		const spheres: {
			mesh: THREE.Mesh;
			config: SphereConfig;
			material: THREE.ShaderMaterial;
		}[] = [];
		const sphereGeometry = new THREE.SphereGeometry(1, 128, 128);

		// Sphere configurations - large chrome liquid metal blobs
		const sphereConfigs: Partial<SphereConfig>[] = [
			// Main large sphere (center-right)
			{
				position: new THREE.Vector3(1.5, 0.3, 0),
				scale: 2.8,
				noiseScale: 0.8,
				noiseStrength: 0.25,
			},
			// Second large sphere (left)
			{
				position: new THREE.Vector3(-2.0, -0.5, -1),
				scale: 2.2,
				noiseScale: 1.0,
				noiseStrength: 0.2,
			},
			// Medium spheres
			{
				position: new THREE.Vector3(-0.5, 2.0, -0.5),
				scale: 1.5,
				noiseScale: 1.2,
				noiseStrength: 0.18,
			},
			{
				position: new THREE.Vector3(3.5, -1.5, -0.8),
				scale: 1.3,
				noiseScale: 1.3,
				noiseStrength: 0.15,
			},
			{
				position: new THREE.Vector3(-3.5, 1.2, -1.2),
				scale: 1.1,
				noiseScale: 1.4,
				noiseStrength: 0.12,
			},
			// Smaller accent spheres
			{
				position: new THREE.Vector3(0.8, -2.2, 0.3),
				scale: 0.9,
				noiseScale: 1.5,
				noiseStrength: 0.1,
			},
			{
				position: new THREE.Vector3(-1.8, -2.0, 0.5),
				scale: 0.7,
				noiseScale: 1.6,
				noiseStrength: 0.08,
			},
			{
				position: new THREE.Vector3(4.0, 1.5, -1.5),
				scale: 0.6,
				noiseScale: 1.8,
				noiseStrength: 0.08,
			},
			// Tiny spheres
			{
				position: new THREE.Vector3(-4.2, -0.8, -0.5),
				scale: 0.5,
				noiseScale: 2.0,
				noiseStrength: 0.06,
			},
			{
				position: new THREE.Vector3(2.5, 2.5, -1.0),
				scale: 0.45,
				noiseScale: 2.0,
				noiseStrength: 0.05,
			},
		];

		sphereConfigs.forEach((config, _index) => {
			const material = new THREE.ShaderMaterial({
				vertexShader: chromeVertexShader,
				fragmentShader: chromeFragmentShader,
				uniforms: {
					uTime: { value: 0 },
					uNoiseScale: { value: config.noiseScale || 1.0 },
					uNoiseStrength: { value: config.noiseStrength || 0.15 },
				},
			});

			const mesh = new THREE.Mesh(sphereGeometry, material);
			const pos = config.position || new THREE.Vector3(0, 0, 0);
			const scale = config.scale || 1;

			mesh.position.copy(pos);
			mesh.scale.setScalar(scale); // Start at full scale for immediate visibility

			const fullConfig: SphereConfig = {
				position: pos.clone(),
				basePosition: pos.clone(),
				scale: scale,
				rotationSpeed: new THREE.Vector3(
					(Math.random() - 0.5) * 0.003,
					(Math.random() - 0.5) * 0.003,
					(Math.random() - 0.5) * 0.003,
				),
				orbitRadius: 0.08 + Math.random() * 0.12,
				orbitSpeed: 0.2 + Math.random() * 0.2,
				orbitPhase: Math.random() * Math.PI * 2,
				noiseScale: config.noiseScale || 1.0,
				noiseStrength: config.noiseStrength || 0.15,
			};

			spheres.push({ mesh, config: fullConfig, material });
			scene.add(mesh);
		});

		// Post-processing
		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));

		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			0.1, // Very subtle bloom
			0.5, // Radius
			0.98, // High threshold
		);
		composer.addPass(bloomPass);

		// Animation
		let time = 0;
		let introProgress = 1; // Start fully visible
		const introDuration = 0.5;

		// Initial render to ensure scene is visible immediately
		composer.render();

		// Mouse interaction
		const mouse = new THREE.Vector2(0, 0);
		const targetMouse = new THREE.Vector2(0, 0);

		const handleMouseMove = (event: MouseEvent) => {
			targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		};
		window.addEventListener("mousemove", handleMouseMove);

		// Loading simulation
		let loadingTime = 0;
		const loadingDuration = 0.8;

		function animate() {
			time += 0.016;

			// Loading simulation
			if (loadingTime < loadingDuration) {
				loadingTime += 0.016;
				const progress = Math.min(loadingTime / loadingDuration, 1);
				setLoadProgress(Math.floor(progress * 100));
				if (progress >= 1) {
					setIsLoaded(true);
				}
			}

			// Intro animation - start immediately
			if (introProgress < 1) {
				introProgress = Math.min(time / introDuration, 1);
			}

			// Smooth mouse following
			mouse.x += (targetMouse.x - mouse.x) * 0.03;
			mouse.y += (targetMouse.y - mouse.y) * 0.03;

			// Update spheres
			spheres.forEach((sphere, index) => {
				const { mesh, config, material } = sphere;

				// Update shader time
				material.uniforms.uTime.value = time;

				// Intro animation - spheres emerge and scale up
				const staggerDelay = index * 0.06;
				const sphereIntro = Math.max(
					0,
					Math.min(1, (introProgress - staggerDelay) / (1 - staggerDelay)),
				);
				const sphereEase = easeOutBack(sphereIntro);

				mesh.scale.setScalar(config.scale * sphereEase);

				// Gentle floating motion
				const floatX =
					Math.sin(time * config.orbitSpeed + config.orbitPhase) *
					config.orbitRadius;
				const floatY =
					Math.cos(time * config.orbitSpeed * 0.8 + config.orbitPhase) *
					config.orbitRadius;
				const floatZ =
					Math.sin(time * config.orbitSpeed * 0.6 + config.orbitPhase + 1.0) *
					config.orbitRadius *
					0.5;

				mesh.position.x = config.basePosition.x + floatX;
				mesh.position.y = config.basePosition.y + floatY;
				mesh.position.z = config.basePosition.z + floatZ;

				// Mouse parallax effect
				const parallaxStrength = 0.15 * (1 - index * 0.08);
				mesh.position.x += mouse.x * parallaxStrength;
				mesh.position.y += mouse.y * parallaxStrength;

				// Gentle rotation
				mesh.rotation.x += config.rotationSpeed.x;
				mesh.rotation.y += config.rotationSpeed.y;
				mesh.rotation.z += config.rotationSpeed.z;
			});

			// Subtle camera movement based on mouse
			camera.position.x = mouse.x * 0.4;
			camera.position.y = mouse.y * 0.4;
			camera.lookAt(0, 0, 0);

			composer.render();
		}

		renderer.setAnimationLoop(animate);

		// Resize handler
		const handleResize = () => {
			const w = window.innerWidth;
			const h = window.innerHeight;

			camera.aspect = w / h;
			camera.updateProjectionMatrix();

			renderer.setSize(w, h);
			composer.setSize(w, h);
		};
			window.addEventListener("resize", handleResize);

			// Store cleanup function
			cleanup = () => {
				window.removeEventListener("resize", handleResize);
				window.removeEventListener("mousemove", handleMouseMove);
				renderer.setAnimationLoop(null);

				sphereGeometry.dispose();
				spheres.forEach((s) => {
					s.material.dispose();
				});

				renderer.dispose();
				composer.dispose();

				if (containerRef.current) {
					containerRef.current.innerHTML = "";
				}
			};
		});

		// Return cleanup from useEffect
		return () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}
			if (cleanup) {
				cleanup();
			}
			initializedRef.current = false;
		};
	}, []);

	return (
		<div className="relative w-full h-full min-h-screen">
			{/* WebGL Canvas */}
			<div ref={containerRef} className="absolute inset-0 w-full h-full" />

			{/* Text overlay */}
			<div
				className={`absolute inset-0 flex items-end justify-start pointer-events-none transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
				style={{ transitionDelay: "0.3s", padding: "2rem" }}
			>
				<h1
					className="text-6xl sm:text-5xl md:text-6xl lg:text-9xl font-bold uppercase"
					style={{
						fontFamily:
							"'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
						color: "#1e1e1e",
						letterSpacing: "-0.04em",
					}}
				>
					MOLECULAR<br />ENGINEERING INC.
				</h1>
			</div>
		</div>
	);
}

// Easing function for smooth overshoot
function easeOutBack(t: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}
