<?php
/**
 * Plugin Name:       Topographic Canvas Block
 * Description:       An animated 3D topographic canvas with customizable shapes, noise modes, and interaction settings.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Exzenter
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       topographic-canvas-block
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register the block
 */
function topographic_canvas_block_init() {
    register_block_type( __DIR__ . '/build' );

    // Register child block: Text Zone
    register_block_type( 'topographic-canvas/text-zone', array(
        'api_version' => 3,
        'title'       => 'Canvas Text Zone',
        'description' => 'A text zone overlay for the topographic canvas.',
        'category'    => 'media',
        'parent'      => array( 'topographic-canvas/block' ),
        'icon'        => 'text',
        'attributes'  => array(
            'position' => array(
                'type'    => 'string',
                'default' => 'center',
            ),
            'horizontalAlign' => array(
                'type'    => 'string',
                'default' => 'center',
            ),
            'verticalAlign' => array(
                'type'    => 'string',
                'default' => 'center',
            ),
        ),
        'supports'    => array(
            'html'     => false,
            'inserter' => false,
            'reusable' => false,
            'spacing'  => array(
                'padding' => true,
            ),
        ),
    ) );
}
add_action( 'init', 'topographic_canvas_block_init' );
