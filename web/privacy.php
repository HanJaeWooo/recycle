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
    <title>Privacy Policy - <?php echo $app_name; ?></title>
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
                <h1>Privacy Policy</h1>
                <p class="last-updated">Last updated: <?php echo $last_updated; ?></p>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="content">
            <p>At <?php echo $app_name; ?>, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile application.</p>

            <h2>Information We Collect</h2>
            
            <h3>Personal Information</h3>
            <ul>
                <li><strong>Google Account Information:</strong> When you sign in with Google OAuth, we collect your email address, name, and profile picture.</li>
                <li><strong>Photos:</strong> Images you take or upload for recycling analysis are processed locally and on our secure servers.</li>
                <li><strong>Usage Data:</strong> Information about how you use the app, including scan history and recycling activities.</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
                <li><strong>Device Information:</strong> Device type, operating system, and app version.</li>
                <li><strong>Location Data:</strong> Approximate location (if permitted) to find nearby recycling centers.</li>
                <li><strong>Analytics Data:</strong> App performance and usage statistics to improve our service.</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <ul>
                <li>Provide AI-powered recycling recognition and guidance</li>
                <li>Maintain your scan history and recycling progress</li>
                <li>Find nearby recycling centers and facilities</li>
                <li>Improve our AI models and app functionality</li>
                <li>Send important updates about the service</li>
                <li>Provide customer support</li>
            </ul>

            <h2>Data Storage and Security</h2>
            <p>Your data is stored securely using industry-standard encryption. We use:</p>
            <ul>
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Secure cloud storage with access controls</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data by authorized personnel only</li>
            </ul>

            <h2>Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information. We may share data only in these circumstances:</p>
            <ul>
                <li><strong>Service Providers:</strong> Third-party services that help us operate the app (Google Cloud, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Aggregated Data:</strong> Anonymous, aggregated statistics for research purposes</li>
            </ul>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt-out of non-essential communications</li>
            </ul>

            <h2>Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide services. You can delete your account at any time through the app settings.</p>

            <h2>Children's Privacy</h2>
            <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>

            <h2>Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy in the app and updating the "Last updated" date.</p>

            <div class="contact-info">
                <h3>Contact Us</h3>
                <p>If you have questions about this Privacy Policy, please contact us:</p>
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
