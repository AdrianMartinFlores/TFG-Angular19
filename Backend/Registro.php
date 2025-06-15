<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once 'Conexion.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // json_decode para obtener los datos del cuerpo de la solicitud
    //php://input permite leer el cuerpo de la solicitud POST
    $input = json_decode(file_get_contents('php://input'), true);

    $Email = strtolower($input['email'] ?? null); 
    $Nombre = $input['nombre'] ?? null;
    $Password = $input['password'] ?? null;

    if (!$Email || !$Nombre || !$Password) {
        echo json_encode(['success' => false, 'mensage' => 'Todos los campos son obligatorios']);
        exit;
    }

    if(strlen($Nombre) < 3 || strlen($Nombre) > 15){
        echo json_encode(['success' => false, 'message' => 'El nombre de usuario debe tener entre 3 y 15 caracteres']);
        exit;
    }
    if (strlen($Password) < 4 ) {
        echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 4 caracteres']);
        exit;
    }
    if(!filter_var($Email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'El correo electrónico no es válido']);
        exit;
    }

    $Password = password_hash($Password, PASSWORD_BCRYPT);

    $query = "INSERT INTO usuarios (Correo, NombreUsuario, Contraseña) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);

    try {
        $stmt->bind_param("sss", $Email, $Nombre, $Password);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente']);
    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() == 1062) { //error mysql entrada duplicada
            echo json_encode(['success' => false, 'message' => 'El correo ya está registrado']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al registrar el usuario: ' . $e->getMessage()]);
        }
    }
}


?>