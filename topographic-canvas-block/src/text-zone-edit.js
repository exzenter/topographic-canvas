/**
 * Text Zone Block - Editor Component
 */
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    useInnerBlocksProps,
    InspectorControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    ButtonGroup,
    Button,
} from '@wordpress/components';

const ZONE_LABELS = {
    top: __( 'Top Text', 'topographic-canvas-block' ),
    bottom: __( 'Bottom Text', 'topographic-canvas-block' ),
    left: __( 'Left Text', 'topographic-canvas-block' ),
    right: __( 'Right Text', 'topographic-canvas-block' ),
    center: __( 'Center Text', 'topographic-canvas-block' ),
};

const ALLOWED_BLOCKS = [
    'core/paragraph',
    'core/heading',
    'core/list',
    'core/image',
    'core/group',
    'core/columns',
    'core/spacer',
    'exzent/clock',
];

const H_ALIGN_OPTIONS = [
    { label: __( 'Left', 'topographic-canvas-block' ), value: 'flex-start', icon: 'align-left' },
    { label: __( 'Center', 'topographic-canvas-block' ), value: 'center', icon: 'align-center' },
    { label: __( 'Right', 'topographic-canvas-block' ), value: 'flex-end', icon: 'align-right' },
    { label: __( 'Space Between', 'topographic-canvas-block' ), value: 'space-between', icon: 'align-wide' },
    { label: __( 'Space Around', 'topographic-canvas-block' ), value: 'space-around', icon: 'align-full-width' },
    { label: __( 'Space Evenly', 'topographic-canvas-block' ), value: 'space-evenly', icon: 'columns' },
];

const V_ALIGN_OPTIONS = [
    { label: __( 'Top', 'topographic-canvas-block' ), value: 'flex-start', icon: 'arrow-up-alt' },
    { label: __( 'Center', 'topographic-canvas-block' ), value: 'center', icon: 'minus' },
    { label: __( 'Bottom', 'topographic-canvas-block' ), value: 'flex-end', icon: 'arrow-down-alt' },
    { label: __( 'Space Between', 'topographic-canvas-block' ), value: 'space-between', icon: 'align-wide' },
    { label: __( 'Space Around', 'topographic-canvas-block' ), value: 'space-around', icon: 'align-full-width' },
    { label: __( 'Space Evenly', 'topographic-canvas-block' ), value: 'space-evenly', icon: 'columns' },
];

export default function TextZoneEdit( { attributes, setAttributes } ) {
    const { position, horizontalAlign, verticalAlign } = attributes;

    const zoneStyle = { flexWrap: 'wrap' };
    if ( horizontalAlign ) {
        zoneStyle.justifyContent = horizontalAlign;
    }
    if ( verticalAlign ) {
        const isSpacing = verticalAlign.startsWith( 'space-' );
        if ( isSpacing ) {
            zoneStyle.alignContent = verticalAlign;
        } else {
            zoneStyle.alignItems = verticalAlign;
        }
    }

    const blockProps = useBlockProps( {
        className: `topographic-canvas-text-zone zone-${ position }`,
        style: zoneStyle,
    } );

    const innerBlocksProps = useInnerBlocksProps( blockProps, {
        allowedBlocks: ALLOWED_BLOCKS,
        templateLock: false,
        placeholder: ZONE_LABELS[ position ] || position,
    } );

    return (
        <>
            <InspectorControls>
                <PanelBody
                    title={ ZONE_LABELS[ position ] || position }
                    initialOpen={ true }
                >
                    <p style={ { marginBottom: '8px', fontWeight: 500 } }>
                        { __( 'Horizontal Alignment', 'topographic-canvas-block' ) }
                    </p>
                    <ButtonGroup style={ { marginBottom: '16px' } }>
                        { H_ALIGN_OPTIONS.map( ( opt ) => (
                            <Button
                                key={ opt.value }
                                icon={ opt.icon }
                                label={ opt.label }
                                isSmall
                                variant={ horizontalAlign === opt.value ? 'primary' : 'secondary' }
                                onClick={ () => setAttributes( { horizontalAlign: opt.value } ) }
                            />
                        ) ) }
                    </ButtonGroup>

                    <p style={ { marginBottom: '8px', fontWeight: 500 } }>
                        { __( 'Vertical Alignment', 'topographic-canvas-block' ) }
                    </p>
                    <ButtonGroup style={ { marginBottom: '16px' } }>
                        { V_ALIGN_OPTIONS.map( ( opt ) => (
                            <Button
                                key={ opt.value }
                                icon={ opt.icon }
                                label={ opt.label }
                                isSmall
                                variant={ verticalAlign === opt.value ? 'primary' : 'secondary' }
                                onClick={ () => setAttributes( { verticalAlign: opt.value } ) }
                            />
                        ) ) }
                    </ButtonGroup>
                </PanelBody>
            </InspectorControls>
            <div { ...innerBlocksProps } />
        </>
    );
}
