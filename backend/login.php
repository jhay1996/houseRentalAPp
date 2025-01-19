<?php
// Enable error reporting to catch potential issues
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for Cross-Origin Resource Sharing (CORS) and content type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Database connection settings
$conn = new mysqli("localhost", "root", "", "house_rental_latest"); // Update with your DB credentials

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle different request methods
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Handle user login
    $data = json_decode(file_get_contents("php://input"), true);  // Read incoming JSON

    // Check if username and password are provided
    if (isset($data['username']) && isset($data['password'])) {
        $username = $data['username'];
        $password = $data['password'];

        // Prepare SQL query to check if user exists in the database
        $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);

        // Execute the query and check success
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // User found, now verify password
            $user = $result->fetch_assoc();
            
            // Use password_verify to check if the entered password matches the stored hash
            if (password_verify($password, $user['password'])) {
                echo json_encode(["success" => true, "user_id" => $user['id']]); // Return success and user ID
            } else {
                echo json_encode(["success" => false, "error" => "Incorrect password"]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "User not found"]);
        }

        $stmt->close();
    } else {
        // If missing data, return an error message
        echo json_encode(["success" => false, "error" => "Missing username or password"]);
    }
}

// Close the database connection
$conn->close();
?>
