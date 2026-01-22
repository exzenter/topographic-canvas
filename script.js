// ============================================
// Topographic Sphere Canvas Animation
// ============================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// ============================================
// Configuration & State
// ============================================
const config = {
    // Visual
    shape: 'sphere',
    mode: 'wavy',
    colorMode: 'mono',
    lineColor: '#ffffff',
    hueStart: 180,
    hueEnd: 280,
    lineDensity: 60,
    lineSegments: 150,
    sphereSize: 280,
    noiseScale: 2,
    noiseAmplitude: 30,
    animationSpeed: 50,
    lineWidth: 0.8,
    lineOpacity: 0.7,
    depthFade: true,
    glowEffect: false,
    bgColor: '#0a0a0a',

    // ============================================
    // MODE-SPECIFIC SETTINGS
    // ============================================

    // Wavy Mode
    wavyOctave2Strength: 0.5,
    wavyOctave3Strength: 0.25,
    wavyOctave2Freq: 2,
    wavyOctave3Freq: 4,
    wavyTime2: 1.5,
    wavyTime3: 2,

    // Bands Mode
    bandsDensity: 8,
    bandsNoiseInfluence: 0.7,
    bandsTimeScale: 2,
    bandsAngleScale: 0.5,
    bandsYScale: 2,
    bandsStrength: 0.3,

    // Cellular Mode
    cellularFreq1: 3,
    cellularFreq2: 6,
    cellularTime2: 0.5,
    cellularAmpBoost: 1.5,
    cellularSharpness: 2,

    // Turbulent Mode
    turbulentOctaves: 5,
    turbulentLacunarity: 2,
    turbulentPersistence: 0.5,
    turbulentTimeMult: 0.3,
    turbulentTimeOffset: 1,

    // Spiral Mode
    spiralArms: 3,
    spiralTwist: 5,
    spiralTimeScale: 2,
    spiralNoiseBlend: 0.5,
    spiralStrength: 0.5,

    // Ripple Mode
    rippleFrequency: 10,
    rippleSpeed: 3,
    rippleStrength: 0.5,
    rippleNoiseBlend: 0.5,
    rippleNoiseTime: 0.5,

    // Auto Rotation
    autoRotate: true,
    rotationSpeed: 20,
    rotationDirX: 0,
    rotationDirY: 90,
    rotationDirZ: 0,
    rotationMode: 'constant',
    pendulumAmplitude: 45,

    // Mouse Drag
    dragEnabled: true,
    dragSensitivity: 1,
    dragInertia: true,
    inertiaDecay: 0.95,
    autoBounceBack: false,
    bounceBackSpeed: 0.05,
    clampRotation: false,
    maxXRotation: 90,

    // Hover
    hoverEnabled: false,
    hoverMode: 'tilt',
    hoverStrength: 1,
    hoverSmoothing: 0.08,
    hoverAffectsNoise: false,
    hoverNoiseInfluence: 10,

    // Random Motion
    randomMotion: false,
    randomMode: 'gentle',
    randomIntensity: 1,
    randomSpeed: 1,

    // Advanced
    easingFunction: 'easeOut',
    smoothingFactor: 0.05,
    mouseWheelZoom: false,
    zoomSensitivity: 1
};

const state = {
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    targetRotationZ: 0,
    baseRotationX: 0,
    baseRotationY: 0,
    baseRotationZ: 0,
    velocityX: 0,
    velocityY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    mouseX: 0,
    mouseY: 0,
    hoverOffsetX: 0,
    hoverOffsetY: 0,
    randomOffsetX: 0,
    randomOffsetY: 0,
    randomOffsetZ: 0,
    noiseOffset: 0,
    time: 0,
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    zoomFactor: 1
};

// ============================================
// Simplex Noise Implementation
// ============================================
class SimplexNoise {
    constructor(seed = Math.random() * 10000) {
        this.p = new Uint8Array(256);
        this.perm = new Uint8Array(512);
        this.permMod12 = new Uint8Array(512);

        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }

        let s = seed;
        for (let i = 255; i > 0; i--) {
            s = (s * 16807) % 2147483647;
            const j = s % (i + 1);
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }

        this.grad3 = new Float32Array([
            1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
            1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
            0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
        ]);

        this.F3 = 1.0 / 3.0;
        this.G3 = 1.0 / 6.0;
    }

    noise3D(x, y, z) {
        const { perm, permMod12, grad3, F3, G3 } = this;

        const s = (x + y + z) * F3;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const k = Math.floor(z + s);

        const t = (i + j + k) * G3;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        const x0 = x - X0;
        const y0 = y - Y0;
        const z0 = z - Z0;

        let i1, j1, k1, i2, j2, k2;

        if (x0 >= y0) {
            if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
            else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
            else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
        } else {
            if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
            else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
            else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        }

        const x1 = x0 - i1 + G3;
        const y1 = y0 - j1 + G3;
        const z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2.0 * G3;
        const y2 = y0 - j2 + 2.0 * G3;
        const z2 = z0 - k2 + 2.0 * G3;
        const x3 = x0 - 1.0 + 3.0 * G3;
        const y3 = y0 - 1.0 + 3.0 * G3;
        const z3 = z0 - 1.0 + 3.0 * G3;

        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;

        let n = 0;

        let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 >= 0) {
            const gi = permMod12[ii + perm[jj + perm[kk]]] * 3;
            t0 *= t0;
            n += t0 * t0 * (grad3[gi] * x0 + grad3[gi + 1] * y0 + grad3[gi + 2] * z0);
        }

        let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 >= 0) {
            const gi = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
            t1 *= t1;
            n += t1 * t1 * (grad3[gi] * x1 + grad3[gi + 1] * y1 + grad3[gi + 2] * z1);
        }

        let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 >= 0) {
            const gi = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
            t2 *= t2;
            n += t2 * t2 * (grad3[gi] * x2 + grad3[gi + 1] * y2 + grad3[gi + 2] * z2);
        }

        let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 >= 0) {
            const gi = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
            t3 *= t3;
            n += t3 * t3 * (grad3[gi] * x3 + grad3[gi + 1] * y3 + grad3[gi + 2] * z3);
        }

        return 32.0 * n;
    }
}

const noise = new SimplexNoise();

// ============================================
// Easing Functions
// ============================================
const easingFunctions = {
    linear: (t) => t,
    easeOut: (t) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    elastic: (t) => {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    },
    bounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
};

