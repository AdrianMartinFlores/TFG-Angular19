<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/Conexion.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    if ($method === 'GET') {
        $usuario_id = $_GET['usuario_id'];
        $grupo_id = isset($_GET['grupo_id']) ? $_GET['grupo_id'] : null;

        $sql = "SELECT * FROM tareas WHERE usuario_id = ?";
        $params = [$usuario_id];

        if ($grupo_id !== null && $grupo_id !== '' && $grupo_id !== 'null') {
            $sql .= " AND grupo_id = ?";
            $params[] = $grupo_id;
        }

        $stmt = $conn->prepare($sql);
        if (count($params) === 2) {
            $stmt->bind_param("ii", $params[0], $params[1]);
        } else {
            $stmt->bind_param("i", $params[0]);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $tareas = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($tareas);
        exit;
    } elseif ($method === 'POST') {
        $titulo = trim($input['titulo']);
        $descripcion = $input['descripcion'];
        $usuario_id = $input['usuario_id'];
        $grupo_id = isset($input['grupo_id']) ? $input['grupo_id'] : null;
        $completada = isset($input['completada']) ? (int)$input['completada'] : 0;
        $color = $input['color'] ?? '#23272f';

        if ($titulo === '') {
            echo json_encode(['success' => false, 'message' => 'El título no puede estar vacío']);
            exit;
        }

        // POST: Crear tarea
        $sql = "INSERT INTO tareas (titulo, descripcion, usuario_id, grupo_id, completada, color) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssiiss", $titulo, $descripcion, $usuario_id, $grupo_id, $completada, $color);
        $stmt->execute();

        echo json_encode(['success' => true]);
        exit;
    } elseif ($method === 'PUT') {
        $id = $input['id'];
        $usuario_id = $input['usuario_id'];
        $titulo = isset($input['titulo']) ? $input['titulo'] : null;
        $descripcion = isset($input['descripcion']) ? $input['descripcion'] : null;
        $grupo_id = isset($input['grupo_id']) ? $input['grupo_id'] : null;
        $completada = isset($input['completada']) ? (int)$input['completada'] : 0;

        // Color: por defecto si está completada, si no el que envía el usuario
        $color = $completada ? '#f6fafd' : ($input['color'] ?? '#f6fafd');

        //Actualizar tarea, coalesce devuelve el primer valor que no sea nul
        $sql = "UPDATE tareas SET 
            titulo = COALESCE(?, titulo),  
            descripcion = COALESCE(?, descripcion), 
            grupo_id = COALESCE(?, grupo_id), 
            completada = ?, 
            color = ?
            WHERE id = ? AND usuario_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssiisii", $titulo, $descripcion, $grupo_id, $completada, $color, $id, $usuario_id);
        $stmt->execute();

        echo json_encode(['success' => true]);
        exit;
    } elseif ($method === 'DELETE') {
        $id = null;
        if (isset($input['id'])) {
            $id = $input['id'];
        } elseif (isset($_GET['id'])) {
            $id = $_GET['id'];
        }

        if ($id !== null) {
            $sql = "DELETE FROM tareas WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'ID de tarea no proporcionado']);
        }
        exit;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>