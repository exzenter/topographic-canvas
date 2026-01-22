<?php
/**
 * Server-side rendering for the Topographic Canvas block
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 * @return string Rendered block output.
 */

// Build base style for sizing
$use_aspect_ratio = $attributes['useAspectRatio'] ?? false;
$size_style = $use_aspect_ratio
    ? sprintf( 'aspect-ratio: %s;', esc_attr( $attributes['aspectRatio'] ?? '16/9' ) )
    : sprintf( 'height: %dpx;', absint( $attributes['canvasHeight'] ?? 500 ) );

$style = $size_style . sprintf( ' background-color: %s;', esc_attr( $attributes['bgColor'] ?? '#0a0a0a' ) );

// Add sticky positioning if enabled
$enable_sticky = $attributes['enableSticky'] ?? false;
$sticky_classes = '';

if ( $enable_sticky ) {
    $sticky_position = $attributes['stickyPosition'] ?? 'top';
    $sticky_top_offset = esc_attr( $attributes['stickyTopOffset'] ?? '0' );
    $sticky_center_offset = esc_attr( $attributes['stickyCenterOffset'] ?? '0' );
    $sticky_bottom_offset = esc_attr( $attributes['stickyBottomOffset'] ?? '0' );
    
    // Ensure values have units, default to rem if just a number
    $sticky_top_offset = preg_match('/^-?[\d.]+$/', $sticky_top_offset) ? $sticky_top_offset . 'rem' : $sticky_top_offset;
    $sticky_center_offset = preg_match('/^-?[\d.]+$/', $sticky_center_offset) ? $sticky_center_offset . 'rem' : $sticky_center_offset;
    $sticky_bottom_offset = preg_match('/^-?[\d.]+$/', $sticky_bottom_offset) ? $sticky_bottom_offset . 'rem' : $sticky_bottom_offset;
    
    $style .= ' position: sticky;';
    
    if ( $sticky_position === 'top' ) {
        $style .= sprintf( ' top: %s;', $sticky_top_offset );
    } else {
        // Center position - use 50vh for top, transform: translateY(-50%) for true centering
        // The transform is applied via CSS class .sticky-position-center
        $style .= sprintf( ' top: calc(50vh + %s);', $sticky_center_offset );
        $sticky_classes .= ' sticky-position-center';
    }
    
    // Bottom offset limits how far the element can stick before stopping
    if ( $sticky_bottom_offset !== '0rem' && $sticky_bottom_offset !== '0' ) {
        $style .= sprintf( ' bottom: %s;', $sticky_bottom_offset );
    }
    
    $sticky_classes .= ' has-sticky-position';
    
    if ( $attributes['disableStickyOnMobile'] ?? false ) {
        $sticky_classes .= ' disable-sticky-mobile';
    }
}

// Get wrapper attributes
$wrapper_classes = 'wp-block-topographic-canvas-block' . ( $sticky_classes ? ' ' . $sticky_classes : '' );
$wrapper_attributes = get_block_wrapper_attributes( array(
    'class' => $wrapper_classes,
    'style' => $style,
) );

