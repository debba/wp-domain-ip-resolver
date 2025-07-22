<?php
/*
Plugin Name: WP Domain IP Resolver
Description: Customize domain-to-IP mappings for HTTP requests in WordPress - perfect for testing, development, and load balancing.
Author: dueclic
Author URI: https://www.dueclic.com
Version: 1.0.0
Text Domain: wp-domain-ip-resolver
*/

if (!defined('ABSPATH'))
    exit;


add_action('admin_menu', function () {
    add_options_page(__('Domain IP Resolver', 'wp-domain-ip-resolver'), __('Domain IP Resolver', 'wp-domain-ip-resolver'), 'manage_options', 'forced-dns-mapper', 'fdm_admin_page');
});

// Enqueue admin scripts and styles
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'settings_page_forced-dns-mapper') {
        return;
    }

    wp_enqueue_style('fdm-admin-css', plugin_dir_url(__FILE__) . 'assets/admin.css', [], '1.1.0');
    wp_enqueue_script('fdm-admin-js', plugin_dir_url(__FILE__) . 'assets/admin.js', ['jquery'], '1.1.0', true);

    // Localize script for translations
    wp_localize_script('fdm-admin-js', 'fdmVars', [
        'rowText' => __('Row', 'wp-domain-ip-resolver'),
        'domainMissingText' => __('domain missing', 'wp-domain-ip-resolver'),
        'invalidPortText' => __('invalid port', 'wp-domain-ip-resolver'),
        'invalidIpText' => __('invalid IP', 'wp-domain-ip-resolver'),
        'duplicateText' => __('duplicate domain:port', 'wp-domain-ip-resolver'),
        'fixErrorsText' => __('Please fix errors before saving!', 'wp-domain-ip-resolver'),
        'removeText' => __('Remove this mapping', 'wp-domain-ip-resolver'),
        'savedText' => __('Settings saved successfully!', 'wp-domain-ip-resolver'),
    ]);
});

function fdm_admin_page()
{
    ?>
    <div class="wrap">
        <h1><?php _e('Domain IP Resolver', 'wp-domain-ip-resolver'); ?></h1>
        <div class="fdm-card">
            <div class="fdm-section-header">
                <h2 class="fdm-section-title"><?php _e('Domain Mapping Configuration', 'wp-domain-ip-resolver'); ?></h2>
            </div>
            <form method="post" action="options.php">
                <?php
                settings_fields('fdm_settings_group');
                do_settings_sections('forced-dns-mapper');
                submit_button();
                ?>
            </form>
        </div>
        <div class="fdm-dark-mode-toggle" id="fdm-dark-mode-toggle" title="<?php _e('Toggle Dark Mode', 'wp-domain-ip-resolver'); ?>">
            <span class="fdm-dark-icon">🌙</span>
        </div>
    </div>
    <?php
}

add_action('admin_init', function () {
    register_setting('fdm_settings_group', 'fdm_hosts_mapping');

    add_settings_section('fdm_main_section', '', [], 'forced-dns-mapper');

    add_settings_field('fdm_hosts_mapping_field', '', 'fdm_render_field', 'forced-dns-mapper', 'fdm_main_section');
});

function fdm_render_field()
{
    $data = get_option('fdm_hosts_mapping', json_encode([]));
    $rows = [];
    $decoded = json_decode($data, true);
    if (is_array($decoded)) {
        foreach ($decoded as $host_port => $ip) {
            $parts = explode(':', $host_port);
            $host = $parts[0] ?? '';
            $port = $parts[1] ?? '';
            $rows[] = [
                'host' => esc_attr($host),
                'port' => esc_attr($port),
                'ip' => esc_attr($ip),
            ];
        }
    }
    ?>
    <table class="fdm-table" id="fdm-table">
        <thead>
            <tr>
                <th><?php _e('Domain', 'wp-domain-ip-resolver'); ?></th>
                <th><?php _e('Port', 'wp-domain-ip-resolver'); ?></th>
                <th><?php _e('IP Address', 'wp-domain-ip-resolver'); ?></th>
                <th><?php _e('Actions', 'wp-domain-ip-resolver'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php if ($rows):
                foreach ($rows as $row): ?>
                    <tr>
                        <td><input type="text" class="fdm-host" placeholder="example.com" value="<?php echo $row['host']; ?>" /></td>
                        <td><input type="number" class="fdm-port" min="1" max="65535" placeholder="443" value="<?php echo $row['port']; ?>" /></td>
                        <td><input type="text" class="fdm-ip" placeholder="192.168.1.1" value="<?php echo $row['ip']; ?>" /></td>
                        <td><span class="fdm-remove-row" title="<?php _e('Remove this mapping', 'wp-domain-ip-resolver'); ?>">&times;</span></td>
                    </tr>
                <?php endforeach; endif; ?>
        </tbody>
    </table>
    <button type="button" class="button fdm-add-row"><?php _e('Add New Mapping', 'wp-domain-ip-resolver'); ?></button>
    <input type="hidden" name="fdm_hosts_mapping" id="fdm_hosts_mapping" />
    <div class="fdm-error" id="fdm-error"></div>
    <p class="description"><?php _e('Configure domain-to-IP mappings for HTTP requests. Each domain:port combination must be unique. Perfect for testing, development environments, and load balancing scenarios.', 'wp-domain-ip-resolver'); ?></p>
    <?php
    // Server-side validation (in case of manual manipulation)
    $is_valid = json_decode($data, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo '<p class="fdm-error">JSON Error: ' . json_last_error_msg() . '</p>';
    } elseif (!is_array($is_valid)) {
        echo '<p class="fdm-error">' . __('Invalid format: JSON must represent an object.', 'wp-domain-ip-resolver') . '</p>';
    } else {
        $seen = [];
        foreach ($is_valid as $host_port => $ip) {
            if (isset($seen[$host_port])) {
                echo '<p class="fdm-error">' . __('Duplicate domain:port: ', 'wp-domain-ip-resolver') . esc_html($host_port) . '</p>';
            }
            $seen[$host_port] = true;
            $parts = explode(':', $host_port);
            if (count($parts) !== 2 || !$parts[0] || !is_numeric($parts[1]) || $parts[1] < 1 || $parts[1] > 65535) {
                echo '<p class="fdm-error">' . __('Invalid domain:port: ', 'wp-domain-ip-resolver') . esc_html($host_port) . '</p>';
            }
            if (!filter_var($ip, FILTER_VALIDATE_IP)) {
                echo '<p class="fdm-error">' . __('Invalid IP: ', 'wp-domain-ip-resolver') . esc_html($ip) . '</p>';
            }
        }
    }
}


add_filter('http_api_curl', function ($handle, $r, $url) {
    $json = get_option('fdm_hosts_mapping');
    $map = json_decode($json, true);

    if (!is_array($map))
        return;

    $parsed = parse_url($url);
    if (!isset($parsed['host']) || !isset($parsed['scheme']))
        return;

    $host = $parsed['host'];
    $port = isset($parsed['port']) ? $parsed['port'] : ($parsed['scheme'] === 'https' ? 443 : 80);
    $key = "$host:$port";

    if (isset($map[$key])) {
        curl_setopt($handle, CURLOPT_RESOLVE, ["$host:$port:{$map[$key]}"]);
    }
}, 10, 3);
