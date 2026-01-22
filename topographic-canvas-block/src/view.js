/**
 * Frontend View Script - Initializes topographic canvas on page load
 */
import { TopographicCanvas } from './topographic-canvas';

/**
 * Initialize all topographic canvas blocks on the page
 */
function initTopographicCanvasBlocks() {
    const blocks = document.querySelectorAll('.wp-block-topographic-canvas-block');

    blocks.forEach((block) => {
        const container = block.querySelector('.topographic-canvas-container');

        if (!container || container.dataset.initialized === 'true') {
            return;
        }

        // Get configuration from data attributes
        const config = {
            shape: container.dataset.shape || 'sphere',
            mode: container.dataset.mode || 'wavy',
            colorMode: container.dataset.colorMode || 'mono',
            lineColor: container.dataset.lineColor || '#ffffff',
            hueStart: parseFloat(container.dataset.hueStart) || 180,
            hueEnd: parseFloat(container.dataset.hueEnd) || 280,
            lineDensity: parseInt(container.dataset.lineDensity) || 60,
            lineSegments: parseInt(container.dataset.lineSegments) || 150,
            sphereSize: parseInt(container.dataset.sphereSize) || 280,
            useSphereSizeRem: container.dataset.useSphereSizeRem === 'true',
            sphereSizeRem: parseFloat(container.dataset.sphereSizeRem) || 15,
            noiseScale: parseFloat(container.dataset.noiseScale) || 2,
            noiseAmplitude: parseInt(container.dataset.noiseAmplitude) || 30,
            animationSpeed: parseInt(container.dataset.animationSpeed) || 50,
            lineWidth: parseFloat(container.dataset.lineWidth) || 0.8,
            lineOpacity: parseFloat(container.dataset.lineOpacity) || 0.7,
            depthFade: container.dataset.depthFade === 'true',
            glowEffect: container.dataset.glowEffect === 'true',
            bgColor: container.dataset.bgColor || '#0a0a0a',

            // Wavy Mode
            wavyOctave2Strength: parseFloat(container.dataset.wavyOctave2Strength) || 0.5,
            wavyOctave3Strength: parseFloat(container.dataset.wavyOctave3Strength) || 0.25,
            wavyOctave2Freq: parseFloat(container.dataset.wavyOctave2Freq) || 2,
            wavyOctave3Freq: parseFloat(container.dataset.wavyOctave3Freq) || 4,
            wavyTime2: parseFloat(container.dataset.wavyTime2) || 1.5,
            wavyTime3: parseFloat(container.dataset.wavyTime3) || 2,

            // Bands Mode
            bandsDensity: parseInt(container.dataset.bandsDensity) || 8,
            bandsNoiseInfluence: parseFloat(container.dataset.bandsNoiseInfluence) || 0.7,
            bandsTimeScale: parseFloat(container.dataset.bandsTimeScale) || 2,
            bandsAngleScale: parseFloat(container.dataset.bandsAngleScale) || 0.5,
            bandsYScale: parseFloat(container.dataset.bandsYScale) || 2,
            bandsStrength: parseFloat(container.dataset.bandsStrength) || 0.3,

            // Cellular Mode
            cellularFreq1: parseFloat(container.dataset.cellularFreq1) || 3,
            cellularFreq2: parseFloat(container.dataset.cellularFreq2) || 6,
            cellularTime2: parseFloat(container.dataset.cellularTime2) || 0.5,
            cellularAmpBoost: parseFloat(container.dataset.cellularAmpBoost) || 1.5,
            cellularSharpness: parseFloat(container.dataset.cellularSharpness) || 2,

            // Turbulent Mode
            turbulentOctaves: parseInt(container.dataset.turbulentOctaves) || 5,
            turbulentLacunarity: parseFloat(container.dataset.turbulentLacunarity) || 2,
            turbulentPersistence: parseFloat(container.dataset.turbulentPersistence) || 0.5,
            turbulentTimeMult: parseFloat(container.dataset.turbulentTimeMult) || 0.3,
            turbulentTimeOffset: parseFloat(container.dataset.turbulentTimeOffset) || 1,

            // Spiral Mode
            spiralArms: parseInt(container.dataset.spiralArms) || 3,
            spiralTwist: parseFloat(container.dataset.spiralTwist) || 5,
            spiralTimeScale: parseFloat(container.dataset.spiralTimeScale) || 2,
            spiralNoiseBlend: parseFloat(container.dataset.spiralNoiseBlend) || 0.5,
            spiralStrength: parseFloat(container.dataset.spiralStrength) || 0.5,

            // Ripple Mode
            rippleFrequency: parseInt(container.dataset.rippleFrequency) || 10,
            rippleSpeed: parseFloat(container.dataset.rippleSpeed) || 3,
            rippleStrength: parseFloat(container.dataset.rippleStrength) || 0.5,
            rippleNoiseBlend: parseFloat(container.dataset.rippleNoiseBlend) || 0.5,
            rippleNoiseTime: parseFloat(container.dataset.rippleNoiseTime) || 0.5,

            // Auto Rotation
            autoRotate: container.dataset.autoRotate === 'true',
            rotationSpeed: parseInt(container.dataset.rotationSpeed) || 20,
            rotationDirX: parseInt(container.dataset.rotationDirX) || 0,
            rotationDirY: parseInt(container.dataset.rotationDirY) || 90,
            rotationDirZ: parseInt(container.dataset.rotationDirZ) || 0,
            rotationMode: container.dataset.rotationMode || 'constant',
            pendulumAmplitude: parseInt(container.dataset.pendulumAmplitude) || 45,

            // View Presets
            viewPreset: container.dataset.viewPreset || '',
            baseRotationX: parseFloat(container.dataset.baseRotationX) || 0,
            baseRotationY: parseFloat(container.dataset.baseRotationY) || 0,
            baseRotationZ: parseFloat(container.dataset.baseRotationZ) || 0,

            // Mouse Drag
            dragEnabled: container.dataset.dragEnabled === 'true',
            dragSensitivity: parseFloat(container.dataset.dragSensitivity) || 1,
            dragInertia: container.dataset.dragInertia === 'true',
            inertiaDecay: parseFloat(container.dataset.inertiaDecay) || 0.95,
            autoBounceBack: container.dataset.autoBounceBack === 'true',
            bounceBackSpeed: parseFloat(container.dataset.bounceBackSpeed) || 0.05,
            clampRotation: container.dataset.clampRotation === 'true',
            maxXRotation: parseInt(container.dataset.maxXRotation) || 90,

            // Hover
            hoverEnabled: container.dataset.hoverEnabled === 'true',
            hoverMode: container.dataset.hoverMode || 'tilt',
            hoverStrength: parseFloat(container.dataset.hoverStrength) || 1,
            hoverSmoothing: parseFloat(container.dataset.hoverSmoothing) || 0.08,
            hoverAffectsNoise: container.dataset.hoverAffectsNoise === 'true',
            hoverNoiseInfluence: parseInt(container.dataset.hoverNoiseInfluence) || 10,

            // Random Motion
            randomMotion: container.dataset.randomMotion === 'true',
            randomMode: container.dataset.randomMode || 'gentle',
            randomIntensity: parseFloat(container.dataset.randomIntensity) || 1,
            randomSpeed: parseFloat(container.dataset.randomSpeed) || 1,

            // Advanced
            easingFunction: container.dataset.easingFunction || 'easeOut',
            smoothingFactor: parseFloat(container.dataset.smoothingFactor) || 0.05,
            mouseWheelZoom: container.dataset.mouseWheelZoom === 'true',
            zoomSensitivity: parseFloat(container.dataset.zoomSensitivity) || 1,
        };

        // Initialize the canvas
        const canvasInstance = new TopographicCanvas(container, config);

        // Mark as initialized
        container.dataset.initialized = 'true';

        // Setup sticky center positioning by measuring height and calculating top value
        if (block.classList.contains('sticky-position-center')) {
            setupStickyCenterPosition(block);
        }

        // Setup scroll tracking and interaction observers AND keyframes
        const keyframesData = container.dataset.keyframes ? JSON.parse(container.dataset.keyframes) : [];
        setupScrollAndInteractionTracking(block, canvasInstance, keyframesData);
    });
}

