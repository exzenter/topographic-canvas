/**
 * Text Zone Block - Save Component
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function TextZoneSave( { attributes } ) {
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

    const blockProps = useBlockProps.save( {
        className: `topographic-canvas-text-zone zone-${ position }`,
        style: zoneStyle,
    } );

    const innerBlocksProps = useInnerBlocksProps.save( blockProps );

    return <div { ...innerBlocksProps } />;
}
