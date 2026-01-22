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
            useSphereSizeRem: false,
            sphereSizeRem: 15,
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

            // View & Camera
            viewPreset: '',
            cameraProjection: 'perspective',

            // Text Mode
            textChar: '5',

            // Shape Morphing
            morphEnabled: false,
            morphTargetShape: 'cube',
            morphProgress: 0,
            morphDuration: 1500,
            morphAutoPlay: false,
            morphLoop: false,

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
            calculatedRadius: 280,

            // Morph state
            morphProgress: 0,
            morphStartTime: null,
            isMorphing: false,
            morphSourceShape: 'sphere',
            morphDirection: 1, // 1 = forward, -1 = reverse
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

        // Cache for expensive text scanning
        this.textCache = {
            char: null,
            lines: null,
            density: null,
            segments: null,
            cachedAt: 0
        };
        this.offscreenCanvas = document.createElement('canvas'); // Reuse for text scanning

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

        // Handle morph source shape sync when main shape changes
        if (newConfig.shape !== undefined && !this.state.isMorphing) {
            this.state.morphSourceShape = newConfig.shape;
        }

        // Handle morph progress from config
        if (newConfig.morphProgress !== undefined) {
            this.state.morphProgress = newConfig.morphProgress;
        }

        // Handle morph auto-play start
        if (newConfig.morphAutoPlay !== undefined && newConfig.morphAutoPlay && this.config.morphEnabled) {
            if (!this.state.isMorphing) {
                this.startMorph(this.config.morphTargetShape, this.config.morphDuration);
            }
        }

        // Recalculate radius
        this.state.calculatedRadius = this.calculateRadius();
    }

    calculateRadius() {
        if (this.config.useSphereSizeRem) {
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            return this.config.sphereSizeRem * rootFontSize;
        }
        return this.config.sphereSize;
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

        // Recalculate radius on resize as root font size might change
        this.state.calculatedRadius = this.calculateRadius();
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

            ellipsoid: (radius, numLines, segments, time) => {
                const lines = [];
                for (let i = 0; i < numLines; i++) {
                    const phi = (i / (numLines - 1)) * Math.PI;
                    const points = [];
                    for (let j = 0; j <= segments; j++) {
                        const theta = (j / segments) * Math.PI * 2;
                        const x = Math.sin(phi) * Math.cos(theta);
                        const y = Math.cos(phi) * 1.5; // Stretch Y
                        const z = Math.sin(phi) * Math.sin(theta);
                        points.push(this.applyDisplacement(x, y, z, radius, time));
                    }
                    lines.push({ points, index: i });
                }
                return lines;
            },

            capsule: (radius, numLines, segments, time) => {
                const lines = [];
                const r = radius * 0.5; // Cylinder radius
                const h = radius * 1.5; // Cylinder height

                for (let i = 0; i < numLines; i++) {
                    const t = i / (numLines - 1); // 0 to 1
                    const points = [];

                    // Parametric capsule logic
                    // We treat it as 3 sections: top hemisphere, cylinder body, bottom hemisphere
                    // But simpler: map phi from 0 to PI, but stretch the middle part

                    let y, ringRadius;

                    // Simplified approach: map t to vertical position directly
                    // Top: t=0 -> y=h/2+r
                    // Bottom: t=1 -> y=-(h/2+r)

                    if (t < 0.2) {
                        // Top Cap
                        const capT = t / 0.2; // 0 to 1
                        const phi = capT * (Math.PI / 2);
                        y = (h / 2) + r * Math.cos(phi);
                        ringRadius = r * Math.sin(phi);
                    } else if (t > 0.8) {
                        // Bottom Cap
                        const capT = (t - 0.8) / 0.2; // 0 to 1
                        const phi = (Math.PI / 2) + capT * (Math.PI / 2);
                        y = -(h / 2) + r * Math.cos(phi);
                        ringRadius = r * Math.sin(phi);
                    } else {
                        // Cylinder Body
                        const bodyT = (t - 0.2) / 0.6; // 0 to 1
                        y = (h / 2) - bodyT * h;
                        ringRadius = r;
                    }

                    for (let j = 0; j <= segments; j++) {
                        const theta = (j / segments) * Math.PI * 2;
                        const x = ringRadius * Math.cos(theta);
                        const z = ringRadius * Math.sin(theta);

                        // Normalized for noise lookup (approximate)
                        const nx = x / r;
                        const ny = y / (h / 2 + r);
                        const nz = z / r;

                        const scale = this.config.noiseScale;
                        const amp = this.config.noiseAmplitude / 100;
                        const modes = this.getDisplacementModes();
                        const displaceFn = modes[this.config.mode] || modes.wavy;
                        const displacement = displaceFn(nx, ny, nz, time, scale, amp, this.state.noiseOffset);

                        points.push({
                            x: x * (1 + displacement),
                            y: y * (1 + displacement),
                            z: z * (1 + displacement),
                            displacement
                        });
                    }
                    lines.push({ points, index: i });
                }
                return lines;
            },



            mobius: (radius, numLines, segments, time) => {
                const lines = [];
                const R = radius * 0.8;
                const width = radius * 0.3;

                for (let i = 0; i < numLines; i++) {
                    const t = (i / (numLines - 1)) * 2 - 1; // -1 to 1 (width of strip)
                    const points = [];
                    for (let j = 0; j <= segments; j++) {
                        const u = (j / segments) * Math.PI * 2; // 0 to 2PI (around loop)

                        const x = (R + width * t * Math.cos(u / 2)) * Math.cos(u);
                        const y = (R + width * t * Math.cos(u / 2)) * Math.sin(u);
                        const z = width * t * Math.sin(u / 2);

                        // Calculate normal-ish for noise (simplified)
                        const nx = x / R;
                        const ny = y / R;
                        const nz = z / width;

                        const scale = this.config.noiseScale;
                        const amp = this.config.noiseAmplitude / 100;
                        const modes = this.getDisplacementModes();
                        const displaceFn = modes[this.config.mode] || modes.wavy;
                        const displacement = displaceFn(nx, ny, nz, time, scale, amp, this.state.noiseOffset);

                        points.push({
                            x: x + nx * displacement * 50, // Push out along normal approx
                            y: y + ny * displacement * 50,
                            z: z + nz * displacement * 50,
                            displacement
                        });
                    }
                    lines.push({ points, index: i });
                }
                return lines;
            },



            heart: (radius, numLines, segments, time) => {
                const lines = [];
                const size = radius * 0.05; // Scaling factor

                for (let i = 0; i < numLines; i++) {
                    const phi = (i / (numLines - 1)) * Math.PI; // 0 to PI
                    const points = [];
                    for (let j = 0; j <= segments; j++) {
                        const theta = (j / segments) * Math.PI * 2; // 0 to 2PI

                        // Parametric Heart Formula
                        // x = 16sin^3(t)
                        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
                        // But we need 3D. A common one is rotating a heart curve or a specific 3D surface.
                        // Using a pseudo-spherical heart mapping:

                        const x = 16 * Math.pow(Math.sin(theta), 3) * Math.sin(phi);
                        const y = (13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta)) * Math.sin(phi);
                        const z = 10 * Math.cos(phi); // Simple inflation along Z

                        // Correct orientation
                        const rX = x * size;
                        const rY = -y * size; // Flip Y to stand up
                        const rZ = z * size;

                        // Apply displacement
                        // Normalize approximately for noise
                        const nx = rX / radius;
                        const ny = rY / radius;
                        const nz = rZ / radius;

                        const scale = this.config.noiseScale;
                        const amp = this.config.noiseAmplitude / 100;
                        const modes = this.getDisplacementModes();
                        const displaceFn = modes[this.config.mode] || modes.wavy;
                        const displacement = displaceFn(nx, ny, nz, time, scale, amp, this.state.noiseOffset);

                        points.push({
                            x: rX * (1 + displacement),
                            y: rY * (1 + displacement),
                            z: rZ * (1 + displacement),
                            displacement
                        });
                    }
                    lines.push({ points, index: i });
                }
                return lines;
            },

            klein: (radius, numLines, segments, time) => {
                const lines = [];
                const size = radius * 0.15;

                for (let i = 0; i < numLines; i++) {
                    const u = (i / (numLines - 1)) * Math.PI; // 0 to PI
                    const points = [];
                    for (let j = 0; j <= segments; j++) {
                        const v = (j / segments) * Math.PI * 2; // 0 to 2PI

                        // Gray's Klein Bottle
                        const x = (3 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.cos(u);
                        const y = (3 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.sin(u);
                        const z = Math.sin(u / 2) * Math.sin(v) + Math.cos(u / 2) * Math.sin(2 * v);

                        const rX = x * size;
                        const rY = y * size;
                        const rZ = z * size;

                        // Displacement
                        const scale = this.config.noiseScale;
                        const amp = this.config.noiseAmplitude / 100;
                        const modes = this.getDisplacementModes();
                        const displaceFn = modes[this.config.mode] || modes.wavy;
                        const displacement = displaceFn(rX / size, rY / size, rZ / size, time, scale, amp, this.state.noiseOffset);

                        points.push({
                            x: rX * (1 + displacement * 0.3),
                            y: rY * (1 + displacement * 0.3),
                            z: rZ * (1 + displacement * 0.3),
                            displacement
                        });
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

            number: (radius, numLines, segments, time) => {
                const char = this.config.textChar || '5';

                // --- CACHING STRATEGY ---
                // Re-scanning text pixels is too slow for 60fps.
                // We cache the "base topology" (points list) and only re-calculate it if:
                // 1. Character changed
                // 2. Line Density changed
                // 3. Line Segments changed
                // The 'time' based displacement is applied to the cached points every frame.

                const cacheValid =
                    this.textCache.char === char &&
                    this.textCache.density === numLines &&
                    this.textCache.segments === segments &&
                    this.textCache.lines !== null;

                if (!cacheValid) {
                    console.time('TextScan');
                    // 1. Setup Offscreen Canvas
                    const size = 512; // High res for good scanning
                    this.offscreenCanvas.width = size;
                    this.offscreenCanvas.height = size;
                    const ctx = this.offscreenCanvas.getContext('2d');

                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, size, size);

                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    // Use Inter Extra Black if available, fallback to sans-serif
                    ctx.font = '900 400px Inter, "Heebo", sans-serif';

                    // Fix mirrored text by flipping horizontally
                    ctx.save();
                    ctx.scale(-1, 1);
                    ctx.fillText(char, -size / 2, size / 2);
                    ctx.restore();

                    const imageData = ctx.getImageData(0, 0, size, size).data;

                    // 2. Scan for points
                    const newLines = [];
                    // We map 'numLines' to vertical Y position

                    for (let i = 0; i < numLines; i++) {
                        // Scan line Y position (0 to size-1)
                        const yNorm = i / (numLines - 1);
                        const y = Math.floor(yNorm * (size - 1));

                        const points = [];
                        let isInside = false;

                        // We walk across the X axis
                        // To keep point count somewhat consistent with 'segments', we skip pixels
                        const step = Math.max(1, Math.floor(size / segments));

                        for (let x = 0; x < size; x += step) {
                            const index = (y * size + x) * 4;
                            const brightness = imageData[index]; // R channel

                            // Simple threshold
                            if (brightness > 128) {
                                // Mapped to -1..1 range
                                const pX = (x / size) * 2 - 1;
                                const pY = (1 - yNorm) * 2 - 1; // Flip Y so up is up
                                // Z is 0 (flat text)
                                const pZ = 0;

                                points.push({
                                    baseX: pX,
                                    baseY: pY,
                                    baseZ: pZ
                                });
                                isInside = true;
                            } else {
                                if (isInside) {
                                    // Gap in text (e.g. middle of '0')
                                    // We could break the line here or simple keep points empty
                                    // For this simple engine, we just keep valid points. 
                                    // Long gaps might create "flying lines" if we aren't careful, 
                                    // but usually 'lines' array is one single path per row.
                                    // To support holes correctly, we'd need multiple 'lines' object per row i,
                                    // but our engine expects 1 line object per i.
                                    // Hack: We add a 'gap' marker point? 
                                    // Or just let it connect (looks like wireframe text).
                                    // Let's trying adding "null" points to break valid segments? 
                                    // Render loop doesn't handle nulls well.
                                    // Better approach: Just accept the wireframe connection across the gap,
                                    // OR split into multiple lines object with same index.
                                    // Let's try splitting!

                                    if (points.length > 0) {
                                        newLines.push({ points: [...points], index: i }); // Flush current segment
                                        points.length = 0; // Clear
                                    }
                                    isInside = false;
                                }
                            }
                        }
                        if (points.length > 0) {
                            newLines.push({ points: [...points], index: i });
                        }
                    }

                    // Filter empty lines to save perf
                    // Update Cache
                    this.textCache = {
                        char: char,
                        density: numLines,
                        segments: segments,
                        lines: newLines,
                        cachedAt: Date.now()
                    };
                    console.timeEnd('TextScan');
                }

                // --- GENERATE FRAME ---
                // Apply displacement to cached points
                const finalTextLines = [];
                const radiusScale = radius * 0.8; // Scale char to fit sphere radius

                this.textCache.lines.forEach(lineObj => {
                    const currentPoints = [];
                    lineObj.points.forEach(pt => {
                        const x = pt.baseX * radiusScale;
                        const y = pt.baseY * radiusScale;
                        const z = pt.baseZ * radiusScale; // Flat by default

                        // Apply Noise Displacement
                        // Map 3D pos to noise space
                        // We use a simplified normal (Z-up) or radial?
                        // For flat text, maybe just Z displacement looks best?
                        // Or general 3D displacement.

                        const scale = this.config.noiseScale;
                        const amp = this.config.noiseAmplitude / 100;
                        const modes = this.getDisplacementModes();
                        const displaceFn = modes[this.config.mode] || modes.wavy;

                        // Noise offset by some Z to make it distinct
                        const displacement = displaceFn(pt.baseX, pt.baseY, 0.5, time, scale, amp, this.state.noiseOffset);

                        currentPoints.push({
                            x: x * (1 + displacement * 0.2), // Subtle distortion
                            y: y * (1 + displacement * 0.2),
                            z: z + (displacement * radius * 0.5), // Main effect is Z-extrusion
                            displacement
                        });
                    });

                    if (currentPoints.length > 1) {
                        finalTextLines.push({ points: currentPoints, index: lineObj.index });
                    }
                });

                return finalTextLines;
            },
        };
    }

    projectPoint(point) {
        if (this.config.cameraProjection === 'orthographic') {
            // Orthographic projection (no depth scaling - parallel projection)
            return {
                x: this.state.centerX + point.x * this.state.zoomFactor,
                y: this.state.centerY + point.y * this.state.zoomFactor,
                z: point.z,
                scale: 1,
            };
        } else {
            // Perspective projection (depth-based scaling)
            const fov = 800;
            const scale = fov / (fov + point.z);
            return {
                x: this.state.centerX + point.x * scale * this.state.zoomFactor,
                y: this.state.centerY + point.y * scale * this.state.zoomFactor,
                z: point.z,
                scale,
            };
        }
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

    /**
     * Base shape point generators - return normalized {x, y, z} WITHOUT displacement.
     * Used for morphing: interpolate between base points, then apply displacement.
     */
    getBaseShapeGenerators() {
        return {
            sphere: (i, j, numLines, segments) => {
                const phi = (i / (numLines - 1)) * Math.PI;
                const theta = (j / segments) * Math.PI * 2;
                return {
                    x: Math.sin(phi) * Math.cos(theta),
                    y: Math.cos(phi),
                    z: Math.sin(phi) * Math.sin(theta),
                    scale: 1.0, // Scale factor for radius
                };
            },

            cube: (i, j, numLines, segments) => {
                const t = (i / (numLines - 1)) * 2 - 1;
                const y = t;
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

                return { x, y, z, scale: 0.8 };
            },

            pyramid: (i, j, numLines, segments) => {
                const t = i / (numLines - 1);
                const y = 1 - t * 2;
                const pyramidScale = t;
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

                x = Math.max(-1, Math.min(1, x)) * pyramidScale;
                z = Math.max(-1, Math.min(1, z)) * pyramidScale;

                return { x, y, z, scale: 0.9 };
            },

            plane: (i, j, numLines, segments) => {
                const z = ((i / (numLines - 1)) * 2 - 1);
                const x = (j / segments) * 2 - 1;
                const y = 0;
                return { x, y, z, scale: 1.2 };
            },

            torus: (i, j, numLines, segments) => {
                const R = 0.7; // Major radius ratio
                const r = 0.3; // Minor radius ratio
                const phi = (i / (numLines - 1)) * Math.PI * 2;
                const theta = (j / segments) * Math.PI * 2;

                const x = (R + r * Math.cos(phi)) * Math.cos(theta);
                const y = r * Math.sin(phi);
                const z = (R + r * Math.cos(phi)) * Math.sin(theta);

                return { x, y, z, scale: 1.0 };
            },

            cylinder: (i, j, numLines, segments) => {
                const t = (i / (numLines - 1)) * 2 - 1;
                const y = t;
                const theta = (j / segments) * Math.PI * 2;
                const x = Math.cos(theta);
                const z = Math.sin(theta);
                return { x, y, z, scale: 0.7 };
            },

            cone: (i, j, numLines, segments) => {
                const t = i / (numLines - 1);
                const y = 1 - t * 2;
                const coneScale = t;
                const theta = (j / segments) * Math.PI * 2;
                const x = Math.cos(theta) * coneScale;
                const z = Math.sin(theta) * coneScale;
                return { x, y, z, scale: 0.8 };
            },

            ellipsoid: (i, j, numLines, segments) => {
                const phi = (i / (numLines - 1)) * Math.PI;
                const theta = (j / segments) * Math.PI * 2;
                return {
                    x: Math.sin(phi) * Math.cos(theta),
                    y: Math.cos(phi) * 1.5,
                    z: Math.sin(phi) * Math.sin(theta),
                    scale: 1.0,
                };
            },

            capsule: (i, j, numLines, segments) => {
                const r = 0.5;
                const h = 1.5;
                const t = i / (numLines - 1);
                let y, ringRadius;

                if (t < 0.2) {
                    const capT = t / 0.2;
                    const phi = capT * (Math.PI / 2);
                    y = (h / 2) + r * Math.cos(phi);
                    ringRadius = r * Math.sin(phi);
                } else if (t > 0.8) {
                    const capT = (t - 0.8) / 0.2;
                    const phi = (Math.PI / 2) + capT * (Math.PI / 2);
                    y = -(h / 2) + r * Math.cos(phi);
                    ringRadius = r * Math.sin(phi);
                } else {
                    const bodyT = (t - 0.2) / 0.6;
                    y = (h / 2) - bodyT * h;
                    ringRadius = r;
                }

                const theta = (j / segments) * Math.PI * 2;
                const x = ringRadius * Math.cos(theta);
                const z = ringRadius * Math.sin(theta);

                return { x, y, z, scale: 1.0 };
            },

            mobius: (i, j, numLines, segments) => {
                const R = 0.8;
                const width = 0.3;
                const t = (i / (numLines - 1)) * 2 - 1;
                const u = (j / segments) * Math.PI * 2;

                const x = (R + width * t * Math.cos(u / 2)) * Math.cos(u);
                const y = (R + width * t * Math.cos(u / 2)) * Math.sin(u);
                const z = width * t * Math.sin(u / 2);

                return { x, y, z, scale: 1.0 };
            },

            heart: (i, j, numLines, segments) => {
                const phi = (i / (numLines - 1)) * Math.PI;
                const theta = (j / segments) * Math.PI * 2;

                const size = 0.05;
                const x = 16 * Math.pow(Math.sin(theta), 3) * Math.sin(phi) * size;
                const y = -(13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta)) * Math.sin(phi) * size;
                const z = 10 * Math.cos(phi) * size;

                return { x, y, z, scale: 1.0 };
            },

            klein: (i, j, numLines, segments) => {
                const u = (i / (numLines - 1)) * Math.PI;
                const v = (j / segments) * Math.PI * 2;
                const size = 0.15;

                const x = (3 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.cos(u) * size;
                const y = (3 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.sin(u) * size;
                const z = (Math.sin(u / 2) * Math.sin(v) + Math.cos(u / 2) * Math.sin(2 * v)) * size;

                return { x, y, z, scale: 1.0 };
            },

            number: (i, j, numLines, segments) => {
                // Fallback to sphere for number shape (text requires special handling)
                const phi = (i / (numLines - 1)) * Math.PI;
                const theta = (j / segments) * Math.PI * 2;
                return {
                    x: Math.sin(phi) * Math.cos(theta),
                    y: Math.cos(phi),
                    z: Math.sin(phi) * Math.sin(theta),
                    scale: 1.0,
                };
            },
        };
    }

    /**
     * Linear interpolation between two points
     */
    lerpPoint(pointA, pointB, t) {
        return {
            x: pointA.x + (pointB.x - pointA.x) * t,
            y: pointA.y + (pointB.y - pointA.y) * t,
            z: pointA.z + (pointB.z - pointA.z) * t,
            scale: pointA.scale + (pointB.scale - pointA.scale) * t,
        };
    }

    /**
     * Start a morph animation
     */
    startMorph(targetShape, duration = null) {
        this.state.morphSourceShape = this.config.shape;
        this.config.morphTargetShape = targetShape;
        this.state.morphStartTime = performance.now();
        this.state.isMorphing = true;
        this.state.morphProgress = 0;
        this.state.morphDirection = 1;
        if (duration !== null) {
            this.config.morphDuration = duration;
        }
    }

    /**
     * Update morph progress based on elapsed time
     */
    updateMorph(currentTime) {
        if (!this.state.isMorphing || !this.config.morphAutoPlay) return;

        const elapsed = currentTime - this.state.morphStartTime;
        let progress = elapsed / this.config.morphDuration;

        if (this.config.morphLoop) {
            // Ping-pong looping
            const cycle = Math.floor(progress);
            progress = progress - cycle;
            if (cycle % 2 === 1) {
                progress = 1 - progress;
            }
        } else {
            progress = Math.min(1, progress);
            if (progress >= 1) {
                this.state.isMorphing = false;
            }
        }

        this.state.morphProgress = progress;
    }

    /**
     * Generate morphed shape lines with interpolation between source and target shapes
     */
    generateMorphedLines(radius, numLines, segments, time) {
        const lines = [];
        const baseGenerators = this.getBaseShapeGenerators();
        const sourceGen = baseGenerators[this.state.morphSourceShape] || baseGenerators.sphere;
        const targetGen = baseGenerators[this.config.morphTargetShape] || baseGenerators.cube;
        const morphProgress = this.config.morphEnabled ?
            (this.state.isMorphing ? this.state.morphProgress : this.config.morphProgress) : 0;

        for (let i = 0; i < numLines; i++) {
            const points = [];

            for (let j = 0; j <= segments; j++) {
                // Get base points from both shapes
                const baseA = sourceGen(i, j, numLines, segments);
                const baseB = targetGen(i, j, numLines, segments);

                // Interpolate between shapes
                const morphed = this.lerpPoint(baseA, baseB, morphProgress);

                // Calculate effective radius with interpolated scale
                const effectiveRadius = radius * morphed.scale;

                // Apply displacement AFTER morphing
                const displaced = this.applyDisplacement(
                    morphed.x, morphed.y, morphed.z,
                    effectiveRadius, time
                );

                points.push(displaced);
            }

            lines.push({ points, index: i });
        }

        return lines;
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
        const { width, height, time, calculatedRadius } = this.state;
        const radius = calculatedRadius;
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

        // Use morphed lines when morphing is enabled and has progress
        const shouldMorph = this.config.morphEnabled &&
            (this.state.morphProgress > 0 || this.config.morphProgress > 0);
        const rawLines = shouldMorph
            ? this.generateMorphedLines(radius, numLines, segments, time)
            : generator(radius, numLines, segments, time);

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

        // Update morph animation if auto-playing
        this.updateMorph(currentTime);

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
