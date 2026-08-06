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
define('CASHFREE_APP_ID', 'TEST10460061582c1f17ce01dbe4733516006401');
define('CASHFREE_SECRET_KEY', 'REPLACE_WITH_YOUR_ACTUAL_SECRET_KEY_IN_PRODUCTION');
define('CASHFREE_API_URL', 'https://sandbox.cashfree.com/pg/orders');

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

    // Cashfree Create Order
    register_rest_route('mp-subs/v1', '/create-order', array(
        'methods' => 'POST',
        'callback' => 'mp_subs_create_order',
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
            if ($customer_details && isset($customer_details['customer_email'])) {
                $email = sanitize_email($customer_details['customer_email']);
                $name = sanitize_text_field($customer_details['customer_name'] ?? '');
                
                $user = get_user_by('email', $email);
                
                if ($user) {
                    // User exists, just upgrade
                    update_user_meta($user->ID, 'is_premium', 'true');
                    update_user_meta($user->ID, 'cashfree_order_id', $data['data']['order']['order_id'] ?? '');
                } else {
                    // User does not exist, create account
                    $username = sanitize_user(explode('@', $email)[0]);
                    if (username_exists($username)) {
                        $username = $username . wp_rand(1000, 9999);
                    }
                    
                    $password = wp_generate_password(12, false);
                    $user_id = wp_create_user($username, $password, $email);
                    
                    if (!is_wp_error($user_id)) {
                        update_user_meta($user_id, 'is_premium', 'true');
                        update_user_meta($user_id, 'cashfree_order_id', $data['data']['order']['order_id'] ?? '');
                        
                        // Send welcome email
                        $subject = 'Welcome to Manasu Pilupu Premium!';
                        $message = "Hello $name,\n\nThank you for subscribing to Premium!\n\nAn account has been automatically created for you.\nHere are your login details:\nUsername: $username\nPassword: $password\n\nPlease log in on our website to access your premium content.\n\nEnjoy unlimited reading!";
                        wp_mail($email, $subject, $message);
                    }
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

    // Check if the post is marked as premium
    $is_premium_post = get_post_meta($post->ID, 'is_premium_post', true) === 'yes';

    // Only protect full single post requests, not list views
    // Wait, let's protect the content field.
    if ($is_premium_post && !$is_premium) {
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

// ---------------------------------------------------------
// CREATE CASHFREE ORDER
// ---------------------------------------------------------
function mp_subs_create_order($request) {
    $body = json_decode($request->get_body(), true);
    
    $username = $body['username'] ?? 'Premium User';
    $email = $body['email'] ?? 'user@example.com';
    $id = $body['id'] ?? 'GUEST';
    $amount = $body['amount'] ?? 99.00;

    $orderId = 'ORDER_' . time() . '_' . rand(100, 999);
    
    $customer_id = (!$id || $id === 'GUEST') ? 'GUEST_' . time() : (string)$id;

    $payload = array(
        'order_amount' => (float)$amount,
        'order_currency' => 'INR',
        'order_id' => $orderId,
        'customer_details' => array(
            'customer_id' => $customer_id,
            'customer_name' => $username,
            'customer_email' => $email,
            'customer_phone' => '9999999999'
        ),
        'order_meta' => array(
            'return_url' => 'http://localhost:3000/pricing?status=success'
        )
    );

    $args = array(
        'method'      => 'POST',
        'headers'     => array(
            'Content-Type' => 'application/json',
            'x-client-id' => CASHFREE_APP_ID,
            'x-client-secret' => CASHFREE_SECRET_KEY,
            'x-api-version' => '2023-08-01'
        ),
        'body'        => json_encode($payload),
        'data_format' => 'body'
    );

    $response = wp_remote_post(CASHFREE_API_URL, $args);

    if (is_wp_error($response)) {
        return new WP_Error('cashfree_error', $response->get_error_message(), array('status' => 500));
    }

    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = json_decode(wp_remote_retrieve_body($response), true);

    if ($response_code >= 400) {
        return new WP_Error('cashfree_error', $response_body['message'] ?? 'Failed to create Cashfree order', array('status' => $response_code));
    }

    return rest_ensure_response(array(
        'payment_session_id' => $response_body['payment_session_id'],
        'order_id' => $response_body['order_id']
    ));
}

// ---------------------------------------------------------
// ADD META BOX FOR PREMIUM CONTENT
// ---------------------------------------------------------
add_action('add_meta_boxes', 'mp_subs_add_premium_meta_box');
function mp_subs_add_premium_meta_box() {
    add_meta_box(
        'mp_subs_premium_box',
        'Premium Content Setting',
        'mp_subs_premium_meta_box_html',
        'post',
        'side',
        'default'
    );
}

function mp_subs_premium_meta_box_html($post) {
    $value = get_post_meta($post->ID, 'is_premium_post', true);
    // By default, if not set, we can make it premium if needed, but let's default to no (free).
    // The previous behavior was all posts are premium, so let's default new posts to no, but existing ones to 'yes' if we wanted backward compatibility.
    // For now, let's just use the saved value.
    $checked = ($value === 'yes') ? 'checked' : '';
    ?>
    <label for="mp_subs_is_premium_post">
        <input type="checkbox" name="mp_subs_is_premium_post" id="mp_subs_is_premium_post" value="yes" <?php echo $checked; ?>>
        Require Premium Subscription to read this post.
    </label>
    <?php
}

add_action('save_post', 'mp_subs_save_premium_meta_box');
function mp_subs_save_premium_meta_box($post_id) {
    if (array_key_exists('mp_subs_is_premium_post', $_POST)) {
        update_post_meta(
            $post_id,
            'is_premium_post',
            $_POST['mp_subs_is_premium_post']
        );
    } else {
        // If it's not present (e.g. checkbox unchecked), delete or update to 'no'
        // But only if it's a valid save (not autosave etc)
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;
        
        update_post_meta($post_id, 'is_premium_post', 'no');
    }
}
