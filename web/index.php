<?php
// PHP configuration for InfinityFree hosting
error_reporting(E_ALL & ~E_NOTICE);
ini_set('display_errors', 0);

// Basic PHP variables for dynamic content
$app_name = "Recycle App";
$current_year = date('Y');
$contact_email = "davidsuballa@gmail.com";
$app_version = "1.0";

// Simple visitor counter (optional)
$visitor_file = 'visitors.txt';
if (file_exists($visitor_file)) {
    $visitors = (int)file_get_contents($visitor_file);
} else {
    $visitors = 0;
}
$visitors++;
file_put_contents($visitor_file, $visitors);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $app_name; ?> - Smart Recycling App</title>
    <meta name="description" content="Smart recycling made simple with AI-powered recognition and comprehensive recycling guides.">
    <meta name="keywords" content="recycling, sustainability, AI, environment, waste management">
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
            background: linear-gradient(135deg, #F2E0AE 0%, #E8D5A3 100%);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 0;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.8rem;
            font-weight: bold;
            color: #2c5530;
        }
        
        nav ul {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        nav a {
            text-decoration: none;
            color: #333;
            font-weight: 500;
            transition: color 0.3s;
        }
        
        nav a:hover {
            color: #2c5530;
        }
        
        .hero {
            text-align: center;
            padding: 4rem 0;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #2c5530;
        }
        
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            color: #666;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 4rem 0;
        }
        
        .feature {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .feature h3 {
            color: #2c5530;
            margin-bottom: 1rem;
        }
        
        .download-section {
            text-align: center;
            padding: 4rem 0;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 20px;
            margin: 2rem 0;
        }
        
        .download-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
            flex-wrap: wrap;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #2c5530;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #1e3a21;
        }
        
        .stats {
            background: rgba(255, 255, 255, 0.9);
            padding: 1rem;
            border-radius: 10px;
            margin: 2rem 0;
            text-align: center;
            font-size: 0.9rem;
            color: #666;
        }
        
        footer {
            background: #2c5530;
            color: white;
            text-align: center;
            padding: 2rem 0;
            margin-top: 4rem;
        }
        
        .footer-links {
            margin-bottom: 1rem;
        }
        
        .footer-links a {
            color: white;
            text-decoration: none;
            margin: 0 1rem;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2rem;
            }
            
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }
            
            nav ul {
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <div class="logo"><img src="appLogo.png" alt="<?php echo $app_name; ?>" style="width: 32px; height: 32px; margin-right: 8px; vertical-align: middle;"><?php echo $app_name; ?></div>
                <nav>
                    <ul>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#download">Download</a></li>
                        <li><a href="privacy.php">Privacy</a></li>
                        <li><a href="terms.php">Terms</a></li>
                        <li><a href="support.php">Support</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h1>Smart Recycling Made Simple</h1>
                <p>Discover what's recyclable, learn proper disposal methods, and track your environmental impact with our AI-powered recycling assistant.</p>
                
                <div class="stats">
                    <p>🌍 Helping make the world more sustainable • Visitors: <?php echo number_format($visitors); ?> • Version <?php echo $app_version; ?></p>
                </div>
            </div>
        </section>

        <section id="features" class="container">
            <div class="features">
                <div class="feature">
                    <h3>🔍 AI Recognition</h3>
                    <p>Take a photo of any item and instantly learn if it's recyclable, what materials it contains, and how to dispose of it properly.</p>
                </div>
                
                <div class="feature">
                    <h3>📚 Recycling Guides</h3>
                    <p>Access comprehensive guides for different materials, local recycling programs, and step-by-step disposal instructions.</p>
                </div>
                
                <div class="feature">
                    <h3>📊 Track Impact</h3>
                    <p>Monitor your recycling history, see your environmental impact, and get personalized tips to improve your sustainability.</p>
                </div>
                
                <div class="feature">
                    <h3>💡 Creative Ideas</h3>
                    <p>Discover creative ways to repurpose items before recycling, with DIY projects and upcycling inspiration.</p>
                </div>
                
                <div class="feature">
                    <h3>🏪 Find Locations</h3>
                    <p>Locate nearby recycling centers, drop-off points, and specialized disposal facilities for different materials.</p>
                </div>
                
                <div class="feature">
                    <h3>🔐 Secure & Private</h3>
                    <p>Your data is protected with Google OAuth authentication and secure cloud storage. We respect your privacy.</p>
                </div>
            </div>
        </section>

        <section id="download" class="container">
            <div class="download-section">
                <h2>Download <?php echo $app_name; ?></h2>
                <p>Available for iOS and Android devices</p>
                <div class="download-buttons">
                    <a href="#" class="btn">📱 Download for iOS</a>
                    <a href="#" class="btn">🤖 Download for Android</a>
                </div>
                <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
                    Coming soon to App Store and Google Play
                </p>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <div class="footer-links">
                <a href="privacy.php">Privacy Policy</a>
                <a href="terms.php">Terms of Service</a>
                <a href="support.php">Support</a>
            </div>
            <p>&copy; <?php echo $current_year; ?> <?php echo $app_name; ?>. Making the world more sustainable, one item at a time.</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                Contact: <a href="mailto:<?php echo $contact_email; ?>" style="color: #F2E0AE;"><?php echo $contact_email; ?></a>
            </p>
        </div>
    </footer>

    <?php
    // Simple analytics tracking (optional)
    $log_entry = date('Y-m-d H:i:s') . " - Visitor from " . $_SERVER['REMOTE_ADDR'] . "\n";
    file_put_contents('access.log', $log_entry, FILE_APPEND | LOCK_EX);
    ?>
</body>
</html>
