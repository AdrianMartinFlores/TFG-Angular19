<?php
//Cors necesario para permitir solicitudes desde el frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
require_once __DIR__ . '/vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;



require_once 'Conexion.php'; 



if ($_SERVER['REQUEST_METHOD'] === 'POST') { // Maneja la solicitud POST para el inicio de sesion
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
 
    if (!$email || !$password) { // Verifica si el email y la contraseña están presentes
        echo json_encode(['success' => false, 'message' => 'Email y contraseña requeridos']);
        exit();
    }
    // Prepara y ejecuta la consulta para verificar el usuario
    $stmt = $conn->prepare("SELECT IdUsuarios, Contraseña FROM usuarios WHERE Correo = ?");
    $stmt->bind_param("s", $email); // Vincula el parametro de entrada
    $stmt->execute(); //Ejecuta
    $stmt->store_result(); // Almacena el resultado para verificar si hay coincidencias
    // Verifica si se encontro un usuario con el email
    if ($stmt->num_rows === 1) { 
        $stmt->bind_result($usuario_id, $hash); // Vincula las variables para almacenar los resultados
        $stmt->fetch(); // Obtiene los resultados de la consulta
        if (password_verify($password, $hash)) { // Verifica la contraseña con el hash almacenado
            // Generar JWT real
            $key = '12345678'; // Usa una clave secreta segura
            $payload = [
                'iss' => 'http://localhost', // Emisor
                'aud' => 'http://localhost', // Audiencia
                'iat' => time(),             // Emitido en
                'exp' => time() + 3600,      // Expira en 1 hora
                'uid' => $usuario_id         // ID de usuario
            ];
            $jwt = JWT::encode($payload, $key, 'HS256');

            echo json_encode([ // Respuesta exitosa
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'usuario_id' => $usuario_id,
                'token' => $jwt // Incluye el token JWT en la respuesta
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