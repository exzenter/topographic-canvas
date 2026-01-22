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

### 1. Core Rendering: **HTML5 Canvas (2D Context)**
We are **not** using a 3D library like Three.js or WebGL. Instead, we are using the standard 2D Canvas API (`ctx.beginPath()`, `ctx.lineTo()`, `ctx.stroke()`) to draw the lines.

### 2. 3D Engine: **Custom "Pseudo-3D" Projection**
Since we aren't using a 3D library, the 3D logic is manually implemented in `TopographicCanvas.js`:
*   **Point Generation**: We calculate raw X, Y, Z coordinates for geometric shapes (spheres, cubes, toruses).
*   **Projection**: We basically flatten these 3D coordinates onto the 2D screen using simple math: `screenX = x * scale` and `screenY = y * scale`.
*   **Rotation**: We apply 3D rotation matrices manually to the X, Y, Z coordinates before projecting them.

### 3. Animation Logic
*   **Loop**: Driven by `requestAnimationFrame` for smooth 60fps performance.
*   **Procedural Noise**: We use a **Simplex Noise** algorithm (imported from `./simplex-noise`) to generate the organic, wavy "terrain" effect by modifying the radius/position of points over time.
*   **Interpolation**: We use Linear Interpolation (LERP) functions to calculate the intermediate states for:
    *   **Morphing**: Blending point positions between two shapes.
    *   **Colors**: Blending start/end hues.

### 4. Integration
*   **Frontend**: Pure Vanilla JS (ES6 class structure) for maximum performance and zero dependencies.
*   **Editor**: React & `@wordpress/components` for the UI controls in the block editor.

## Credits

