<?php
// Variables de configuración
$receiving_email_address = 'contacto@solucionesinformaticasluvelwell.com'; // Cambiar por tu email

// Validar que sea una solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener y sanitizar datos del formulario
    $name = htmlspecialchars(strip_tags(trim($_POST['name'] ?? '')), ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars(strip_tags(trim($_POST['email'] ?? '')), ENT_QUOTES, 'UTF-8');
    $subject = htmlspecialchars(strip_tags(trim($_POST['subject'] ?? '')), ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars(strip_tags(trim($_POST['message'] ?? '')), ENT_QUOTES, 'UTF-8');

    // Validar campos requeridos
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        http_response_code(400);
        echo json_encode(['message' => 'Por favor completa todos los campos requeridos.']);
        exit;
    }

    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['message' => 'Por favor ingresa un correo electrónico válido.']);
        exit;
    }

    // Preparar el contenido del email
    $email_subject = "Nuevo mensaje de contacto: " . $subject;
    $email_body = "Nombre: " . $name . "\r\n";
    $email_body .= "Correo: " . $email . "\r\n";
    $email_body .= "Asunto: " . $subject . "\r\n\r\n";
    $email_body .= "Mensaje:\r\n" . $message;

    // Encabezados del email
    $headers = "From: " . $email . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Enviar el email
    if (mail($receiving_email_address, $email_subject, $email_body, $headers)) {
        http_response_code(200);
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al enviar el mensaje. Por favor intenta más tarde.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Método no permitido.']);
}
?>