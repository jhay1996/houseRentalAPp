<?php
header('Content-Type: application/json');

// Database connection settings
$servername = "localhost";  // Replace with your database server
$username = "root";         // Replace with your database username
$password = "";             // Replace with your database password
$dbname = "house_rental_latest"; // Replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Get the category from the query string
$category = isset($_GET['category']) ? $_GET['category'] : 'BUILDING'; // Default to 'BUILDING'

// SQL query based on the category
$sql = "SELECT h.id, h.house_no, h.price, h.image, h.description FROM houses h inner join categories c WHERE c.name= ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["error" => "Failed to prepare the SQL query."]);
    exit();
}

// Bind the category parameter to the SQL query
$stmt->bind_param("s", $category);  // 's' is for string parameter

// Execute the query and get the result
if ($stmt->execute()) {
    $result = $stmt->get_result();

    // Fetch the data
    $houses = [];
    while ($row = $result->fetch_assoc()) {
        $houses[] = $row;
    }

    // Check if any houses were found
    if (count($houses) > 0) {
        echo json_encode($houses);  // Send the houses as JSON
    } else {
        echo json_encode(["error" => "No houses found for the selected category"]);
    }
} else {
    echo json_encode(["error" => "Failed to execute the SQL query."]);
}

// Close the database connection
$stmt->close();
$conn->close();
?>