// ============================================
// Mode-specific displacement functions
// ============================================
const displacementModes = {
    wavy: (x, y, z, t, scale, amp, noiseOffset) => {
        const n1 = noise.noise3D(x * scale, y * scale, z * scale + t + noiseOffset);
        const n2 = noise.noise3D(
            x * scale * config.wavyOctave2Freq,
            y * scale * config.wavyOctave2Freq,
            z * scale * config.wavyOctave2Freq + t * config.wavyTime2
        ) * config.wavyOctave2Strength;
        const n3 = noise.noise3D(
            x * scale * config.wavyOctave3Freq,
            y * scale * config.wavyOctave3Freq,
            z * scale * config.wavyOctave3Freq + t * config.wavyTime3
        ) * config.wavyOctave3Strength;
        return (n1 + n2 + n3) * amp;
    },

    bands: (x, y, z, t, scale, amp, noiseOffset) => {
        const angle = Math.atan2(z, x);
        const n = noise.noise3D(
            angle * scale * config.bandsAngleScale,
            y * scale * config.bandsYScale,
            t + noiseOffset
        );
        const bands = Math.sin(y * scale * config.bandsDensity + t * config.bandsTimeScale) * config.bandsStrength;
        return (n * config.bandsNoiseInfluence + bands) * amp;
    },

    cellular: (x, y, z, t, scale, amp, noiseOffset) => {
        const n1 = noise.noise3D(
            x * scale * config.cellularFreq1,
            y * scale * config.cellularFreq1,
            z * scale * config.cellularFreq1 + t + noiseOffset
        );
        const n2 = noise.noise3D(
            x * scale * config.cellularFreq2,
            y * scale * config.cellularFreq2,
            z * scale * config.cellularFreq2 + t * config.cellularTime2
        );
        const cellular = Math.pow(Math.abs(n1 * 2), config.cellularSharpness / 2) *
            Math.pow(Math.abs(n2 * 2), config.cellularSharpness / 2);
        return cellular * amp * config.cellularAmpBoost;
    },

    turbulent: (x, y, z, t, scale, amp, noiseOffset) => {
        let value = 0;
        let amplitude = 1;
        let frequency = scale;
        const octaves = Math.floor(config.turbulentOctaves);
        for (let i = 0; i < octaves; i++) {
            value += Math.abs(noise.noise3D(
                x * frequency,
                y * frequency,
                z * frequency + t * (i + config.turbulentTimeOffset) * config.turbulentTimeMult + noiseOffset
            )) * amplitude;
            amplitude *= config.turbulentPersistence;
            frequency *= config.turbulentLacunarity;
        }
        return value * amp;
    },

    spiral: (x, y, z, t, scale, amp, noiseOffset) => {
        const angle = Math.atan2(z, x);
        const spiral = Math.sin(
            angle * config.spiralArms +
            y * scale * config.spiralTwist +
            t * config.spiralTimeScale +
            noiseOffset
        );
        const n = noise.noise3D(x * scale, y * scale, z * scale + t);
        const spiralWeight = config.spiralStrength;
        const noiseWeight = config.spiralNoiseBlend;
        return (spiral * spiralWeight + n * noiseWeight) * amp;
    },

    ripple: (x, y, z, t, scale, amp, noiseOffset) => {
        const dist = Math.sqrt(x * x + y * y + z * z);
        const ripple = Math.sin(
            dist * scale * config.rippleFrequency -
            t * config.rippleSpeed +
            noiseOffset
        ) * config.rippleStrength;
        const n = noise.noise3D(
            x * scale,
            y * scale,
            z * scale + t * config.rippleNoiseTime
        ) * config.rippleNoiseBlend;
        return (ripple + n) * amp;
    }
};

// ============================================
// 3D Math Utilities
// ============================================
function rotateX(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: point.x,
        y: point.y * cos - point.z * sin,
        z: point.y * sin + point.z * cos
    };
}

function rotateY(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: point.x * cos + point.z * sin,
        y: point.y,
        z: -point.x * sin + point.z * cos
    };
}

function rotateZ(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: point.x * cos - point.y * sin,
        y: point.x * sin + point.y * cos,
        z: point.z
    };
}

// ============================================
// Movement Calculations
// ============================================
function calculateAutoRotation(deltaTime) {
    if (!config.autoRotate) return { x: 0, y: 0, z: 0 };

    const speed = config.rotationSpeed * 0.0005;
    const dirX = config.rotationDirX * Math.PI / 180;
    const dirY = config.rotationDirY * Math.PI / 180;
    const dirZ = config.rotationDirZ * Math.PI / 180;

    let rotX = 0, rotY = 0, rotZ = 0;

    switch (config.rotationMode) {
        case 'constant':
            rotX = Math.sin(dirX) * speed;
            rotY = Math.sin(dirY) * speed;
            rotZ = Math.sin(dirZ) * speed;
            break;

        case 'pendulum':
            const amp = config.pendulumAmplitude * Math.PI / 180;
            const swing = Math.sin(state.time * speed * 50);
            rotX = swing * amp * Math.abs(Math.sin(dirX)) * 0.02;
            rotY = swing * amp * Math.abs(Math.sin(dirY)) * 0.02;
            rotZ = swing * amp * Math.abs(Math.sin(dirZ)) * 0.02;
            break;

        case 'random':
            const rSpeed = speed * 20;
            rotX = noise.noise3D(state.time * rSpeed, 0, 0) * speed * 2;
            rotY = noise.noise3D(0, state.time * rSpeed, 1) * speed * 2;
            rotZ = noise.noise3D(0, 1, state.time * rSpeed) * speed;
            break;

        case 'orbital':
            rotX = Math.sin(state.time * speed * 30) * speed * 0.5;
            rotY = speed;
            rotZ = Math.cos(state.time * speed * 30) * speed * 0.3;
            break;

        case 'wobble':
            rotX = Math.sin(state.time * speed * 50) * speed * 1.5;
            rotY = Math.cos(state.time * speed * 40) * speed;
            rotZ = Math.sin(state.time * speed * 60 + 1) * speed * 0.5;
            break;

        case 'chaos':
            const chaos1 = noise.noise3D(state.time * 2, 0, 0);
            const chaos2 = noise.noise3D(0, state.time * 2.5, 0);
            const chaos3 = noise.noise3D(0, 0, state.time * 3);
            rotX = chaos1 * speed * 3;
            rotY = chaos2 * speed * 3;
            rotZ = chaos3 * speed * 2;
            break;
    }

    return { x: rotX, y: rotY, z: rotZ };
}

function calculateRandomMotion() {
    if (!config.randomMotion) {
        state.randomOffsetX *= 0.95;
        state.randomOffsetY *= 0.95;
        state.randomOffsetZ *= 0.95;
        return;
    }

    const intensity = config.randomIntensity * 0.01;
    const speed = config.randomSpeed;
    const t = state.time * speed;

    switch (config.randomMode) {
        case 'gentle':
            state.randomOffsetX = noise.noise3D(t * 0.5, 0, 0) * intensity;
            state.randomOffsetY = noise.noise3D(0, t * 0.5, 0) * intensity;
            state.randomOffsetZ = noise.noise3D(0, 0, t * 0.5) * intensity * 0.5;
            break;

        case 'jitter':
            state.randomOffsetX = (Math.random() - 0.5) * intensity * 0.5;
            state.randomOffsetY = (Math.random() - 0.5) * intensity * 0.5;
            state.randomOffsetZ = (Math.random() - 0.5) * intensity * 0.3;
            break;

        case 'pulse':
            const pulse = Math.sin(t * 5) * 0.5 + 0.5;
            state.randomOffsetX = noise.noise3D(t, 0, 0) * intensity * pulse;
            state.randomOffsetY = noise.noise3D(0, t, 0) * intensity * pulse;
            break;

        case 'earthquake':
            const quake = Math.random() > 0.98 ? 1 : 0.1;
            state.randomOffsetX += (Math.random() - 0.5) * intensity * quake;
            state.randomOffsetY += (Math.random() - 0.5) * intensity * quake;
            state.randomOffsetX *= 0.9;
            state.randomOffsetY *= 0.9;
            break;

        case 'breathing':
            const breath = Math.sin(t * 2) * 0.5 + 0.5;
            state.randomOffsetX = Math.sin(t * 0.7) * intensity * breath * 0.5;
            state.randomOffsetY = Math.cos(t * 0.6) * intensity * breath * 0.5;
            break;
    }
}