/**
 * Setup scroll measurement, interaction tracking, and keyframe application
 */
function setupScrollAndInteractionTracking(block, canvasInstance, keyframes) {
    let lastScrollY = window.scrollY;
    let lastRectTop = block.getBoundingClientRect().top;
    let accumulatedDistance = 0;

    // Cache for computed keyframe absolute positions
    let computedKeyframes = [];

    // Helper: Calculate absolute pixel value from unit
    const calculateAbsoluteValue = (val, type, offset = 0) => {
        const numVal = parseFloat(val);
        const numOffset = parseFloat(offset) || 0;

        switch (type) {
            case '%':
                return (numVal / 100) * (document.body.getBoundingClientRect().height - window.innerHeight) + numOffset;
            case 'rem':
                return numVal * parseFloat(getComputedStyle(document.documentElement).fontSize) + numOffset;
            case 'element-center':
                try {
                    const el = document.querySelector(val); // 'val' is selector string here
                    if (!el) return null;
                    const rect = el.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    // Center of element relative to document top
                    // We want it to trigger when this point hits the CENTER of the viewport
                    // So TargetScrollY = ElementAbsCenter - (ViewportHeight / 2)
                    return (rect.top + scrollTop) + (rect.height / 2) - (window.innerHeight / 2) + numOffset;
                } catch (e) {
                    console.warn('Topographic Canvas: Invalid selector', val);
                    return null;
                }
            case 'px':
            default:
                return numVal + numOffset;
        }
    };

    // Helper: Recalculate all ranges
    const recalculateRanges = () => {
        computedKeyframes = keyframes.map(kf => {
            const absStart = calculateAbsoluteValue(kf.triggerValue, kf.triggerType, kf.triggerOffset);

            // For advanced end value
            let absEnd = null;
            if (kf.isAdvanced) {
                // If triggerEndType is defined use it, otherwise fallback to start type (legacy behavior)
                // Note: Legacy keyframes might not have triggerEndType, so we assume type 'px' or whatever, 
                // but actually for mixed units we need to check kf.triggerEndType.
                const endType = kf.triggerEndType || kf.triggerType;
                const endOffset = kf.triggerEndOffset || 0;
                absEnd = calculateAbsoluteValue(kf.triggerEndValue, endType, endOffset);
            }

            return {
                ...kf,
                computedStart: absStart !== null ? absStart : -1,
                computedEnd: absEnd !== null ? absEnd : -1
            };
        });
    };

    // Initial calculation and listeners
    recalculateRanges();
    window.addEventListener('resize', recalculateRanges);
    window.addEventListener('load', recalculateRanges); // Images loading shifts layout

    // Base configuration snapshot
    const baseConfig = { ...canvasInstance.config };

    // ============================================
    // HELPER FUNCTIONS FOR VALUE INTERPOLATION
    // ============================================

    const lerp = (start, end, progress) => start + (end - start) * progress;

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgbToHex = (r, g, b) => {
        return "#" + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join('');
    };

    const lerpColor = (startColor, endColor, progress) => {
        const start = hexToRgb(startColor);
        const end = hexToRgb(endColor);
        if (!start || !end) return endColor;
        return rgbToHex(
            lerp(start.r, end.r, progress),
            lerp(start.g, end.g, progress),
            lerp(start.b, end.b, progress)
        );
    };

    const interpolateValue = (key, startVal, endVal, progress) => {
        // Special handling for shape - return morph parameters
        if (key === 'shape' && startVal !== endVal) {
            return {
                __isShapeMorph: true,
                morphEnabled: true,
                morphSourceShape: startVal,
                morphTargetShape: endVal,
                morphProgress: progress,
                shape: startVal // Keep source shape as the base
            };
        }

        // Special handling for textChar - return morph parameters
        if (key === 'textChar' && startVal !== endVal) {
            return {
                __isTextMorph: true,
                morphEnabled: true,
                morphSourceChar: startVal,
                morphTargetChar: endVal,
                morphProgress: progress,
                textChar: startVal // Keep source char as the base
            };
        }

        if (typeof startVal === 'number' && typeof endVal === 'number') {
            return lerp(startVal, endVal, progress);
        }
        if (typeof startVal === 'string' && typeof endVal === 'string') {
            if (startVal.startsWith('#') && endVal.startsWith('#')) {
                return lerpColor(startVal, endVal, progress);
            }
            return progress < 0.5 ? startVal : endVal;
        }
        if (typeof startVal === 'boolean' && typeof endVal === 'boolean') {
            return progress < 0.5 ? startVal : endVal;
        }
        return endVal;
    };

    // ============================================
    // PURE POSITION-BASED STATE CALCULATION
    // ============================================
    // This function computes the EXACT canvas state for any scroll position.
    // No history, no "last keyframe" - just position → state.
    // This ensures clicking scrollbar, fast scrolling, or any jump ALWAYS works.

    const computeStateForScrollPosition = (scrollPos) => {
        // Start with base configuration
        let state = { ...baseConfig };

        // Track whether we're currently in a shape or text morph
        let inShapeMorph = false;
        let inTextMorph = false;

        // --- STEP 1: Apply simple keyframes (cumulative, in order) ---
        const simpleKFs = computedKeyframes
            .filter(k => !k.isAdvanced && k.computedStart !== -1)
            .sort((a, b) => a.computedStart - b.computedStart);

        // Apply all passed simple keyframes
        simpleKFs.forEach(kf => {
            if (scrollPos >= kf.computedStart) {
                // Apply this keyframe's settings
                state = { ...state, ...kf.settings };
            }
        });

        // Handle linear interpolation between simple keyframes
        const passedSimple = simpleKFs.filter(kf => scrollPos >= kf.computedStart);
        const nextSimple = simpleKFs.find(kf => scrollPos < kf.computedStart);

        if (passedSimple.length > 0 && nextSimple && nextSimple.transitionType === 'linear') {
            const currentKF = passedSimple[passedSimple.length - 1];
            const progress = (scrollPos - currentKF.computedStart) / (nextSimple.computedStart - currentKF.computedStart);
            const clampedProgress = Math.max(0, Math.min(1, progress));

            Object.keys(nextSimple.settings).forEach(key => {
                const startVal = state[key];
                const endVal = nextSimple.settings[key];
                const result = interpolateValue(key, startVal, endVal, clampedProgress);

                // Handle shape morph return object
                if (result && result.__isShapeMorph) {
                    inShapeMorph = true;
                    state.morphEnabled = result.morphEnabled;
                    state.morphSourceShape = result.morphSourceShape;
                    state.morphTargetShape = result.morphTargetShape;
                    state.morphProgress = result.morphProgress;
                    state.shape = result.shape;
                } else if (result && result.__isTextMorph) {
                    inTextMorph = true;
                    state.morphEnabled = result.morphEnabled;
                    state.morphSourceChar = result.morphSourceChar;
                    state.morphTargetChar = result.morphTargetChar;
                    state.morphProgress = result.morphProgress;
                    state.textChar = result.textChar;
                } else {
                    state[key] = result;
                }
            });
        }

        // --- STEP 2: Apply advanced ranges (each can override) ---
        const advancedKFs = computedKeyframes
            .filter(k => k.isAdvanced && k.computedStart !== -1 && k.computedEnd !== -1)
            .sort((a, b) => a.computedStart - b.computedStart);

        advancedKFs.forEach(kf => {
            const rangeStart = kf.computedStart;
            const rangeEnd = kf.computedEnd;

            if (rangeEnd <= rangeStart) return; // Invalid range

            const startSet = kf.startSettings || {};
            const endSet = kf.settings || {};
            const allKeys = [...new Set([...Object.keys(startSet), ...Object.keys(endSet)])];

            if (scrollPos >= rangeStart && scrollPos <= rangeEnd) {
                // INSIDE: interpolate from startSettings to settings
                const progress = (scrollPos - rangeStart) / (rangeEnd - rangeStart);

                allKeys.forEach(key => {
                    const sVal = startSet[key] !== undefined ? startSet[key] : state[key];
                    const eVal = endSet[key] !== undefined ? endSet[key] : state[key];
                    const result = interpolateValue(key, sVal, eVal, progress);

                    // Handle shape morph return object
                    if (result && result.__isShapeMorph) {
                        inShapeMorph = true;
                        state.morphEnabled = result.morphEnabled;
                        state.morphSourceShape = result.morphSourceShape;
                        state.morphTargetShape = result.morphTargetShape;
                        state.morphProgress = result.morphProgress;
                        state.shape = result.shape;
                    } else if (result && result.__isTextMorph) {
                        inTextMorph = true;
                        state.morphEnabled = result.morphEnabled;
                        state.morphSourceChar = result.morphSourceChar;
                        state.morphTargetChar = result.morphTargetChar;
                        state.morphProgress = result.morphProgress;
                        state.textChar = result.textChar;
                    } else {
                        state[key] = result;
                    }
                });
            } else if (scrollPos > rangeEnd) {
                // PAST: apply end settings (target values)
                allKeys.forEach(key => {
                    if (endSet[key] !== undefined) {
                        state[key] = endSet[key];
                    }
                });
            }
            // BEFORE range: do nothing, previous state stays
        });

        // If not in a shape or text morph, disable morphing
        if (!inShapeMorph && !inTextMorph) {
            state.morphEnabled = false;
            state.morphProgress = 0;
        }

        return state;
    };

    // ============================================
    // SCROLL UPDATE - DIRECT STATE APPLICATION
    // ============================================

    const scrollKeyframes = keyframes.filter(k => ['px', '%', 'rem', 'element-center'].includes(k.triggerType));

    const updateCanvas = () => {
        const scrollPos = window.scrollY;

        // Compute the exact state for this scroll position
        const newState = computeStateForScrollPosition(scrollPos);

        // Apply directly to canvas - no animation, no transitions
        canvasInstance.updateConfig(newState);
    };

    window.addEventListener('scroll', () => {
        // Keyframe System Update
        if (scrollKeyframes.length > 0) {
            updateCanvas();
        }
    }, { passive: true });

    // Initial update on page load (handles refreshing at a scrolled position)
    if (scrollKeyframes.length > 0) {
        updateCanvas();
    }

    // 2. Interaction Observer for center detection (Events)
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Element scrolled past center:', entry.target);

                // Find matching keyframes for this element
                const centerKFs = keyframes.filter(k => k.triggerType === 'element-center');
                const matchingKFs = centerKFs.filter(kf => {
                    if (!kf.elementSelector) return false;
                    try {
                        return entry.target.matches(kf.elementSelector);
                    } catch (e) {
                        return false;
                    }
                });

                matchingKFs.forEach(kf => {
                    let duration = kf.transitionType === 'duration' ? (kf.transitionDuration || 500) : 0;
                    triggerTransition(kf.settings, duration);
                });
            }
        });
    }, observerOptions);

    // Observe elements based on all unique selectors from keyframes
    const centerKFs = keyframes.filter(k => k.triggerType === 'element-center');
    const uniqueSelectors = [...new Set(centerKFs.map(kf => kf.elementSelector).filter(Boolean))];

    uniqueSelectors.forEach(selector => {
        try {
            document.querySelectorAll(selector).forEach(el => {
                observer.observe(el);
            });
        } catch (e) {
            console.warn(`Invalid selector in keyframe: ${selector}`);
        }
    });

    // Initial update
    if (scrollKeyframes.length > 0) updateCanvas();
}

/**
 * Setup sticky center positioning by measuring element height and calculating the correct top value.
 * This runs once at page load and on resize - no scroll listeners, no class toggling.
 */
function setupStickyCenterPosition(block) {
    const calculateAndApplyTop = () => {
        const height = block.offsetHeight;
        const halfHeight = height / 2;

        // Get the current offset from the inline style (set by render.php)
        // The current style is: top: calc(50vh + offset)
        // We need to change it to: top: calc(50vh - halfHeight + offset)
        const currentStyle = block.style.top || '';

        // Extract the offset from the current calc expression
        // Format is: calc(50vh + Xrem) or calc(50vh + 0rem)
        const offsetMatch = currentStyle.match(/calc\(50vh\s*\+\s*(.+)\)/);
        const offset = offsetMatch ? offsetMatch[1].trim() : '0rem';

        // Set the corrected top value with the element's half-height subtracted
        block.style.top = `calc(50vh - ${halfHeight}px + ${offset})`;
    };

    // Calculate on load
    calculateAndApplyTop();

    // Recalculate on resize (element height might change)
    window.addEventListener('resize', calculateAndApplyTop, { passive: true });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTopographicCanvasBlocks);
} else {
    initTopographicCanvasBlocks();
}
