<?php
$app_name = "Recycle App";
$current_year = date('Y');
$contact_email = "davidsuballa@gmail.com";

// Handle contact form submission
$message_sent = false;
$error_message = "";

if ($_POST && isset($_POST['name']) && isset($_POST['email']) && isset($_POST['message'])) {
    $name = htmlspecialchars(trim($_POST['name']));
    $email = htmlspecialchars(trim($_POST['email']));
    $message = htmlspecialchars(trim($_POST['message']));
    $subject = htmlspecialchars(trim($_POST['subject']));
    
    if (!empty($name) && !empty($email) && !empty($message)) {
        // Simple email validation
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            // Log the message (in a real scenario, you'd send an email)
            $log_entry = date('Y-m-d H:i:s') . " - Contact Form Submission\n";
            $log_entry .= "Name: $name\n";
            $log_entry .= "Email: $email\n";
            $log_entry .= "Subject: $subject\n";
            $log_entry .= "Message: $message\n";
            $log_entry .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n\n";
            
            file_put_contents('contact_messages.log', $log_entry, FILE_APPEND | LOCK_EX);
            $message_sent = true;
        } else {
            $error_message = "Please enter a valid email address.";
        }
    } else {
        $error_message = "Please fill in all required fields.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support - <?php echo $app_name; ?></title>
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
        
        .content {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
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
        
        .faq-item {
            margin-bottom: 2rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .contact-form {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #2c5530;
        }
        
        input, textarea, select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
        }
        
        textarea {
            height: 120px;
            resize: vertical;
        }
        
        .btn {
            background: #2c5530;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #1e3a21;
        }
        
        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 1rem;
        }
        
        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 1rem;
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
                <h1>Support Center</h1>
                <p>We're here to help you make the most of <?php echo $app_name; ?></p>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="content">
            <h2>Frequently Asked Questions</h2>
            
            <div class="faq-item">
                <h3>How accurate is the AI recycling recognition?</h3>
                <p>Our AI model has been trained on thousands of images and achieves high accuracy for common recyclable items. However, always verify with your local recycling guidelines as rules can vary by location.</p>
            </div>
            
            <div class="faq-item">
                <h3>Why do I need to sign in with Google?</h3>
                <p>Google OAuth provides secure authentication and allows us to save your scan history and recycling progress. Your Google account information is kept private and secure.</p>
            </div>
            
            <div class="faq-item">
                <h3>Can I use the app without an internet connection?</h3>
                <p>The AI recognition requires an internet connection to process images. However, you can browse previously saved recycling guides offline.</p>
            </div>
            
            <div class="faq-item">
                <h3>How do I find recycling centers near me?</h3>
                <p>Use the "Find Locations" feature in the app. Make sure location permissions are enabled to get the most accurate results.</p>
            </div>
            
            <div class="faq-item">
                <h3>Is my data safe and private?</h3>
                <p>Yes! We use industry-standard encryption and security measures. Read our Privacy Policy for detailed information about how we protect your data.</p>
            </div>
            
            <div class="faq-item">
                <h3>Can I delete my account and data?</h3>
                <p>Absolutely. You can delete your account and all associated data at any time through the app settings.</p>
            </div>

            <h2>Supported Materials</h2>
            <p>Our AI can recognize and provide guidance for these material categories:</p>
            <ul>
                <li><strong>Paper & Cardboard:</strong> Boxes, newspapers, magazines, office paper</li>
                <li><strong>Plastics:</strong> Bottles, containers, bags (various plastic types)</li>
                <li><strong>Metals:</strong> Cans, foil, metal bars, utensils</li>
                <li><strong>Textiles:</strong> Cotton, denim, corduroy, chiffon</li>
                <li><strong>Wood:</strong> Furniture, construction materials</li>
                <li><strong>Glass:</strong> Bottles, jars, cups</li>
                <li><strong>Electronics:</strong> Basic guidance for e-waste</li>
            </ul>

            <h2>Troubleshooting</h2>
            <h3>App won't recognize my item</h3>
            <ul>
                <li>Ensure good lighting when taking photos</li>
                <li>Try different angles or distances</li>
                <li>Clean the item if it's dirty or obscured</li>
                <li>Check if the item is in our supported materials list</li>
            </ul>
            
            <h3>Login issues</h3>
            <ul>
                <li>Check your internet connection</li>
                <li>Make sure you're using the same Google account</li>
                <li>Try logging out and back in</li>
                <li>Clear the app cache if problems persist</li>
            </ul>
        </div>

        <div class="contact-form">
            <h2>Contact Us</h2>
            
            <?php if ($message_sent): ?>
                <div class="success-message">
                    <strong>Thank you!</strong> Your message has been sent successfully. We'll get back to you soon.
                </div>
            <?php endif; ?>
            
            <?php if ($error_message): ?>
                <div class="error-message">
                    <strong>Error:</strong> <?php echo $error_message; ?>
                </div>
            <?php endif; ?>
            
            <p>Can't find what you're looking for? Send us a message and we'll help you out!</p>
            
            <form method="POST" action="">
                <div class="form-group">
                    <label for="name">Name *</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="subject">Subject</label>
                    <select id="subject" name="subject">
                        <option value="General Question">General Question</option>
                        <option value="Technical Issue">Technical Issue</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Bug Report">Bug Report</option>
                        <option value="Account Issue">Account Issue</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="message">Message *</label>
                    <textarea id="message" name="message" placeholder="Please describe your question or issue in detail..." required></textarea>
                </div>
                
                <button type="submit" class="btn">Send Message</button>
            </form>
            
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee;">
                <h3>Other Ways to Reach Us</h3>
                <p><strong>Email:</strong> <a href="mailto:<?php echo $contact_email; ?>"><?php echo $contact_email; ?></a></p>
                <p><strong>Response Time:</strong> We typically respond within 24-48 hours</p>
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