function calculateHoverEffect() {
    if (!config.hoverEnabled || state.isDragging) {
        state.hoverOffsetX *= (1 - config.hoverSmoothing);
        state.hoverOffsetY *= (1 - config.hoverSmoothing);
        return;
    }

    const normalizedX = (state.mouseX - state.centerX) / state.centerX;
    const normalizedY = (state.mouseY - state.centerY) / state.centerY;
    const strength = config.hoverStrength * 0.5;

    let targetX = 0, targetY = 0;

    switch (config.hoverMode) {
        case 'tilt':
            targetX = normalizedY * strength;
            targetY = -normalizedX * strength;
            break;

        case 'repel':
            targetX = -normalizedY * strength;
            targetY = normalizedX * strength;
            break;

        case 'follow':
            targetX = normalizedY * strength * 0.5;
            targetY = normalizedX * strength * 0.5;
            break;

        case 'parallax':
            targetX = normalizedY * strength * 0.3;
            targetY = normalizedX * strength * 0.3;
            break;
    }

    state.hoverOffsetX += (targetX - state.hoverOffsetX) * config.hoverSmoothing;
    state.hoverOffsetY += (targetY - state.hoverOffsetY) * config.hoverSmoothing;

    // Hover affects noise
    if (config.hoverAffectsNoise) {
        const dist = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
        state.noiseOffset = dist * config.hoverNoiseInfluence * 0.1;
    } else {
        state.noiseOffset *= 0.95;
    }
}

function applyEasing(current, target, factor) {
    const diff = target - current;
    const easeFn = easingFunctions[config.easingFunction] || easingFunctions.easeOut;

    // Simple smoothing with easing influence
    return current + diff * factor;
}

// ============================================
// Shape Generation & Rendering
// ============================================

// Apply noise displacement to a point
function applyDisplacement(x, y, z, radius, time) {
    const scale = config.noiseScale;
    const amp = config.noiseAmplitude / 100;
    const displaceFn = displacementModes[config.mode] || displacementModes.wavy;
    const displacement = displaceFn(x, y, z, time, scale, amp, state.noiseOffset);
    const r = radius * (1 + displacement);
    return {
        x: x * r,
        y: y * r,
        z: z * r,
        displacement: displacement
    };
}

// Shape generators - each returns lines of points
const shapeGenerators = {
    sphere: (radius, numLines, segments, time) => {
        const lines = [];
        for (let i = 0; i < numLines; i++) {
            const phi = (i / (numLines - 1)) * Math.PI;
            const points = [];
            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * Math.PI * 2;
                const x = Math.sin(phi) * Math.cos(theta);
                const y = Math.cos(phi);
                const z = Math.sin(phi) * Math.sin(theta);
                points.push(applyDisplacement(x, y, z, radius, time));
            }
            lines.push({ points, index: i });
        }
        return lines;
    },

    cube: (radius, numLines, segments, time) => {
        const lines = [];
        const size = radius * 0.8;

        // Generate horizontal slices through the cube
        for (let i = 0; i < numLines; i++) {
            const t = (i / (numLines - 1)) * 2 - 1; // -1 to 1
            const y = t;
            const points = [];

            // Walk around the perimeter of the cube at this height
            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                let x, z;

                // Determine which face we're on based on angle
                const normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                if (normalized < Math.PI / 4 || normalized >= 7 * Math.PI / 4) {
                    x = 1; z = Math.tan(normalized);
                } else if (normalized < 3 * Math.PI / 4) {
                    z = 1; x = 1 / Math.tan(normalized);
                } else if (normalized < 5 * Math.PI / 4) {
                    x = -1; z = -Math.tan(normalized);
                } else {
                    z = -1; x = -1 / Math.tan(normalized);
                }

                // Clamp to cube edges
                x = Math.max(-1, Math.min(1, x));
                z = Math.max(-1, Math.min(1, z));

                points.push(applyDisplacement(x, y, z, size, time));
            }
            lines.push({ points, index: i });
        }
        return lines;
    },

    pyramid: (radius, numLines, segments, time) => {
        const lines = [];
        const size = radius * 0.9;

        for (let i = 0; i < numLines; i++) {
            const t = i / (numLines - 1); // 0 to 1 from top to bottom
            const y = 1 - t * 2; // 1 to -1
            const scale = t; // Pyramid gets wider as we go down
            const points = [];

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                // Square base
                const normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                let x, z;

                if (normalized < Math.PI / 4 || normalized >= 7 * Math.PI / 4) {
                    x = 1; z = Math.tan(normalized);
                } else if (normalized < 3 * Math.PI / 4) {
                    z = 1; x = 1 / Math.tan(normalized);
                } else if (normalized < 5 * Math.PI / 4) {
                    x = -1; z = -Math.tan(normalized);
                } else {
                    z = -1; x = -1 / Math.tan(normalized);
                }

                x = Math.max(-1, Math.min(1, x)) * scale;
                z = Math.max(-1, Math.min(1, z)) * scale;

                points.push(applyDisplacement(x, y, z, size, time));
            }
            lines.push({ points, index: i });
        }
        return lines;
    },

    plane: (radius, numLines, segments, time) => {
        const lines = [];
        const size = radius * 1.2;

        for (let i = 0; i < numLines; i++) {
            const z = ((i / (numLines - 1)) * 2 - 1);
            const points = [];

            for (let j = 0; j <= segments; j++) {
                const x = (j / segments) * 2 - 1;
                const y = 0;
                points.push(applyDisplacement(x, y, z, size, time));
            }
            lines.push({ points, index: i });
        }
        return lines;
    },

    torus: (radius, numLines, segments, time) => {
        const lines = [];
        const R = radius * 0.7; // Major radius
        const r = radius * 0.3; // Minor radius

        for (let i = 0; i < numLines; i++) {
            const phi = (i / (numLines - 1)) * Math.PI * 2;
            const points = [];

            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * Math.PI * 2;

                const x = (R + r * Math.cos(phi)) * Math.cos(theta);
                const y = r * Math.sin(phi);
                const z = (R + r * Math.cos(phi)) * Math.sin(theta);

                // Normalize for displacement
                const len = Math.sqrt(x * x + y * y + z * z);
                const nx = x / len, ny = y / len, nz = z / len;

                const scale = config.noiseScale;
                const amp = config.noiseAmplitude / 100;
                const displaceFn = displacementModes[config.mode] || displacementModes.wavy;
                const displacement = displaceFn(nx, ny, nz, time, scale, amp, state.noiseOffset);

                points.push({
                    x: x * (1 + displacement * 0.3),
                    y: y * (1 + displacement * 0.3),
                    z: z * (1 + displacement * 0.3),
                    displacement: displacement
                });
            }
            lines.push({ points, index: i });
        }
        return lines;
    },

    cylinder: (radius, numLines, segments, time) => {
        const lines = [];
        const size = radius * 0.7;
        const height = radius;

        for (let i = 0; i < numLines; i++) {
            const t = (i / (numLines - 1)) * 2 - 1;
            const y = t * (height / radius);
            const points = [];

            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * Math.PI * 2;
                const x = Math.cos(theta);
                const z = Math.sin(theta);

                points.push(applyDisplacement(x, y, z, size, time));
            }
            lines.push({ points, index: i });
        }
        return lines;
    },

    cone: (radius, numLines, segments, time) => {
        const lines = [];
        const size = radius * 0.8;

        for (let i = 0; i < numLines; i++) {
            const t = i / (numLines - 1);
            const y = 1 - t * 2; // 1 at top, -1 at bottom
            const scale = t; // 0 at top (point), 1 at bottom
            const points = [];

            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * Math.PI * 2;
                const x = Math.cos(theta) * scale;
                const z = Math.sin(theta) * scale;

                points.push(applyDisplacement(x, y, z, size, time));
            }
            lines.push({ points, index: i });
        }
        return lines;
    }
};

