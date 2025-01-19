<?php
header('Content-Type: application/json');

// Database connection settings
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "house_rental_latest";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Get the search query and category from query parameters
$searchQuery = isset($_GET['searchQuery']) ? $_GET['searchQuery'] : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';

// SQL query to fetch data from the houses table
$sql = "SELECT h.id, h.house_no, h.price, h.description, c.name AS category 
        FROM houses h 
        INNER JOIN categories c ON h.category_id = c.id 
        WHERE (c.name LIKE ?  OR h.price LIKE ? )";

if (!empty($category)) {
    $sql .= " AND c.name = ?";
}

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["error" => "Failed to prepare the SQL query."]);
    exit();
}

// Bind parameters to the query
$searchParam = '%' . $searchQuery . '%';
if (!empty($category)) {
    $stmt->bind_param("sss", $searchParam, $searchParam, $category);
} else {
    $stmt->bind_param("ss", $searchParam, $searchParam);
}

// Execute the query
if ($stmt->execute()) {
    $result = $stmt->get_result();
    $houses = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode($houses);
} else {
    echo json_encode(["error" => "Failed to execute the SQL query."]);
}

$stmt->close();
$conn->close();
?>
