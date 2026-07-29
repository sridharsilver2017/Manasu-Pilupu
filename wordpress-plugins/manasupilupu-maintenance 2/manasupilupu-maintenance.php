<?php
/**
 * Plugin Name: Manasu Pilupu Maintenance API
 * Description: Provides a simple REST API to manage maintenance mode for the Next.js app.
 * Version: 1.0.0
 * Author: Advaita Designs
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Ensure proper CORS handling for preflight requests
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        if ( 'OPTIONS' == $_SERVER['REQUEST_METHOD'] ) {
            status_header( 200 );
            exit();
        }
        return $value;
    });
}, 15);

// Ensure the option exists
register_activation_hook(__FILE__, 'mp_maintenance_activation');
function mp_maintenance_activation() {
    if (get_option('mp_is_maintenance') === false) {
        add_option('mp_is_maintenance', 'false');
    }
}

// Register REST API routes
add_action('rest_api_init', function () {
    // GET endpoint: Public, used by the Next.js app to check status
    register_rest_route('mp-maintenance/v1', '/status', array(
        'methods' => 'GET',
        'callback' => 'mp_maintenance_get_status',
        'permission_callback' => '__return_true' // Publicly accessible
    ));

    // POST endpoint: Protected, used by the Admin Page to update status
    register_rest_route('mp-maintenance/v1', '/update', array(
        'methods' => 'POST',
        'callback' => 'mp_maintenance_update_status',
        'permission_callback' => '__return_true' // We handle password auth inside the callback
    ));
});

function mp_maintenance_get_status() {
    $status = get_option('mp_is_maintenance', 'false');
    // Ensure we handle CORS correctly for the Next.js frontend
    $response = new WP_REST_Response(array('isMaintenance' => $status === 'true'));
    $response->header('Access-Control-Allow-Origin', '*');
    return $response;
}

function mp_maintenance_update_status($request) {
    // Basic password protection (Static password for simple admin page)
    $password = $request->get_param('password');
    $expected_password = 'srd4usSR@78'; // Same static password requested by user

    if ($password !== $expected_password) {
        return new WP_Error('unauthorized', 'Invalid password', array('status' => 401));
    }

    $is_maintenance = $request->get_param('isMaintenance');
    
    // Update the option
    if ($is_maintenance === true || $is_maintenance === 'true') {
        update_option('mp_is_maintenance', 'true');
    } else {
        update_option('mp_is_maintenance', 'false');
    }

    $response = new WP_REST_Response(array('success' => true, 'isMaintenance' => get_option('mp_is_maintenance') === 'true'));
    $response->header('Access-Control-Allow-Origin', '*');
    return $response;
}