// Build data attributes for the container
$data_attributes = array(
    'shape'              => $attributes['shape'] ?? 'sphere',
    'mode'               => $attributes['mode'] ?? 'wavy',
    'color-mode'         => $attributes['colorMode'] ?? 'mono',
    'line-color'         => $attributes['lineColor'] ?? '#ffffff',
    'hue-start'          => $attributes['hueStart'] ?? 180,
    'hue-end'            => $attributes['hueEnd'] ?? 280,
    'line-density'       => $attributes['lineDensity'] ?? 60,
    'line-segments'      => $attributes['lineSegments'] ?? 150,
    'sphere-size'        => $attributes['sphereSize'] ?? 280,
    'use-sphere-size-rem' => ( $attributes['useSphereSizeRem'] ?? false ) ? 'true' : 'false',
    'sphere-size-rem'    => $attributes['sphereSizeRem'] ?? 15,
    'noise-scale'        => $attributes['noiseScale'] ?? 2,
    'noise-amplitude'    => $attributes['noiseAmplitude'] ?? 30,
    'animation-speed'    => $attributes['animationSpeed'] ?? 50,
    'line-width'         => $attributes['lineWidth'] ?? 0.8,
    'line-opacity'       => $attributes['lineOpacity'] ?? 0.7,
    'depth-fade'         => ( $attributes['depthFade'] ?? true ) ? 'true' : 'false',
    'glow-effect'        => ( $attributes['glowEffect'] ?? false ) ? 'true' : 'false',
    'bg-color'           => $attributes['bgColor'] ?? '#0a0a0a',

    // Wavy Mode
    'wavy-octave2-strength' => $attributes['wavyOctave2Strength'] ?? 0.5,
    'wavy-octave3-strength' => $attributes['wavyOctave3Strength'] ?? 0.25,
    'wavy-octave2-freq'     => $attributes['wavyOctave2Freq'] ?? 2,
    'wavy-octave3-freq'     => $attributes['wavyOctave3Freq'] ?? 4,
    'wavy-time2'            => $attributes['wavyTime2'] ?? 1.5,
    'wavy-time3'            => $attributes['wavyTime3'] ?? 2,

    // Bands Mode
    'bands-density'          => $attributes['bandsDensity'] ?? 8,
    'bands-noise-influence'  => $attributes['bandsNoiseInfluence'] ?? 0.7,
    'bands-time-scale'       => $attributes['bandsTimeScale'] ?? 2,
    'bands-angle-scale'      => $attributes['bandsAngleScale'] ?? 0.5,
    'bands-y-scale'          => $attributes['bandsYScale'] ?? 2,
    'bands-strength'         => $attributes['bandsStrength'] ?? 0.3,

    // Cellular Mode
    'cellular-freq1'      => $attributes['cellularFreq1'] ?? 3,
    'cellular-freq2'      => $attributes['cellularFreq2'] ?? 6,
    'cellular-time2'      => $attributes['cellularTime2'] ?? 0.5,
    'cellular-amp-boost'  => $attributes['cellularAmpBoost'] ?? 1.5,
    'cellular-sharpness'  => $attributes['cellularSharpness'] ?? 2,

    // Turbulent Mode
    'turbulent-octaves'     => $attributes['turbulentOctaves'] ?? 5,
    'turbulent-lacunarity'  => $attributes['turbulentLacunarity'] ?? 2,
    'turbulent-persistence' => $attributes['turbulentPersistence'] ?? 0.5,
    'turbulent-time-mult'   => $attributes['turbulentTimeMult'] ?? 0.3,
    'turbulent-time-offset' => $attributes['turbulentTimeOffset'] ?? 1,

    // Spiral Mode
    'spiral-arms'        => $attributes['spiralArms'] ?? 3,
    'spiral-twist'       => $attributes['spiralTwist'] ?? 5,
    'spiral-time-scale'  => $attributes['spiralTimeScale'] ?? 2,
    'spiral-noise-blend' => $attributes['spiralNoiseBlend'] ?? 0.5,
    'spiral-strength'    => $attributes['spiralStrength'] ?? 0.5,

    // Ripple Mode
    'ripple-frequency'   => $attributes['rippleFrequency'] ?? 10,
    'ripple-speed'       => $attributes['rippleSpeed'] ?? 3,
    'ripple-strength'    => $attributes['rippleStrength'] ?? 0.5,
    'ripple-noise-blend' => $attributes['rippleNoiseBlend'] ?? 0.5,
    'ripple-noise-time'  => $attributes['rippleNoiseTime'] ?? 0.5,

    // Auto Rotation
    'auto-rotate'         => ( $attributes['autoRotate'] ?? true ) ? 'true' : 'false',
    'rotation-speed'      => $attributes['rotationSpeed'] ?? 20,
    'rotation-dir-x'      => $attributes['rotationDirX'] ?? 0,
    'rotation-dir-y'      => $attributes['rotationDirY'] ?? 90,
    'rotation-dir-z'      => $attributes['rotationDirZ'] ?? 0,
    'rotation-mode'       => $attributes['rotationMode'] ?? 'constant',
    'pendulum-amplitude'  => $attributes['pendulumAmplitude'] ?? 45,
    'view-preset'         => $attributes['viewPreset'] ?? '',
    'base-rotation-x'     => $attributes['baseRotationX'] ?? 0,
    'base-rotation-y'     => $attributes['baseRotationY'] ?? 0,
    'base-rotation-z'     => $attributes['baseRotationZ'] ?? 0,

    // Mouse Drag
    'drag-enabled'      => ( $attributes['dragEnabled'] ?? true ) ? 'true' : 'false',
    'drag-sensitivity'  => $attributes['dragSensitivity'] ?? 1,
    'drag-inertia'      => ( $attributes['dragInertia'] ?? true ) ? 'true' : 'false',
    'inertia-decay'     => $attributes['inertiaDecay'] ?? 0.95,
    'auto-bounce-back'  => ( $attributes['autoBounceBack'] ?? false ) ? 'true' : 'false',
    'bounce-back-speed' => $attributes['bounceBackSpeed'] ?? 0.05,
    'clamp-rotation'    => ( $attributes['clampRotation'] ?? false ) ? 'true' : 'false',
    'max-x-rotation'    => $attributes['maxXRotation'] ?? 90,

    // Hover
    'hover-enabled'          => ( $attributes['hoverEnabled'] ?? false ) ? 'true' : 'false',
    'hover-mode'             => $attributes['hoverMode'] ?? 'tilt',
    'hover-strength'         => $attributes['hoverStrength'] ?? 1,
    'hover-smoothing'        => $attributes['hoverSmoothing'] ?? 0.08,
    'hover-affects-noise'    => ( $attributes['hoverAffectsNoise'] ?? false ) ? 'true' : 'false',
    'hover-noise-influence'  => $attributes['hoverNoiseInfluence'] ?? 10,

    // Random Motion
    'random-motion'    => ( $attributes['randomMotion'] ?? false ) ? 'true' : 'false',
    'random-mode'      => $attributes['randomMode'] ?? 'gentle',
    'random-intensity' => $attributes['randomIntensity'] ?? 1,
    'random-speed'     => $attributes['randomSpeed'] ?? 1,

    // Advanced
    'easing-function'   => $attributes['easingFunction'] ?? 'easeOut',
    'smoothing-factor'  => $attributes['smoothingFactor'] ?? 0.05,
    'mouse-wheel-zoom'  => ( $attributes['mouseWheelZoom'] ?? false ) ? 'true' : 'false',
    'zoom-sensitivity'  => $attributes['zoomSensitivity'] ?? 1,
    'keyframes'         => json_encode($attributes['keyframes'] ?? []),
);

// Build data attributes string
$data_attrs_string = '';
foreach ( $data_attributes as $key => $value ) {
    $data_attrs_string .= sprintf( ' data-%s="%s"', esc_attr( $key ), esc_attr( $value ) );
}
?>

<div <?php echo $wrapper_attributes; ?>>
    <div class="topographic-canvas-container" style="width: 100%; height: 100%;"<?php echo $data_attrs_string; ?>></div>
</div>
