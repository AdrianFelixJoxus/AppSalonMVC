<?php 

require_once __DIR__ . '/../includes/app.php';

use Controllers\APIController;
use Controllers\CitaController;
use Controllers\LoginController;
use Controllers\AdminController;
use Controllers\ServicioController;
use MVC\Router;

$router = new Router();

// Iniciar sesion
$router->get("/", [LoginController::class,"login"]);//Listo
$router->post("/", [LoginController::class,"login"]);
$router->get("/logout", [LoginController::class,"logout"]);

// Recuperar el password
$router->get("/olvide", [LoginController::class,"olvide"]);//Listo
$router->post("/olvide", [LoginController::class,"olvide"]);
$router->get("/recuperar", [LoginController::class,"recuperar"]);
$router->post("/recuperar", [LoginController::class,"recuperar"]);

// Crear cuenta
$router->get("/crear-cuenta", [LoginController::class,"crear"]);//Listo
$router->post("/crear-cuenta", [LoginController::class,"crear"]);

// confirmar cuenta
$router->get("/confirmar-cuenta", [LoginController::class,"confirmar"]);//Listo
$router->get("/mensaje", [LoginController::class,"mensaje"]);

// Area Privada
$router->get("/cita",[CitaController::class,"index"]);
$router->get("/admin",[AdminController::class,"index"]);


// API de citas // Url o endpoint
$router->get("/api/servicios",[APIController::class,"index"]);
$router->post("/api/citas",[APIController::class,"guardar"]);
$router->post("/api/eliminar",[APIController::class,"eliminar"]);

// CRUD de servicios
$router->get("/servicios",[ServicioController::class,"index"]);
$router->get("/servicios/crear",[ServicioController::class,"crear"]);
$router->post("/servicios/crear",[ServicioController::class,"crear"]);
$router->get("/servicios/actualizar",[ServicioController::class,"actualizar"]);
$router->post("/servicios/actualizar",[ServicioController::class,"actualizar"]);
$router->post("/servicios/eliminar",[ServicioController::class,"eliminar"]);

// Comprueba y valida las rutas, que existan y les asigna las funciones del Controlador
$router->comprobarRutas();