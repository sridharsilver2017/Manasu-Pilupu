<?php
/**
 * Plugin Name: WordPress Likes API
 * Plugin URI: https://manasupilupu.pages.dev
 * Description: Adds custom REST API endpoints to handle global likes for the Next.js frontend.
 * Version: 1.0.0
 * Author: Sridhar Silver
 * License: GPL2
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Register the custom REST API endpoints
add_action('rest_api_init', function () {
    // GET endpoint to retrieve likes for a post
    register_rest_route('custom/v1', '/like', array(
        'methods' => 'GET',
        'callback' => 'wpla_get_post_likes',
        'permission_callback' => '__return_true', // Allow public access
        'args' => array(
            'post_id' => array(
                'required' => true,
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            )
        )
    ));

    // POST endpoint to increment likes for a post
    register_rest_route('custom/v1', '/like', array(
        'methods' => 'POST',
        'callback' => 'wpla_increment_post_likes',
        'permission_callback' => '__return_true', // Allow public access
        'args' => array(
            'post_id' => array(
                'required' => true,
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            )
        )
    ));
});

// Callback to get likes
function wpla_get_post_likes($request) {
    $post_id = $request->get_param('post_id');
    $likes = get_post_meta($post_id, '_post_likes', true);
    
    return new WP_REST_Response(array(
        'post_id' => $post_id,
        'likes' => $likes ? (int)$likes : 0
    ), 200);
}

// Callback to increment likes
function wpla_increment_post_likes($request) {
    $post_id = $request->get_param('post_id');
    
    // Check if post exists
    if (!get_post_status($post_id)) {
        return new WP_Error('no_post', 'Post not found', array('status' => 404));
    }

    $likes = get_post_meta($post_id, '_post_likes', true);
    $new_likes = $likes ? (int)$likes + 1 : 1;
    
    update_post_meta($post_id, '_post_likes', $new_likes);
    
    return new WP_REST_Response(array(
        'post_id' => $post_id,
        'likes' => $new_likes
    ), 200);
}
