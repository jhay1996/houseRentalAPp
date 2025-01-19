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

if ($method === 'GET') {
    // Fetch users from the database
    $result = $conn->query("SELECT id FROM requestfrom");
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    echo json_encode($users);
} elseif ($method === 'POST') {
    // Handle user registration
    $data = json_decode(file_get_contents("php://input"), true);  // Read incoming JSON

    // Check if required data is present
    if (isset($data['name']) && isset($data['room']) && isset($data['request'])) {
        $name = $data['name'];
        $room = $data['room'];
        $request = $data['request'];
        // Prepare SQL query to insert user data into the database
        $stmt = $conn->prepare("INSERT INTO requestfrom (name, room, request) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $name, $room , $request);

        // Execute the query and check success
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $conn->error]);
        }

        $stmt->close();
    } else {
        // If missing data, return an error message
        echo json_encode(["success" => false, "error" => "Missing data"]);
    }
}

// Close the database connection
$conn->close();
?>
