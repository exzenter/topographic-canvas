/**
 * Topographic Canvas Block - Editor Component
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    RangeControl,
    ToggleControl,
    ColorPicker,
    TextControl,
    __experimentalDivider as Divider,
    Button,
    ButtonGroup,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { TopographicCanvas } from './topographic-canvas';
import KeyframeManager, { VIEW_PRESETS } from './keyframe-manager';

export default function Edit({ attributes, setAttributes, clientId }) {
    const containerRef = useRef(null);
    const canvasInstanceRef = useRef(null);
    const [isKeyframeModalOpen, setIsKeyframeModalOpen] = useState(false);

    // Set block ID if not set
    useEffect(() => {
        if (!attributes.blockId) {
            setAttributes({ blockId: `topo-canvas-${clientId.slice(0, 8)}` });
        }
    }, [clientId]);

    // Initialize and update canvas
    useEffect(() => {
        if (containerRef.current) {
            // Destroy existing instance
            if (canvasInstanceRef.current) {
                canvasInstanceRef.current.destroy();
            }

            // Create new instance with current attributes
            canvasInstanceRef.current = new TopographicCanvas(
                containerRef.current,
                { ...attributes }
            );
        }

        return () => {
            if (canvasInstanceRef.current) {
                canvasInstanceRef.current.destroy();
            }
        };
    }, [attributes]);

    // Compute container style based on aspect ratio or fixed height
    const containerStyle = attributes.useAspectRatio
        ? {
            aspectRatio: attributes.aspectRatio,
            backgroundColor: attributes.bgColor,
        }
        : {
            height: `${attributes.canvasHeight}px`,
            backgroundColor: attributes.bgColor,
        };

    const blockProps = useBlockProps({
        className: 'wp-block-topographic-canvas-block',
        style: containerStyle,
    });

    // Shape options
    const shapeOptions = [
        { label: __('Sphere', 'topographic-canvas-block'), value: 'sphere' },
        { label: __('Cube', 'topographic-canvas-block'), value: 'cube' },
        { label: __('Pyramid', 'topographic-canvas-block'), value: 'pyramid' },
        { label: __('Plane', 'topographic-canvas-block'), value: 'plane' },
        { label: __('Torus', 'topographic-canvas-block'), value: 'torus' },
        { label: __('Cylinder', 'topographic-canvas-block'), value: 'cylinder' },
        { label: __('Cone', 'topographic-canvas-block'), value: 'cone' },
    ];

    // Mode options
    const modeOptions = [
        { label: __('Wavy Organic', 'topographic-canvas-block'), value: 'wavy' },
        { label: __('Horizontal Bands', 'topographic-canvas-block'), value: 'bands' },
        { label: __('Cellular', 'topographic-canvas-block'), value: 'cellular' },
        { label: __('Turbulent', 'topographic-canvas-block'), value: 'turbulent' },
        { label: __('Spiral', 'topographic-canvas-block'), value: 'spiral' },
        { label: __('Ripple', 'topographic-canvas-block'), value: 'ripple' },
    ];

    // Aspect ratio options
    const aspectRatioOptions = [
        { label: '16:9', value: '16/9' },
        { label: '4:3', value: '4/3' },
        { label: '1:1', value: '1/1' },
        { label: '21:9', value: '21/9' },
        { label: '3:2', value: '3/2' },
        { label: '2:1', value: '2/1' },
        { label: '9:16', value: '9/16' },
    ];

    // Rotation mode options
    const rotationModeOptions = [
        { label: __('Constant', 'topographic-canvas-block'), value: 'constant' },
        { label: __('Pendulum Swing', 'topographic-canvas-block'), value: 'pendulum' },
        { label: __('Random Drift', 'topographic-canvas-block'), value: 'random' },
        { label: __('Orbital', 'topographic-canvas-block'), value: 'orbital' },
        { label: __('Wobble', 'topographic-canvas-block'), value: 'wobble' },
        { label: __('Chaotic', 'topographic-canvas-block'), value: 'chaos' },
    ];

    // Hover mode options
    const hoverModeOptions = [
        { label: __('Tilt Toward Mouse', 'topographic-canvas-block'), value: 'tilt' },
        { label: __('Repel From Mouse', 'topographic-canvas-block'), value: 'repel' },
        { label: __('Follow Mouse', 'topographic-canvas-block'), value: 'follow' },
        { label: __('Parallax Effect', 'topographic-canvas-block'), value: 'parallax' },
    ];

    // Random mode options
    const randomModeOptions = [
        { label: __('Gentle Drift', 'topographic-canvas-block'), value: 'gentle' },
        { label: __('Jitter', 'topographic-canvas-block'), value: 'jitter' },
        { label: __('Pulse', 'topographic-canvas-block'), value: 'pulse' },
        { label: __('Earthquake', 'topographic-canvas-block'), value: 'earthquake' },
        { label: __('Breathing', 'topographic-canvas-block'), value: 'breathing' },
    ];

    // Easing function options
    const easingOptions = [
        { label: __('Linear', 'topographic-canvas-block'), value: 'linear' },
        { label: __('Ease Out', 'topographic-canvas-block'), value: 'easeOut' },
        { label: __('Ease In-Out', 'topographic-canvas-block'), value: 'easeInOut' },
        { label: __('Elastic', 'topographic-canvas-block'), value: 'elastic' },
        { label: __('Bounce', 'topographic-canvas-block'), value: 'bounce' },
    ];

    // Sticky position options
    const stickyPositionOptions = [
        { label: __('Top', 'topographic-canvas-block'), value: 'top' },
        { label: __('Center', 'topographic-canvas-block'), value: 'center' },
    ];

    return (
        <>
            <InspectorControls>
                { /* Shape & Mode Panel */}
                <PanelBody title={__('Shape & Mode', 'topographic-canvas-block')} initialOpen={true}>
                    <ToggleControl
                        label={__('Use Aspect Ratio', 'topographic-canvas-block')}
                        help={attributes.useAspectRatio
                            ? __('Height is determined by aspect ratio', 'topographic-canvas-block')
                            : __('Using fixed pixel height', 'topographic-canvas-block')
                        }
                        checked={attributes.useAspectRatio}
                        onChange={(value) => setAttributes({ useAspectRatio: value })}
                    />
                    {attributes.useAspectRatio ? (
                        <SelectControl
                            label={__('Aspect Ratio', 'topographic-canvas-block')}
                            value={attributes.aspectRatio}
                            options={aspectRatioOptions}
                            onChange={(value) => setAttributes({ aspectRatio: value })}
                        />
                    ) : (
                        <RangeControl
                            label={__('Canvas Height', 'topographic-canvas-block')}
                            value={attributes.canvasHeight}
                            onChange={(value) => setAttributes({ canvasHeight: value })}
                            min={200}
                            max={1000}
                        />
                    )}
                    <SelectControl
                        label={__('Shape', 'topographic-canvas-block')}
                        value={attributes.shape}
                        options={shapeOptions}
                        onChange={(value) => setAttributes({ shape: value })}
                    />
                    <SelectControl
                        label={__('Mode', 'topographic-canvas-block')}
                        value={attributes.mode}
                        options={modeOptions}
                        onChange={(value) => setAttributes({ mode: value })}
                    />
                </PanelBody>

                { /* Sticky Settings Panel */}
                <PanelBody title={__('Sticky Settings', 'topographic-canvas-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Enable Sticky', 'topographic-canvas-block')}
                        help={attributes.enableSticky
                            ? __('Block will stick when scrolling', 'topographic-canvas-block')
                            : __('Block scrolls normally', 'topographic-canvas-block')
                        }
                        checked={attributes.enableSticky}
                        onChange={(value) => setAttributes({ enableSticky: value })}
                    />
                    {attributes.enableSticky && (
                        <>
                            <SelectControl
                                label={__('Sticky Position', 'topographic-canvas-block')}
                                value={attributes.stickyPosition}
                                options={stickyPositionOptions}
                                onChange={(value) => setAttributes({ stickyPosition: value })}
                            />
                            {attributes.stickyPosition === 'top' && (
                                <TextControl
                                    label={__('Top Offset (rem)', 'topographic-canvas-block')}
                                    help={__('Distance from viewport top (e.g. 2 or 2rem)', 'topographic-canvas-block')}
                                    value={attributes.stickyTopOffset}
                                    onChange={(value) => setAttributes({ stickyTopOffset: value })}
                                />
                            )}
                            {attributes.stickyPosition === 'center' && (
                                <TextControl
                                    label={__('Center Offset (rem)', 'topographic-canvas-block')}
                                    help={__('Offset from viewport center (negative = higher, e.g. -2rem)', 'topographic-canvas-block')}
                                    value={attributes.stickyCenterOffset}
                                    onChange={(value) => setAttributes({ stickyCenterOffset: value })}
                                />
                            )}
                            <TextControl
                                label={__('Bottom Offset (rem)', 'topographic-canvas-block')}
                                help={__('Space from container bottom when sticky stops (e.g. 2rem)', 'topographic-canvas-block')}
                                value={attributes.stickyBottomOffset}
                                onChange={(value) => setAttributes({ stickyBottomOffset: value })}
                            />
                            <ToggleControl
                                label={__('Disable on Mobile', 'topographic-canvas-block')}
                                checked={attributes.disableStickyOnMobile}
                                onChange={(value) => setAttributes({ disableStickyOnMobile: value })}
                            />
                        </>
                    )}
                </PanelBody>

                { /* Keyframe Settings Panel */}
                <PanelBody title={__('Keyframe Animation', 'topographic-canvas-block')} initialOpen={false}>
                    <p>{__('Configure scroll-based animations and triggers.', 'topographic-canvas-block')}</p>
                    <Button
                        variant="secondary"
                        onClick={() => setIsKeyframeModalOpen(true)}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {__('Manage Keyframes', 'topographic-canvas-block')}
                    </Button>
                    <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                        {attributes.keyframes.length} {__('keyframes defined', 'topographic-canvas-block')}
                    </p>
                </PanelBody>

                <KeyframeManager
                    isOpen={isKeyframeModalOpen}
                    onClose={() => setIsKeyframeModalOpen(false)}
                    keyframes={attributes.keyframes || []}
                    setAttributes={setAttributes}
                />

                { /* Visual Settings Panel */}
                <PanelBody title={__('Visual Settings', 'topographic-canvas-block')} initialOpen={false}>
                    <SelectControl
                        label={__('Color Mode', 'topographic-canvas-block')}
                        value={attributes.colorMode}
                        options={[
                            { label: __('Mono', 'topographic-canvas-block'), value: 'mono' },
                            { label: __('Color', 'topographic-canvas-block'), value: 'color' },
                        ]}
                        onChange={(value) => setAttributes({ colorMode: value })}
                    />

                    {attributes.colorMode === 'mono' && (
                        <>
                            <p>{__('Line Color', 'topographic-canvas-block')}</p>
                            <ColorPicker
                                color={attributes.lineColor}
                                onChange={(value) => setAttributes({ lineColor: value })}
                                enableAlpha={false}
                            />
                        </>
                    )}

                    {attributes.colorMode === 'color' && (
                        <>
                            <RangeControl
                                label={__('Hue Start', 'topographic-canvas-block')}
                                value={attributes.hueStart}
                                onChange={(value) => setAttributes({ hueStart: value })}
                                min={0}
                                max={360}
                            />
                            <RangeControl
                                label={__('Hue End', 'topographic-canvas-block')}
                                value={attributes.hueEnd}
                                onChange={(value) => setAttributes({ hueEnd: value })}
                                min={0}
                                max={360}
                            />
                        </>
                    )}

                    <Divider />

                    <RangeControl
                        label={__('Line Density', 'topographic-canvas-block')}
                        value={attributes.lineDensity}
                        onChange={(value) => setAttributes({ lineDensity: value })}
                        min={20}
                        max={120}
                    />
                    <RangeControl
                        label={__('Line Segments', 'topographic-canvas-block')}
                        value={attributes.lineSegments}
                        onChange={(value) => setAttributes({ lineSegments: value })}
                        min={60}
                        max={300}
                    />
                    <RangeControl
                        label={__('Sphere Size', 'topographic-canvas-block')}
                        value={attributes.sphereSize}
                        onChange={(value) => setAttributes({ sphereSize: value })}
                        min={100}
                        max={500}
                    />
                    <RangeControl
                        label={__('Line Width', 'topographic-canvas-block')}
                        value={attributes.lineWidth}
                        onChange={(value) => setAttributes({ lineWidth: value })}
                        min={0.2}
                        max={3}
                        step={0.1}
                    />
                    <RangeControl
                        label={__('Line Opacity', 'topographic-canvas-block')}
                        value={attributes.lineOpacity}
                        onChange={(value) => setAttributes({ lineOpacity: value })}
                        min={0.1}
                        max={1}
                        step={0.05}
                    />
                    <ToggleControl
                        label={__('Depth Fade', 'topographic-canvas-block')}
                        checked={attributes.depthFade}
                        onChange={(value) => setAttributes({ depthFade: value })}
                    />
                    <ToggleControl
                        label={__('Glow Effect', 'topographic-canvas-block')}
                        checked={attributes.glowEffect}
                        onChange={(value) => setAttributes({ glowEffect: value })}
                    />

                    <Divider />

                    <p>{__('Background Color', 'topographic-canvas-block')}</p>
                    <ColorPicker
                        color={attributes.bgColor}
                        onChange={(value) => setAttributes({ bgColor: value })}
                        enableAlpha={false}
                    />
                </PanelBody>

                { /* Noise Settings Panel */}
                <PanelBody title={__('Noise & Animation', 'topographic-canvas-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Noise Scale', 'topographic-canvas-block')}
                        value={attributes.noiseScale}
                        onChange={(value) => setAttributes({ noiseScale: value })}
                        min={0.5}
                        max={5}
                        step={0.1}
                    />
                    <RangeControl
                        label={__('Noise Amplitude', 'topographic-canvas-block')}
                        value={attributes.noiseAmplitude}
                        onChange={(value) => setAttributes({ noiseAmplitude: value })}
                        min={0}
                        max={100}
                    />
                    <RangeControl
                        label={__('Animation Speed', 'topographic-canvas-block')}
                        value={attributes.animationSpeed}
                        onChange={(value) => setAttributes({ animationSpeed: value })}
                        min={0}
                        max={200}
                    />
                </PanelBody>

                { /* Wavy Mode Settings */}
                {attributes.mode === 'wavy' && (
                    <PanelBody title={__('Wavy Mode Settings', 'topographic-canvas-block')} initialOpen={false}>
                        <RangeControl
                            label={__('Octave 2 Strength', 'topographic-canvas-block')}
                            value={attributes.wavyOctave2Strength}
                            onChange={(value) => setAttributes({ wavyOctave2Strength: value })}
                            min={0}
                            max={1}
                            step={0.05}
                        />
                        <RangeControl
                            label={__('Octave 3 Strength', 'topographic-canvas-block')}
                            value={attributes.wavyOctave3Strength}
                            onChange={(value) => setAttributes({ wavyOctave3Strength: value })}
                            min={0}
                            max={1}
                            step={0.05}
                        />
                        <RangeControl
                            label={__('Octave 2 Frequency', 'topographic-canvas-block')}
                            value={attributes.wavyOctave2Freq}
                            onChange={(value) => setAttributes({ wavyOctave2Freq: value })}
                            min={1}
                            max={5}
                            step={0.1}
                        />
                        <RangeControl
                            label={__('Octave 3 Frequency', 'topographic-canvas-block')}
                            value={attributes.wavyOctave3Freq}
                            onChange={(value) => setAttributes({ wavyOctave3Freq: value })}
                            min={1}
                            max={8}
                            step={0.1}
                        />
                        <RangeControl
                            label={__('Octave 2 Time Scale', 'topographic-canvas-block')}
                            value={attributes.wavyTime2}
                            onChange={(value) => setAttributes({ wavyTime2: value })}
                            min={0.5}
                            max={3}
                            step={0.1}
                        />
                        <RangeControl
                            label={__('Octave 3 Time Scale', 'topographic-canvas-block')}
                            value={attributes.wavyTime3}
                            onChange={(value) => setAttributes({ wavyTime3: value })}
                            min={0.5}
                            max={4}
                            step={0.1}
                        />
                    </PanelBody>
                )}

                { /* Bands Mode Settings */}
                {attributes.mode === 'bands' && (
                    <PanelBody title={__('Bands Mode Settings', 'topographic-canvas-block')} initialOpen={false}>
                        <RangeControl
                            label={__('Band Density', 'topographic-canvas-block')}
                            value={attributes.bandsDensity}
                            onChange={(value) => setAttributes({ bandsDensity: value })}
                            min={2}
                            max={20}
                        />
                        <RangeControl
                            label={__('Noise Influence', 'topographic-canvas-block')}
                            value={attributes.bandsNoiseInfluence}
                            onChange={(value) => setAttributes({ bandsNoiseInfluence: value })}
                            min={0}
                            max={1}
                            step={0.05}
                        />
                        <RangeControl
                            label={__('Band Time Scale', 'topographic-canvas-block')}
                            value={attributes.bandsTimeScale}
                            onChange={(value) => setAttributes({ bandsTimeScale: value })}
                            min={0.5}
                            max={5}
                            step={0.1}
                        />
                        <RangeControl
                            label={__('Angular Scale', 'topographic-canvas-block')}
                            value={attributes.bandsAngleScale}
                            onChange={(value) => setAttributes({ bandsAngleScale: value })}
                            min={0.1}
                            max={2}
                            step={0.1}
                        />
                        <RangeControl
                            label={__('Vertical Scale', 'topographic-canvas-block')}
                            value={attributes.bandsYScale}
                            onChange={(value) => setAttributes({ bandsYScale: value })}
                            min={0.5}
                            max={5}
                            step={0.1}
                        />
                        <RangeControl
                            label={__('Band Strength', 'topographic-canvas-block')}
                            value={attributes.bandsStrength}
                            onChange={(value) => setAttributes({ bandsStrength: value })}
                            min={0}
                            max={1}
                            step={0.05}
                        />
                    </PanelBody>
                )}

                { /* Cellular Mode Settings */}
                {attributes.mode === 'cellular' && (
                    <PanelBody title={__('Cellular Mode Settings', 'topographic-canvas-block')} initialOpen={false}>
                        <RangeControl
                            label={__('Layer 1 Frequency', 'topographic-canvas-block')}
                            value={attributes.cellularFreq1}
                            onChange={(value) => setAttributes({ cellularFreq1: value })}
                            min={1}
                            max={8}
                            step={0.5}
                        />
                        <RangeControl
                            label={__('Layer 2 Frequency', 'topographic-canvas-block')}
                            value={attributes.cellularFreq2}
                            onChange={(value) => setAttributes({ cellularFreq2: value })}
                            min={2}
                            max={12}
                            step={0.5}
                        />
                        <RangeControl
                            label={__('Layer 2 Time Scale', 'topographic-canvas-block')}
                            value={attributes.cellularTime2}
                            onChange={(value) => setAttributes({ cellularTime2: value })}
                            min={0.1}
                            max={2}
                            step={0.1}
                        />
                        <RangeControl
                            label={__('Amplitude Boost', 'topographic-canvas-block')}
                            value={attributes.cellularAmpBoost}
                            onChange={(value) => setAttributes({ cellularAmpBoost: value })}
                            min={0.5}
                            max={3}
                            step={0.1}
                        />
                        <RangeControl
                            label={__('Cell Sharpness', 'topographic-canvas-block')}
                            value={attributes.cellularSharpness}
                            onChange={(value) => setAttributes({ cellularSharpness: value })}
                            min={1}
                            max={4}
                            step={0.1}
                        />
                    </PanelBody>
                )}

                { /* Turbulent Mode Settings */}
                {attributes.mode === 'turbulent' && (
                    <PanelBody title={__('Turbulent Mode Settings', 'topographic-canvas-block')} initialOpen={false}>
                        <RangeControl
                            label={__('Octaves', 'topographic-canvas-block')}
                            value={attributes.turbulentOctaves}
                            onChange={(value) => setAttributes({ turbulentOctaves: value })}
                            min={1}
                            max={8}
                        />
                        <RangeControl
                            label={__('Lacunarity', 'topographic-canvas-block')}
                            value={attributes.turbulentLacunarity}
                            onChange={(value) => setAttributes({ turbulentLacunarity: value })}
                            min={1.5}
                            max={3}
                            step={0.1}
                        />
                        <RangeControl
                            label={__('Persistence', 'topographic-canvas-block')}
                            value={attributes.turbulentPersistence}
                            onChange={(value) => setAttributes({ turbulentPersistence: value })}
                            min={0.2}
                            max={0.8}
                            step={0.05}
                        />
                        <RangeControl
                            label={__('Time Multiplier', 'topographic-canvas-block')}
                            value={attributes.turbulentTimeMult}
                            onChange={(value) => setAttributes({ turbulentTimeMult: value })}
                            min={0.1}
                            max={1}
                            step={0.05}
                        />
                        <RangeControl
                            label={__('Time Offset', 'topographic-canvas-block')}
                            value={attributes.turbulentTimeOffset}
                            onChange={(value) => setAttributes({ turbulentTimeOffset: value })}
                            min={0}
                            max={2}
                            step={0.1}
                        />
                    </PanelBody>
                )}

                { /* Spiral Mode Settings */}
                {attributes.mode === 'spiral' && (
                    <PanelBody title={__('Spiral Mode Settings', 'topographic-canvas-block')} initialOpen={false}>
                        <RangeControl
                            label={__('Spiral Arms', 'topographic-canvas-block')}
                            value={attributes.spiralArms}
                            onChange={(value) => setAttributes({ spiralArms: value })}
                            min={1}
                            max={8}
                        />
                        <RangeControl
                            label={__('Spiral Twist', 'topographic-canvas-block')}
                            value={attributes.spiralTwist}
                            onChange={(value) => setAttributes({ spiralTwist: value })}
                            min={1}
                            max={15}
                            step={0.5}
                        />
                        <RangeControl
                            label={__('Spiral Time Scale', 'topographic-canvas-block')}
                            value={attributes.spiralTimeScale}
                            onChange={(value) => setAttributes({ spiralTimeScale: value })}
                            min={0.5}
                            max={5}
                            step={0.1}
                        />
                        <RangeControl
                            label={__('Noise Blend', 'topographic-canvas-block')}
                            value={attributes.spiralNoiseBlend}
                            onChange={(value) => setAttributes({ spiralNoiseBlend: value })}
                            min={0}
                            max={1}
                            step={0.05}
                        />
                        <RangeControl
                            label={__('Spiral Strength', 'topographic-canvas-block')}
                            value={attributes.spiralStrength}
                            onChange={(value) => setAttributes({ spiralStrength: value })}
                            min={0.1}
                            max={1}
                            step={0.05}
                        />
                    </PanelBody>
                )}

                { /* Ripple Mode Settings */}
                {attributes.mode === 'ripple' && (
                    <PanelBody title={__('Ripple Mode Settings', 'topographic-canvas-block')} initialOpen={false}>
                        <RangeControl
                            label={__('Ring Frequency', 'topographic-canvas-block')}
                            value={attributes.rippleFrequency}
                            onChange={(value) => setAttributes({ rippleFrequency: value })}
                            min={2}
                            max={20}
                        />
                        <RangeControl
                            label={__('Ripple Speed', 'topographic-canvas-block')}
                            value={attributes.rippleSpeed}
                            onChange={(value) => setAttributes({ rippleSpeed: value })}
                            min={0.5}
                            max={8}
                            step={0.5}
                        />
                        <RangeControl
                            label={__('Ripple Strength', 'topographic-canvas-block')}
                            value={attributes.rippleStrength}
                            onChange={(value) => setAttributes({ rippleStrength: value })}
                            min={0.1}
                            max={1}
                            step={0.05}
                        />
                        <RangeControl
                            label={__('Noise Blend', 'topographic-canvas-block')}
                            value={attributes.rippleNoiseBlend}
                            onChange={(value) => setAttributes({ rippleNoiseBlend: value })}
                            min={0}
                            max={1}
                            step={0.05}
                        />
                        <RangeControl
                            label={__('Noise Time Scale', 'topographic-canvas-block')}
                            value={attributes.rippleNoiseTime}
                            onChange={(value) => setAttributes({ rippleNoiseTime: value })}
                            min={0.1}
                            max={2}
                            step={0.1}
                        />
                    </PanelBody>
                )}

                { /* Rotation Settings Panel */}
                <PanelBody title={__('Auto Rotation', 'topographic-canvas-block')} initialOpen={false}>
                    <p style={{ marginBottom: '8px', fontWeight: '500' }}>{__('View Presets', 'topographic-canvas-block')}</p>
                    <ButtonGroup style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '20px' }}>
                        {Object.entries(VIEW_PRESETS).map(([key, preset]) => (
                            <Button
                                key={key}
                                variant={attributes.viewPreset === key ? 'primary' : 'secondary'}
                                onClick={() => setAttributes({
                                    viewPreset: key,
                                    baseRotationX: preset.baseRotationX,
                                    baseRotationY: preset.baseRotationY,
                                    baseRotationZ: preset.baseRotationZ,
                                })}
                                isSmall
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </ButtonGroup>
                    <Divider />
                    <ToggleControl
                        label={__('Enable Auto Rotation', 'topographic-canvas-block')}
                        checked={attributes.autoRotate}
                        onChange={(value) => setAttributes({ autoRotate: value })}
                    />
                    {attributes.autoRotate && (
                        <>
                            <RangeControl
                                label={__('Rotation Speed', 'topographic-canvas-block')}
                                value={attributes.rotationSpeed}
                                onChange={(value) => setAttributes({ rotationSpeed: value })}
                                min={0}
                                max={100}
                            />
                            <RangeControl
                                label={__('X-Axis Direction (°)', 'topographic-canvas-block')}
                                value={attributes.rotationDirX}
                                onChange={(value) => setAttributes({ rotationDirX: value })}
                                min={-180}
                                max={180}
                            />
                            <RangeControl
                                label={__('Y-Axis Direction (°)', 'topographic-canvas-block')}
                                value={attributes.rotationDirY}
                                onChange={(value) => setAttributes({ rotationDirY: value })}
                                min={-180}
                                max={180}
                            />
                            <RangeControl
                                label={__('Z-Axis Direction (°)', 'topographic-canvas-block')}
                                value={attributes.rotationDirZ}
                                onChange={(value) => setAttributes({ rotationDirZ: value })}
                                min={-180}
                                max={180}
                            />
                            <SelectControl
                                label={__('Rotation Mode', 'topographic-canvas-block')}
                                value={attributes.rotationMode}
                                options={rotationModeOptions}
                                onChange={(value) => setAttributes({ rotationMode: value })}
                            />
                            {attributes.rotationMode === 'pendulum' && (
                                <RangeControl
                                    label={__('Pendulum Amplitude (°)', 'topographic-canvas-block')}
                                    value={attributes.pendulumAmplitude}
                                    onChange={(value) => setAttributes({ pendulumAmplitude: value })}
                                    min={10}
                                    max={180}
                                />
                            )}
                        </>
                    )}
                </PanelBody>

                { /* Drag Settings Panel */}
                <PanelBody title={__('Mouse Drag', 'topographic-canvas-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Enable Click & Drag', 'topographic-canvas-block')}
                        checked={attributes.dragEnabled}
                        onChange={(value) => setAttributes({ dragEnabled: value })}
                    />
                    {attributes.dragEnabled && (
                        <>
                            <RangeControl
                                label={__('Drag Sensitivity', 'topographic-canvas-block')}
                                value={attributes.dragSensitivity}
                                onChange={(value) => setAttributes({ dragSensitivity: value })}
                                min={0.1}
                                max={3}
                                step={0.1}
                            />
                            <ToggleControl
                                label={__('Momentum / Inertia', 'topographic-canvas-block')}
                                checked={attributes.dragInertia}
                                onChange={(value) => setAttributes({ dragInertia: value })}
                            />
                            {attributes.dragInertia && (
                                <RangeControl
                                    label={__('Inertia Decay', 'topographic-canvas-block')}
                                    value={attributes.inertiaDecay}
                                    onChange={(value) => setAttributes({ inertiaDecay: value })}
                                    min={0.9}
                                    max={0.99}
                                    step={0.01}
                                />
                            )}
                            <ToggleControl
                                label={__('Auto Bounce Back', 'topographic-canvas-block')}
                                checked={attributes.autoBounceBack}
                                onChange={(value) => setAttributes({ autoBounceBack: value })}
                            />
                            {attributes.autoBounceBack && (
                                <RangeControl
                                    label={__('Bounce Back Speed', 'topographic-canvas-block')}
                                    value={attributes.bounceBackSpeed}
                                    onChange={(value) => setAttributes({ bounceBackSpeed: value })}
                                    min={0.01}
                                    max={0.2}
                                    step={0.01}
                                />
                            )}
                            <ToggleControl
                                label={__('Clamp X Rotation', 'topographic-canvas-block')}
                                checked={attributes.clampRotation}
                                onChange={(value) => setAttributes({ clampRotation: value })}
                            />
                            {attributes.clampRotation && (
                                <RangeControl
                                    label={__('Max X Rotation (°)', 'topographic-canvas-block')}
                                    value={attributes.maxXRotation}
                                    onChange={(value) => setAttributes({ maxXRotation: value })}
                                    min={15}
                                    max={180}
                                />
                            )}
                        </>
                    )}
                </PanelBody>

                { /* Hover Settings Panel */}
                <PanelBody title={__('Hover Interaction', 'topographic-canvas-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Enable Hover Interaction', 'topographic-canvas-block')}
                        checked={attributes.hoverEnabled}
                        onChange={(value) => setAttributes({ hoverEnabled: value })}
                    />
                    {attributes.hoverEnabled && (
                        <>
                            <SelectControl
                                label={__('Hover Mode', 'topographic-canvas-block')}
                                value={attributes.hoverMode}
                                options={hoverModeOptions}
                                onChange={(value) => setAttributes({ hoverMode: value })}
                            />
                            <RangeControl
                                label={__('Hover Strength', 'topographic-canvas-block')}
                                value={attributes.hoverStrength}
                                onChange={(value) => setAttributes({ hoverStrength: value })}
                                min={0.1}
                                max={3}
                                step={0.1}
                            />
                            <RangeControl
                                label={__('Hover Smoothing', 'topographic-canvas-block')}
                                value={attributes.hoverSmoothing}
                                onChange={(value) => setAttributes({ hoverSmoothing: value })}
                                min={0.01}
                                max={0.3}
                                step={0.01}
                            />
                            <ToggleControl
                                label={__('Hover Affects Noise', 'topographic-canvas-block')}
                                checked={attributes.hoverAffectsNoise}
                                onChange={(value) => setAttributes({ hoverAffectsNoise: value })}
                            />
                            {attributes.hoverAffectsNoise && (
                                <RangeControl
                                    label={__('Noise Influence', 'topographic-canvas-block')}
                                    value={attributes.hoverNoiseInfluence}
                                    onChange={(value) => setAttributes({ hoverNoiseInfluence: value })}
                                    min={0}
                                    max={50}
                                />
                            )}
                        </>
                    )}
                </PanelBody>

                { /* Random Motion Panel */}
                <PanelBody title={__('Random Motion', 'topographic-canvas-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Enable Random Motion', 'topographic-canvas-block')}
                        checked={attributes.randomMotion}
                        onChange={(value) => setAttributes({ randomMotion: value })}
                    />
                    {attributes.randomMotion && (
                        <>
                            <SelectControl
                                label={__('Random Mode', 'topographic-canvas-block')}
                                value={attributes.randomMode}
                                options={randomModeOptions}
                                onChange={(value) => setAttributes({ randomMode: value })}
                            />
                            <RangeControl
                                label={__('Random Intensity', 'topographic-canvas-block')}
                                value={attributes.randomIntensity}
                                onChange={(value) => setAttributes({ randomIntensity: value })}
                                min={0.1}
                                max={5}
                                step={0.1}
                            />
                            <RangeControl
                                label={__('Random Speed', 'topographic-canvas-block')}
                                value={attributes.randomSpeed}
                                onChange={(value) => setAttributes({ randomSpeed: value })}
                                min={0.1}
                                max={5}
                                step={0.1}
                            />
                        </>
                    )}
                </PanelBody>

                { /* Advanced Settings Panel */}
                <PanelBody title={__('Advanced', 'topographic-canvas-block')} initialOpen={false}>
                    <SelectControl
                        label={__('Easing Function', 'topographic-canvas-block')}
                        value={attributes.easingFunction}
                        options={easingOptions}
                        onChange={(value) => setAttributes({ easingFunction: value })}
                    />
                    <RangeControl
                        label={__('Smoothing Factor', 'topographic-canvas-block')}
                        value={attributes.smoothingFactor}
                        onChange={(value) => setAttributes({ smoothingFactor: value })}
                        min={0.01}
                        max={0.3}
                        step={0.01}
                    />
                    <ToggleControl
                        label={__('Mouse Wheel Zoom', 'topographic-canvas-block')}
                        checked={attributes.mouseWheelZoom}
                        onChange={(value) => setAttributes({ mouseWheelZoom: value })}
                    />
                    {attributes.mouseWheelZoom && (
                        <RangeControl
                            label={__('Zoom Sensitivity', 'topographic-canvas-block')}
                            value={attributes.zoomSensitivity}
                            onChange={(value) => setAttributes({ zoomSensitivity: value })}
                            min={0.1}
                            max={3}
                            step={0.1}
                        />
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div
                    ref={containerRef}
                    className="topographic-canvas-container"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </>
    );
}
