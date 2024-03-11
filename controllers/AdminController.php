<?php

namespace Controllers;

use MVC\Router;
use Model\AdminCita;

class AdminController {


    public static function index(Router $router) {
        session_start();
        isAdmin();// Verifica si es un administrador
        
        $fecha = $_GET["fecha"] ?? date("Y-m-d");
        $fechas = explode("-",$fecha);
        
        

        if(!checkdate($fechas[1],$fechas[2],$fechas[0])) {
            header("Location: /404");
        }

       //debuguear($fecha);
        
        //consultar la base de datos
       $consulta = "SELECT citas.id , citas.hora , concat(usuarios.nombre , ' ', usuarios.apellido) as cliente , "; 
       $consulta .= "usuarios.email , usuarios.telefono , servicios.nombre as servicio , servicios.precio "; 
       $consulta .=  "FROM citas "; 
       $consulta .= "left outer join usuarios "; 
       $consulta .= "on citas.usuarioId = usuarios.id ";
       $consulta .= "left outer join citasservicios ";
       $consulta .= "on citasservicios.citaId = citas.id ";
       $consulta .= "left outer join servicios ";
       $consulta .= "on citasservicios.servicioId = servicios.id ";
       $consulta .= "WHERE fecha = '$fecha' ";
        
       
       $citas = AdminCita::SQL($consulta);

       
        
        isAuth();

        $router->render("admin/index", [
            "nombre" => $_SESSION["nombre"],
            "citas" => $citas,
            "fecha" => $fecha
            
        ]);
    }
}