function projectPoint(point) {
    const fov = 800;
    const scale = fov / (fov + point.z);
    return {
        x: state.centerX + point.x * scale * state.zoomFactor,
        y: state.centerY + point.y * scale * state.zoomFactor,
        z: point.z,
        scale: scale
    };
}

function getColor(depth, index, total) {
    const alpha = config.lineOpacity;
    let depthAlpha = 1;

    if (config.depthFade) {
        depthAlpha = 0.3 + (depth + 1) * 0.35;
        depthAlpha = Math.max(0.1, Math.min(1, depthAlpha));
    }

    if (config.colorMode === 'mono') {
        const hex = config.lineColor;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha * depthAlpha})`;
    } else {
        const hue = config.hueStart + (index / total) * (config.hueEnd - config.hueStart);
        const saturation = 70 + depth * 15;
        const lightness = 50 + depth * 20;
        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * depthAlpha})`;
    }
}

function renderShape() {
    const { width, height, time } = state;
    const radius = config.sphereSize;
    const numLines = config.lineDensity;
    const segments = config.lineSegments;

    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, width, height);

    if (config.glowEffect) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = config.colorMode === 'mono' ? config.lineColor : `hsl(${config.hueStart}, 80%, 60%)`;
    } else {
        ctx.shadowBlur = 0;
    }

    ctx.lineWidth = config.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Get shape generator
    const generator = shapeGenerators[config.shape] || shapeGenerators.sphere;
    const rawLines = generator(radius, numLines, segments, time);

    // Transform and project points
    const lines = rawLines.map(line => {
        const transformedPoints = line.points.map(point => {
            let p = rotateX(point, state.rotationX);
            p = rotateY(p, state.rotationY);
            p = rotateZ(p, state.rotationZ);

            const projected = projectPoint(p);
            return {
                x: projected.x,
                y: projected.y,
                z: p.z,
                displacement: point.displacement
            };
        });

        const avgZ = transformedPoints.reduce((sum, p) => sum + p.z, 0) / transformedPoints.length;
        return { points: transformedPoints, index: line.index, avgZ };
    });

    // Sort by depth
    lines.sort((a, b) => a.avgZ - b.avgZ);

    // Render
    for (const line of lines) {
        const { points, index } = line;

        ctx.beginPath();

        let started = false;
        for (let j = 0; j < points.length; j++) {
            const p = points[j];

            if (p.z < -radius * 0.3 && config.depthFade && config.shape === 'sphere') {
                if (started) {
                    ctx.stroke();
                    started = false;
                }
                continue;
            }

            if (!started) {
                ctx.moveTo(p.x, p.y);
                started = true;
            } else {
                ctx.lineTo(p.x, p.y);
            }
        }

        const normalizedZ = (line.avgZ / radius + 1) / 2;
        ctx.strokeStyle = getColor(normalizedZ, index, numLines);
        ctx.stroke();
    }
}

// ============================================
// Animation Loop
// ============================================
let lastTime = 0;

function animate(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update time for noise animation
    state.time += deltaTime * config.animationSpeed * 0.01;

    // Calculate all movement contributions
    const autoRot = calculateAutoRotation(deltaTime);
    calculateRandomMotion();
    calculateHoverEffect();

    // Apply auto rotation to base
    if (!state.isDragging) {
        state.baseRotationX += autoRot.x;
        state.baseRotationY += autoRot.y;
        state.baseRotationZ += autoRot.z;
    }

    // Apply inertia when not dragging
    if (!state.isDragging && config.dragInertia) {
        state.targetRotationX += state.velocityX;
        state.targetRotationY += state.velocityY;
        state.velocityX *= config.inertiaDecay;
        state.velocityY *= config.inertiaDecay;
    }

    // Auto bounce back
    if (config.autoBounceBack && !state.isDragging) {
        state.targetRotationX *= (1 - config.bounceBackSpeed);
        state.targetRotationY *= (1 - config.bounceBackSpeed);
    }

    // Clamp rotation if enabled
    if (config.clampRotation) {
        const maxRad = config.maxXRotation * Math.PI / 180;
        state.targetRotationX = Math.max(-maxRad, Math.min(maxRad, state.targetRotationX));
    }

    // Combine all rotations
    const totalTargetX = state.baseRotationX + state.targetRotationX + state.hoverOffsetX + state.randomOffsetX;
    const totalTargetY = state.baseRotationY + state.targetRotationY + state.hoverOffsetY + state.randomOffsetY;
    const totalTargetZ = state.baseRotationZ + state.targetRotationZ + state.randomOffsetZ;

    // Smooth interpolation
    const smoothing = config.smoothingFactor;
    state.rotationX = applyEasing(state.rotationX, totalTargetX, smoothing);
    state.rotationY = applyEasing(state.rotationY, totalTargetY, smoothing);
    state.rotationZ = applyEasing(state.rotationZ, totalTargetZ, smoothing);

    renderShape();
    requestAnimationFrame(animate);
}

// ============================================
// Event Handlers
// ============================================
function handleResize() {
    const dpr = window.devicePixelRatio || 1;
    state.width = window.innerWidth;
    state.height = window.innerHeight;

    canvas.width = state.width * dpr;
    canvas.height = state.height * dpr;
    canvas.style.width = state.width + 'px';
    canvas.style.height = state.height + 'px';

    ctx.scale(dpr, dpr);

    state.centerX = state.width / 2;
    state.centerY = state.height / 2;
}

function handleMouseDown(e) {
    if (!config.dragEnabled) return;
    state.isDragging = true;
    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
    state.velocityX = 0;
    state.velocityY = 0;
}

function handleMouseMove(e) {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;

    if (!state.isDragging || !config.dragEnabled) return;

    const deltaX = e.clientX - state.lastMouseX;
    const deltaY = e.clientY - state.lastMouseY;

    const sensitivity = config.dragSensitivity * 0.005;
    state.targetRotationY += deltaX * sensitivity;
    state.targetRotationX += deltaY * sensitivity;

    // Store velocity for inertia
    state.velocityX = deltaY * sensitivity;
    state.velocityY = deltaX * sensitivity;

    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
}

function handleMouseUp() {
    state.isDragging = false;
}

function handleTouchStart(e) {
    if (!config.dragEnabled) return;
    if (e.touches.length === 1) {
        state.isDragging = true;
        state.lastMouseX = e.touches[0].clientX;
        state.lastMouseY = e.touches[0].clientY;
        state.velocityX = 0;
        state.velocityY = 0;
    }
}

function handleTouchMove(e) {
    if (!state.isDragging || e.touches.length !== 1 || !config.dragEnabled) return;
    e.preventDefault();

    const deltaX = e.touches[0].clientX - state.lastMouseX;
    const deltaY = e.touches[0].clientY - state.lastMouseY;

    const sensitivity = config.dragSensitivity * 0.005;
    state.targetRotationY += deltaX * sensitivity;
    state.targetRotationX += deltaY * sensitivity;

    state.velocityX = deltaY * sensitivity;
    state.velocityY = deltaX * sensitivity;

    state.lastMouseX = e.touches[0].clientX;
    state.lastMouseY = e.touches[0].clientY;
}

