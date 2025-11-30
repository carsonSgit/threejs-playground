# `AsciiEarth` Component Documentation

This component renders a rotating Earth sphere using **Three.js**, but instead of normal WebGL output, it converts the scene into ASCII characters using `AsciiEffect`.

## Overview

The component:

* creates a Three.js scene containing a textured Earth sphere
* renders it using ASCII characters instead of pixels
* allows user interaction via orbit controls
* handles window resizing and performs proper cleanup

---

## File Breakdown

### 1. React + DOM setup

```ts
const containerRef = useRef<HTMLDivElement>(null);
```

A `ref` is used because Three.js requires direct access to a real DOM element to insert the WebGL and ASCII canvases.

`useEffect` ensures everything runs after the component mounts.

---

## Scene, Camera, Renderer

### Creating the scene

```ts
const scene = new THREE.Scene();
```

Simple empty scene to hold objects.

### Setting up the camera

```ts
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3);
```

A standard perspective camera. Positioned slightly away from the origin so the Earth is visible.

### WebGL renderer

```ts
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
```

Normal Three.js renderer — but note it will not be displayed; it's only required because the ASCII effect uses it internally.

---

## ASCII Effect

```ts
const effect = new AsciiEffect(renderer, " .=+*#%", { invert: true });
effect.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.display = "none";
```

`AsciiEffect` wraps the WebGL renderer and converts each rendered frame to characters.

* `" .=+*#%"`: character palette used for brightness mapping
* `invert: true`: flips dark/bright mapping
* Hides the original WebGL canvas so only ASCII is visible.

The ASCII output is inserted into the DOM:

```ts
containerRef.current.appendChild(effect.domElement);
```

---

## Orbit Controls

```ts
const controls = new OrbitControls(camera, effect.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
```

Allows the user to rotate around the ASCII-rendered Earth.
Damping adds smooth motion.

---

## Texture Loading + Darkening

### Load texture

```ts
const earthTexture = textureLoader.load("/assets/textures/earth_daymap.jpg");
earthTexture.colorSpace = THREE.SRGBColorSpace;
```

The Earth’s daymap texture.

### Darkening logic

Because ASCII art has limited range, bright textures wash out.
This block darkens every pixel by 50%:

```ts
const canvas = document.createElement("canvas");
ctx.drawImage(earthTexture.image, 0, 0);
const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

for (let i = 0; i < data.length; i += 4) {
  data[i] *= 0.5;     // R
  data[i + 1] *= 0.5; // G
  data[i + 2] *= 0.5; // B
}
```

The modified pixel data is written back and the texture updated.

The end result is an Earth texture better suited to ASCII shading.

---

## Earth Geometry & Mesh

```ts
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);

scene.add(earth);
```

* `SphereGeometry(1, 64, 64)`: radius 1, high subdivision for smoother ASCII
* `MeshBasicMaterial`: works without lighting, ideal because ASCII shading will do the work
* The mesh is added to the scene.

---

## Animation Loop

```ts
function animate() {
  earth.rotation.y += 0.002;
  earth.rotation.x += 0.003;

  controls.update();
  effect.render(scene, camera);
}
renderer.setAnimationLoop(animate);
```

The Earth slowly rotates on both axes.

`effect.render` is used instead of `renderer.render` since ASCII transforms the frame.

---

## Window Resize Handling

```ts
const w = window.innerWidth;
const h = window.innerHeight;

camera.aspect = w / h;
camera.updateProjectionMatrix();

renderer.setSize(w, h);
effect.setSize(w, h);
```

Both the renderer and the ASCII effect are resized so the ASCII characters stay properly spaced.

---

## Cleanup

During component unmount:

```ts
renderer.setAnimationLoop(null);
controls.dispose();
earthGeometry.dispose();
earthMaterial.dispose();
earthTexture.dispose();
renderer.dispose();
containerRef.current.innerHTML = "";
```

This prevents:

* WebGL context leaks
* orphaned DOM nodes
* continued animation loops after leaving page

Everything is disposed correctly.

