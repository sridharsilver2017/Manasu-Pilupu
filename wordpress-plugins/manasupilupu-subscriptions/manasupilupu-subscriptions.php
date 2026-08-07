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
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if ('OPTIONS' == $_SERVER['REQUEST_METHOD']) {
            status_header(200);
            exit();
        }
        return $value;
    });
}, 15);

// ---------------------------------------------------------
// SIMPLE JWT UTILITY
// ---------------------------------------------------------
class MP_Simple_JWT
{
    public static function encode($payload, $key)
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $key, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($jwt, $key)
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3)
            return false;
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
function mp_subs_get_user_from_request($request)
{
    $auth = $request->get_header('authorization');
    if (!$auth || !preg_match('/Bearer\s(\S+)/', $auth, $matches))
        return null;
    $payload = MP_Simple_JWT::decode($matches[1], MP_JWT_SECRET);
    if (!$payload || !isset($payload['user_id']))
        return null;
    return get_userdata($payload['user_id']);
}

// LOGIN
function mp_subs_login($request)
{
    $creds = array(
        'user_login' => $request->get_param('username'),
        'user_password' => $request->get_param('password'),
        'remember' => true
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
function mp_subs_register($request)
{
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

function mp_subs_get_me($request)
{
    $user = mp_subs_get_user_from_request($request);
    if (!$user)
        return new WP_Error('unauthorized', 'Invalid token', array('status' => 401));
    $is_premium = get_user_meta($user->ID, 'is_premium', true) === 'true';

    $allowed_roles = array('administrator', 'editor', 'author', 'contributor', 'standard');
    if (!$is_premium && !empty(array_intersect($allowed_roles, (array) $user->roles))) {
        $is_premium = true;
    }

    return rest_ensure_response(array('id' => $user->ID, 'username' => $user->user_login, 'is_premium' => $is_premium));
}

// WEBHOOK (Cashfree)
function mp_subs_webhook($request)
{
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
function mp_subs_protect_post_content($response, $post, $request)
{
    // Check if site is under maintenance, let it pass (handled by frontend)

    $user = mp_subs_get_user_from_request($request);
    $is_premium = false;

    if ($user) {
        $is_premium = get_user_meta($user->ID, 'is_premium', true) === 'true';

        // Allow higher roles to bypass the lock
        $allowed_roles = array('administrator', 'editor', 'author', 'contributor', 'standard');
        if (!$is_premium && !empty(array_intersect($allowed_roles, (array) $user->roles))) {
            $is_premium = true;
        }
    }

    // Check if the post is marked as free. If it's NOT marked as 'yes' (free), it defaults to premium.
    $is_free_post = get_post_meta($post->ID, 'is_free_post', true) === 'yes';
    $is_premium_post = !$is_free_post;

    $response->data['is_premium_type'] = $is_premium_post;

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
function mp_subs_create_order($request)
{
    $body = json_decode($request->get_body(), true);

    $username = $body['username'] ?? 'Premium User';
    $email = $body['email'] ?? 'user@example.com';
    $id = $body['id'] ?? 'GUEST';
    $amount = $body['amount'] ?? 99.00;

    $orderId = 'ORDER_' . time() . '_' . rand(100, 999);

    $customer_id = (!$id || $id === 'GUEST') ? 'GUEST_' . time() : (string) $id;

    $payload = array(
        'order_amount' => (float) $amount,
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
        'method' => 'POST',
        'headers' => array(
            'Content-Type' => 'application/json',
            'x-client-id' => CASHFREE_APP_ID,
            'x-client-secret' => CASHFREE_SECRET_KEY,
            'x-api-version' => '2023-08-01'
        ),
        'body' => json_encode($payload),
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
// ADD META BOX FOR FREE CONTENT
// ---------------------------------------------------------
add_action('add_meta_boxes', 'mp_subs_add_free_meta_box');
function mp_subs_add_free_meta_box()
{
    add_meta_box(
        'mp_subs_free_box',
        'Free Content Setting',
        'mp_subs_free_meta_box_html',
        'post',
        'side',
        'default'
    );
}

function mp_subs_free_meta_box_html($post)
{
    $value = get_post_meta($post->ID, 'is_free_post', true);
    $checked = ($value === 'yes') ? 'checked' : '';
    ?>
    <label for="mp_subs_is_free_post">
        <input type="checkbox" name="mp_subs_is_free_post" id="mp_subs_is_free_post" value="yes" <?php echo $checked; ?>>
        Make this post FREE (no subscription required). By default, all posts are Premium.
    </label>
    <?php
}

add_action('save_post', 'mp_subs_save_free_meta_box');
function mp_subs_save_free_meta_box($post_id)
{
    if (array_key_exists('mp_subs_is_free_post', $_POST)) {
        update_post_meta(
            $post_id,
            'is_free_post',
            $_POST['mp_subs_is_free_post']
        );
    } else {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
            return;
        if (!current_user_can('edit_post', $post_id))
            return;

        update_post_meta($post_id, 'is_free_post', 'no');
    }
}

// ---------------------------------------------------------
// AUTOMATIC 2-WAY CONTENT SYNC
// ---------------------------------------------------------
// 1. Register the meta field so the REST API can read/write it
add_action('init', function() {
    register_post_meta('post', '_remote_post_id', array(
        'show_in_rest' => true,
        'single'       => true,
        'type'         => 'integer',
        'auth_callback'=> function() { return current_user_can('edit_posts'); }
    ));
});

// Helper: Sync a specific taxonomy (categories or tags)
function mp_subs_sync_terms($post_id, $taxonomy, $remote_api_url, $headers) {
    $terms = wp_get_post_terms($post_id, $taxonomy);
    if (empty($terms) || is_wp_error($terms)) return array();

    $remote_ids = array();
    $endpoint = rtrim(str_replace('/posts', '', $remote_api_url), '/') . '/' . ($taxonomy === 'post_tag' ? 'tags' : 'categories');

    foreach ($terms as $term) {
        // Check if term exists remotely by slug
        $search_url = $endpoint . '?slug=' . urlencode($term->slug);
        $search_res = wp_remote_get($search_url, array('headers' => $headers, 'timeout' => 15));
        
        $remote_term_id = null;
        if (!is_wp_error($search_res) && wp_remote_retrieve_response_code($search_res) === 200) {
            $body = json_decode(wp_remote_retrieve_body($search_res), true);
            if (!empty($body) && isset($body[0]['id'])) {
                $remote_term_id = $body[0]['id'];
            }
        }

        // If it doesn't exist, create it
        if (!$remote_term_id) {
            $create_res = wp_remote_post($endpoint, array(
                'headers' => $headers,
                'body'    => json_encode(array('name' => $term->name, 'slug' => $term->slug)),
                'timeout' => 15
            ));
            if (!is_wp_error($create_res) && wp_remote_retrieve_response_code($create_res) === 201) {
                $body = json_decode(wp_remote_retrieve_body($create_res), true);
                if (isset($body['id'])) {
                    $remote_term_id = $body['id'];
                }
            }
        }

        if ($remote_term_id) {
            $remote_ids[] = $remote_term_id;
        }
    }
    return $remote_ids;
}

// Helper: Sync Featured Image
function mp_subs_sync_featured_image($post_id, $remote_api_url, $auth_header) {
    $thumb_id = get_post_thumbnail_id($post_id);
    if (!$thumb_id) return null;

    // Check if we've already synced this specific attachment ID
    $mapped_thumb_id = get_post_meta($post_id, '_remote_thumbnail_id_mapping', true);
    $mapped_local_thumb_id = get_post_meta($post_id, '_synced_local_thumbnail_id', true);

    // If it's already synced and the image hasn't changed, return the remote ID
    if ($mapped_thumb_id && $mapped_local_thumb_id == $thumb_id) {
        return $mapped_thumb_id;
    }

    $image_path = get_attached_file($thumb_id);
    if (!$image_path || !file_exists($image_path)) return null;

    $endpoint = rtrim(str_replace('/posts', '', $remote_api_url), '/') . '/media';
    
    $file_content = file_get_contents($image_path);
    $filename = basename($image_path);
    $mime_type = wp_check_filetype($image_path)['type'] ?: 'image/jpeg';

    $headers = array(
        'Authorization' => $auth_header,
        'Content-Type'  => $mime_type,
        'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        'X-MP-Sync'     => 'true'
    );

    $response = wp_remote_post($endpoint, array(
        'headers' => $headers,
        'body'    => $file_content,
        'timeout' => 30
    ));

    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 201) {
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (isset($body['id'])) {
            // Save mapping so we don't upload again unless image changes
            update_post_meta($post_id, '_remote_thumbnail_id_mapping', $body['id']);
            update_post_meta($post_id, '_synced_local_thumbnail_id', $thumb_id);
            return $body['id'];
        }
    }
    return null;
}

// 2. Hook into post saves
add_action('save_post', 'mp_subs_sync_post_to_destination', 10, 3);

function mp_subs_sync_post_to_destination($post_id, $post, $update) {
    // Prevent infinite loop if this request is from our own sync script
    if (isset($_SERVER['HTTP_X_MP_SYNC']) && $_SERVER['HTTP_X_MP_SYNC'] === 'true') {
        return;
    }

    // Only sync standard posts and avoid autosaves or revisions
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if ($post->post_type !== 'post') return;
    if (wp_is_post_revision($post_id)) return;

    // --- CONFIGURATION ---
    // Make sure to swap these depending on which site this plugin is installed on!
    $remote_api_url = 'https://sridharsilver.gt.tc/te/wp-json/wp/v2/posts';
    $remote_username = 'admin'; 
    $remote_app_password = 'REPLACE_WITH_YOUR_DESTINATION_APPLICATION_PASSWORD'; 
    // ---------------------

    $remote_post_id = get_post_meta($post_id, '_remote_post_id', true);
    $endpoint = $remote_api_url;
    $method = 'POST';

    if ($remote_post_id) {
        $endpoint = rtrim($remote_api_url, '/') . '/' . $remote_post_id;
        $method = 'PUT'; // Update existing remote post
    } else {
        if ($post->post_status !== 'publish') {
            return;
        }
    }

    $auth_header = 'Basic ' . base64_encode($remote_username . ':' . $remote_app_password);
    $json_headers = array(
        'Authorization' => $auth_header,
        'Content-Type'  => 'application/json',
        'X-MP-Sync'     => 'true' // Add our custom header to prevent infinite loops
    );

    // Sync terms
    $remote_categories = mp_subs_sync_terms($post_id, 'category', $remote_api_url, $json_headers);
    $remote_tags = mp_subs_sync_terms($post_id, 'post_tag', $remote_api_url, $json_headers);

    // Sync featured image
    $remote_media_id = mp_subs_sync_featured_image($post_id, $remote_api_url, $auth_header);

    // Prepare the post data to send
    $post_data = array(
        'title'      => $post->post_title,
        'content'    => $post->post_content,
        'status'     => $post->post_status,
        'categories' => $remote_categories,
        'tags'       => $remote_tags,
        'meta'       => array('_remote_post_id' => $post_id)
    );

    if ($remote_media_id) {
        $post_data['featured_media'] = $remote_media_id;
    }

    $response = wp_remote_request($endpoint, array(
        'method'  => $method,
        'headers' => $json_headers,
        'body'    => json_encode($post_data),
        'timeout' => 30, // Increased timeout for potential media uploads
        'blocking' => true // Need to block to get the new ID back
    ));

    if (!is_wp_error($response)) {
        $response_code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        // If we just created the post remotely, save their new ID in our database
        if ($response_code === 201 && !$remote_post_id && isset($body['id'])) {
            update_post_meta($post_id, '_remote_post_id', $body['id']);
        }
    }
}
