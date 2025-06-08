<?php

namespace Controllers;

use Model\Cita;
use Model\CitaServicio;
use Model\Servicio;

class APIController {
    public static function index() {
        
        $servicios = Servicio::all();
        echo json_encode($servicios);
    }

    

    public static function eliminar() {
        if($_SERVER["REQUEST_METHOD"] === "POST") {
            $id = $_POST["id"];
            
            $cita = cita::find($id);
            $cita->eliminar();
            header("Location:" . $_SERVER["HTTP_REFERER"]);
        }
    }
}
