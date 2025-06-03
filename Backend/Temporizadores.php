<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/Conexion.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$usuario_id = $_GET['usuario_id'] ?? $input['usuario_id'] ?? null;

if (!$usuario_id) {
    echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    exit;
}

try {
    switch ($method) {
        case 'GET':
            $stmt = $conn->prepare('SELECT * FROM temporizadores WHERE usuario_id = ?');
            $stmt->bind_param('i', $usuario_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $temporizadores = $result->fetch_all(MYSQLI_ASSOC);
            echo json_encode($temporizadores);
            break;

        case 'POST':
            $titulo = $input['titulo'];
            $duracion = $input['duracion'];
            $stmt = $conn->prepare('INSERT INTO temporizadores (titulo, duracion, usuario_id) VALUES (?, ?, ?)');
            $stmt->bind_param('sii', $titulo, $duracion, $usuario_id);
            $stmt->execute();
            echo json_encode(['success' => true, 'message' => 'Temporizador creado']);
            break;

        case 'PUT':
            $id = $input['id'];
            $titulo = $input['titulo'];
            $duracion = $input['duracion'];
            $stmt = $conn->prepare('UPDATE temporizadores SET titulo = ?, duracion = ? WHERE id = ? AND usuario_id = ?');
            $stmt->bind_param('siii', $titulo, $duracion, $id, $usuario_id);
            $stmt->execute();
            echo json_encode(['success' => true, 'message' => 'Temporizador actualizado']);
            break;

        case 'DELETE':
            $id = $input['id'] ?? null;
            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'Faltan parámetros para eliminar el temporizador']);
                exit;
            }
            $stmt = $conn->prepare('DELETE FROM temporizadores WHERE id = ? AND usuario_id = ?');
            $stmt->bind_param('ii', $id, $usuario_id);
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                echo json_encode(['success' => true, 'message' => 'Temporizador eliminado']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró el temporizador o no pertenece al usuario']);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>