function handleTouchEnd() {
    state.isDragging = false;
}

function handleWheel(e) {
    if (!config.mouseWheelZoom) return;
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    state.zoomFactor += delta * config.zoomSensitivity;
    state.zoomFactor = Math.max(0.3, Math.min(3, state.zoomFactor));
}

// ============================================
// Settings Panel
// ============================================
function initSettings() {
    const panel = document.getElementById('settings-panel');
    const toggle = document.getElementById('settings-toggle');

    toggle.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
    });

    // Accordion
    const accordionBtn = document.getElementById('movement-accordion-btn');
    const accordionContent = document.getElementById('movement-accordion');

    accordionBtn.addEventListener('click', () => {
        accordionBtn.classList.toggle('active');
        accordionContent.classList.toggle('open');
    });

    // Shape select
    const shapeSelect = document.getElementById('shape');
    shapeSelect.value = config.shape;
    shapeSelect.addEventListener('change', (e) => {
        config.shape = e.target.value;
    });

    // Mode select with mode-specific settings visibility
    const modeSelect = document.getElementById('mode');
    modeSelect.value = config.mode;

    // Function to show/hide mode-specific settings
    function updateModeSettings(mode) {
        const modes = ['wavy', 'bands', 'cellular', 'turbulent', 'spiral', 'ripple'];
        modes.forEach(m => {
            const container = document.getElementById(`mode-settings-${m}`);
            if (container) {
                if (m === mode) {
                    container.classList.remove('hidden');
                } else {
                    container.classList.add('hidden');
                }
            }
        });
    }

    // Initialize mode settings visibility
    updateModeSettings(config.mode);

    modeSelect.addEventListener('change', (e) => {
        config.mode = e.target.value;
        updateModeSettings(e.target.value);
    });

    // ============================================
    // MODE-SPECIFIC SETTINGS CONTROLS
    // ============================================

    // Wavy Mode Settings
    setupRangeInput('wavy-octave2-strength', 'wavyOctave2Strength', '', 2);
    setupRangeInput('wavy-octave3-strength', 'wavyOctave3Strength', '', 2);
    setupRangeInput('wavy-octave2-freq', 'wavyOctave2Freq', 'x', 1);
    setupRangeInput('wavy-octave3-freq', 'wavyOctave3Freq', 'x', 1);
    setupRangeInput('wavy-time2', 'wavyTime2', 'x', 1);
    setupRangeInput('wavy-time3', 'wavyTime3', 'x', 1);

    // Bands Mode Settings
    setupRangeInput('bands-density', 'bandsDensity');
    setupRangeInput('bands-noise-influence', 'bandsNoiseInfluence', '', 2);
    setupRangeInput('bands-time-scale', 'bandsTimeScale', 'x', 1);
    setupRangeInput('bands-angle-scale', 'bandsAngleScale', '', 1);
    setupRangeInput('bands-y-scale', 'bandsYScale', '', 1);
    setupRangeInput('bands-strength', 'bandsStrength', '', 2);

    // Cellular Mode Settings
    setupRangeInput('cellular-freq1', 'cellularFreq1', 'x', 1);
    setupRangeInput('cellular-freq2', 'cellularFreq2', 'x', 1);
    setupRangeInput('cellular-time2', 'cellularTime2', 'x', 1);
    setupRangeInput('cellular-amp-boost', 'cellularAmpBoost', 'x', 1);
    setupRangeInput('cellular-sharpness', 'cellularSharpness', '', 1);

    // Turbulent Mode Settings
    setupRangeInput('turbulent-octaves', 'turbulentOctaves');
    setupRangeInput('turbulent-lacunarity', 'turbulentLacunarity', '', 1);
    setupRangeInput('turbulent-persistence', 'turbulentPersistence', '', 2);
    setupRangeInput('turbulent-time-mult', 'turbulentTimeMult', '', 2);
    setupRangeInput('turbulent-time-offset', 'turbulentTimeOffset', '', 1);

    // Spiral Mode Settings
    setupRangeInput('spiral-arms', 'spiralArms');
    setupRangeInput('spiral-twist', 'spiralTwist', '', 1);
    setupRangeInput('spiral-time-scale', 'spiralTimeScale', 'x', 1);
    setupRangeInput('spiral-noise-blend', 'spiralNoiseBlend', '', 2);
    setupRangeInput('spiral-strength', 'spiralStrength', '', 2);

    // Ripple Mode Settings
    setupRangeInput('ripple-frequency', 'rippleFrequency');
    setupRangeInput('ripple-speed', 'rippleSpeed', 'x', 1);
    setupRangeInput('ripple-strength', 'rippleStrength', '', 2);
    setupRangeInput('ripple-noise-blend', 'rippleNoiseBlend', '', 2);
    setupRangeInput('ripple-noise-time', 'rippleNoiseTime', 'x', 1);

    // Color mode toggle
    const colorMono = document.getElementById('color-mono');
    const colorColor = document.getElementById('color-color');
    const monoColorGroup = document.getElementById('mono-color-group');
    const colorSettings = document.getElementById('color-settings');

    colorMono.addEventListener('click', () => {
        config.colorMode = 'mono';
        colorMono.classList.add('active');
        colorColor.classList.remove('active');
        monoColorGroup.classList.remove('hidden');
        colorSettings.classList.add('hidden');
    });

    colorColor.addEventListener('click', () => {
        config.colorMode = 'color';
        colorColor.classList.add('active');
        colorMono.classList.remove('active');
        monoColorGroup.classList.add('hidden');
        colorSettings.classList.remove('hidden');
    });

    // Line color
    const lineColorInput = document.getElementById('line-color');
    lineColorInput.value = config.lineColor;
    lineColorInput.addEventListener('input', (e) => {
        config.lineColor = e.target.value;
    });

    // Hue range
    setupRangeInput('hue-start', 'hueStart', '°');
    setupRangeInput('hue-end', 'hueEnd', '°');

    // Performance
    setupRangeInput('line-density', 'lineDensity');
    setupRangeInput('line-segments', 'lineSegments');

    // Sphere settings
    setupRangeInput('sphere-size', 'sphereSize');
    setupRangeInput('noise-scale', 'noiseScale', '', 1);
    setupRangeInput('noise-amplitude', 'noiseAmplitude');
    setupRangeInput('animation-speed', 'animationSpeed');

    // Line appearance
    setupRangeInput('line-width', 'lineWidth');
    setupRangeInput('line-opacity', 'lineOpacity');

    // Checkboxes - Visual
    setupCheckbox('depth-fade', 'depthFade');
    setupCheckbox('glow-effect', 'glowEffect');

    // Background color
    const bgColorInput = document.getElementById('bg-color');
    bgColorInput.value = config.bgColor;
    bgColorInput.addEventListener('input', (e) => {
        config.bgColor = e.target.value;
        document.body.style.background = e.target.value;
    });

    // ============================================
    // Movement Settings
    // ============================================

    // Auto Rotation
    setupCheckbox('auto-rotate', 'autoRotate');
    setupRangeInput('rotation-speed', 'rotationSpeed');
    setupRangeInput('rotation-dir-x', 'rotationDirX', '°');
    setupRangeInput('rotation-dir-y', 'rotationDirY', '°');
    setupRangeInput('rotation-dir-z', 'rotationDirZ', '°');

    const rotationModeSelect = document.getElementById('rotation-mode');
    rotationModeSelect.value = config.rotationMode;
    rotationModeSelect.addEventListener('change', (e) => {
        config.rotationMode = e.target.value;
    });

    setupRangeInput('pendulum-amplitude', 'pendulumAmplitude', '°');

    // Mouse Drag
    setupCheckbox('drag-enabled', 'dragEnabled');
    setupRangeInput('drag-sensitivity', 'dragSensitivity', 'x', 1);
    setupCheckbox('drag-inertia', 'dragInertia');
    setupRangeInput('inertia-decay', 'inertiaDecay', '', 2);
    setupCheckbox('auto-bounce-back', 'autoBounceBack');
    setupRangeInput('bounce-back-speed', 'bounceBackSpeed', '', 2);
    setupCheckbox('clamp-rotation', 'clampRotation');
    setupRangeInput('max-x-rotation', 'maxXRotation', '°');

    // Hover
    setupCheckbox('hover-enabled', 'hoverEnabled');

    const hoverModeSelect = document.getElementById('hover-mode');
    hoverModeSelect.value = config.hoverMode;
    hoverModeSelect.addEventListener('change', (e) => {
        config.hoverMode = e.target.value;
    });

    setupRangeInput('hover-strength', 'hoverStrength', '', 1);
    setupRangeInput('hover-smoothing', 'hoverSmoothing', '', 2);
    setupCheckbox('hover-affects-noise', 'hoverAffectsNoise');
    setupRangeInput('hover-noise-influence', 'hoverNoiseInfluence');

    // Random Motion
    setupCheckbox('random-motion', 'randomMotion');

    const randomModeSelect = document.getElementById('random-mode');
    randomModeSelect.value = config.randomMode;
    randomModeSelect.addEventListener('change', (e) => {
        config.randomMode = e.target.value;
    });

    setupRangeInput('random-intensity', 'randomIntensity', '', 1);
    setupRangeInput('random-speed', 'randomSpeed', '', 1);

    // Advanced
    const easingSelect = document.getElementById('easing-function');
    easingSelect.value = config.easingFunction;
    easingSelect.addEventListener('change', (e) => {
        config.easingFunction = e.target.value;
    });

    setupRangeInput('smoothing-factor', 'smoothingFactor', '', 2);
    setupCheckbox('mouse-wheel-zoom', 'mouseWheelZoom');
    setupRangeInput('zoom-sensitivity', 'zoomSensitivity', '', 1);

    // Randomize button
    document.getElementById('randomize-motion-btn').addEventListener('click', randomizeMotion);

    // Presets
    const presetsSelect = document.getElementById('presets');
    presetsSelect.addEventListener('change', (e) => {
        applyPreset(e.target.value);
        e.target.value = '';
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetToDefaults);
}

