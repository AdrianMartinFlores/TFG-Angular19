<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once 'Conexion.php'; 

// Conexión a la base de datos


// Solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $Email = strtolower($input['email'] ?? null); // Convertir a minúsculas
    $Nombre = $input['nombre'] ?? null;
    $Password = $input['password'] ?? null;

    if (!$Email || !$Nombre || !$Password) {
        echo json_encode(['success' => false, 'mensage' => 'Todos los campos son obligatorios']);
        exit;
    }

    // strlen() verifica la longitud de la cadena
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

    $Password = password_hash($Password, PASSWORD_BCRYPT); // Encriptar la contraseña

    $query = "INSERT INTO usuarios (Correo, NombreUsuario, Contraseña) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);

    try {
        $stmt->bind_param("sss", $Email, $Nombre, $Password);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente']);
    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() == 1062) { // Código de error para violación de unicidad en MySQLi
            echo json_encode(['success' => false, 'message' => 'El correo ya está registrado']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al registrar el usuario: ' . $e->getMessage()]);
        }
    }
}


?>