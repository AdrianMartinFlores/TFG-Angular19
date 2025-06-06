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
        $sql = "SELECT * FROM jornada WHERE usuario_id = ? ORDER BY fecha DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $registros = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($registros);
        exit;
    }
    // POST: Crear nuevo registro de jornada
    elseif ($method === 'POST') {
        $usuario_id = $input['usuario_id'];
        $fecha = $input['fecha'];
        $horaEntrada = $input['horaEntrada'];
        $horaSalida = isset($input['horaSalida']) ? $input['horaSalida'] : null;
        $actividad_id = isset($input['actividad_id']) ? $input['actividad_id'] : null;
        $duracion = isset($input['duracion']) ? $input['duracion'] : 0;

        $sql = "INSERT INTO jornada (usuario_id, fecha, horaEntrada, horaSalida, actividad_id, duracion) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isssii", $usuario_id, $fecha, $horaEntrada, $horaSalida, $actividad_id, $duracion);
        $stmt->execute();

        // Sumar duración a la actividad
        if ($actividad_id) {
            $sql2 = "UPDATE actividades SET tiempo_total = tiempo_total + ? WHERE id = ?";
            $stmt2 = $conn->prepare($sql2);
            $stmt2->bind_param("ii", $duracion, $actividad_id);
            $stmt2->execute();
        }

        echo json_encode(['success' => true]);
        exit;
    }
    // PUT: Actualizar registro de jornada
    elseif ($method === 'PUT') {
        $id = $input['id'];
        $fecha = $input['fecha'];
        $horaEntrada = $input['horaEntrada'];
        $horaSalida = isset($input['horaSalida']) ? $input['horaSalida'] : null;

        $sql = "UPDATE jornada SET fecha = ?, horaEntrada = ?, horaSalida = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssi", $fecha, $horaEntrada, $horaSalida, $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        exit;
    }
    // DELETE: Eliminar registro de jornada
    elseif ($method === 'DELETE') {
        $id = $input['id'];
        $sql = "DELETE FROM jornada WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}
?>