/**
 * Topographic Canvas - ES6 Class Implementation
 * Adapted from the original script.js for use in WordPress block
 */
import { SimplexNoise } from './simplex-noise';

export class TopographicCanvas {
    constructor(container, config = {}) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        // Merge config with defaults
        this.config = {
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
            zoomSensitivity: 1,

            ...config,
        };

        // State
        this.state = {
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            targetRotationX: 0,
            targetRotationY: 0,
            targetRotationZ: 0,
            baseRotationX: this.config.baseRotationX ? this.config.baseRotationX * Math.PI / 180 : 0,
            baseRotationY: this.config.baseRotationY ? this.config.baseRotationY * Math.PI / 180 : 0,
            baseRotationZ: this.config.baseRotationZ ? this.config.baseRotationZ * Math.PI / 180 : 0,
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
            zoomFactor: 1,
        };

        // Caches
        this.rotationCache = {
            cosX: 1, sinX: 0,
            cosY: 1, sinY: 0,
            cosZ: 1, sinZ: 0,
        };

        this.colorCache = {
            lineColorRGB: { r: 255, g: 255, b: 255 },
            lastLineColor: '#ffffff',
        };

        // Initialize noise
        this.noise = new SimplexNoise();

        // Animation frame ID
        this.animationFrameId = null;
        this.lastTime = 0;
        this.isDestroyed = false;

        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleWheel = this.handleWheel.bind(this);

