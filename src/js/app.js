
let paso = 1;

const pasoInicial = 1;
const pasoFinal = 3;

const cita = {
    id: "",
    nombre: "",
    fecha: "",
    hora: "",
    servicios: []
}

document.addEventListener("DOMContentLoaded",function() {
    iniciarApp();
});


function iniciarApp() {
    mostrarSeccion();// Muestra y oculta las secciones
    tabs(); // Cambia la seccion cuando se presionen los tabs
    botonesPaginador(); // Agrega o quita los botones del paginador
    paginaSiguiente();
    paginaAnterior();

    consultarAPI(); // Consulta la API en el backend de PHP

    nombreCliente(); // Agrega el nombre del cliente al objeto de cita
    idCliente(); // Agrega el id del cliente al objeto de cita
    seleccionarFecha(); // agrega la fecha de la cita al objeto
    seleccionarHora(); // Agrega la hora de la cita al objeto de cita

    mostrarResumen();
   
}

function mostrarSeccion() {

    
    // Elimina la seccion anterior
    const seccionAnterior = document.querySelector(".mostrar");
    if(seccionAnterior) {
        seccionAnterior.classList.remove("mostrar");
    }
    
    // Seleccionar la seccion con el paso
    const pasoSelector = `#paso-${paso}`;
    const seccion = document.querySelector(pasoSelector);
    seccion.classList.add("mostrar");

    // Quita la clase de actual al tab anterior
    const tabAnterior = document.querySelector(".actual");
    if(tabAnterior) {
        tabAnterior.classList.remove("actual");
    }

    // Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${paso}"]`);
    tab.classList.add("actual");
}

function tabs() {

    const botones = document.querySelectorAll(".tabs button");

    botones.forEach(boton => {
        boton.addEventListener("click", function(e) {
            paso = parseInt(e.target.dataset.paso); // Con dataset accedo a los atributos del html
            
            mostrarSeccion();

            botonesPaginador();

        });
    })
    
}

function botonesPaginador() {
    const paginaAnterior = document.querySelector("#anterior");
    const paginaSiguiente = document.querySelector("#siguiente");
    
    
     if(paso !== 1) {
         paginaAnterior.classList.add("mostrar");
         paginaAnterior.classList.remove("ocultar");
         
     }
     else {
         paginaAnterior.classList.add("ocultar");
         paginaAnterior.classList.remove("mostrar");
      
     }

     if(paso !== 3) {
         paginaSiguiente.classList.add("mostrar")
         paginaSiguiente.classList.remove("ocultar");
     }else {
         paginaSiguiente.classList.remove("mostrar")
         paginaSiguiente.classList.add("ocultar");
     }

     if(paso === 3) {
        mostrarResumen();
     }
     mostrarSeccion();
    
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector("#anterior");
    paginaAnterior.addEventListener("click", function() {

        if(paso <= pasoInicial) {
            return;
        }
        paso--;

        botonesPaginador();
    });
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector("#siguiente");
    paginaSiguiente.addEventListener("click", function() {

        if(paso >= pasoFinal) {
            return;
        }
        paso++;

        botonesPaginador();
    });
}

async function consultarAPI() {

    try {
        const url = "/api/servicios";
        const resultado = await fetch(url);
        const servicios = await resultado.json();
        mostrarServicios(servicios);
    } catch (error) {
        console.log(error);
    }
}

function mostrarServicios(servicios) {
    servicios.forEach(servicio => {
        const {id,nombre,precio} = servicio; // destructuring

        const nombreServicio = document.createElement("P");
        nombreServicio.classList.add("nombre-servicio");
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement("P");
        precioServicio.classList.add("precio-servicio");
        precioServicio.textContent = `$${precio}`

        const servicioDiv = document.createElement("DIV");
        servicioDiv.classList.add("servicio");
        servicioDiv.dataset.idServicio = id;// id del div del servicio
        servicioDiv.onclick = function() {
            seleccionarServicio(servicio);
        }

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        document.querySelector("#servicios").appendChild(servicioDiv);
       
    });
}

function seleccionarServicio(servicio) {
    const {id} = servicio; //destructuring
    const {servicios} = cita;

    // Identificar el elemento al que se le da click
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);

    // Comprobar si un servicio ya fue agregado
    if(servicios.some(agregado => agregado.id === id)) {
        //Eliminar el producto
        cita.servicios = servicios.filter(agregado => agregado.id !== id);
        divServicio.classList.remove("seleccionado");
    }else {
        //Agregar el producto
        cita.servicios = [...servicios, servicio];
        divServicio.classList.add("seleccionado");
    }
    

    //console.log(cita);
}
function idCliente() {
    const id = document.querySelector("#id").value;
    cita.id = id;
}

