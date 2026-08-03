<?php
/**
 * Plugin Name: Manasu Pilupu Subscriptions
 * Description: JWT Authentication and Razorpay Subscriptions for headless Next.js app.
 * Version: 1.0.0
 * Author: Advaita Designs
 */

if (!defined('ABSPATH')) {
    exit;
}

// ---------------------------------------------------------
// CONFIGURATION: Cashfree & JWT
// ---------------------------------------------------------
define('MP_JWT_SECRET', 'YOUR_SUPER_SECRET_JWT_KEY_MAKE_IT_LONG');

// ---------------------------------------------------------
// CORS HANDLING
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// SIMPLE JWT UTILITY
// ---------------------------------------------------------
class MP_Simple_JWT {
    public static function encode($payload, $key) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $key, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($jwt, $key) {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) return false;
        list($header64, $payload64, $signature64) = $parts;
        $signature = str_replace(['-', '_'], ['+', '/'], $signature64);
        $signature = base64_decode($signature);
        $expected_signature = hash_hmac('sha256', $header64 . "." . $payload64, $key, true);
        if (hash_equals($signature, $expected_signature)) {
            $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $payload64));
            return json_decode($payload, true);
        }
        return false;
    }
}

// ---------------------------------------------------------
// REGISTER REST ENDPOINTS
// ---------------------------------------------------------
add_action('rest_api_init', function () {
    // Auth
    register_rest_route('mp-subs/v1', '/login', array(
        'methods' => 'POST',
        'callback' => 'mp_subs_login',
        'permission_callback' => '__return_true'
    ));
    register_rest_route('mp-subs/v1', '/register', array(
        'methods' => 'POST',
        'callback' => 'mp_subs_register',
        'permission_callback' => '__return_true'
    ));
    register_rest_route('mp-subs/v1', '/me', array(
        'methods' => 'GET',
        'callback' => 'mp_subs_get_me',
        'permission_callback' => '__return_true'
    ));

    // Cashfree Webhook
    register_rest_route('mp-subs/v1', '/webhook', array(
        'methods' => 'POST',
        'callback' => 'mp_subs_webhook',
        'permission_callback' => '__return_true'
    ));
});

// Helper to get user from Auth header
function mp_subs_get_user_from_request($request) {
    $auth = $request->get_header('authorization');
    if (!$auth || !preg_match('/Bearer\s(\S+)/', $auth, $matches)) return null;
    $payload = MP_Simple_JWT::decode($matches[1], MP_JWT_SECRET);
    if (!$payload || !isset($payload['user_id'])) return null;
    return get_userdata($payload['user_id']);
}

// LOGIN
function mp_subs_login($request) {
    $creds = array(
        'user_login'    => $request->get_param('username'),
        'user_password' => $request->get_param('password'),
        'remember'      => true
    );
    $user = wp_signon($creds, false);
    if (is_wp_error($user)) {
        return new WP_Error('invalid_credentials', $user->get_error_message(), array('status' => 401));
    }
    $payload = array(
        'user_id' => $user->ID,
        'username' => $user->user_login,
        'exp' => time() + (7 * 24 * 60 * 60) // 1 week
    );
    $token = MP_Simple_JWT::encode($payload, MP_JWT_SECRET);
    return rest_ensure_response(array('token' => $token, 'user' => array('id' => $user->ID, 'username' => $user->user_login)));
}

// REGISTER
function mp_subs_register($request) {
    $username = $request->get_param('username');
    $password = $request->get_param('password');
    $email = $request->get_param('email');

    if (username_exists($username) || email_exists($email)) {
        return new WP_Error('user_exists', 'Username or email already exists.', array('status' => 400));
    }

    $user_id = wp_create_user($username, $password, $email);
    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), array('status' => 500));
    }
    
    // Set default meta
    update_user_meta($user_id, 'is_premium', 'false');

    $payload = array('user_id' => $user_id, 'username' => $username, 'exp' => time() + (7 * 24 * 60 * 60));
    $token = MP_Simple_JWT::encode($payload, MP_JWT_SECRET);
    return rest_ensure_response(array('token' => $token, 'user' => array('id' => $user_id, 'username' => $username)));
}

function mp_subs_get_me($request) {
    $user = mp_subs_get_user_from_request($request);
    if (!$user) return new WP_Error('unauthorized', 'Invalid token', array('status' => 401));
    $is_premium = get_user_meta($user->ID, 'is_premium', true) === 'true';
    
    $allowed_roles = array('administrator', 'editor', 'author', 'contributor', 'standard');
    if (!$is_premium && !empty(array_intersect($allowed_roles, (array)$user->roles))) {
        $is_premium = true;
    }
    
    return rest_ensure_response(array('id' => $user->ID, 'username' => $user->user_login, 'is_premium' => $is_premium));
}

// WEBHOOK (Cashfree)
function mp_subs_webhook($request) {
    $body = $request->get_body();
    // Verify signature logic should be implemented here in production
    
    $data = json_decode($body, true);
    if (isset($data['type'])) {
        $event = $data['type'];
        
        if ($event === 'PAYMENT_SUCCESS_WEBHOOK') {
            $customer_details = $data['data']['customer_details'] ?? null;
            if ($customer_details && isset($customer_details['customer_id'])) {
                $user_id = intval($customer_details['customer_id']);
                if ($user_id > 0) {
                    update_user_meta($user_id, 'is_premium', 'true');
                    update_user_meta($user_id, 'cashfree_order_id', $data['data']['order']['order_id'] ?? '');
                }
            }
        } elseif ($event === 'PAYMENT_FAILED_WEBHOOK') {
            // Optional: Handle failure
        }
    }
    return rest_ensure_response(array('status' => 'ok'));
}

// ---------------------------------------------------------
// PROTECT POST CONTENT
// ---------------------------------------------------------
// If a user requests a post, we check their JWT token. 
// If not premium, we replace post content with an excerpt.
add_filter('rest_prepare_post', 'mp_subs_protect_post_content', 10, 3);
function mp_subs_protect_post_content($response, $post, $request) {
    // Check if site is under maintenance, let it pass (handled by frontend)
    
    $user = mp_subs_get_user_from_request($request);
    $is_premium = false;
    
    if ($user) {
        $is_premium = get_user_meta($user->ID, 'is_premium', true) === 'true';
        
        // Allow higher roles to bypass the lock
        $allowed_roles = array('administrator', 'editor', 'author', 'contributor', 'standard');
        if (!$is_premium && !empty(array_intersect($allowed_roles, (array)$user->roles))) {
            $is_premium = true;
        }
    }

    // Only protect full single post requests, not list views
    // Wait, let's protect the content field.
    if (!$is_premium) {
        // Truncate content to first 2 paragraphs as a teaser
        $content = $post->post_content;
        $paragraphs = explode("</p>", $content);
        $teaser = "";
        $limit = min(4, count($paragraphs));
        for ($i = 0; $i < $limit; $i++) {
            if (trim($paragraphs[$i]) !== "") {
                $teaser .= $paragraphs[$i] . "</p>";
            }
        }
        $teaser .= '<div class="premium-locked"></div>';
        
        $response->data['content']['rendered'] = apply_filters('the_content', $teaser);
        $response->data['is_locked'] = true;
    } else {
        $response->data['is_locked'] = false;
    }

    return $response;
}
