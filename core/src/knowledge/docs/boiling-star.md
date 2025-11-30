# `BoilingStar` Component Documentation

This component renders a highly detailed star with turbulent plasma surface, volumetric corona effects, erupting solar flares, and cinematic post-processing bloom using Three.js.

## Overview

The component:

* creates a Three.js scene with a custom shader-based star, corona glow, and particle flare system
* uses 4D simplex noise with derivatives for realistic plasma turbulence and convection
* implements a volumetric corona on a slightly larger sphere with back-face rendering
* generates streaming solar flares using instanced GPU particles with curl noise perturbation
* applies post-processing bloom to create dramatic energy bursts
* allows user interaction via orbit controls with damping
* handles window resizing and performs proper cleanup

---

## File Breakdown

### 1. React + DOM setup

```ts
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    if (!containerRef.current) return;
    // ... Three.js setup
}, []);
```

A `ref` is used because Three.js requires direct access to a real DOM element to insert the WebGL canvas.

`useEffect` ensures everything runs after the component mounts and cleans up on unmount.

---

### 2. Scene, Camera, Renderer

```ts
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    stencil: false,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
containerRef.current.appendChild(renderer.domElement);
```

Simple scene with black background. Perspective camera positioned to view the star. WebGL renderer with performance optimizations and pixel ratio clamping.

---

### 3. Orbit Controls

```ts
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 15;
```

Allows orbiting around the star between 3-15 units with smooth damping for comfortable navigation.

---

### 4. Simplex Noise Implementation

```ts
const simplexNoise4D = `
// 4D simplex noise GLSL implementation with derivatives
// Based on Ashima Arts and David Li's implementations
#define F4 0.309016994374947451
// ... full GLSL implementation
`;
```

Custom 4D simplex noise with analytical derivatives for curl noise computation. Enables realistic fluid-like plasma motion.

---

### 5. Star Surface Shader

```glsl
const vertexShader = `
varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vWorldPos;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
${simplexNoise4D}

uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uCoreColor;
// ... complex fragment shader with multiple noise layers
`;
```

Vertex shader passes normals and positions. Fragment shader combines multiple noise octaves for turbulent convection, sunspots, and flare regions.

---

### 6. Star Geometry & Material

```ts
const starGeometry = new THREE.SphereGeometry(2, 64, 64);
const starMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(1.0, 0.3, 0.05) },
        uCoreColor: { value: new THREE.Color(1.0, 0.95, 0.7) },
    },
});

const star = new THREE.Mesh(starGeometry, starMaterial);
scene.add(star);
```

High-resolution sphere geometry with custom shader material using time-based uniforms for animation.

---

### 7. Corona Shader & Geometry

```glsl
const coronaFragmentShader = `
${simplexNoise4D}

uniform float uTime;
uniform vec3 uCoronaColor;
// ... corona shader with tendrils and pulsation
`;
```

Separate shader for the outer glow layer with animated plasma tendrils.

```ts
const coronaGeometry = new THREE.SphereGeometry(2.15, 48, 48);
const coronaMaterial = new THREE.ShaderMaterial({
    vertexShader: coronaVertexShader,
    fragmentShader: coronaFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uCoronaColor: { value: new THREE.Color(1.0, 0.25, 0.1) },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
});

const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
scene.add(corona);
```

Slightly larger sphere rendered with back-face culling to create wrapping atmospheric glow.

---

### 8. Particle Flare System

```glsl
const particleFlareVertexShader = `
${simplexNoise4D}

uniform float uTime;
attribute float aLifePhase;
attribute vec3 aSourcePos;
attribute vec3 aDirection;
attribute float aSpeed;
attribute float aFlareGroup;
// ... complex vertex shader for particle animation
`;
```

GPU-based flare system with instanced attributes for life cycle, direction, and group-based activity.

```ts
const numFlareStreams = 30;
const particlesPerStream = 20;
const totalParticles = numFlareStreams * particlesPerStream;

const flareGeometry = new THREE.BufferGeometry();
// ... attribute buffer setup for positions, life phases, directions, etc.

const flareMaterial = new THREE.ShaderMaterial({
    vertexShader: particleFlareVertexShader,
    fragmentShader: particleFlareFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uStarRadius: { value: 2.0 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
});

const flareParticles = new THREE.Points(flareGeometry, flareMaterial);
flareParticles.frustumCulled = false;
scene.add(flareParticles);
```

