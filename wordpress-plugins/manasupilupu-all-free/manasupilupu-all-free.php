<?php
/*
Plugin Name: Manasu Pilupu - All Posts Free
Description: Temporarily makes all posts free by overriding the 'is_free_post' meta value to 'yes'. Enable this while payment gateway is down.
Version: 1.0
Author: Sridhar
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

add_filter('get_post_metadata', 'mp_all_free_override_post_meta', 99, 4);
function mp_all_free_override_post_meta($value, $object_id, $meta_key, $single) {
    if ($meta_key === 'is_free_post') {
        return $single ? 'yes' : array('yes');
    }
    return $value; // Return original value for other meta keys (usually null, letting WP fetch it)
}

add_action('rest_api_init', function () {
    register_rest_route('mp/v1', '/is-all-free', array(
        'methods' => 'GET',
        'callback' => function () {
            return rest_ensure_response(true);
        },
        'permission_callback' => '__return_true'
    ));
});