        // Initialize
        this.init();
    }

    init() {
        this.handleResize();
        this.setupEventListeners();
        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    destroy() {
        this.isDestroyed = true;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.removeEventListeners();
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }

    updateConfig(newConfig) {
        // Deep merge or simple spread? Simple spread is safer for performance if structure is flat-ish
        this.config = { ...this.config, ...newConfig };

        // Handle view preset - apply base rotations from preset
        if (newConfig.viewPreset !== undefined) {
            this.setViewPreset(newConfig.viewPreset);
        }

        // Handle direct base rotation updates (in degrees, convert to radians)
        if (newConfig.baseRotationX !== undefined) {
            this.state.baseRotationX = newConfig.baseRotationX * Math.PI / 180;
        }
        if (newConfig.baseRotationY !== undefined) {
            this.state.baseRotationY = newConfig.baseRotationY * Math.PI / 180;
        }
        if (newConfig.baseRotationZ !== undefined) {
            this.state.baseRotationZ = newConfig.baseRotationZ * Math.PI / 180;
        }

        // Update caches if necessary
        this.updateColorCache();
    }

    /**
     * Set the view to a preset rotation
     * @param {string} preset - Preset name: 'top', 'front', 'side', 'iso', 'iso2'
     */
    setViewPreset(preset) {
        const presets = {
            top: { x: 90, y: 0, z: 0 },
            front: { x: 0, y: 0, z: 0 },
            side: { x: 0, y: 90, z: 0 },
            iso: { x: 30, y: 45, z: 0 },
            iso2: { x: 30, y: -45, z: 0 },
        };

        const p = presets[preset];
        if (!p) return;

        const toRad = deg => deg * Math.PI / 180;

        // Set base rotation
        this.state.baseRotationX = toRad(p.x);
        this.state.baseRotationY = toRad(p.y);
        this.state.baseRotationZ = toRad(p.z);

        // Reset target/velocity for clean preset application
        this.state.targetRotationX = 0;
        this.state.targetRotationY = 0;
        this.state.velocityX = 0;
        this.state.velocityY = 0;
    }

    setupEventListeners() {
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this.container);

        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    }

    removeEventListeners() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('wheel', this.handleWheel);
    }

    handleResize() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.state.width = rect.width;
        this.state.height = rect.height;

        this.canvas.width = this.state.width * dpr;
        this.canvas.height = this.state.height * dpr;
        this.canvas.style.width = this.state.width + 'px';
        this.canvas.style.height = this.state.height + 'px';

        this.ctx.scale(dpr, dpr);

        this.state.centerX = this.state.width / 2;
        this.state.centerY = this.state.height / 2;
    }

    handleMouseDown(e) {
        if (!this.config.dragEnabled) return;
        this.state.isDragging = true;
        this.state.lastMouseX = e.clientX;
        this.state.lastMouseY = e.clientY;
        this.state.velocityX = 0;
        this.state.velocityY = 0;
        this.canvas.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        this.state.mouseX = e.clientX;
        this.state.mouseY = e.clientY;

        if (!this.state.isDragging || !this.config.dragEnabled) return;

        const deltaX = e.clientX - this.state.lastMouseX;
        const deltaY = e.clientY - this.state.lastMouseY;

        const sensitivity = this.config.dragSensitivity * 0.005;
        this.state.targetRotationY += deltaX * sensitivity;
        this.state.targetRotationX += deltaY * sensitivity;

        this.state.velocityX = deltaY * sensitivity;
        this.state.velocityY = deltaX * sensitivity;

        this.state.lastMouseX = e.clientX;
        this.state.lastMouseY = e.clientY;
    }

    handleMouseUp() {
        this.state.isDragging = false;
        this.canvas.style.cursor = this.config.dragEnabled ? 'grab' : 'default';
    }

    handleTouchStart(e) {
        if (!this.config.dragEnabled) return;
        if (e.touches.length === 1) {
            this.state.isDragging = true;
            this.state.lastMouseX = e.touches[0].clientX;
            this.state.lastMouseY = e.touches[0].clientY;
            this.state.velocityX = 0;
            this.state.velocityY = 0;
        }
    }

    handleTouchMove(e) {
        if (!this.state.isDragging || e.touches.length !== 1 || !this.config.dragEnabled) return;
        e.preventDefault();

        const deltaX = e.touches[0].clientX - this.state.lastMouseX;
        const deltaY = e.touches[0].clientY - this.state.lastMouseY;

        const sensitivity = this.config.dragSensitivity * 0.005;
        this.state.targetRotationY += deltaX * sensitivity;
        this.state.targetRotationX += deltaY * sensitivity;

        this.state.velocityX = deltaY * sensitivity;
        this.state.velocityY = deltaX * sensitivity;

        this.state.lastMouseX = e.touches[0].clientX;
        this.state.lastMouseY = e.touches[0].clientY;
    }

    handleTouchEnd() {
        this.state.isDragging = false;
    }

    handleWheel(e) {
        if (!this.config.mouseWheelZoom) return;
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.state.zoomFactor += delta * this.config.zoomSensitivity;
        this.state.zoomFactor = Math.max(0.3, Math.min(3, this.state.zoomFactor));
    }

    // Easing functions
    getEasingFunction() {
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
            },
        };
        return easingFunctions[this.config.easingFunction] || easingFunctions.easeOut;
    }

    applyEasing(current, target, factor) {
        const diff = target - current;
        return current + diff * factor;
    }

    updateColorCache() {
        if (this.config.lineColor !== this.colorCache.lastLineColor) {
            const hex = this.config.lineColor;
            this.colorCache.lineColorRGB = {
                r: parseInt(hex.slice(1, 3), 16),
                g: parseInt(hex.slice(3, 5), 16),
                b: parseInt(hex.slice(5, 7), 16),
            };
            this.colorCache.lastLineColor = this.config.lineColor;
        }
    }

    updateRotationCache() {
        this.rotationCache.cosX = Math.cos(this.state.rotationX);
        this.rotationCache.sinX = Math.sin(this.state.rotationX);
        this.rotationCache.cosY = Math.cos(this.state.rotationY);
        this.rotationCache.sinY = Math.sin(this.state.rotationY);
        this.rotationCache.cosZ = Math.cos(this.state.rotationZ);
        this.rotationCache.sinZ = Math.sin(this.state.rotationZ);
    }

    rotateAllCached(point) {
        const { cosX, sinX, cosY, sinY, cosZ, sinZ } = this.rotationCache;

        const y1 = point.y * cosX - point.z * sinX;
        const z1 = point.y * sinX + point.z * cosX;

        const x2 = point.x * cosY + z1 * sinY;
        const z2 = -point.x * sinY + z1 * cosY;

        return {
            x: x2 * cosZ - y1 * sinZ,
            y: x2 * sinZ + y1 * cosZ,
            z: z2,
        };
    }

    // Displacement modes
    getDisplacementModes() {
        const noise = this.noise;
        const config = this.config;

        return {
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
            },
        };
    }

    applyDisplacement(x, y, z, radius, time) {
        const scale = this.config.noiseScale;
        const amp = this.config.noiseAmplitude / 100;
        const modes = this.getDisplacementModes();
        const displaceFn = modes[this.config.mode] || modes.wavy;
        const displacement = displaceFn(x, y, z, time, scale, amp, this.state.noiseOffset);
        const r = radius * (1 + displacement);
        return {
            x: x * r,
            y: y * r,
            z: z * r,
            displacement,
        };
    }

    // Shape generators
    getShapeGenerators() {
        return {
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
                        points.push(this.applyDisplacement(x, y, z, radius, time));
                    }
                    lines.push({ points, index: i });
                }
                return lines;
            },

            cube: (radius, numLines, segments, time) => {
                const lines = [];
                const size = radius * 0.8;

                for (let i = 0; i < numLines; i++) {
                    const t = (i / (numLines - 1)) * 2 - 1;
                    const y = t;
                    const points = [];

                    for (let j = 0; j <= segments; j++) {
                        const angle = (j / segments) * Math.PI * 2;
                        let x, z;

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

                        x = Math.max(-1, Math.min(1, x));
                        z = Math.max(-1, Math.min(1, z));

                        points.push(this.applyDisplacement(x, y, z, size, time));
                    }
                    lines.push({ points, index: i });
                }
                return lines;
            },

            pyramid: (radius, numLines, segments, time) => {
                const lines = [];
                const size = radius * 0.9;

                for (let i = 0; i < numLines; i++) {
                    const t = i / (numLines - 1);
                    const y = 1 - t * 2;
                    const scale = t;
                    const points = [];

                    for (let j = 0; j <= segments; j++) {
                        const angle = (j / segments) * Math.PI * 2;
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

                        points.push(this.applyDisplacement(x, y, z, size, time));
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
                        points.push(this.applyDisplacement(x, y, z, size, time));
                    }
                    lines.push({ points, index: i });
                }
                return lines;
            },

            torus: (radius, numLines, segments, time) => {
                const lines = [];
                const R = radius * 0.7;
                const r = radius * 0.3;

                for (let i = 0; i < numLines; i++) {
                    const phi = (i / (numLines - 1)) * Math.PI * 2;
                    const points = [];

                    for (let j = 0; j <= segments; j++) {
                        const theta = (j / segments) * Math.PI * 2;

                        const x = (R + r * Math.cos(phi)) * Math.cos(theta);
                        const y = r * Math.sin(phi);
                        const z = (R + r * Math.cos(phi)) * Math.sin(theta);

                        const len = Math.sqrt(x * x + y * y + z * z);
                        const nx = x / len, ny = y / len, nz = z / len;

                        const scale = this.config.noiseScale;
                        const amp = this.config.noiseAmplitude / 100;
                        const modes = this.getDisplacementModes();
                        const displaceFn = modes[this.config.mode] || modes.wavy;
                        const displacement = displaceFn(nx, ny, nz, time, scale, amp, this.state.noiseOffset);

                        points.push({
                            x: x * (1 + displacement * 0.3),
                            y: y * (1 + displacement * 0.3),
                            z: z * (1 + displacement * 0.3),
                            displacement,
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

                        points.push(this.applyDisplacement(x, y, z, size, time));
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
                    const y = 1 - t * 2;
                    const scale = t;
                    const points = [];

                    for (let j = 0; j <= segments; j++) {
                        const theta = (j / segments) * Math.PI * 2;
                        const x = Math.cos(theta) * scale;
                        const z = Math.sin(theta) * scale;

                        points.push(this.applyDisplacement(x, y, z, size, time));
                    }
                    lines.push({ points, index: i });
                }
                return lines;
            },
        };
    }

    projectPoint(point) {
        const fov = 800;
        const scale = fov / (fov + point.z);
        return {
            x: this.state.centerX + point.x * scale * this.state.zoomFactor,
            y: this.state.centerY + point.y * scale * this.state.zoomFactor,
            z: point.z,
            scale,
        };
    }

    getColor(depth, index, total) {
        const alpha = this.config.lineOpacity;
        let depthAlpha = 1;

        if (this.config.depthFade) {
            depthAlpha = 0.3 + (depth + 1) * 0.35;
            depthAlpha = Math.max(0.1, Math.min(1, depthAlpha));
        }

        if (this.config.colorMode === 'mono') {
            const { r, g, b } = this.colorCache.lineColorRGB;
            return `rgba(${r}, ${g}, ${b}, ${alpha * depthAlpha})`;
        } else {
            const hue = this.config.hueStart + (index / total) * (this.config.hueEnd - this.config.hueStart);
            const saturation = 70 + depth * 15;
            const lightness = 50 + depth * 20;
            return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * depthAlpha})`;
        }
    }

    calculateAutoRotation() {
        if (!this.config.autoRotate) return { x: 0, y: 0, z: 0 };

        const speed = this.config.rotationSpeed * 0.0005;
        const dirX = this.config.rotationDirX * Math.PI / 180;
        const dirY = this.config.rotationDirY * Math.PI / 180;
        const dirZ = this.config.rotationDirZ * Math.PI / 180;

        let rotX = 0, rotY = 0, rotZ = 0;

        switch (this.config.rotationMode) {
            case 'constant':
                rotX = Math.sin(dirX) * speed;
                rotY = Math.sin(dirY) * speed;
                rotZ = Math.sin(dirZ) * speed;
                break;

            case 'pendulum':
                const amp = this.config.pendulumAmplitude * Math.PI / 180;
                const swing = Math.sin(this.state.time * speed * 50);
                rotX = swing * amp * Math.abs(Math.sin(dirX)) * 0.02;
                rotY = swing * amp * Math.abs(Math.sin(dirY)) * 0.02;
                rotZ = swing * amp * Math.abs(Math.sin(dirZ)) * 0.02;
                break;

            case 'random':
                const rSpeed = speed * 20;
                rotX = this.noise.noise3D(this.state.time * rSpeed, 0, 0) * speed * 2;
                rotY = this.noise.noise3D(0, this.state.time * rSpeed, 1) * speed * 2;
                rotZ = this.noise.noise3D(0, 1, this.state.time * rSpeed) * speed;
                break;

            case 'orbital':
                rotX = Math.sin(this.state.time * speed * 30) * speed * 0.5;
                rotY = speed;
                rotZ = Math.cos(this.state.time * speed * 30) * speed * 0.3;
                break;

            case 'wobble':
                rotX = Math.sin(this.state.time * speed * 50) * speed * 1.5;
                rotY = Math.cos(this.state.time * speed * 40) * speed;
                rotZ = Math.sin(this.state.time * speed * 60 + 1) * speed * 0.5;
                break;

            case 'chaos':
                const chaos1 = this.noise.noise3D(this.state.time * 2, 0, 0);
                const chaos2 = this.noise.noise3D(0, this.state.time * 2.5, 0);
                const chaos3 = this.noise.noise3D(0, 0, this.state.time * 3);
                rotX = chaos1 * speed * 3;
                rotY = chaos2 * speed * 3;
                rotZ = chaos3 * speed * 2;
                break;
        }

        return { x: rotX, y: rotY, z: rotZ };
    }

    calculateRandomMotion() {
        if (!this.config.randomMotion) {
            this.state.randomOffsetX *= 0.95;
            this.state.randomOffsetY *= 0.95;
            this.state.randomOffsetZ *= 0.95;
            return;
        }

        const intensity = this.config.randomIntensity * 0.01;
        const speed = this.config.randomSpeed;
        const t = this.state.time * speed;

        switch (this.config.randomMode) {
            case 'gentle':
                this.state.randomOffsetX = this.noise.noise3D(t * 0.5, 0, 0) * intensity;
                this.state.randomOffsetY = this.noise.noise3D(0, t * 0.5, 0) * intensity;
                this.state.randomOffsetZ = this.noise.noise3D(0, 0, t * 0.5) * intensity * 0.5;
                break;

            case 'jitter':
                this.state.randomOffsetX = (Math.random() - 0.5) * intensity * 0.5;
                this.state.randomOffsetY = (Math.random() - 0.5) * intensity * 0.5;
                this.state.randomOffsetZ = (Math.random() - 0.5) * intensity * 0.3;
                break;

            case 'pulse':
                const pulse = Math.sin(t * 5) * 0.5 + 0.5;
                this.state.randomOffsetX = this.noise.noise3D(t, 0, 0) * intensity * pulse;
                this.state.randomOffsetY = this.noise.noise3D(0, t, 0) * intensity * pulse;
                break;

            case 'earthquake':
                const quake = Math.random() > 0.98 ? 1 : 0.1;
                this.state.randomOffsetX += (Math.random() - 0.5) * intensity * quake;
                this.state.randomOffsetY += (Math.random() - 0.5) * intensity * quake;
                this.state.randomOffsetX *= 0.9;
                this.state.randomOffsetY *= 0.9;
                break;

            case 'breathing':
                const breath = Math.sin(t * 2) * 0.5 + 0.5;
                this.state.randomOffsetX = Math.sin(t * 0.7) * intensity * breath * 0.5;
                this.state.randomOffsetY = Math.cos(t * 0.6) * intensity * breath * 0.5;
                break;
        }
    }

    calculateHoverEffect() {
        if (!this.config.hoverEnabled || this.state.isDragging) {
            this.state.hoverOffsetX *= (1 - this.config.hoverSmoothing);
            this.state.hoverOffsetY *= (1 - this.config.hoverSmoothing);
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const normalizedX = (this.state.mouseX - rect.left - this.state.centerX) / this.state.centerX;
        const normalizedY = (this.state.mouseY - rect.top - this.state.centerY) / this.state.centerY;
        const strength = this.config.hoverStrength * 0.5;

        let targetX = 0, targetY = 0;

        switch (this.config.hoverMode) {
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

        this.state.hoverOffsetX += (targetX - this.state.hoverOffsetX) * this.config.hoverSmoothing;
        this.state.hoverOffsetY += (targetY - this.state.hoverOffsetY) * this.config.hoverSmoothing;

        if (this.config.hoverAffectsNoise) {
            const dist = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
            this.state.noiseOffset = dist * this.config.hoverNoiseInfluence * 0.1;
        } else {
            this.state.noiseOffset *= 0.95;
        }
    }

    renderShape() {
        const { width, height, time } = this.state;
        const radius = this.config.sphereSize;
        const numLines = this.config.lineDensity;
        const segments = this.config.lineSegments;

        this.ctx.fillStyle = this.config.bgColor;
        this.ctx.fillRect(0, 0, width, height);

        if (this.config.glowEffect) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.config.colorMode === 'mono'
                ? this.config.lineColor
                : `hsl(${this.config.hueStart}, 80%, 60%)`;
        } else {
            this.ctx.shadowBlur = 0;
        }

        this.ctx.lineWidth = this.config.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        const generators = this.getShapeGenerators();
        const generator = generators[this.config.shape] || generators.sphere;
        const rawLines = generator(radius, numLines, segments, time);

        this.updateRotationCache();
        this.updateColorCache();

        const lines = rawLines.map((line) => {
            const transformedPoints = line.points.map((point) => {
                const p = this.rotateAllCached(point);
                const projected = this.projectPoint(p);
                return {
                    x: projected.x,
                    y: projected.y,
                    z: p.z,
                    displacement: point.displacement,
                };
            });

            const avgZ = transformedPoints.reduce((sum, p) => sum + p.z, 0) / transformedPoints.length;
            return { points: transformedPoints, index: line.index, avgZ };
        });

        lines.sort((a, b) => a.avgZ - b.avgZ);

        for (const line of lines) {
            const { points, index } = line;

            this.ctx.beginPath();

            let started = false;
            for (let j = 0; j < points.length; j++) {
                const p = points[j];

                if (p.z < -radius * 0.3 && this.config.depthFade && this.config.shape === 'sphere') {
                    if (started) {
                        this.ctx.stroke();
                        started = false;
                    }
                    continue;
                }

                if (!started) {
                    this.ctx.moveTo(p.x, p.y);
                    started = true;
                } else {
                    this.ctx.lineTo(p.x, p.y);
                }
            }

            const normalizedZ = (line.avgZ / radius + 1) / 2;
            this.ctx.strokeStyle = this.getColor(normalizedZ, index, numLines);
            this.ctx.stroke();
        }
    }

    animate(currentTime) {
        if (this.isDestroyed) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.state.time += deltaTime * this.config.animationSpeed * 0.01;

        const autoRot = this.calculateAutoRotation();
        this.calculateRandomMotion();
        this.calculateHoverEffect();

        if (!this.state.isDragging) {
            this.state.baseRotationX += autoRot.x;
            this.state.baseRotationY += autoRot.y;
            this.state.baseRotationZ += autoRot.z;
        }

        if (!this.state.isDragging && this.config.dragInertia) {
            this.state.targetRotationX += this.state.velocityX;
            this.state.targetRotationY += this.state.velocityY;
            this.state.velocityX *= this.config.inertiaDecay;
            this.state.velocityY *= this.config.inertiaDecay;
        }

        if (this.config.autoBounceBack && !this.state.isDragging) {
            this.state.targetRotationX *= (1 - this.config.bounceBackSpeed);
            this.state.targetRotationY *= (1 - this.config.bounceBackSpeed);
        }

        if (this.config.clampRotation) {
            const maxRad = this.config.maxXRotation * Math.PI / 180;
            this.state.targetRotationX = Math.max(-maxRad, Math.min(maxRad, this.state.targetRotationX));
        }

        const totalTargetX = this.state.baseRotationX + this.state.targetRotationX + this.state.hoverOffsetX + this.state.randomOffsetX;
        const totalTargetY = this.state.baseRotationY + this.state.targetRotationY + this.state.hoverOffsetY + this.state.randomOffsetY;
        const totalTargetZ = this.state.baseRotationZ + this.state.targetRotationZ + this.state.randomOffsetZ;

        const smoothing = this.config.smoothingFactor;
        this.state.rotationX = this.applyEasing(this.state.rotationX, totalTargetX, smoothing);
        this.state.rotationY = this.applyEasing(this.state.rotationY, totalTargetY, smoothing);
        this.state.rotationZ = this.applyEasing(this.state.rotationZ, totalTargetZ, smoothing);

        this.renderShape();
        this.animationFrameId = requestAnimationFrame(this.animate);
    }
}
