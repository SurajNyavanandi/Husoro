<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

// Allow CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Check if form was submitted via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Get and sanitize form data
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    
    // Validation
    $errors = [];
    
    if (empty($name)) {
        $errors[] = "Name is required";
    }
    
    if (empty($email)) {
        $errors[] = "Email is required";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format";
    }
    
    if (empty($subject)) {
        $errors[] = "Subject is required";
    }
    
    if (empty($message)) {
        $errors[] = "Message is required";
    }
    
    // If there are validation errors
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => implode(', ', $errors)
        ]);
        exit;
    }
    
    // Email configuration - UPDATE THESE WITH YOUR DETAILS
    $to = "info@husoro.com"; // Your Hostinger email
    $email_subject = "New Contact Form Submission: " . $subject;
    
    // Create email body
    $email_body = "You have received a new message from your website contact form.\n\n";
    $email_body .= "Name: " . $name . "\n";
    $email_body .= "Email: " . $email . "\n";
    $email_body .= "Subject: " . $subject . "\n\n";
    $email_body .= "Message:\n" . $message . "\n\n";
    $email_body .= "---\n";
    $email_body .= "This message was sent from your HUSORO website contact form.\n";
    $email_body .= "Sent on: " . date('Y-m-d H:i:s') . "\n";
    
    // Email headers
    $headers = "From: " . $name . " <" . $email . ">\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // Send email
    if (mail($to, $email_subject, $email_body, $headers)) {
        // Success response
        echo json_encode([
            'success' => true,
            'message' => 'Message sent successfully! We\'ll get back to you soon.'
        ]);
    } else {
        // Error response
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to send message. Please try again or email us directly.'
        ]);
    }
    
} else {
    // Not a POST request
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}
?>