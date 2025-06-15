<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}
require_once __DIR__ . '/Conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $usuario_id = $input['usuario_id'];
    $fecha = $input['fecha'];
    $horaEntrada = $input['horaEntrada'];
    $horaSalida = $input['horaSalida'];
    $nombre = $input['nombre'];
    $duracion = isset($input['duracion']) ? intval($input['duracion']) : null;

    if ($duracion !== null) {
        $sql = "INSERT INTO jornada (usuario_id, fecha, horaEntrada, horaSalida, nombre, duracion)
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issssi", $usuario_id, $fecha, $horaEntrada, $horaSalida, $nombre, $duracion);
    } else {
        $sql = "INSERT INTO jornada (usuario_id, fecha, horaEntrada, horaSalida, nombre)
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issss", $usuario_id, $fecha, $horaEntrada, $horaSalida, $nombre);
    }
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'];
    $fecha = $input['fecha'];
    $horaEntrada = $input['horaEntrada'];
    $horaSalida = $input['horaSalida'];
    $nombre = $input['nombre'];
    $duracion = isset($input['duracion']) ? intval($input['duracion']) : null;

    if ($duracion !== null) {
        $sql = "UPDATE jornada SET fecha=?, horaEntrada=?, horaSalida=?, nombre=?, duracion=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssii", $fecha, $horaEntrada, $horaSalida, $nombre, $duracion, $id);
    } else {
        $sql = "UPDATE jornada SET fecha=?, horaEntrada=?, horaSalida=?, nombre=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssi", $fecha, $horaEntrada, $horaSalida, $nombre, $id);
    }
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'];
    $sql = "DELETE FROM jornada WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}
?>