function setupRangeInput(id, configKey, suffix = '', decimals = 0) {
    const rangeInput = document.getElementById(id);
    const numInput = document.getElementById(id + '-val');

    if (!rangeInput || !numInput) return;

    // Find suffix span
    const wrapper = numInput.parentElement;
    const suffixSpan = wrapper ? wrapper.querySelector('.val-suffix') : null;

    const step = 1 / Math.pow(10, decimals);
    numInput.step = step;

    // Init values
    rangeInput.value = config[configKey];
    numInput.value = config[configKey].toFixed(decimals);
    if (suffixSpan) suffixSpan.textContent = suffix;

    // Range input listener
    rangeInput.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        config[configKey] = value;
        numInput.value = value.toFixed(decimals);
    });

    // Number input behavior
    const updateFromInput = (val) => {
        let value = parseFloat(val);
        if (isNaN(value)) return;

        // Clamp to min/max
        const min = parseFloat(rangeInput.min);
        const max = parseFloat(rangeInput.max);
        if (!isNaN(min)) value = Math.max(min, value);
        if (!isNaN(max)) value = Math.min(max, value);

        config[configKey] = value;
        rangeInput.value = value;
        return value;
    };

    numInput.addEventListener('change', (e) => {
        const val = updateFromInput(e.target.value);
        if (val !== undefined) numInput.value = val.toFixed(decimals);
    });

    numInput.addEventListener('input', (e) => {
        // Real-time update but don't force formatting yet to allow typing
        let value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            // Check limits but don't force value yet to avoid annoying typing experience
            const min = parseFloat(rangeInput.min);
            const max = parseFloat(rangeInput.max);

            // Only clamp if completely out of bounds to allow intermediate states? 
            // Actually, for immediate feedback on canvas, we should update config.
            // But if user types "0." we shouldn't parse it as 0 yet if they mean 0.5
            // So maybe we can just respect valid numbers.
            config[configKey] = value;
            rangeInput.value = value;
        }
    });

    numInput.addEventListener('blur', () => {
        numInput.value = config[configKey].toFixed(decimals);
    });

    // Wheel listener
    numInput.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -step : step;

        // Use a multiplier for Shift key?
        const multiplier = e.shiftKey ? 10 : 1;

        let newValue = config[configKey] + (delta * multiplier);

        // Clamp
        const min = parseFloat(rangeInput.min);
        const max = parseFloat(rangeInput.max);
        if (!isNaN(min)) newValue = Math.max(min, newValue);
        if (!isNaN(max)) newValue = Math.min(max, newValue);

        // Round to avoid float errors
        const precision = Math.pow(10, decimals + 1); // Extra precision
        newValue = Math.round(newValue * precision) / precision;

        config[configKey] = newValue;
        rangeInput.value = newValue;
        numInput.value = newValue.toFixed(decimals);
    }, { passive: false });
}

function updateRangeUI(id, value, suffix = '', decimals = 0) {
    const rangeInput = document.getElementById(id);
    const numInput = document.getElementById(id + '-val');
    if (rangeInput) rangeInput.value = value;
    if (numInput) numInput.value = value.toFixed(decimals);
}

function setupCheckbox(id, configKey) {
    const checkbox = document.getElementById(id);
    if (!checkbox) return;

    checkbox.checked = config[configKey];
    checkbox.addEventListener('change', (e) => {
        config[configKey] = e.target.checked;
    });
}

