/**
 * Topographic Canvas Web Worker
 * Handles heavy computation off the main thread:
 * - Simplex noise calculations
 * - Shape generation
 * - Point transformation and projection
 */

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
// Displacement Mode Functions
// ============================================
function createDisplacementModes(config) {
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
        }
    };
}

// ============================================
// Shape Generators
// ============================================
function createShapeGenerators(config, displacementModes, noiseOffset) {
    function applyDisplacement(x, y, z, radius, time) {
        const scale = config.noiseScale;
        const amp = config.noiseAmplitude / 100;
        const displaceFn = displacementModes[config.mode] || displacementModes.wavy;
        const displacement = displaceFn(x, y, z, time, scale, amp, noiseOffset);
        const r = radius * (1 + displacement);
        return { x: x * r, y: y * r, z: z * r, displacement };
    }

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
                    points.push(applyDisplacement(x, y, z, radius, time));
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
                    const scl = config.noiseScale;
                    const amp = config.noiseAmplitude / 100;
                    const displaceFn = displacementModes[config.mode] || displacementModes.wavy;
                    const displacement = displaceFn(nx, ny, nz, time, scl, amp, noiseOffset);
                    points.push({
                        x: x * (1 + displacement * 0.3),
                        y: y * (1 + displacement * 0.3),
                        z: z * (1 + displacement * 0.3),
                        displacement
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
                const y = 1 - t * 2;
                const scale = t;
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
}

// ============================================
// Transform and Project Points
// ============================================
function transformAndProject(lines, rotation, state) {
    const { cosX, sinX, cosY, sinY, cosZ, sinZ } = rotation;
    const { centerX, centerY, zoomFactor } = state;
    const fov = 800;

    return lines.map(line => {
        const transformedPoints = line.points.map(point => {
            // Rotate X
            const y1 = point.y * cosX - point.z * sinX;
            const z1 = point.y * sinX + point.z * cosX;
            // Rotate Y
            const x2 = point.x * cosY + z1 * sinY;
            const z2 = -point.x * sinY + z1 * cosY;
            // Rotate Z
            const x3 = x2 * cosZ - y1 * sinZ;
            const y3 = x2 * sinZ + y1 * cosZ;

            // Project
            const scale = fov / (fov + z2);
            return {
                x: centerX + x3 * scale * zoomFactor,
                y: centerY + y3 * scale * zoomFactor,
                z: z2,
                displacement: point.displacement
            };
        });

        const avgZ = transformedPoints.reduce((sum, p) => sum + p.z, 0) / transformedPoints.length;
        return { points: transformedPoints, index: line.index, avgZ };
    });
}

// ============================================
// Message Handler
// ============================================
self.onmessage = function(e) {
    const { type, config, state, rotation, noiseOffset } = e.data;

    if (type === 'compute') {
        const displacementModes = createDisplacementModes(config);
        const shapeGenerators = createShapeGenerators(config, displacementModes, noiseOffset);

        // Generate shape
        const generator = shapeGenerators[config.shape] || shapeGenerators.sphere;
        const rawLines = generator(
            config.sphereSize,
            config.lineDensity,
            config.lineSegments,
            state.time
        );

        // Transform and project
        const projectedLines = transformAndProject(rawLines, rotation, state);

        // Sort by depth
        projectedLines.sort((a, b) => a.avgZ - b.avgZ);

        // Send back the projected lines
        self.postMessage({
            type: 'result',
            lines: projectedLines,
            radius: config.sphereSize,
            numLines: config.lineDensity
        });
    }
};