600 particles across 30 streams, each with custom attributes for realistic solar flare behavior.

---

### 9. Post-Processing Setup

```ts
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomResolution = new THREE.Vector2(
    window.innerWidth * 0.8,
    window.innerHeight * 0.8
);
const bloomPass = new UnrealBloomPass(
    bloomResolution,
    2.2, // strength
    0.5, // radius
    0.05, // threshold
);
composer.addPass(bloomPass);
```

EffectComposer with RenderPass and UnrealBloomPass for cinematic highlight amplification.

---

### 10. Animation Loop

```ts
let time = 0;
function animate() {
    time += 0.016; // 60fps delta

    starMaterial.uniforms.uTime.value = time;
    coronaMaterial.uniforms.uTime.value = time;
    flareMaterial.uniforms.uTime.value = time;

    star.rotation.y += 0.001;
    corona.rotation.y -= 0.0008;
    corona.rotation.x += 0.0005;

    controls.update();
    composer.render();
}

renderer.setAnimationLoop(animate);
```

Updates time uniforms, applies subtle rotations, and renders through the post-processing pipeline.

---

### 11. Window Resize Handling

```ts
const handleResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
    composer.setSize(w, h);

    bloomPass.resolution.set(w * 0.8, h * 0.8);
};

window.addEventListener("resize", handleResize);
```

Updates camera, renderer, composer, and bloom resolution to maintain consistent visual quality.

---

### 12. Cleanup

```ts
return () => {
    window.removeEventListener("resize", handleResize);
    renderer.setAnimationLoop(null);
    controls.dispose();
    starGeometry.dispose();
    starMaterial.dispose();
    coronaGeometry.dispose();
    coronaMaterial.dispose();
    flareGeometry.dispose();
    flareMaterial.dispose();
    renderer.dispose();

    if (containerRef.current) {
        containerRef.current.innerHTML = "";
    }
};
```

Disposes all Three.js resources, removes event listeners, and clears the DOM to prevent memory leaks.

## Key Features & Technical Details

### Shader Implementation
- **4D Simplex Noise**: Custom GLSL implementation with analytical derivatives for curl noise computation
- **Curl Noise**: Divergence-free velocity fields created from noise derivatives (`curl = (dY - dZ, dZ - dX, dX - dY)`)
- **Multi-octave Turbulence**: Blends noise layers at different scales (0.8, 2.5, 6.0) for fractal detail
- **Fresnel Effects**: Edge highlighting using `pow(1 - abs(dot(normal, viewDir)), power)` for fiery rims

### Corona Rendering
- Back-face culling ensures glow wraps around star silhouette
- Animated tendrils using varied noise frequencies (3.0 and 7.0 multipliers)
- Pulsating intensity with sine waves and curl magnitude for magnetic loop simulation

### Particle System
- 600 particles across 30 streams for global surface coverage
- Group-based activity control via simplex noise sampling
- Curl noise perturbation for chaotic plasma arc trajectories
- Temperature-based color interpolation modeling blackbody cooling

### Post-Processing Pipeline
- UnrealBloomPass with tuned parameters (strength 2.2, radius 0.5, threshold 0.05)
- Resolution scaling (80% of window size) for performance balance
- Consistent bloom application across star, corona, and particles

### Performance Optimizations
- Pixel ratio clamped to 2 to prevent exponential fragment costs
- Dynamic buffer updates with `THREE.DynamicDrawUsage`
- Frustum culling disabled for particles to ensure complete rendering
- Comprehensive resource disposal to prevent memory leaks

### Use Cases
- Sci-fi landing pages with unstable star/reactor animations
- Astronomical dashboards visualizing solar weather
- Music visualizers syncing with audio beats
- Educational exhibits explaining stellar physics
- Game backgrounds and cinematic VFX references

## Reference Links
- [Simplex noise GLSL implementation](https://github.com/ashima/webgl-noise)
- [Curl noise explanation](https://thebookofshaders.com/11/)
- [Three.js post-processing](https://threejs.org/docs/#examples/en/postprocessing/EffectComposer)
- [Points rendering](https://threejs.org/docs/#api/en/objects/Points)
