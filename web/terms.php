<?php
$app_name = "Recycle App";
$current_year = date('Y');
$last_updated = "December 2024";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Service - <?php echo $app_name; ?></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        header {
            background: #2c5530;
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
        }
        
        .header-content {
            text-align: center;
        }
        
        .back-link {
            color: #F2E0AE;
            text-decoration: none;
            margin-bottom: 1rem;
            display: inline-block;
        }
        
        .back-link:hover {
            text-decoration: underline;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .last-updated {
            font-size: 1rem;
            opacity: 0.9;
        }
        
        .content {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h2 {
            color: #2c5530;
            margin: 2rem 0 1rem 0;
            font-size: 1.5rem;
        }
        
        h3 {
            color: #2c5530;
            margin: 1.5rem 0 0.5rem 0;
        }
        
        p {
            margin-bottom: 1rem;
        }
        
        ul {
            margin: 1rem 0 1rem 2rem;
        }
        
        li {
            margin-bottom: 0.5rem;
        }
        
        .contact-info {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 5px;
            margin: 2rem 0;
        }
        
        footer {
            text-align: center;
            margin-top: 3rem;
            padding: 2rem 0;
            color: #666;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <a href="index.php" class="back-link">← Back to Home</a>
                <h1>Terms of Service</h1>
                <p class="last-updated">Last updated: <?php echo $last_updated; ?></p>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="content">
            <p>Welcome to <?php echo $app_name; ?>. These Terms of Service ("Terms") govern your use of our mobile application and services.</p>

            <h2>Acceptance of Terms</h2>
            <p>By downloading, installing, or using <?php echo $app_name; ?>, you agree to be bound by these Terms. If you do not agree to these Terms, do not use our service.</p>

            <h2>Description of Service</h2>
            <p><?php echo $app_name; ?> is a mobile application that provides:</p>
            <ul>
                <li>AI-powered recycling recognition and classification</li>
                <li>Recycling guides and educational content</li>
                <li>Tracking of recycling activities and environmental impact</li>
                <li>Location services for finding recycling centers</li>
                <li>Creative ideas for repurposing items</li>
            </ul>

            <h2>User Accounts</h2>
            <p>To use certain features, you must create an account using Google OAuth. You are responsible for:</p>
            <ul>
                <li>Maintaining the security of your account</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us of any unauthorized use</li>
            </ul>

            <h2>Acceptable Use</h2>
            <p>You agree to use <?php echo $app_name; ?> only for lawful purposes. You may not:</p>
            <ul>
                <li>Upload inappropriate, offensive, or copyrighted content</li>
                <li>Attempt to reverse engineer or hack the application</li>
                <li>Use the service to spam or harass others</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Share your account credentials with others</li>
            </ul>

            <h2>Content and Intellectual Property</h2>
            <h3>Your Content</h3>
            <p>You retain ownership of photos and content you upload. By using our service, you grant us a license to process your content for the purpose of providing recycling analysis and improving our AI models.</p>
            
            <h3>Our Content</h3>
            <p>All content provided by <?php echo $app_name; ?>, including recycling guides, AI models, and app design, is protected by intellectual property laws and remains our property.</p>

            <h2>AI Recognition Disclaimer</h2>
            <p>Our AI recycling recognition is provided for informational purposes only. While we strive for accuracy:</p>
            <ul>
                <li>Results may not always be 100% accurate</li>
                <li>Always verify with local recycling guidelines</li>
                <li>We are not responsible for incorrect disposal based on our suggestions</li>
                <li>Local recycling rules may vary and take precedence</li>
            </ul>

            <h2>Privacy</h2>
            <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.</p>

            <h2>Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, <?php echo $app_name; ?> shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>

            <h2>Service Availability</h2>
            <p>We strive to maintain service availability but do not guarantee uninterrupted access. We may:</p>
            <ul>
                <li>Perform maintenance that temporarily interrupts service</li>
                <li>Modify or discontinue features with notice</li>
                <li>Suspend accounts that violate these Terms</li>
            </ul>

            <h2>Termination</h2>
            <p>You may terminate your account at any time through the app settings. We may terminate or suspend your account if you violate these Terms.</p>

            <h2>Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of significant changes through the app or email. Continued use after changes constitutes acceptance of the new Terms.</p>

            <h2>Governing Law</h2>
            <p>These Terms are governed by the laws of the jurisdiction where our company is registered, without regard to conflict of law principles.</p>

            <div class="contact-info">
                <h3>Contact Information</h3>
                <p>If you have questions about these Terms, please contact us:</p>
                <p><strong>Email:</strong> davidsuballa@gmail.com</p>
                <p><strong>App:</strong> Use the "Support" section in the app</p>
            </div>
        </div>
    </div>

    <footer>
        <div class="container">
            <p>&copy; <?php echo $current_year; ?> <?php echo $app_name; ?>. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
