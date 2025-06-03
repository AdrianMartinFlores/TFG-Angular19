<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, DELETE, PUT, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
include_once __DIR__ . '/Conexion.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

if ($method === 'POST') {
    $nombre = $input['nombre'];
    $usuario_id = $input['usuario_id'];
    $sql = "INSERT INTO grupos_tareas (nombre, usuario_id) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $nombre, $usuario_id);
    $stmt->execute();
    echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
    exit();
}

if ($method === 'GET') {
    $usuario_id = $_GET['usuario_id'];
    $sql = "SELECT * FROM grupos_tareas WHERE usuario_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $grupos = [];
    while ($row = $result->fetch_assoc()) {
        $grupos[] = $row;
    }
    echo json_encode($grupos);
    exit();
}

// Modificar grupo
if ($method === 'PUT') {
    $id = $input['id'];
    $nombre = $input['nombre'];
    $sql = "UPDATE grupos_tareas SET nombre = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $nombre, $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit();
}

// Eliminar grupo
if ($method === 'DELETE') {
    $id = $input['id'];
    $sql = "DELETE FROM grupos_tareas WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit();
}
?>