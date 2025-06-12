<?php
//Cors necesario para permitir solicitudes desde el frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
require_once __DIR__ . '/vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;



require_once 'Conexion.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'POST') { 
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
 
    if (!$email || !$password) { 
        echo json_encode(['success' => false, 'message' => 'Email y contraseña requeridos']);
        exit();
    }
    

    $stmt = $conn->prepare("SELECT IdUsuarios, Contraseña FROM usuarios WHERE Correo = ?");
    $stmt->bind_param("s", $email); //vincula el parametro
    $stmt->execute();
    $stmt->store_result(); //Almacena
    // Verificar en la bbdd
    if ($stmt->num_rows === 1) { 
        $stmt->bind_result($usuario_id, $hash); // Vincula las variables para almacenar los resultados
        $stmt->fetch(); // Obtiene los resultados de la consulta
        if (password_verify($password, $hash)) { // contraseña y hash
            $key = '12345678'; // Usa una clave secreta segura
            $payload = [
                'iss' => 'http://localhost', // Identifica al emisor
                'aud' => 'http://localhost', // Identifica al destinatario
                'iat' => time(),             // Fecha de emisión
                'exp' => time() + 360,      // Fecha de expiración
                'uid' => $usuario_id         // ID de usuario 
            ];
            $jwt = JWT::encode($payload, $key, 'HS256'); 

            echo json_encode([ 
                'success' => true,
                'message' => 'Inicio de sesión exitoso',    
                'usuario_id' => $usuario_id,
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    }
    exit();
}
?>