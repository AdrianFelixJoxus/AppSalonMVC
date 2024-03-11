<?php

namespace Controllers;
use MVC\Router;
use Model\Usuario;
use Classes\Email;

class LoginController {

    public static function login(Router $router) {
        $alertas = [];
        if($_SERVER["REQUEST_METHOD"] === "POST") {
            $auth = new Usuario($_POST);
            $alertas = $auth->validarLogin();
            
            if(empty($alertas)) {
                // Comprobar que el usuario exista
                $usuario = Usuario::where("email",$auth->email);
                if($usuario) {
                    // Verificar el password
                    if($usuario->comprobarPasswordAndVerificado($auth->password)) {
                        session_start();

                        $_SESSION["id"] = $usuario->id;
                        $_SESSION["nombre"] = $usuario->nombre . " " . $usuario->apellido;
                        $_SESSION["email"] = $usuario->email;
                        $_SESSION["login"] = true;
                        
                        if($usuario->admin === "1") {
                            $_SESSION["admin"] = $usuario->admin ?? null;
                            header("location: /admin");
                        }else {
                            header("location: /cita");
                            
                        }
                        
                    }
                    
                    
                }else {
                    Usuario::setAlerta("error","Usuario no encontrado");
                }
            }
        }

        $alertas = Usuario::getAlertas();

        $router->render("auth/login",[
            "alertas" => $alertas
        ]);
    }
    public static function logout() {
        session_start();

        $_SESSION = [];

        header("Location: /");
    }
    public static function olvide(Router $router) {
        $alertas = [];
        if($_SERVER["REQUEST_METHOD"] === "POST") {
            $auth = new Usuario($_POST);
            $alertas = $auth->validarEmail();

            if(empty($alertas)) {
                $usuario = Usuario::where("email",$auth->email);
                
                if($usuario && $usuario->confirmado === "1") {
                    // Generar un token
                    $usuario->crearToken();
                    $usuario->guardar();
                    
                    // Enviar el email
                    $email = New Email($usuario->email,$usuario->nombre,$usuario->token);
                    $email->enviarInstrucciones();
                    // Alerta de exito
                    Usuario::setAlerta("exito","Revisa tu email");
                } else {
                    Usuario::setAlerta("error","El usuario no existe o no esta confirmado");
                    
                }
            }
        }

        $alertas = Usuario::getAlertas();
        $router->render("/auth/olvide-password",[
            "alertas" => $alertas
        ]);
    }
    public static function recuperar(Router $router) {
        $alertas = [];
        $error = false;
        $token = s($_GET["token"]);

        // Buscar Usuario por su token
        $usuario = Usuario::where("token",$token);
        if(empty($usuario)){ 
            Usuario::setAlerta("error","Token no valido");
            $error = true;
        }

        if($_SERVER["REQUEST_METHOD"] === "POST") {
            // leer el nuevo password y guardarlo
            $password = new Usuario($_POST);
            //validar que no este el campo vacio
            $alertas = $password->validarPassword();
            
            if(empty($alertas)) {
                $usuario->password = null;

                $usuario->password = $password->password;
                $usuario->hashPassword();
                $usuario->token = null;

                $resultado = $usuario->guardar();
                
                if($resultado) {
                    header("Location: /");
                }
                
            }
        }

        $alertas = Usuario::getAlertas();
        $router->render("auth/recuperar-password",[
            "alertas" => $alertas,
            "error" => $error
        ]);
    }
    public static function crear(Router $router) {
        $usuario = new Usuario;
        // Alertas vacias
        $alertas = [];
        if($_SERVER["REQUEST_METHOD"] === "POST") {
            $usuario->sincronizar($_POST);
            $alertas = $usuario->validarCuentaNueva();
           
            // Revisar que alerta este vacion
            if(empty($alertas)) {
                // Verificar que el usuario no este registrado
               $resultado = $usuario->existeUsuario();

               if($resultado->num_rows) {
                    $alertas = Usuario::getAlertas();
               } else {
                    // Hasear password
                    $usuario->hashPassword();

                    // Generar un token unico
                    $usuario->crearToken();

                    // Enviar el email
                    $email = new Email($usuario->email,$usuario->nombre,$usuario->token);

                    $email->enviarConfirmacion();

                    // Crear el usuario
                    $resultado =  $usuario->guardar();
                    if($resultado){ 
                        header("location: /mensaje");
                    }
               }
            }
        }
        // Renderizar la vista
        $router->render("auth/crear-cuenta",[
            "usuario" => $usuario,
            "alertas" => $alertas
        ]);
    }

    public static function mensaje(Router $router) {
        $router->render("auth/mensaje");
    }

    public static function confirmar(Router $router){ 
        $alertas = [];
        $token = s($_GET["token"]);
        $usuario = Usuario::where("token",$token);
        if(empty($usuario)) {
            // Mostrar mensaje de error
            Usuario::setAlerta("error","Token No Valido");
        }else {
            // Modificar a usuario confirmado
            $usuario->confirmado = "1";
            $usuario->token = null;
            $usuario->guardar();
            
            Usuario::setAlerta("exito","cuenta Comprobada Correctamente");
        }
        // obtener alertas
        $alertas = Usuario::getAlertas();
        // Renderizar vista
        $router->render("auth/confirmar-cuenta",[
            "alertas" => $alertas
        ]);
    }
}