<?php
$conn = new mysqli("localhost:3306", "root", "", "tfg");
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>