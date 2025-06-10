<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/Conexion.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    if ($method === 'GET') {
        $usuario_id = $_GET['usuario_id'];
        $sql = "SELECT * FROM actividades WHERE usuario_id = ? ORDER BY fecha_creacion DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $actividades = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($actividades);
        exit;
    }
    // POST: Crear nueva actividad
    elseif ($method === 'POST') {
        $usuario_id = $input['usuario_id'];
        $nombre = $input['nombre'];
        $fecha_creacion = $input['fecha_creacion'];
        $sql = "INSERT INTO actividades (usuario_id, nombre, fecha_creacion) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iss", $usuario_id, $nombre, $fecha_creacion);
        $stmt->execute();
        echo json_encode(['success' => true]);
        exit;
    } elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!empty($input['sumar_tiempo'])) {
            $id = $input['id'];
            $tiempo = $input['tiempo'];
            $usuario_id = $input['usuario_id'];
            $sql = "UPDATE actividades SET tiempo_total = tiempo_total + ? WHERE id = ? AND usuario_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iii", $tiempo, $id, $usuario_id);
            $stmt->execute();
            echo json_encode(['success' => true]);
            exit;
        }
        $id = $input['id'];
        $nombre = $input['nombre'];
        $usuario_id = $input['usuario_id'];
        $sql = "UPDATE actividades SET nombre=? WHERE id=? AND usuario_id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sii", $nombre, $id, $usuario_id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        exit;
    } elseif ($method === 'DELETE') {
        $id = $input['id'];
        $usuario_id = $input['usuario_id'];
        $sql = "DELETE FROM actividades WHERE id=? AND usuario_id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $id, $usuario_id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}
?>