function updateUIFromConfig() {
    document.getElementById('shape').value = config.shape;
    document.getElementById('mode').value = config.mode;

    // Update mode settings visibility
    const modes = ['wavy', 'bands', 'cellular', 'turbulent', 'spiral', 'ripple'];
    modes.forEach(m => {
        const container = document.getElementById(`mode-settings-${m}`);
        if (container) {
            if (m === config.mode) {
                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
            }
        }
    });

    if (config.colorMode === 'mono') {
        document.getElementById('color-mono').click();
    } else {
        document.getElementById('color-color').click();
    }

    // View Presets
    window.setViewPreset = function (preset) {
        // Disable auto-rotation
        config.autoRotate = false;
        document.getElementById('auto-rotate').checked = false;

        // Reset base rotation
        state.baseRotationX = 0;
        state.baseRotationY = 0;
        state.baseRotationZ = 0;
        state.velocityX = 0;
        state.velocityY = 0;

        // Set target rotation based on preset
        const toRad = deg => deg * Math.PI / 180;

        switch (preset) {
            case 'top':
                state.targetRotationX = toRad(90);
                state.targetRotationY = 0;
                state.targetRotationZ = 0;
                break;
            case 'front':
                state.targetRotationX = 0;
                state.targetRotationY = 0;
                state.targetRotationZ = 0;
                break;
            case 'side':
                state.targetRotationX = 0;
                state.targetRotationY = toRad(90);
                state.targetRotationZ = 0;
                break;
            case 'iso':
                state.targetRotationX = toRad(30);
                state.targetRotationY = toRad(45);
                state.targetRotationZ = 0;
                break;
            case 'iso2':
                state.targetRotationX = toRad(30);
                state.targetRotationY = toRad(-45);
                state.targetRotationZ = 0;
                break;
        }

        // Update rotation sliders if they exist (though they control animation params, not absolute rotation usually)
        // Actually, rotation-dir-x/y/z control auto-rotation direction, not current rotation.
        // So we don't need to update those sliders.
    };
    document.getElementById('line-color').value = config.lineColor;
    updateRangeUI('hue-start', config.hueStart, '°');
    updateRangeUI('hue-end', config.hueEnd, '°');
    updateRangeUI('line-density', config.lineDensity);
    updateRangeUI('line-segments', config.lineSegments);
    updateRangeUI('sphere-size', config.sphereSize);
    updateRangeUI('noise-scale', config.noiseScale, '', 1);
    updateRangeUI('noise-amplitude', config.noiseAmplitude);
    updateRangeUI('animation-speed', config.animationSpeed);
    updateRangeUI('line-width', config.lineWidth);
    updateRangeUI('line-opacity', config.lineOpacity);

    document.getElementById('depth-fade').checked = config.depthFade;
    document.getElementById('glow-effect').checked = config.glowEffect;
    document.getElementById('bg-color').value = config.bgColor;
    document.body.style.background = config.bgColor;

    // Mode-specific settings
    // Wavy
    updateRangeUI('wavy-octave2-strength', config.wavyOctave2Strength, '', 2);
    updateRangeUI('wavy-octave3-strength', config.wavyOctave3Strength, '', 2);
    updateRangeUI('wavy-octave2-freq', config.wavyOctave2Freq, 'x', 1);
    updateRangeUI('wavy-octave3-freq', config.wavyOctave3Freq, 'x', 1);
    updateRangeUI('wavy-time2', config.wavyTime2, 'x', 1);
    updateRangeUI('wavy-time3', config.wavyTime3, 'x', 1);

    // Bands
    updateRangeUI('bands-density', config.bandsDensity);
    updateRangeUI('bands-noise-influence', config.bandsNoiseInfluence, '', 2);
    updateRangeUI('bands-time-scale', config.bandsTimeScale, 'x', 1);
    updateRangeUI('bands-angle-scale', config.bandsAngleScale, '', 1);
    updateRangeUI('bands-y-scale', config.bandsYScale, '', 1);
    updateRangeUI('bands-strength', config.bandsStrength, '', 2);

    // Cellular
    updateRangeUI('cellular-freq1', config.cellularFreq1, 'x', 1);
    updateRangeUI('cellular-freq2', config.cellularFreq2, 'x', 1);
    updateRangeUI('cellular-time2', config.cellularTime2, 'x', 1);
    updateRangeUI('cellular-amp-boost', config.cellularAmpBoost, 'x', 1);
    updateRangeUI('cellular-sharpness', config.cellularSharpness, '', 1);

    // Turbulent
    updateRangeUI('turbulent-octaves', config.turbulentOctaves);
    updateRangeUI('turbulent-lacunarity', config.turbulentLacunarity, '', 1);
    updateRangeUI('turbulent-persistence', config.turbulentPersistence, '', 2);
    updateRangeUI('turbulent-time-mult', config.turbulentTimeMult, '', 2);
    updateRangeUI('turbulent-time-offset', config.turbulentTimeOffset, '', 1);

    // Spiral
    updateRangeUI('spiral-arms', config.spiralArms);
    updateRangeUI('spiral-twist', config.spiralTwist, '', 1);
    updateRangeUI('spiral-time-scale', config.spiralTimeScale, 'x', 1);
    updateRangeUI('spiral-noise-blend', config.spiralNoiseBlend, '', 2);
    updateRangeUI('spiral-strength', config.spiralStrength, '', 2);

    // Ripple
    updateRangeUI('ripple-frequency', config.rippleFrequency);
    updateRangeUI('ripple-speed', config.rippleSpeed, 'x', 1);
    updateRangeUI('ripple-strength', config.rippleStrength, '', 2);
    updateRangeUI('ripple-noise-blend', config.rippleNoiseBlend, '', 2);
    updateRangeUI('ripple-noise-time', config.rippleNoiseTime, 'x', 1);

    // Movement settings
    document.getElementById('auto-rotate').checked = config.autoRotate;
    updateRangeUI('rotation-speed', config.rotationSpeed);
    updateRangeUI('rotation-dir-x', config.rotationDirX, '°');
    updateRangeUI('rotation-dir-y', config.rotationDirY, '°');
    updateRangeUI('rotation-dir-z', config.rotationDirZ, '°');
    document.getElementById('rotation-mode').value = config.rotationMode;
    updateRangeUI('pendulum-amplitude', config.pendulumAmplitude, '°');

    document.getElementById('drag-enabled').checked = config.dragEnabled;
    updateRangeUI('drag-sensitivity', config.dragSensitivity, 'x', 1);
    document.getElementById('drag-inertia').checked = config.dragInertia;
    updateRangeUI('inertia-decay', config.inertiaDecay, '', 2);
    document.getElementById('auto-bounce-back').checked = config.autoBounceBack;
    updateRangeUI('bounce-back-speed', config.bounceBackSpeed, '', 2);
    document.getElementById('clamp-rotation').checked = config.clampRotation;
    updateRangeUI('max-x-rotation', config.maxXRotation, '°');

    document.getElementById('hover-enabled').checked = config.hoverEnabled;
    document.getElementById('hover-mode').value = config.hoverMode;
    updateRangeUI('hover-strength', config.hoverStrength, '', 1);
    updateRangeUI('hover-smoothing', config.hoverSmoothing, '', 2);
    document.getElementById('hover-affects-noise').checked = config.hoverAffectsNoise;
    updateRangeUI('hover-noise-influence', config.hoverNoiseInfluence);

    document.getElementById('random-motion').checked = config.randomMotion;
    document.getElementById('random-mode').value = config.randomMode;
    updateRangeUI('random-intensity', config.randomIntensity, '', 1);
    updateRangeUI('random-speed', config.randomSpeed, '', 1);

    document.getElementById('easing-function').value = config.easingFunction;
    updateRangeUI('smoothing-factor', config.smoothingFactor, '', 2);
    document.getElementById('mouse-wheel-zoom').checked = config.mouseWheelZoom;
    updateRangeUI('zoom-sensitivity', config.zoomSensitivity, '', 1);
}

