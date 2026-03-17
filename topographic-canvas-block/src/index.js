/**
 * WordPress Block Registration
 */
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import Edit from './edit';
import metadata from './block.json';
import TextZoneEdit from './text-zone-edit';
import TextZoneSave from './text-zone-save';
import './editor.scss';
import './style.scss';

// Main Topographic Canvas block (dynamic, rendered via PHP)
registerBlockType( metadata.name, {
    edit: Edit,
    save: () => <InnerBlocks.Content />,
    deprecated: [
        {
            // Blocks saved before text zones were added (save returned null)
            attributes: metadata.attributes,
            save() {
                return null;
            },
            migrate( attributes, innerBlocks ) {
                return [ attributes, innerBlocks ];
            },
        },
    ],
} );

// Child block: Text Zone (used inside the canvas block)
registerBlockType( 'topographic-canvas/text-zone', {
    apiVersion: 3,
    title: 'Canvas Text Zone',
    description: 'A text zone overlay for the topographic canvas.',
    category: 'media',
    parent: [ 'topographic-canvas/block' ],
    icon: 'text',
    attributes: {
        position: {
            type: 'string',
            default: 'center',
        },
        horizontalAlign: {
            type: 'string',
            default: 'center',
        },
        verticalAlign: {
            type: 'string',
            default: 'center',
        },
    },
    supports: {
        html: false,
        inserter: false,
        reusable: false,
        lock: false,
        spacing: {
            padding: true,
        },
    },
    edit: TextZoneEdit,
    save: TextZoneSave,
} );