Created by [Exzenter](https://github.com/exzenter).


Topographic Canvas Configuration API
Complete reference for all configurable options in the topographic canvas animation. All settings are exposed via the global config object.

Access Pattern
// To modify settings from external JavaScript:
const canvasConfig = window.config; // Access the config object
canvasConfig.noiseAmplitude = 50;   // Modify any property
Shape & Visual Mode
shape (String)
Accepted Values: 'sphere', 'cube', 'pyramid', 'plane', 'torus', 'cylinder', 'cone'
Default: 'sphere'

mode (String)
Accepted Values: 'wavy', 'bands', 'cellular', 'turbulent', 'spiral', 'ripple'
Default: 'wavy'

Color Settings
colorMode (String)
Accepted Values: 'mono', 'color'
Default: 'mono'

lineColor (String - Hex Color)
Format: Hex color code (e.g., '#ffffff')
Default: '#ffffff'
Note: Only applies when colorMode is 'mono'

hueStart (Number)
Min: 0
Max: 360
Step: 1
Default: 180
Note: Only applies when colorMode is 'color'

hueEnd (Number)
Min: 0
Max: 360
Step: 1
Default: 280
Note: Only applies when colorMode is 'color'

bgColor (String - Hex Color)
Format: Hex color code
Default: '#0a0a0a'

Performance Settings
lineDensity (Number - Integer)
Min: 20
Max: 120
Step: 1
Default: 60
Description: Number of horizontal lines on the shape

lineSegments (Number - Integer)
Min: 60
Max: 300
Step: 1
Default: 150
Description: Points per line (detail level)

Shape Geometry
sphereSize (Number - Integer)
Min: 100
Max: 500
Step: 1
Default: 280

Noise & Distortion
noiseScale (Number)
Min: 0.5
Max: 5
Step: 0.1
Default: 2
Decimals: 1

noiseAmplitude (Number - Integer)
Min: 0
Max: 100
Step: 1
Default: 30

animationSpeed (Number - Integer)
Min: 0
Max: 200
Step: 1
Default: 50

Line Appearance
lineWidth (Number)
Min: 0.2
Max: 3
Step: 0.1
Default: 0.8
Decimals: 1

lineOpacity (Number)
Min: 0.1
Max: 1
Step: 0.05
Default: 0.7
Decimals: 2

depthFade (Boolean)
Default: true

glowEffect (Boolean)
Default: false

Mode-Specific Settings
Wavy Mode
wavyOctave2Strength (Number)
Min: 0
Max: 1
Step: 0.05
Default: 0.5
Decimals: 2

wavyOctave3Strength (Number)
Min: 0
Max: 1
Step: 0.05
Default: 0.25
Decimals: 2

wavyOctave2Freq (Number)
Min: 1
Max: 5
Step: 0.1
Default: 2
Decimals: 1

wavyOctave3Freq (Number)
Min: 1
Max: 8
Step: 0.1
Default: 4
Decimals: 1

wavyTime2 (Number)
Min: 0.5
Max: 3
Step: 0.1
Default: 1.5
Decimals: 1

wavyTime3 (Number)
Min: 0.5
Max: 4
Step: 0.1
Default: 2
Decimals: 1

Bands Mode
bandsDensity (Number - Integer)
Min: 2
Max: 20
Step: 1
Default: 8

bandsNoiseInfluence (Number)
Min: 0
Max: 1
Step: 0.05
Default: 0.7
Decimals: 2

bandsTimeScale (Number)
Min: 0.5
Max: 5
Step: 0.1
Default: 2
Decimals: 1

bandsAngleScale (Number)
Min: 0.1
Max: 2
Step: 0.1
Default: 0.5
Decimals: 1

bandsYScale (Number)
Min: 0.5
Max: 5
Step: 0.1
Default: 2
Decimals: 1

bandsStrength (Number)
Min: 0
Max: 1
Step: 0.05
Default: 0.3
Decimals: 2

Cellular Mode
cellularFreq1 (Number)
Min: 1
Max: 8
Step: 0.5
Default: 3
Decimals: 1

cellularFreq2 (Number)
Min: 2
Max: 12
Step: 0.5
Default: 6
Decimals: 1

cellularTime2 (Number)
Min: 0.1
Max: 2
Step: 0.1
Default: 0.5
Decimals: 1

cellularAmpBoost (Number)
Min: 0.5
Max: 3
Step: 0.1
Default: 1.5
Decimals: 1

cellularSharpness (Number)
Min: 1
Max: 4
Step: 0.1
Default: 2
Decimals: 1

Turbulent Mode
turbulentOctaves (Number - Integer)
Min: 1
Max: 8
Step: 1
Default: 5

turbulentLacunarity (Number)
Min: 1.5
Max: 3
Step: 0.1
Default: 2
Decimals: 1

turbulentPersistence (Number)
Min: 0.2
Max: 0.8
Step: 0.05
Default: 0.5
Decimals: 2

turbulentTimeMult (Number)
Min: 0.1
Max: 1
Step: 0.05
Default: 0.3
Decimals: 2

turbulentTimeOffset (Number)
Min: 0
Max: 2
Step: 0.1
Default: 1
Decimals: 1

Spiral Mode
spiralArms (Number - Integer)
Min: 1
Max: 8
Step: 1
Default: 3

spiralTwist (Number)
Min: 1
Max: 15
Step: 0.5
Default: 5
Decimals: 1

spiralTimeScale (Number)
Min: 0.5
Max: 5
Step: 0.1
Default: 2
Decimals: 1

spiralNoiseBlend (Number)
Min: 0
Max: 1
Step: 0.05
Default: 0.5
Decimals: 2

spiralStrength (Number)
Min: 0.1
Max: 1
Step: 0.05
Default: 0.5
Decimals: 2

Ripple Mode
rippleFrequency (Number - Integer)
Min: 2
Max: 20
Step: 1
Default: 10

rippleSpeed (Number)
Min: 0.5
Max: 8
Step: 0.5
Default: 3
Decimals: 1

rippleStrength (Number)
Min: 0.1
Max: 1
Step: 0.05
Default: 0.5
Decimals: 2

rippleNoiseBlend (Number)
Min: 0
Max: 1
Step: 0.05
Default: 0.5
Decimals: 2

rippleNoiseTime (Number)
Min: 0.1
Max: 2
Step: 0.1
Default: 0.5
Decimals: 1

Movement & Interaction Settings
Auto Rotation
autoRotate (Boolean)
Default: true

rotationSpeed (Number - Integer)
Min: 0
Max: 100
Step: 1
Default: 20

rotationDirX (Number - Integer)
Min: -180
Max: 180
Step: 1
Default: 0
Description: X-Axis rotation direction in degrees

rotationDirY (Number - Integer)
Min: -180
Max: 180
Step: 1
Default: 90
Description: Y-Axis rotation direction in degrees

rotationDirZ (Number - Integer)
Min: -180
Max: 180
Step: 1
Default: 0
Description: Z-Axis rotation direction in degrees

rotationMode (String)
Accepted Values: 'constant', 'pendulum', 'random', 'orbital', 'wobble', 'chaos'
Default: 'constant'

pendulumAmplitude (Number - Integer)
Min: 10
Max: 180
Step: 1
Default: 45
Description: Degrees of swing for pendulum mode

Mouse Drag
dragEnabled (Boolean)
Default: true

dragSensitivity (Number)
Min: 0.1
Max: 3
Step: 0.1
Default: 1
Decimals: 1

dragInertia (Boolean)
Default: true
Description: Enable momentum/inertia

inertiaDecay (Number)
Min: 0.9
Max: 0.99
Step: 0.01
Default: 0.95
Decimals: 2

autoBounceBack (Boolean)
Default: false

bounceBackSpeed (Number)
Min: 0.01
Max: 0.2
Step: 0.01
Default: 0.05
Decimals: 2

clampRotation (Boolean)
Default: false
Description: Clamp X rotation

maxXRotation (Number - Integer)
Min: 15
Max: 180
Step: 1
Default: 90
Description: Max X rotation in degrees

Hover/Mouseover
hoverEnabled (Boolean)
Default: false

hoverMode (String)
Accepted Values: 'tilt', 'repel', 'follow', 'parallax'
Default: 'tilt'

hoverStrength (Number)
Min: 0.1
Max: 3
Step: 0.1
Default: 1
Decimals: 1

hoverSmoothing (Number)
Min: 0.01
Max: 0.3
Step: 0.01
Default: 0.08
Decimals: 2

hoverAffectsNoise (Boolean)
Default: false

hoverNoiseInfluence (Number - Integer)
Min: 0
Max: 50
Step: 1
Default: 10

Random Motion
randomMotion (Boolean)
Default: false

randomMode (String)
Accepted Values: 'gentle', 'jitter', 'pulse', 'earthquake', 'breathing'
Default: 'gentle'

randomIntensity (Number)
Min: 0.1
Max: 5
Step: 0.1
Default: 1
Decimals: 1

randomSpeed (Number)
Min: 0.1
Max: 5
Step: 0.1
Default: 1
Decimals: 1

Advanced Settings
easingFunction (String)
Accepted Values: 'linear', 'easeOut', 'easeInOut', 'elastic', 'bounce'
Default: 'easeOut'

smoothingFactor (Number)
Min: 0.01
Max: 0.3
Step: 0.01
Default: 0.05
Decimals: 2

mouseWheelZoom (Boolean)
Default: false

zoomSensitivity (Number)
Min: 0.1
Max: 3
Step: 0.1
Default: 1
Decimals: 1

Scroll-Driven Animation Example
// Example: Animate settings based on scroll position
window.addEventListener('scroll', () => {
    // Get scroll progress (0 to 1)
    const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    
    // Map scroll to noise amplitude (30 to 100)
    config.noiseAmplitude = 30 + (scrollProgress * 70);
    
    // Map scroll to rotation speed (0 to 100)
    config.rotationSpeed = scrollProgress * 100;
    
    // Change mode at specific waypoints
    if (scrollProgress < 0.25) {
        config.mode = 'wavy';
    } else if (scrollProgress < 0.5) {
        config.mode = 'bands';
    } else if (scrollProgress < 0.75) {
        config.mode = 'spiral';
    } else {
        config.mode = 'turbulent';
    }
});
Notes
Decimals: Indicates the number of decimal places for precision
Step: The increment value for sliders
All numerical values can be set programmatically beyond their UI min/max ranges, but visual results may vary
Boolean values accept true or false
String values (modes, colors) are case-sensitive
Changes to config properties take effect immediately in the animation loop