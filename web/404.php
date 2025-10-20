<?php
$app_name = "Recycle App";
http_response_code(404);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found - <?php echo $app_name; ?></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #F2E0AE 0%, #E8D5A3 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }
        
        .error-container {
            text-align: center;
            background: white;
            padding: 3rem;
            border-radius: 15px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.1);
            max-width: 500px;
        }
        
        .error-code {
            font-size: 6rem;
            font-weight: bold;
            color: #2c5530;
            margin-bottom: 1rem;
        }
        
        h1 {
            color: #2c5530;
            margin-bottom: 1rem;
        }
        
        p {
            margin-bottom: 2rem;
            color: #666;
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
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <a href="index.php" class="btn">🏠 Back to Home</a>
    </div>
</body>
</html>
