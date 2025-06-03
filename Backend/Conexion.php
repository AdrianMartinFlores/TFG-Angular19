<?php
$conn = new mysqli("localhost", "root", "", "tfg");
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>