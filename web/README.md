# RN Recycle Web Files for InfinityFree Hosting

This directory contains PHP files optimized for InfinityFree hosting.

## Files Included

### Main Pages
- `index.php` - Main landing page with visitor counter and dynamic content
- `privacy.php` - Privacy policy page
- `terms.php` - Terms of service page  
- `support.php` - Support center with contact form and FAQ

### Configuration
- `.htaccess` - Apache configuration for URL rewriting, security, and performance
- `404.php` - Custom 404 error page

### Original Files (for reference)
- `index.html` - Original static HTML file
- `privacy.html` - Original privacy page
- `terms.html` - Original terms page
- `support.html` - Original support page
- `netlify.toml` - Netlify configuration (not needed for InfinityFree)

## Features Added for PHP Version

### Dynamic Content
- Visitor counter on homepage
- Current year in copyright notices
- Dynamic app name and contact email variables
- Last updated dates for legal pages

### Contact Form
- Working contact form on support.php
- Form validation and error handling
- Messages logged to `contact_messages.log`
- Email validation

### Security & Performance
- Security headers via .htaccess
- File access restrictions for log files
- Compression and caching rules
- Clean URLs (removes .php extension)

### InfinityFree Optimizations
- Error logging enabled but hidden from visitors
- Compatible with InfinityFree's PHP environment
- Proper file permissions and access controls

## Upload Instructions for InfinityFree

1. Upload all `.php` files to your public_html directory
2. Upload the `.htaccess` file
3. Set proper file permissions (644 for files, 755 for directories)
4. The contact form will create log files automatically

## File Permissions
- PHP files: 644
- .htaccess: 644
- Log files (auto-created): 644

## Notes
- The visitor counter uses a simple text file (`visitors.txt`)
- Contact form messages are logged to `contact_messages.log`
- All sensitive files are protected via .htaccess
- URLs work with or without .php extension (e.g., both `/support` and `/support.php` work)

## Contact
For questions about this setup: davidsuballa@gmail.com
