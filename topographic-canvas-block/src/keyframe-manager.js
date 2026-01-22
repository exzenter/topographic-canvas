/**
 * Keyframe Manager Component - Redesigned with grouped settings
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
    Modal,
    Button,
    SelectControl,
    TextControl,
    RangeControl,
    ColorPicker,
    ToggleControl,
    PanelBody,
    __experimentalDivider as Divider,
    Flex,
    FlexItem,
    Card,
    CardHeader,
    CardBody,
} from '@wordpress/components';

// Inline simple icons to avoid dependency issues
const icons = {
    plus: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z"></path></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M12 4h3c.55 0 1 .45 1 1v1H8V5c0-.55.45-1 1-1h3V2c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v2zM6 7h12v12c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1V7zm2.5 10h2V9h-2v8zm5 0h2V9h-2v8z"></path></svg>,
    dragHandle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z"></path></svg>
};

const TRIGGER_TYPES = [
    { label: 'Scroll Pixels (px)', value: 'px' },
    { label: 'Scroll Percentage (%)', value: '%' },
    { label: 'Rem Units (rem)', value: 'rem' },
    { label: 'Element Center', value: 'element-center' }
];


const TRANSITION_TYPES = [
    { label: 'Instant', value: 'instant' },
    { label: 'Duration (ms)', value: 'duration' },
    { label: 'Linear Interpolation (Scroll)', value: 'linear' },
];

// Organized settings by category matching block.json structure
const SETTINGS_GROUPS = {
    'Visual Settings': [
        {
            label: 'Color Mode', key: 'colorMode', type: 'select', options: [
                { label: 'Mono', value: 'mono' },
                { label: 'Color', value: 'color' }
            ]
        },
        { label: 'Line Color', key: 'lineColor', type: 'color' },
        { label: 'Hue Start', key: 'hueStart', type: 'range', min: 0, max: 360, step: 1 },
        { label: 'Hue End', key: 'hueEnd', type: 'range', min: 0, max: 360, step: 1 },
        { label: 'Line Density', key: 'lineDensity', type: 'range', min: 20, max: 120, step: 1 },
        { label: 'Line Segments', key: 'lineSegments', type: 'range', min: 60, max: 300, step: 1 },
        { label: 'Sphere Size', key: 'sphereSize', type: 'range', min: 100, max: 500, step: 1 },
        { label: 'Line Width', key: 'lineWidth', type: 'range', min: 0.2, max: 3, step: 0.1 },
        { label: 'Line Opacity', key: 'lineOpacity', type: 'range', min: 0.1, max: 1, step: 0.05 },
        { label: 'Depth Fade', key: 'depthFade', type: 'toggle' },
        { label: 'Glow Effect', key: 'glowEffect', type: 'toggle' },
        { label: 'Background Color', key: 'bgColor', type: 'color' },
    ],
    'Noise & Animation': [
        { label: 'Noise Scale', key: 'noiseScale', type: 'range', min: 0.5, max: 5, step: 0.1 },
        { label: 'Noise Amplitude', key: 'noiseAmplitude', type: 'range', min: 0, max: 100, step: 1 },
        { label: 'Animation Speed', key: 'animationSpeed', type: 'range', min: 0, max: 200, step: 1 },
    ],
    'Wavy Mode': [
        { label: 'Wavy Octave 2 Strength', key: 'wavyOctave2Strength', type: 'range', min: 0, max: 1, step: 0.05 },
        { label: 'Wavy Octave 3 Strength', key: 'wavyOctave3Strength', type: 'range', min: 0, max: 1, step: 0.05 },
        { label: 'Wavy Octave 2 Freq', key: 'wavyOctave2Freq', type: 'range', min: 1, max: 5, step: 0.1 },
        { label: 'Wavy Octave 3 Freq', key: 'wavyOctave3Freq', type: 'range', min: 1, max: 8, step: 0.1 },
        { label: 'Wavy Time 2', key: 'wavyTime2', type: 'range', min: 0.5, max: 3, step: 0.1 },
        { label: 'Wavy Time 3', key: 'wavyTime3', type: 'range', min: 0.5, max: 4, step: 0.1 },
    ],
    'Bands Mode': [
        { label: 'Bands Density', key: 'bandsDensity', type: 'range', min: 2, max: 20, step: 1 },
        { label: 'Bands Noise Influence', key: 'bandsNoiseInfluence', type: 'range', min: 0, max: 1, step: 0.05 },
        { label: 'Bands Time Scale', key: 'bandsTimeScale', type: 'range', min: 0.5, max: 5, step: 0.1 },
        { label: 'Bands Angle Scale', key: 'bandsAngleScale', type: 'range', min: 0.1, max: 2, step: 0.1 },
        { label: 'Bands Y Scale', key: 'bandsYScale', type: 'range', min: 0.5, max: 5, step: 0.1 },
        { label: 'Bands Strength', key: 'bandsStrength', type: 'range', min: 0, max: 1, step: 0.05 },
    ],
    'Cellular Mode': [
        { label: 'Cellular Freq 1', key: 'cellularFreq1', type: 'range', min: 1, max: 8, step: 0.5 },
        { label: 'Cellular Freq 2', key: 'cellularFreq2', type: 'range', min: 2, max: 12, step: 0.5 },
        { label: 'Cellular Time 2', key: 'cellularTime2', type: 'range', min: 0.1, max: 2, step: 0.1 },
        { label: 'Cellular Amp Boost', key: 'cellularAmpBoost', type: 'range', min: 0.5, max: 3, step: 0.1 },
        { label: 'Cellular Sharpness', key: 'cellularSharpness', type: 'range', min: 1, max: 4, step: 0.1 },
    ],
    'Turbulent Mode': [
        { label: 'Turbulent Octaves', key: 'turbulentOctaves', type: 'range', min: 1, max: 8, step: 1 },
        { label: 'Turbulent Lacunarity', key: 'turbulentLacunarity', type: 'range', min: 1.5, max: 3, step: 0.1 },
        { label: 'Turbulent Persistence', key: 'turbulentPersistence', type: 'range', min: 0.2, max: 0.8, step: 0.05 },
        { label: 'Turbulent Time Mult', key: 'turbulentTimeMult', type: 'range', min: 0.1, max: 1, step: 0.05 },
        { label: 'Turbulent Time Offset', key: 'turbulentTimeOffset', type: 'range', min: 0, max: 2, step: 0.1 },
    ],
    'Spiral Mode': [
        { label: 'Spiral Arms', key: 'spiralArms', type: 'range', min: 1, max: 8, step: 1 },
        { label: 'Spiral Twist', key: 'spiralTwist', type: 'range', min: 1, max: 15, step: 0.5 },
        { label: 'Spiral Time Scale', key: 'spiralTimeScale', type: 'range', min: 0.5, max: 5, step: 0.1 },
        { label: 'Spiral Noise Blend', key: 'spiralNoiseBlend', type: 'range', min: 0, max: 1, step: 0.05 },
        { label: 'Spiral Strength', key: 'spiralStrength', type: 'range', min: 0.1, max: 1, step: 0.05 },
    ],
    'Ripple Mode': [
        { label: 'Ripple Frequency', key: 'rippleFrequency', type: 'range', min: 2, max: 20, step: 1 },
        { label: 'Ripple Speed', key: 'rippleSpeed', type: 'range', min: 0.5, max: 8, step: 0.5 },
        { label: 'Ripple Strength', key: 'rippleStrength', type: 'range', min: 0.1, max: 1, step: 0.05 },
        { label: 'Ripple Noise Blend', key: 'rippleNoiseBlend', type: 'range', min: 0, max: 1, step: 0.05 },
        { label: 'Ripple Noise Time', key: 'rippleNoiseTime', type: 'range', min: 0.1, max: 2, step: 0.1 },
    ],
    'Auto Rotation': [
        { label: 'Auto Rotate', key: 'autoRotate', type: 'toggle' },
        { label: 'Rotation Speed', key: 'rotationSpeed', type: 'range', min: 0, max: 100, step: 1 },
        { label: 'Rotation Dir X', key: 'rotationDirX', type: 'range', min: -180, max: 180, step: 1 },
        { label: 'Rotation Dir Y', key: 'rotationDirY', type: 'range', min: -180, max: 180, step: 1 },
        { label: 'Rotation Dir Z', key: 'rotationDirZ', type: 'range', min: -180, max: 180, step: 1 },
        {
            label: 'Rotation Mode', key: 'rotationMode', type: 'select', options: [
                { label: 'Constant', value: 'constant' },
                { label: 'Pendulum', value: 'pendulum' },
                { label: 'Random', value: 'random' },
                { label: 'Orbital', value: 'orbital' },
                { label: 'Wobble', value: 'wobble' },
                { label: 'Chaos', value: 'chaos' }
            ]
        },
        { label: 'Pendulum Amplitude', key: 'pendulumAmplitude', type: 'range', min: 10, max: 180, step: 1 },
    ],
    'Mouse Drag': [
        { label: 'Drag Enabled', key: 'dragEnabled', type: 'toggle' },
        { label: 'Drag Sensitivity', key: 'dragSensitivity', type: 'range', min: 0.1, max: 3, step: 0.1 },
        { label: 'Drag Inertia', key: 'dragInertia', type: 'toggle' },
        { label: 'Inertia Decay', key: 'inertiaDecay', type: 'range', min: 0.9, max: 0.99, step: 0.01 },
        { label: 'Auto Bounce Back', key: 'autoBounceBack', type: 'toggle' },
        { label: 'Bounce Back Speed', key: 'bounceBackSpeed', type: 'range', min: 0.01, max: 0.2, step: 0.01 },
        { label: 'Clamp Rotation', key: 'clampRotation', type: 'toggle' },
        { label: 'Max X Rotation', key: 'maxXRotation', type: 'range', min: 15, max: 180, step: 1 },
    ],
    'Hover Interaction': [
        { label: 'Hover Enabled', key: 'hoverEnabled', type: 'toggle' },
        {
            label: 'Hover Mode', key: 'hoverMode', type: 'select', options: [
                { label: 'Tilt', value: 'tilt' },
                { label: 'Repel', value: 'repel' },
                { label: 'Follow', value: 'follow' },
                { label: 'Parallax', value: 'parallax' }
            ]
        },
        { label: 'Hover Strength', key: 'hoverStrength', type: 'range', min: 0.1, max: 3, step: 0.1 },
        { label: 'Hover Smoothing', key: 'hoverSmoothing', type: 'range', min: 0.01, max: 0.3, step: 0.01 },
        { label: 'Hover Affects Noise', key: 'hoverAffectsNoise', type: 'toggle' },
        { label: 'Hover Noise Influence', key: 'hoverNoiseInfluence', type: 'range', min: 0, max: 50, step: 1 },
    ],
    'Random Motion': [
        { label: 'Random Motion', key: 'randomMotion', type: 'toggle' },
        {
            label: 'Random Mode', key: 'randomMode', type: 'select', options: [
                { label: 'Gentle', value: 'gentle' },
                { label: 'Jitter', value: 'jitter' },
                { label: 'Pulse', value: 'pulse' },
                { label: 'Earthquake', value: 'earthquake' },
                { label: 'Breathing', value: 'breathing' }
            ]
        },
        { label: 'Random Intensity', key: 'randomIntensity', type: 'range', min: 0.1, max: 5, step: 0.1 },
        { label: 'Random Speed', key: 'randomSpeed', type: 'range', min: 0.1, max: 5, step: 0.1 },
    ],
    'Advanced Settings': [
        {
            label: 'Easing Function', key: 'easingFunction', type: 'select', options: [
                { label: 'Linear', value: 'linear' },
                { label: 'Ease Out', value: 'easeOut' },
                { label: 'Ease In-Out', value: 'easeInOut' },
                { label: 'Elastic', value: 'elastic' },
                { label: 'Bounce', value: 'bounce' }
            ]
        },
        { label: 'Smoothing Factor', key: 'smoothingFactor', type: 'range', min: 0.01, max: 0.3, step: 0.01 },
        { label: 'Mouse Wheel Zoom', key: 'mouseWheelZoom', type: 'toggle' },
        { label: 'Zoom Sensitivity', key: 'zoomSensitivity', type: 'range', min: 0.1, max: 3, step: 0.1 },
    ],
};

// Flatten all settings for easy lookup
const ALL_SETTINGS = Object.values(SETTINGS_GROUPS).flat();

export default function KeyframeManager({ keyframes, setAttributes, isOpen, onClose }) {
    const [expandedIndices, setExpandedIndices] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Ensure all keyframes have IDs (migration for existing data)
    if (keyframes.some(k => !k.id)) {
        const newKFs = keyframes.map(k => k.id ? k : { ...k, id: 'kf-' + Math.random().toString(36).substr(2, 9) });
        setAttributes({ keyframes: newKFs });
        return null; // Force re-render with IDs
    }

    const handleAdd = () => {
        const newKeyframes = [...keyframes, {
            id: 'kf-' + Math.random().toString(36).substr(2, 9),
            triggerType: 'px',
            triggerValue: '0',
            triggerOffset: 0,
            elementSelector: '', // Only for simple element mode
            transitionType: 'duration',
            transitionDuration: 500,
            settings: {},
            isAdvanced: false,
            triggerEndType: 'px',
            triggerEndValue: '',
            triggerEndOffset: 0,
            startSettings: {}
        }];
        setAttributes({ keyframes: newKeyframes });
        setExpandedIndices([...expandedIndices, newKeyframes.length - 1]);
    };

    const handleDelete = (index) => {
        const newKeyframes = [...keyframes];
        newKeyframes.splice(index, 1);
        setAttributes({ keyframes: newKeyframes });
        setExpandedIndices(expandedIndices.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    };

    const updateKeyframe = (index, updates) => {
        const newKeyframes = [...keyframes];
        newKeyframes[index] = { ...newKeyframes[index], ...updates };
        setAttributes({ keyframes: newKeyframes });
    };

    const updateSetting = (index, key, value) => {
        const newKeyframes = [...keyframes];
        newKeyframes[index] = {
            ...newKeyframes[index],
            settings: {
                ...newKeyframes[index].settings,
                [key]: value
            }
        };
        setAttributes({ keyframes: newKeyframes });
    };

    const removeSetting = (index, key) => {
        const newKeyframes = [...keyframes];
        const newSettings = { ...newKeyframes[index].settings };
        delete newSettings[key];
        newKeyframes[index] = { ...newKeyframes[index], settings: newSettings };
        setAttributes({ keyframes: newKeyframes });
    };

    const updateStartSetting = (index, key, value) => {
        const newKeyframes = [...keyframes];
        newKeyframes[index] = {
            ...newKeyframes[index],
            startSettings: {
                ...newKeyframes[index].startSettings || {}, // Ensure object exists
                [key]: value
            }
        };
        setAttributes({ keyframes: newKeyframes });
    };

    const removeStartSetting = (index, key) => {
        const newKeyframes = [...keyframes];
        const newSettings = { ...newKeyframes[index].startSettings || {} };
        delete newSettings[key];
        newKeyframes[index] = { ...newKeyframes[index], startSettings: newSettings };
        setAttributes({ keyframes: newKeyframes });
    };

    const toggleExpanded = (index) => {
        if (expandedIndices.includes(index)) {
            setExpandedIndices(expandedIndices.filter(i => i !== index));
        } else {
            setExpandedIndices([...expandedIndices, index]);
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newKeyframes = [...keyframes];
        const draggedItem = newKeyframes[draggedIndex];
        newKeyframes.splice(draggedIndex, 1);
        newKeyframes.splice(index, 0, draggedItem);

        setAttributes({ keyframes: newKeyframes });
        setDraggedIndex(index);

        // Adjust expanded indices
        let newExpanded = [...expandedIndices];
        if (expandedIndices.includes(draggedIndex)) {
            newExpanded = newExpanded.filter(i => i !== draggedIndex);
            newExpanded.push(index);
        }
        setExpandedIndices(newExpanded);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Build grouped options for dropdown
    const buildSettingOptions = (existingSettings) => {
        const options = [{ label: '-- Select a setting --', value: '' }];

        Object.entries(SETTINGS_GROUPS).forEach(([groupName, settings]) => {
            const availableInGroup = settings.filter(s => !existingSettings.hasOwnProperty(s.key));
            if (availableInGroup.length > 0) {
                options.push({
                    label: `━━ ${groupName} ━━`,
                    value: '',
                    disabled: true
                });
                availableInGroup.forEach(setting => {
                    options.push({
                        label: `  ${setting.label}`,
                        value: setting.key
                    });
                });
            }
        });

        return options;
    };

    return (
        isOpen && (
            <Modal
                title="Keyframe Manager"
                onRequestClose={onClose}
                size="large"
                style={{ maxWidth: '90vw' }}
            >
                <div style={{ padding: '20px' }}>
                    <Button
                        variant="primary"
                        onClick={handleAdd}
                        icon={icons.plus}
                        style={{ marginBottom: '20px' }}
                    >
                        Add Keyframe
                    </Button>

                    {keyframes.length === 0 && (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>
                            No keyframes defined. Click "Add Keyframe" to get started.
                        </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {keyframes.map((kf, index) => {
                            const isExpanded = expandedIndices.includes(index);
                            return (
                                <Card
                                    key={kf.id || index}
                                    className="keyframe-card"
                                    style={{
                                        border: '1px solid #ddd',
                                        opacity: draggedIndex === index ? 0.5 : 1,
                                        transition: 'transform 0.2s ease',
                                        position: 'relative',
                                        zIndex: draggedIndex === index ? 10 : 1
                                    }}
                                    draggable="true"
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <CardHeader
                                        style={{
                                            backgroundColor: '#f9f9f9',
                                            padding: '12px 16px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                        onClick={(e) => {
                                            // Only toggle if not clicking the delete button
                                            // (Drag handle will stop prop automatically due to being separate?)
                                            toggleExpanded(index);
                                        }}
                                    >
                                        <div
                                            style={{ cursor: 'grab', marginRight: '10px', display: 'flex', alignItems: 'center', color: '#ccc' }}
                                            draggable="true"
                                            onDragStart={(e) => {
                                                e.dataTransfer.effectAllowed = 'move';
                                                e.stopPropagation(); // Stop click from firing on parent header (if expanding)
                                                handleDragStart(index);
                                            }}
                                            onClick={(e) => e.stopPropagation()} // Prevent expansion when clicking handle
                                        >
                                            {icons.dragHandle}
                                        </div>

                                        <div style={{ flex: 1, cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ color: '#999', fontSize: '12px' }}>#{index + 1}</span>
                                                {getKeyframeLabel(kf)}
                                            </div>
                                        </div>

                                        <Button
                                            icon={icons.trash}
                                            isDestructive
                                            isSmall
                                            style={{ marginLeft: '10px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(index);
                                            }}
                                        />
                                    </CardHeader>

                                    {isExpanded && (
                                        <CardBody style={{ padding: '20px' }}>
                                            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                                                <ToggleControl
                                                    label="Advanced Range Mode"
                                                    checked={kf.isAdvanced || false}
                                                    onChange={(v) => updateKeyframe(index, { isAdvanced: v })}
                                                    help={kf.isAdvanced
                                                        ? "Defines a scroll range (Start → End) where settings smoothly interpolate."
                                                        : "Simple point-based trigger with optional transition."
                                                    }
                                                />
                                            </div>

                                            {!kf.isAdvanced ? (
                                                /* SIMPLE KEYFRAME UI */
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    {/* Left Column: Trigger Settings */}
                                                    <div>
                                                        <h4 style={{ marginTop: 0 }}>Trigger</h4>
                                                        <SelectControl
                                                            label="Trigger Type"
                                                            value={kf.triggerType}
                                                            options={TRIGGER_TYPES}
                                                            onChange={(v) => updateKeyframe(index, { triggerType: v })}
                                                        />

                                                        {kf.triggerType !== 'element-center' ? (
                                                            <TextControl
                                                                label="Trigger Value"
                                                                value={kf.triggerValue}
                                                                onChange={(v) => updateKeyframe(index, { triggerValue: v })}
                                                                help={`e.g., 500 for px, 50 for %, 10 for rem`}
                                                            />
                                                        ) : (
                                                            <>
                                                                <TextControl
                                                                    label="Element Selector"
                                                                    value={kf.triggerValue}
                                                                    onChange={(v) => updateKeyframe(index, { triggerValue: v })}
                                                                    help="CSS selector (e.g., #myId, .myClass, p)"
                                                                    placeholder=".my-element"
                                                                />
                                                                <TextControl
                                                                    label="Offset (px)"
                                                                    value={kf.triggerOffset || 0}
                                                                    onChange={(v) => updateKeyframe(index, { triggerOffset: v })}
                                                                    type="number"
                                                                    help="Positive value triggers later, negative earlier."
                                                                />
                                                            </>
                                                        )}

                                                        <Divider style={{ margin: '20px 0' }} />

                                                        <h4>Transition</h4>
                                                        <SelectControl
                                                            label="Transition Method"
                                                            value={kf.transitionType}
                                                            options={TRANSITION_TYPES}
                                                            onChange={(v) => updateKeyframe(index, { transitionType: v })}
                                                        />

                                                        {kf.transitionType === 'duration' && (
                                                            <RangeControl
                                                                label="Duration (ms)"
                                                                value={kf.transitionDuration || 500}
                                                                onChange={(v) => updateKeyframe(index, { transitionDuration: v })}
                                                                min={0}
                                                                max={5000}
                                                                step={100}
                                                            />
                                                        )}

                                                        {kf.transitionType === 'linear' && (
                                                            <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                                                                Smoothly interpolates from previous keyframe while scrolling.
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Right Column: Setting Overrides */}
                                                    <div>
                                                        <h4 style={{ marginTop: 0 }}>Setting Overrides</h4>
                                                        <SelectControl
                                                            label="Add Setting Override"
                                                            value=""
                                                            options={buildSettingOptions(kf.settings)}
                                                            onChange={(key) => {
                                                                if (key) {
                                                                    updateSetting(index, key, getDefaultValue(key));
                                                                }
                                                            }}
                                                        />

                                                        <div style={{ marginTop: '15px' }}>
                                                            {Object.keys(kf.settings).length === 0 && (
                                                                <p style={{ color: '#999', fontStyle: 'italic', fontSize: '13px' }}>
                                                                    No overrides set.
                                                                </p>
                                                            )}

                                                            {Object.keys(kf.settings).map(key => {
                                                                const def = ALL_SETTINGS.find(s => s.key === key);
                                                                if (!def) return null;

                                                                return (
                                                                    <div
                                                                        key={key}
                                                                        style={{
                                                                            marginBottom: '15px',
                                                                            border: '1px solid #e0e0e0',
                                                                            padding: '12px',
                                                                            borderRadius: '4px',
                                                                            backgroundColor: '#fafafa'
                                                                        }}
                                                                    >
                                                                        <Flex align="flex-start" gap={2}>
                                                                            <FlexItem style={{ flex: 1 }}>
                                                                                {renderControl(def, kf.settings[key], (v) => updateSetting(index, key, v))}
                                                                            </FlexItem>
                                                                            <FlexItem>
                                                                                <Button
                                                                                    icon={icons.trash}
                                                                                    isDestructive
                                                                                    isSmall
                                                                                    onClick={() => removeSetting(index, key)}
                                                                                    style={{ marginTop: '24px' }}
                                                                                />
                                                                            </FlexItem>
                                                                        </Flex>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* ADVANCED KEYFRAME UI */
                                                <div>
                                                    {/* Compact Range Row (Split Units) */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'end',
                                                        gap: '15px',
                                                        marginBottom: '25px',
                                                        padding: '15px',
                                                        backgroundColor: '#f6f7f7',
                                                        borderRadius: '4px'
                                                    }}>

                                                        {/* START */}
                                                        <div style={{ flex: 2 }}>
                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <SelectControl
                                                                        label="Start Unit"
                                                                        value={kf.triggerType}
                                                                        options={TRIGGER_TYPES.filter(t => t.value !== 'element-unique')} // reusing standard list
                                                                        onChange={(v) => updateKeyframe(index, { triggerType: v })}
                                                                        style={{ marginBottom: '5px', fontSize: '11px' }}
                                                                    />
                                                                </div>
                                                                {kf.triggerType === 'element-center' && (
                                                                    <div style={{ flex: 0.8 }}>
                                                                        <TextControl
                                                                            label="Offset (px)"
                                                                            value={kf.triggerOffset || 0}
                                                                            onChange={(v) => updateKeyframe(index, { triggerOffset: v })}
                                                                            style={{ marginBottom: '5px' }}
                                                                            type="number"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <TextControl
                                                                label={kf.triggerType === 'element-center' ? "Selector (e.g. #id)" : "Value"}
                                                                value={kf.triggerValue}
                                                                onChange={(v) => updateKeyframe(index, { triggerValue: v })}
                                                                style={{ marginBottom: 0 }}
                                                                placeholder={kf.triggerType === 'element-center' ? '#section-1' : '0'}
                                                            />
                                                        </div>

                                                        <div style={{ flex: 0.2, textAlign: 'center', paddingBottom: '8px', color: '#666' }}>→</div>

                                                        {/* END */}
                                                        <div style={{ flex: 2 }}>
                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <SelectControl
                                                                        label="End Unit"
                                                                        value={kf.triggerEndType || 'px'}
                                                                        options={TRIGGER_TYPES.filter(t => t.value !== 'element-unique')}
                                                                        onChange={(v) => updateKeyframe(index, { triggerEndType: v })}
                                                                        style={{ marginBottom: '5px', fontSize: '11px' }}
                                                                    />
                                                                </div>
                                                                {kf.triggerEndType === 'element-center' && (
                                                                    <div style={{ flex: 0.8 }}>
                                                                        <TextControl
                                                                            label="Offset (px)"
                                                                            value={kf.triggerEndOffset || 0}
                                                                            onChange={(v) => updateKeyframe(index, { triggerEndOffset: v })}
                                                                            style={{ marginBottom: '5px' }}
                                                                            type="number"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <TextControl
                                                                label={kf.triggerEndType === 'element-center' ? "Selector (e.g. #id)" : "Value"}
                                                                value={kf.triggerEndValue || ''}
                                                                onChange={(v) => updateKeyframe(index, { triggerEndValue: v })}
                                                                placeholder={kf.triggerEndType === 'element-center' ? '#section-2' : (kf.triggerType === '%' ? '100' : '1000')}
                                                                style={{ marginBottom: 0 }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <Divider />

                                                    {/* Compact Settings List */}
                                                    <div>
                                                        <h4 style={{ marginTop: 0 }}>Modified Settings</h4>
                                                        <div style={{ marginBottom: '15px' }}>
                                                            <SelectControl
                                                                label="Add Modification"
                                                                value=""
                                                                options={buildSettingOptions({ ...kf.startSettings, ...kf.settings })}
                                                                onChange={(key) => {
                                                                    if (key) {
                                                                        const defVal = getDefaultValue(key);
                                                                        updateStartSetting(index, key, defVal);
                                                                        updateSetting(index, key, defVal);
                                                                    }
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Headers for columns */}
                                                        {Object.keys({ ...kf.startSettings, ...kf.settings }).length > 0 && (
                                                            <div style={{ display: 'flex', gap: '10px', fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '8px', paddingLeft: '110px' }}>
                                                                <div style={{ flex: 1 }}>Start Value</div>
                                                                <div style={{ width: '20px' }}></div>
                                                                <div style={{ flex: 1 }}>Target Value</div>
                                                                <div style={{ width: '32px' }}></div>
                                                            </div>
                                                        )}

                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {(() => {
                                                                const mergedKeys = [...new Set([...Object.keys(kf.startSettings || {}), ...Object.keys(kf.settings || {})])];

                                                                if (mergedKeys.length === 0) {
                                                                    return <p style={{ color: '#999', fontStyle: 'italic', fontSize: '13px' }}>No settings modified.</p>;
                                                                }

                                                                return mergedKeys.map(key => {
                                                                    const def = ALL_SETTINGS.find(s => s.key === key);
                                                                    if (!def) return null;

                                                                    const startVal = kf.startSettings?.[key] !== undefined ? kf.startSettings[key] : getDefaultValue(key);
                                                                    const endVal = kf.settings?.[key] !== undefined ? kf.settings[key] : getDefaultValue(key);

                                                                    return (
                                                                        <div key={key} style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '10px',
                                                                            padding: '10px',
                                                                            backgroundColor: '#fff',
                                                                            border: '1px solid #e0e0e0',
                                                                            borderRadius: '4px'
                                                                        }}>
                                                                            {/* Label */}
                                                                            <div style={{ width: '100px', fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={def.label}>
                                                                                {def.label}
                                                                            </div>

                                                                            {/* Start Control */}
                                                                            <div style={{ flex: 1 }}>
                                                                                {renderCompactControl(def, startVal, (v) => updateStartSetting(index, key, v))}
                                                                            </div>

                                                                            <div style={{ color: '#aaa' }}>→</div>

                                                                            {/* End Control */}
                                                                            <div style={{ flex: 1 }}>
                                                                                {renderCompactControl(def, endVal, (v) => updateSetting(index, key, v))}
                                                                            </div>

                                                                            {/* Delete */}
                                                                            <Button
                                                                                icon={icons.trash}
                                                                                isDestructive
                                                                                isSmall
                                                                                onClick={() => {
                                                                                    removeStartSetting(index, key);
                                                                                    removeSetting(index, key);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardBody>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        )
    );
}

function getKeyframeLabel(kf) {
    if (kf.isAdvanced) {
        const count = new Set([...Object.keys(kf.startSettings || {}), ...Object.keys(kf.settings || {})]).size;

        const startLabel = kf.triggerType === 'element-center' ? (kf.triggerValue || 'Select Element') : `${kf.triggerValue}${kf.triggerType}`;
        const endLabel = kf.triggerEndType === 'element-center' ? (kf.triggerEndValue || 'Select Element') : `${kf.triggerEndValue || '?'}${kf.triggerEndType || kf.triggerType}`;
        const startOffset = kf.triggerOffset ? ` (+${kf.triggerOffset})` : '';
        const endOffset = kf.triggerEndOffset ? ` (+${kf.triggerEndOffset})` : '';

        return (
            <span>
                <strong>{startLabel}{startOffset}</strong>
                <span style={{ color: '#888', margin: '0 5px' }}>→</span>
                <strong>{endLabel}{endOffset}</strong>
                <span style={{ marginLeft: '10px', color: '#666', fontSize: '12px', fontWeight: 'normal' }}>
                    ({count} modifications)
                </span>
            </span>
        );
    }

    // Simple Mode Label
    let label = '';
    if (kf.triggerType === 'element-center') {
        const offset = kf.triggerOffset ? ` (+${kf.triggerOffset}px)` : '';
        label = kf.triggerValue ? `${kf.triggerValue}${offset}` : 'Select Element';
    } else {
        label = `${kf.triggerValue}${kf.triggerType}`;
    }

    const settingsCount = Object.keys(kf.settings).length;

    return (
        <span>
            <strong>{label}</strong>
            <span style={{ marginLeft: '10px', color: '#666', fontSize: '12px', fontWeight: 'normal' }}>
                ({settingsCount} overrides)
            </span>
        </span>
    );
}

// Compact control renderer (hides labels, minimizes space)
function renderCompactControl(def, value, onChange) {
    if (def.type === 'range') {
        return (
            <RangeControl
                value={value}
                onChange={onChange}
                min={def.min}
                max={def.max}
                step={def.step || 1}
                withInputField={true}
                __nextHasNoMarginBottom={true}
            />
        );
    }
    if (def.type === 'color') {
        return (
            <ColorPicker
                color={value}
                onChange={onChange}
                enableAlpha={false}
                style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }} // Mini color picker
            />
        );
    }
    if (def.type === 'toggle') {
        return (
            <ToggleControl
                checked={value}
                onChange={onChange}
            />
        );
    }
    if (def.type === 'select') {
        return (
            <SelectControl
                value={value}
                options={def.options}
                onChange={onChange}
            />
        );
    }
    return null;
}

function getDefaultValue(key) {
    const def = ALL_SETTINGS.find(s => s.key === key);
    if (!def) return null;

    if (def.type === 'color') {
        if (key === 'bgColor') return '#0a0a0a';
        return '#ffffff';
    }
    if (def.type === 'toggle') return true;
    if (def.type === 'select') return def.options[0].value;
    if (def.type === 'range') {
        // Return sensible defaults based on key
        if (key === 'sphereSize') return 280;
        if (key === 'lineOpacity') return 0.7;
        if (key === 'lineWidth') return 0.8;
        if (key === 'lineDensity') return 60;
        if (key === 'lineSegments') return 150;
        if (key === 'noiseScale') return 2;
        if (key === 'noiseAmplitude') return 30;
        if (key === 'animationSpeed') return 50;
        if (key === 'rotationSpeed') return 20;
        // Use midpoint for most ranges
        return (def.min + def.max) / 2;
    }
    return 1;
}

function renderControl(def, value, onChange) {
    if (def.type === 'range') {
        return (
            <RangeControl
                label={def.label}
                value={value}
                onChange={onChange}
                min={def.min}
                max={def.max}
                step={def.step || 1}
            />
        );
    }
    if (def.type === 'color') {
        return (
            <>
                <p style={{ marginBottom: '8px', fontWeight: '500' }}>{def.label}</p>
                <ColorPicker
                    color={value}
                    onChange={onChange}
                    enableAlpha={false}
                />
            </>
        );
    }
    if (def.type === 'toggle') {
        return (
            <ToggleControl
                label={def.label}
                checked={value}
                onChange={onChange}
            />
        );
    }
    if (def.type === 'select') {
        return (
            <SelectControl
                label={def.label}
                value={value}
                options={def.options}
                onChange={onChange}
            />
        );
    }
    return null;
}