function randomizeMotion() {
    // Randomize rotation settings
    config.rotationSpeed = Math.random() * 60 + 10;
    config.rotationDirX = Math.floor(Math.random() * 360) - 180;
    config.rotationDirY = Math.floor(Math.random() * 360) - 180;
    config.rotationDirZ = Math.floor(Math.random() * 360) - 180;

    const rotModes = ['constant', 'pendulum', 'random', 'orbital', 'wobble', 'chaos'];
    config.rotationMode = rotModes[Math.floor(Math.random() * rotModes.length)];

    config.pendulumAmplitude = Math.floor(Math.random() * 120) + 20;

    // Randomize hover
    config.hoverEnabled = Math.random() > 0.5;
    const hoverModes = ['tilt', 'repel', 'follow', 'parallax'];
    config.hoverMode = hoverModes[Math.floor(Math.random() * hoverModes.length)];
    config.hoverStrength = Math.random() * 2 + 0.5;

    // Randomize random motion
    config.randomMotion = Math.random() > 0.5;
    const randModes = ['gentle', 'jitter', 'pulse', 'earthquake', 'breathing'];
    config.randomMode = randModes[Math.floor(Math.random() * randModes.length)];
    config.randomIntensity = Math.random() * 3 + 0.5;
    config.randomSpeed = Math.random() * 3 + 0.5;

    updateUIFromConfig();
}

const presets = {
    organic: {
        mode: 'wavy',
        colorMode: 'mono',
        lineColor: '#ffffff',
        lineDensity: 70,
        lineSegments: 180,
        sphereSize: 280,
        noiseScale: 2.5,
        noiseAmplitude: 35,
        animationSpeed: 40,
        lineWidth: 0.7,
        lineOpacity: 0.65,
        depthFade: true,
        glowEffect: false,
        bgColor: '#0a0a0a'
    },
    planet: {
        mode: 'bands',
        colorMode: 'mono',
        lineColor: '#c8d4e0',
        lineDensity: 80,
        lineSegments: 200,
        sphereSize: 300,
        noiseScale: 1.5,
        noiseAmplitude: 20,
        animationSpeed: 25,
        lineWidth: 0.6,
        lineOpacity: 0.7,
        depthFade: true,
        glowEffect: false,
        bgColor: '#050510'
    },
    abstract: {
        mode: 'turbulent',
        colorMode: 'color',
        hueStart: 0,
        hueEnd: 360,
        lineDensity: 60,
        lineSegments: 150,
        sphereSize: 260,
        noiseScale: 3,
        noiseAmplitude: 45,
        animationSpeed: 60,
        lineWidth: 1,
        lineOpacity: 0.8,
        depthFade: true,
        glowEffect: true,
        bgColor: '#0a0510'
    },
    minimal: {
        mode: 'wavy',
        colorMode: 'mono',
        lineColor: '#888888',
        lineDensity: 30,
        lineSegments: 100,
        sphereSize: 250,
        noiseScale: 1,
        noiseAmplitude: 15,
        animationSpeed: 20,
        lineWidth: 0.5,
        lineOpacity: 0.5,
        depthFade: true,
        glowEffect: false,
        bgColor: '#1a1a1a'
    },
    chaos: {
        mode: 'turbulent',
        colorMode: 'mono',
        lineColor: '#ffffff',
        lineDensity: 100,
        lineSegments: 250,
        sphereSize: 320,
        noiseScale: 4,
        noiseAmplitude: 60,
        animationSpeed: 80,
        lineWidth: 0.6,
        lineOpacity: 0.75,
        depthFade: true,
        glowEffect: false,
        bgColor: '#080808'
    },
    neon: {
        mode: 'spiral',
        colorMode: 'color',
        hueStart: 280,
        hueEnd: 340,
        lineDensity: 50,
        lineSegments: 180,
        sphereSize: 270,
        noiseScale: 2,
        noiseAmplitude: 30,
        animationSpeed: 45,
        lineWidth: 1.2,
        lineOpacity: 0.85,
        depthFade: false,
        glowEffect: true,
        bgColor: '#05050a'
    }
};

function applyPreset(name) {
    if (!presets[name]) return;

    Object.assign(config, presets[name]);
    updateUIFromConfig();
}

function resetToDefaults() {
    // Visual
    config.mode = 'wavy';
    config.colorMode = 'mono';
    config.lineColor = '#ffffff';
    config.hueStart = 180;
    config.hueEnd = 280;
    config.lineDensity = 60;
    config.lineSegments = 150;
    config.sphereSize = 280;
    config.noiseScale = 2;
    config.noiseAmplitude = 30;
    config.animationSpeed = 50;
    config.lineWidth = 0.8;
    config.lineOpacity = 0.7;
    config.depthFade = true;
    config.glowEffect = false;
    config.bgColor = '#0a0a0a';

    // Mode-specific settings
    // Wavy
    config.wavyOctave2Strength = 0.5;
    config.wavyOctave3Strength = 0.25;
    config.wavyOctave2Freq = 2;
    config.wavyOctave3Freq = 4;
    config.wavyTime2 = 1.5;
    config.wavyTime3 = 2;

    // Bands
    config.bandsDensity = 8;
    config.bandsNoiseInfluence = 0.7;
    config.bandsTimeScale = 2;
    config.bandsAngleScale = 0.5;
    config.bandsYScale = 2;
    config.bandsStrength = 0.3;

    // Cellular
    config.cellularFreq1 = 3;
    config.cellularFreq2 = 6;
    config.cellularTime2 = 0.5;
    config.cellularAmpBoost = 1.5;
    config.cellularSharpness = 2;

    // Turbulent
    config.turbulentOctaves = 5;
    config.turbulentLacunarity = 2;
    config.turbulentPersistence = 0.5;
    config.turbulentTimeMult = 0.3;
    config.turbulentTimeOffset = 1;

    // Spiral
    config.spiralArms = 3;
    config.spiralTwist = 5;
    config.spiralTimeScale = 2;
    config.spiralNoiseBlend = 0.5;
    config.spiralStrength = 0.5;

    // Ripple
    config.rippleFrequency = 10;
    config.rippleSpeed = 3;
    config.rippleStrength = 0.5;
    config.rippleNoiseBlend = 0.5;
    config.rippleNoiseTime = 0.5;

    // Movement
    config.autoRotate = true;
    config.rotationSpeed = 20;
    config.rotationDirX = 0;
    config.rotationDirY = 90;
    config.rotationDirZ = 0;
    config.rotationMode = 'constant';
    config.pendulumAmplitude = 45;

    config.dragEnabled = true;
    config.dragSensitivity = 1;
    config.dragInertia = true;
    config.inertiaDecay = 0.95;
    config.autoBounceBack = false;
    config.bounceBackSpeed = 0.05;
    config.clampRotation = false;
    config.maxXRotation = 90;

    config.hoverEnabled = false;
    config.hoverMode = 'tilt';
    config.hoverStrength = 1;
    config.hoverSmoothing = 0.08;
    config.hoverAffectsNoise = false;
    config.hoverNoiseInfluence = 10;

    config.randomMotion = false;
    config.randomMode = 'gentle';
    config.randomIntensity = 1;
    config.randomSpeed = 1;

    config.easingFunction = 'easeOut';
    config.smoothingFactor = 0.05;
    config.mouseWheelZoom = false;
    config.zoomSensitivity = 1;

    // Reset state
    state.zoomFactor = 1;
    state.baseRotationX = 0;
    state.baseRotationY = 0;
    state.baseRotationZ = 0;
    state.targetRotationX = 0;
    state.targetRotationY = 0;
    state.velocityX = 0;
    state.velocityY = 0;

    updateUIFromConfig();
}

// ============================================
// Initialize
// ============================================
function init() {
    handleResize();
    initSettings();

    window.addEventListener('resize', handleResize);

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    requestAnimationFrame(animate);
}

init();
