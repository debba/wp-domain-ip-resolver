# WP Domain IP Resolver

**A WordPress plugin to customize domain-to-IP mappings for HTTP requests - perfect for testing, development, and load balancing.**

## Description

Domain IP Resolver allows you to override DNS resolution for specific domains and ports within WordPress, forcing them to resolve to custom IP addresses. This is particularly useful for:

- **Development and Testing**: Test against staging servers without changing DNS settings
- **Load Balancing**: Route traffic to specific servers based on domain/port combinations
- **Local Development**: Point production domains to local development environments
- **CDN Testing**: Test different CDN endpoints without DNS changes
- **Debugging**: Troubleshoot connectivity issues by bypassing DNS resolution

## Features

- ✅ **Easy-to-use Interface**: Simple admin panel with dynamic table management
- ✅ **Domain:Port Mapping**: Specify exact port mappings for precise control
- ✅ **IPv4 & IPv6 Support**: Works with both IPv4 and IPv6 addresses
- ✅ **Duplicate Prevention**: Built-in validation prevents duplicate mappings
- ✅ **Real-time Validation**: Client-side and server-side validation
- ✅ **JSON Storage**: Efficient data storage and retrieval
- ✅ **Translation Ready**: Fully localized with English translations

## Installation

1. Download the plugin files
2. Upload to your WordPress `/wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Navigate to **Settings > Domain IP Resolver** to configure

## Usage

### Basic Configuration

1. Go to **Settings > Domain IP Resolver** in your WordPress admin
2. Click **Add Row** to create a new mapping
3. Enter the domain name (e.g., `api.example.com`)
4. Specify the port (e.g., `443` for HTTPS, `80` for HTTP)
5. Enter the target IP address (e.g., `192.168.1.100`)
6. Click **Save Changes**

### Example Configurations

**Redirect API calls to staging server:**
- Domain: `api.mysite.com`
- Port: `443`
- IP: `192.168.1.50`

**Local development setup:**
- Domain: `mysite.com`
- Port: `80`
- IP: `127.0.0.1`

**CDN testing:**
- Domain: `cdn.mysite.com`
- Port: `443`
- IP: `203.0.113.10`

## Technical Details

### How It Works

The plugin uses WordPress's `http_api_curl` filter to intercept HTTP requests and applies custom DNS resolution using cURL's `CURLOPT_RESOLVE` option. This method:

- Only affects WordPress HTTP requests (wp_remote_get, wp_remote_post, etc.)
- Doesn't modify system-wide DNS settings
- Works with SSL/TLS connections
- Supports both IPv4 and IPv6 addresses

### Validation

The plugin includes comprehensive validation:
- **Domain validation**: Ensures valid domain format
- **Port validation**: Checks port range (1-65535)
- **IP validation**: Validates IPv4 and IPv6 addresses
- **Duplicate prevention**: Prevents duplicate domain:port combinations

### Data Storage

Mappings are stored as JSON in the WordPress options table for optimal performance and easy backup/restore capabilities.

## Requirements

- WordPress 4.7 or higher
- PHP 7.0 or higher
- cURL extension enabled

## Frequently Asked Questions

**Q: Does this affect all web traffic on my server?**
A: No, this only affects HTTP requests made by WordPress itself using wp_remote_get, wp_remote_post, and similar functions.

**Q: Can I use this for external API calls?**
A: Yes, this is perfect for redirecting API calls to staging servers or alternate endpoints.

**Q: Does it work with SSL/HTTPS?**
A: Yes, the plugin works with both HTTP and HTTPS requests.

**Q: Can I backup my mappings?**
A: Yes, the data is stored in WordPress options and will be included in standard WordPress backups.

## Support

For support, feature requests, or bug reports, please contact the plugin author or submit an issue through the appropriate channels.

## License

This plugin is licensed under the GPL v2 or later.

## Author

**dueclic**  
Website: [https://www.dueclic.com](https://www.dueclic.com)

---

*Version 1.0.0 - Built with WordPress best practices and security in mind.*
