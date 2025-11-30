# `ParticleNetwork` Component Documentation

This component renders a dynamic particle swarm within a cubic boundary, with real-time connection lines forming network-like visualizations that can be interactively controlled via UI sliders.

## Overview

The component:

* creates a Three.js scene with drifting particles in a bounded cube
* dynamically draws connection lines between nearby particles with distance-based alpha
* provides real-time UI controls for particle count, connection distance, and visibility toggles
* uses efficient buffer geometry with draw range updates for performance
* allows orbit controls for cinematic camera movement
* demonstrates React state management with Three.js refs for live parameter updates

---

## File Breakdown

### 1. React + DOM setup

```ts
const containerRef = useRef<HTMLDivElement>(null);
const [settings, setSettings] = useState<EffectSettings>({...});

// Refs for Three.js object management
const pointCloudRef = useRef<THREE.Points | null>(null);
const linesMeshRef = useRef<THREE.LineSegments | null>(null);
const particlesGeomRef = useRef<THREE.BufferGeometry | null>(null);
const settingsRef = useRef(settings);
```

A `ref` for the container and React state for UI controls. Additional refs capture Three.js objects for visibility and draw range updates.

`useEffect` ensures Three.js setup runs client-side and synchronizes settings refs.

---

### 2. Scene, Camera, Renderer

```ts
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    4000,
);
camera.position.z = 1750;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
containerRef.current.appendChild(renderer.domElement);
```

Black background scene with perspective camera positioned for wide view of the cube. WebGL renderer with antialiasing and pixel ratio clamping.

---

### 3. Orbit Controls

```ts
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1000;
controls.maxDistance = 3000;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
```

Allows zooming between 1000-3000 units with smooth damping for cinematic camera motion.

---

### 4. Bounding Cube & Constants

```ts
const maxParticleCount = 1000;
const r = 800;
const rHalf = r / 2;

const group = new THREE.Group();
scene.add(group);

const helper = new THREE.BoxHelper(
    new THREE.Mesh(new THREE.BoxGeometry(r, r, r)),
);
(helper.material as THREE.LineBasicMaterial).color.setHex(0x333333);
(helper.material as THREE.LineBasicMaterial).blending = THREE.AdditiveBlending;
group.add(helper);
```

Constants define cube size (800 units) and max particles. Wireframe BoxHelper provides subtle boundary visualization with additive blending.

---

### 5. Particle System Setup

```ts
const particlePositions = new Float32Array(maxParticleCount * 3);
const particlesData: ParticleData[] = [];

for (let i = 0; i < maxParticleCount; i++) {
    const x = Math.random() * r - rHalf;
    const y = Math.random() * r - rHalf;
    const z = Math.random() * r - rHalf;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particlesData.push({
        velocity: new THREE.Vector3(
            -1 + Math.random() * 2,
            -1 + Math.random() * 2,
            -1 + Math.random() * 2,
        ),
        numConnections: 0,
    });
}
```

Random particle positions within cube bounds and velocity vectors for continuous motion. Each particle tracks connection count for limit enforcement.

---

### 6. Points Geometry & Material

```ts
const particles = new THREE.BufferGeometry();
particles.setDrawRange(0, settingsRef.current.particleCount);
particles.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3).setUsage(
        THREE.DynamicDrawUsage,
    ),
);

const pMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 4,
    blending: THREE.AdditiveBlending,
    transparent: true,
    sizeAttenuation: false,
});

const pointCloud = new THREE.Points(particles, pMaterial);
pointCloudRef.current = pointCloud;
group.add(pointCloud);
```

BufferGeometry with dynamic draw usage for frequent position updates. PointsMaterial with constant size and additive blending for crisp, glowing dots.

---

### 7. Connection Lines Setup

```ts
const segments = maxParticleCount * maxParticleCount;
const positions = new Float32Array(segments * 3);
const colors = new Float32Array(segments * 3);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
);
geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage),
);

const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
});

const linesMesh = new THREE.LineSegments(geometry, material);
linesMeshRef.current = linesMesh;
group.add(linesMesh);
```

Separate buffer geometry for line segments with position and color attributes. LineBasicMaterial with vertex colors and additive blending for connection visualization.

---

### 8. Animation Loop

```ts
function animate() {
    const currentSettings = settingsRef.current;
    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    // Reset connection counts
    for (let i = 0; i < currentSettings.particleCount; i++) {
        particlesData[i].numConnections = 0;
    }

    // Update particle positions and check connections
    for (let i = 0; i < currentSettings.particleCount; i++) {
        const particleData = particlesData[i];
        // ... position updates and boundary collisions
        // ... nested loop for distance checks and line drawing
    }

    linesMesh.geometry.setDrawRange(0, numConnected * 2);
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    pointCloud.geometry.attributes.position.needsUpdate = true;

    const time = Date.now() * 0.001;
    group.rotation.y = time * 0.1;

    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
```

Main animation loop handles particle motion, boundary collisions, distance-based connections, and buffer updates. Group rotation adds visual dynamism.

---

### 9. Interactive Controls UI

```tsx
<div className="fixed top-16 left-5 z-[1000] bg-black/70 px-4 py-3.5 rounded-md text-xs max-w-[220px]">
    {/* Checkboxes for showDots, showLines, limitConnections */}
    {/* Range sliders for minDistance, maxConnections, particleCount */}
</div>
```

Fixed overlay panel with Tailwind styling containing toggles and sliders. Updates React state which synchronizes to settingsRef for animation loop access.

---

### 10. Window Resize Handling

```ts
const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("resize", handleResize);
```

Updates camera aspect and renderer size to maintain correct perspective.

---

### 11. Cleanup

```ts
return () => {
    window.removeEventListener("resize", handleResize);
    renderer.setAnimationLoop(null);
    controls.dispose();
    particles.dispose();
    geometry.dispose();
    pMaterial.dispose();
    material.dispose();
    renderer.dispose();

    pointCloudRef.current = null;
    linesMeshRef.current = null;
    particlesGeomRef.current = null;

    if (containerRef.current) {
        containerRef.current.innerHTML = "";
    }
};
```

Disposes all geometries, materials, and Three.js resources. Clears refs and DOM to prevent memory leaks.

## Key Features & Technical Details

### Distance-Based Connections
- Euclidean distance calculations: `sqrt(dx^2 + dy^2 + dz^2)` between particle pairs
- Alpha fades linearly with normalized distance: `1 - dist / minDistance`
- Optional connection limits prevent hub particles from dominating

### Performance Optimizations
- O(n²) distance checks limited by `particleCount` slider
- `limitConnections` drastically reduces iterations by capping per-particle links
- Dynamic draw usage hints optimize frequent buffer updates
- Draw range updates avoid rendering unused vertices

### Boundary Physics
- Velocity reflection: boundary collisions invert velocity components
- Constant velocity integration: `p = p + v * dt` (dt = 1 per frame)

### UI Integration
- React state drives Three.js parameters via synchronized refs
- Real-time slider adjustments without animation interruption
- DOM overlays avoid interfering with WebGL canvas controls

### Use Cases
- Tech landing pages with abstract network visualizations
- Data dashboards showing service connectivity
- Music visualizers with pulsing connection patterns
- Educational physics simulations
- AR/VR prototypes with spatial node graphs

## Reference Links
- [BufferGeometry draw range](https://threejs.org/examples/?q=buffer#webgl_buffergeometry_drawrange)
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)
- [React + Three.js](https://threejs.org/manual/#en/react)
