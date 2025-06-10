<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once __DIR__ . '/Conexion.php'; // <-- Esto es necesario

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    $usuario_id = $_GET['usuario_id'];
    $stmt = $conn->prepare("SELECT id, nombre FROM grupos_tareas WHERE usuario_id = ?");
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $grupos = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($grupos);
    exit;
}

if ($method === 'POST') {
    $nombre = $input['nombre'];
    $usuario_id = $input['usuario_id'];
    $sql = "INSERT INTO grupos_tareas (nombre, usuario_id) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $nombre, $usuario_id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'PUT') {
    $id = $input['id'];
    $nombre = $input['nombre'];
    $usuario_id = $input['usuario_id'];
    $sql = "UPDATE grupos_tareas SET nombre = ? WHERE id = ? AND usuario_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sii", $nombre, $id, $usuario_id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'DELETE') {
    $id = $input['id'];
    $usuario_id = $input['usuario_id'];
    $sql = "DELETE FROM grupos_tareas WHERE id = ? AND usuario_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $id, $usuario_id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}
?>