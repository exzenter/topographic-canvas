# Topographic Canvas Animation

A high-performance, interactive HTML5 Canvas animation featuring topographic lines, 3D shapes, and dynamic noise effects.

![Topographic Canvas](https://github.com/exzenter/topographic-canvas/raw/main/preview.png)
*(Note: You can add a screenshot named `preview.png` to the repo for the image above to work)*

## Features

- **7 3D Shapes**: Sphere, Cube, Pyramid, Plane, Torus, Cylinder, Cone.
- **6 Noise Modes**: 
  - **Wavy Organic**: ClassicPerlin-like noise.
  - **Horizontal Bands**: Linear stratified patterns.
  - **Cellular**: Voronoi-like cellular structures.
  - **Turbulent**: High-frequency, stormy details.
  - **Spiral**: Twisting, vortex-like distortions.
  - **Ripple**: Concentric wave emanations.
- **Interactive Controls**:
  - **Shape Selection**: Switch between geometries instantly.
  - **View Presets**: One-click camera angles (Top, Front, Side, Isometric).
  - **Fine-grained Tweaking**: Adjust line density, segments, noise scale, amplitude, speed, and more.
  - **Mouse Interaction**: Click and drag to rotate, scroll to zoom (if enabled).
- **Customizable Appearance**:
  - Light/Dark background support.
  - Line color, width, and opacity control.
  - Color mapping (Monochrome vs. Colorful).
  - Depth fade and glow effects.

## Usage

Simply open `index.html` in a modern web browser.

For development:
```bash
# Install dependencies (if using a local server for dev)
npm install

# Run local development server
npx serve
```

## Technologies

- **HTML5 Canvas**: For high-performance 2D/3D rendering.
- **Vanilla JavaScript**: No heavy frameworks, just pure JS logic.
- **Simplex Noise**: Implementation for smooth, organic procedural generation.
- **CSS3**: Modern styling for the glassmorphism settings panel.

## Credits

Created by [Exzenter](https://github.com/exzenter).
