<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Usa la conexión centralizada
require_once __DIR__ . '/Conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Guardar alarma
    $data = json_decode(file_get_contents("php://input"), true);
    $usuario_id = $data['usuario_id'];
    $fecha_hora = $data['fecha_hora'];
    $sql = "INSERT INTO alarmas (usuario_id, fecha_hora) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $usuario_id, $fecha_hora);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Listar alarmas
    if (isset($_GET['usuario_id'])) {
        $usuario_id = $_GET['usuario_id'];
        if (isset($_GET['proximas'])) {
            // Solo alarmas en los próximos 5 minutos
            $sql = "SELECT * FROM alarmas WHERE usuario_id = ? AND fecha_hora BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 5 MINUTE)";
        } else {
            $sql = "SELECT * FROM alarmas WHERE usuario_id = ?";
        }
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $alarmas = [];
        while ($row = $result->fetch_assoc()) {
            $alarmas[] = $row;
        }
        echo json_encode($alarmas);
        exit();
    } else {
        echo json_encode(['error' => 'usuario_id requerido']);
        http_response_code(400);
        exit();
    }
}

// Editar alarma
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'];
    $fecha_hora = $data['fecha_hora'];
    $sql = "UPDATE alarmas SET fecha_hora = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $fecha_hora, $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'];
    $sql = "DELETE FROM alarmas WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit();
}
?>