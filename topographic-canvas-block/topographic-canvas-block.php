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
}
add_action( 'init', 'topographic_canvas_block_init' );