function nombreCliente() {
    const nombre = document.querySelector("#nombre").value;
    cita.nombre = nombre;
}

function seleccionarFecha() {
    const inputFecha = document.querySelector("#fecha");

    inputFecha.addEventListener("input",function(e) {
        const dia = new Date(e.target.value).getUTCDay();
        if( [6,0].includes(dia)) {
            e.target.value = "";
            mostrarAlerta("Fines de semana sin servicio","error",".formulario");
        }else {
            cita.fecha = e.target.value;
        }
    });
}

function seleccionarHora() {
    const inputHora = document.querySelector("#hora");
    inputHora.addEventListener("input",function(e) {
        const horaCita = e.target.value;
        const hora = horaCita.split(":")[0];
        if(hora < 10 || hora > 18) {
            e.target.value = "";
            mostrarAlerta("Hora no valida","error",".formulario");
        }else {
            cita.hora = e.target.value;
        }
    });
}

function mostrarResumen() {
    const resumen = document.querySelector(".contenido-resumen");

    // Limpiar el contenido de Resumen
    while(resumen.firstChild) {
        resumen.removeChild(resumen.firstChild);
    }

    if(Object.values(cita).includes("") || cita.servicios.length === 0) {
        mostrarAlerta("hacen falta datos de Servicios, Fecha u Hora","error",".contenido-resumen",false);
        return;
    }

    // Formatear el div de resumen
    const {nombre,fecha,hora,servicios} = cita;

    // Heading para servicios en Resumen
    const headingServicios = document.createElement("H3");
    headingServicios.textContent = "Resumen de Servicios";
    resumen.appendChild(headingServicios);

    // iterando y mostrando los servicios
    servicios.forEach(servicio => {
        const {id,precio,nombre} = servicio;
        const contenedorServicio = document.createElement("DIV");
        contenedorServicio.classList.add("contenedor-servicio");

        const textoServicio = document.createElement("P");
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement("P");
        precioServicio.innerHTML = `<span>Precio:</span> $${precio}`;

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        resumen.appendChild(contenedorServicio);
        
    });

    // Heading para cita en Resumen
    const headingCita = document.createElement("H3");
    headingCita.textContent = "Resumen de Cita";
    resumen.appendChild(headingCita);
    
    const nombreCliente = document.createElement("P");
    nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`;

    // Formatear la fecha en espanol
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate() + 2; // cada desfase se le resta 1 dia
    const year = fechaObj.getFullYear();

    const fechaUTC = new Date(Date.UTC(year,mes,dia));

    const opciones = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
    const fechaFormateada = fechaUTC.toLocaleDateString("es-MX",opciones);
    //console.log(fechaFormateada);


    const fechaCita = document.createElement("P");
    fechaCita.innerHTML = `<span>Fecha:</span> ${fechaFormateada}`;
    
    const horaCita = document.createElement("P");
    horaCita.innerHTML = `<span>Hora:</span> ${hora} Horas`;

    // Boton para crear un cita
    const botonReservar = document.createElement("BUTTON");
    botonReservar.classList.add("boton");
    botonReservar.textContent = "Reservar Cita";
    botonReservar.onclick = reservarCita;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);

    resumen.appendChild(botonReservar);

    

}

function mostrarAlerta(mensaje,tipo,elemento,desaparece = true) {

    // Previene que se genere mas de una alerta
    const alertaPrevia = document.querySelector(".alerta");
    if(alertaPrevia) {
        alertaPrevia.remove();
    }

    // scripting para generar una alerta
    const alerta = document.createElement("DIV");
    alerta.textContent = mensaje;
    alerta.classList.add("alerta");
    alerta.classList.add(tipo);

    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);

    if(desaparece) {
        // Remover alerta
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
    
}

async function reservarCita() {
    
    const {nombre,fecha,hora,servicios,id} = cita

    const idServicios = servicios.map(servicio => servicio.id);


    // Cuerpo del metodo post este es el submit pero en fetch
    const datos = new FormData();
    datos.append("fecha",fecha);
    datos.append("hora",hora);
    datos.append("usuarioId",id);
    datos.append("servicios",idServicios);
    // console.log([...datos]);

    try {
    // Peticion hacia la api
    const url = "/api/citas";

    // Respuesta para tipo post
    const respuesta = await fetch(url, {
        method: "POST",
        body: datos
    });

    const resultado = await respuesta.json();
    console.log(resultado);

    if(resultado.resultado) {
        Swal.fire({
            icon: 'success',
            title: 'Cita Creada',
            text: 'Tu cita fue creada correctamente',
            button: "OK"
        }).then( () => {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        });
    }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'error',
            text: 'Hubo un error al guardar la cita',
        })
    }
    
    
    // Esto no servira para ver si los datos se estan recibiendo o enviando correctamente
    //console.log([...datos])
}

