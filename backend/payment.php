<?php
header('Content-Type: application/json');

// Database connection settings
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "house_rental_latest";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connectionroom
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Handle POST request to add tenant
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = isset($_POST['name']) ? $_POST['name'] : '';
    $room = isset($_POST['room']) ? $_POST['room'] : '';
    $gcashImage = '';

    // Handle file upload if present
    if (isset($_FILES['gcash_image']) && $_FILES['gcash_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/';
        $gcashImage = $uploadDir . basename($_FILES['gcash_image']['name']);
        $fileType = strtolower(pathinfo($gcashImage, PATHINFO_EXTENSION));

        // Check if directory exists, create it if not
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Validate file type (only images)
        if (in_array($fileType, ['jpg', 'jpeg', 'png', 'gif'])) {
            if (!move_uploaded_file($_FILES['gcash_image']['tmp_name'], $gcashImage)) {
                echo json_encode(["error" => "Failed to upload GCASH image."]);
                exit();
            }
        } else {
            echo json_encode(["error" => "Invalid file type."]);
            exit();
        }
    }

    // Insert tenant data into the tenant_mobile table
    $stmt = $conn->prepare("INSERT INTO tenant_mobile (name, room, gcash_image) VALUES (?, ?, ?)");
    if ($stmt) {
        $stmt->bind_param("sss", $name, $room, $gcashImage);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Tenant added successfully."]);
        } else {
            echo json_encode(["error" => "Failed to add tenant."]);
        }

        $stmt->close();
    } else {
        echo json_encode(["error" => "Failed to prepare query."]);
    }
}

$conn->close();
?>
