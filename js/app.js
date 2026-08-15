// ==========================================
// CONTROL DE GLUCOSA
// app.js
// ==========================================


// ==========================================
// ELEMENTOS DEL FORMULARIO
// ==========================================

const fechaInput = document.getElementById("fecha");
const horaInput = document.getElementById("hora");
const glucosaInput = document.getElementById("glucosa");
const momentoInput = document.getElementById("momento");
const observacionInput = document.getElementById("observacion");

const btnGuardar = document.querySelector(".btn-save");

// ==========================================
// REGISTROS ACTUALES
// ==========================================

let registrosActuales = [];


// Instancia de la gráfica

let graficaGlucosa = null;


// ==========================================
// FECHA Y HORA ACTUAL
// ==========================================

function establecerFechaHoraActual() {

    const ahora = new Date();

    // ------------------------------
    // Fecha
    // ------------------------------

    const año = ahora.getFullYear();

    const mes = String(
        ahora.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        ahora.getDate()
    ).padStart(2, "0");

    fechaInput.value = `${año}-${mes}-${dia}`;


    // ------------------------------
    // Hora
    // ------------------------------

    const horas = String(
        ahora.getHours()
    ).padStart(2, "0");

    const minutos = String(
        ahora.getMinutes()
    ).padStart(2, "0");

    horaInput.value = `${horas}:${minutos}`;
}


// Ejecutar al cargar la aplicación

establecerFechaHoraActual();


// ==========================================
// VALIDAR DATOS
// ==========================================

function validarFormulario() {

    if (!fechaInput.value) {

        alert("Por favor selecciona la fecha.");

        fechaInput.focus();

        return false;
    }


    if (!horaInput.value) {

        alert("Por favor selecciona la hora.");

        horaInput.focus();

        return false;
    }


    if (!glucosaInput.value) {

        alert("Por favor ingresa el valor de glucosa.");

        glucosaInput.focus();

        return false;
    }


    const glucosa = Number(
        glucosaInput.value
    );


    if (glucosa <= 0) {

        alert("El valor de glucosa debe ser mayor que 0.");

        glucosaInput.focus();

        return false;
    }


    if (!momentoInput.value) {

        alert("Selecciona el momento de la medición.");

        momentoInput.focus();

        return false;
    }


    return true;
}


// ==========================================
// OBTENER DATOS
// ==========================================

function obtenerDatos() {

    return {

        fecha: fechaInput.value,

        hora: horaInput.value,

        glucosa: Number(
            glucosaInput.value
        ),

        momento: momentoInput.value,

        observacion: observacionInput.value.trim()

    };
}


// ==========================================
// GUARDAR MEDICIÓN
// ==========================================

btnGuardar.addEventListener(
    "click",
    guardarMedicion
);


// ==========================================
// URL DE GOOGLE APPS SCRIPT
// ==========================================

const URL_APPS_SCRIPT =
    "https://script.google.com/macros/s/AKfycbzw8etif4KHGgh76_ADbINJslVCOX9QFgmPF7Xg8zhqQpQ82-1cZ2wKo_ikWQ4Rld0opg/exec";


// ==========================================
// GUARDAR MEDICIÓN
// ==========================================

async function guardarMedicion() {


    // --------------------------------------
    // Validar formulario
    // --------------------------------------

    if (!validarFormulario()) {

        return;

    }


    // --------------------------------------
    // Obtener datos
    // --------------------------------------

    const datos = obtenerDatos();


    // --------------------------------------
    // Cambiar estado del botón
    // --------------------------------------

    btnGuardar.disabled = true;

    btnGuardar.innerHTML =
        "⏳ Guardando...";


    try {


        // ----------------------------------
        // Enviar datos a Apps Script
        // ----------------------------------

        const respuesta = await fetch(
            URL_APPS_SCRIPT,
            {

                method: "POST",

                body: JSON.stringify(datos)

            }
        );


        // ----------------------------------
        // Leer respuesta
        // ----------------------------------

        const resultado =
            await respuesta.json();


        // ----------------------------------
        // Comprobar resultado
        // ----------------------------------

        if (resultado.success) {


            alert(
                "✅ Medición guardada correctamente."
            );


            // Limpiar formulario

            glucosaInput.value = "";

            observacionInput.value = "";

            momentoInput.value = "";


            // Enfocar glucosa

            glucosaInput.focus();


        } else {


            alert(
                "❌ No se pudo guardar la medición.\n\n" +
                resultado.message
            );

        }


    } catch (error) {


        console.error(
            "Error:",
            error
        );


        alert(
            "❌ No fue posible conectar con Google Sheets.\n\n" +
            "Verifica tu conexión a Internet."
        );


    } finally {


        // ----------------------------------
        // Restaurar botón
        // ----------------------------------

        btnGuardar.disabled = false;

        btnGuardar.innerHTML =
            "<span>💾</span> Guardar medición";

    }

}

// ==========================================
// MOSTRAR HISTORIAL
// ==========================================

async function mostrarHistorial() {

    const lista =
        document.getElementById(
            "listaRegistros"
        );


    // Mostrar cargando

    lista.innerHTML = `

        <div class="loading">

            <div class="spinner"></div>

            <p>
                Cargando registros...
            </p>

        </div>

    `;


    // Obtener registros

    const registros =
        await obtenerRegistros();

    registrosActuales = registros;


    // --------------------------------------
    // Sin registros
    // --------------------------------------

    if (registros.length === 0) {

        lista.innerHTML = `

            <div class="sin-registros">

                <div class="sin-registros-icon">
                    🩸
                </div>

                <h3>
                    No hay registros
                </h3>

                <p>
                    Las mediciones que guardes
                    aparecerán aquí.
                </p>

            </div>

        `;

        return;

    }


    // --------------------------------------
    // Ordenar registros
    // Más reciente primero
    // --------------------------------------

    registros.sort(function (a, b) {

        const fechaA =
            new Date(
                `${a.fecha}T${a.hora}`
            );

        const fechaB =
            new Date(
                `${b.fecha}T${b.hora}`
            );

        return fechaB - fechaA;

    });


    // --------------------------------------
    // Crear tarjetas
    // --------------------------------------

    lista.innerHTML = "";


    registros.forEach(function (registro) {

        const tarjeta =
            document.createElement("div");


        tarjeta.className =
            "registro-card";


        tarjeta.innerHTML = `

            <div class="registro-top">

                <div class="registro-fecha">

                    📅 ${formatearFecha(
            registro.fecha
        )}

                </div>

                <div class="registro-hora">

                    🕐 ${registro.hora}

                </div>

            </div>


            <div class="registro-glucosa">

                <span class="registro-valor">

                    ${registro.glucosa}

                </span>

                <span class="registro-unidad">

                    mg/dL

                </span>

            </div>


            <div class="registro-momento">

                🍴 ${registro.momento}

            </div>


            ${registro.observacion
                ?
                `
                <div class="registro-observacion">

                    📝 ${registro.observacion}

                </div>
                `
                :
                ""
            }

        `;


        lista.appendChild(tarjeta);

    });

}

// ==========================================
// FORMATEAR FECHA
// ==========================================

// ==========================================
// FORMATEAR FECHA
// ==========================================

function formatearFecha(fecha) {

    if (!fecha) {

        return "";

    }


    // --------------------------------------
    // Formato: DD/MM/YYYY
    // --------------------------------------

    if (fecha.includes("/")) {

        const partes =
            fecha.split("/");


        if (partes.length === 3) {

            const dia = partes[0];

            const mes = partes[1];

            const año = partes[2];


            const meses = [

                "ENE",
                "FEB",
                "MAR",
                "ABR",
                "MAY",
                "JUN",
                "JUL",
                "AGO",
                "SEP",
                "OCT",
                "NOV",
                "DIC"

            ];


            return `${dia} ${meses[
                Number(mes) - 1
            ]} ${año}`;

        }

    }


    // --------------------------------------
    // Formato: YYYY-MM-DD
    // --------------------------------------

    if (fecha.includes("-")) {

        const partes =
            fecha.split("-");


        if (partes.length === 3) {

            const año = partes[0];

            const mes = partes[1];

            const dia = partes[2];


            const meses = [

                "ENE",
                "FEB",
                "MAR",
                "ABR",
                "MAY",
                "JUN",
                "JUL",
                "AGO",
                "SEP",
                "OCT",
                "NOV",
                "DIC"

            ];


            return `${dia} ${meses[
                Number(mes) - 1
            ]} ${año}`;

        }

    }


    // --------------------------------------
    // Si no reconoce el formato
    // --------------------------------------

    return fecha;

}

// ==========================================
// FORMATEAR HORA
// ==========================================

function formatearHora(hora) {

    if (!hora) {

        return "";

    }


    // Si viene con segundos
    // 14:06:00 → 14:06

    if (hora.length >= 5) {

        return hora.substring(0, 5);

    }


    return hora;

}

// ==========================================
// NAVEGACIÓN
// ==========================================

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


const vistaInicio =
    document.getElementById(
        "vistaInicio"
    );


const vistaHistorial =
    document.getElementById(
        "vistaHistorial"
    );


navItems.forEach(function (item, index) {

    item.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            // Quitar activo

            navItems.forEach(function (nav) {

                nav.classList.remove(
                    "active"
                );

            });


            // Activar seleccionado

            item.classList.add(
                "active"
            );


            // --------------------------
            // INICIO
            // --------------------------

            if (index === 0) {

                vistaInicio.classList.add(
                    "active"
                );

                vistaHistorial.classList.remove(
                    "active"
                );

            }


            // --------------------------
            // HISTORIAL
            // --------------------------

            if (index === 1) {

                vistaInicio.classList.remove(
                    "active"
                );

                vistaHistorial.classList.add(
                    "active"
                );


                // Cargar registros

                mostrarHistorial();

            }

        }
    );

});

// ==========================================
// OBTENER REGISTROS
// ==========================================

async function obtenerRegistros() {

    console.log("1️⃣ Iniciando consulta de registros...");

    try {

        console.log(
            "2️⃣ Consultando:",
            URL_APPS_SCRIPT
        );


        const respuesta = await fetch(
            URL_APPS_SCRIPT,
            {
                method: "GET"
            }
        );


        console.log(
            "3️⃣ Respuesta recibida:",
            respuesta.status
        );


        const resultado =
            await respuesta.json();


        console.log(
            "4️⃣ Datos recibidos:",
            resultado
        );


        if (!resultado.success) {

            throw new Error(
                resultado.message ||
                "No se pudieron obtener los registros."
            );

        }


        console.log(
            "5️⃣ Total de registros:",
            resultado.registros.length
        );


        return resultado.registros;


    } catch (error) {

        console.error(
            "❌ Error obteniendo registros:",
            error
        );


        return [];

    }

}

// ==========================================
// CREAR GRÁFICA DE GLUCOSA
// ==========================================

function crearGraficaGlucosa() {

    const canvas =
        document.getElementById(
            "graficaGlucosa"
        );


    if (!canvas) {

        console.error(
            "No se encontró el canvas de la gráfica."
        );

        return;

    }


    // --------------------------------------
    // Verificar registros
    // --------------------------------------

    if (
        !registrosActuales ||
        registrosActuales.length === 0
    ) {

        return;

    }


    // --------------------------------------
    // Ordenar por ID
    // --------------------------------------

    const registros =
        [...registrosActuales].sort(function (a, b) {

            return Number(a.id) - Number(b.id);

        });


    // --------------------------------------
    // Etiquetas
    // --------------------------------------

    const etiquetas =
        registros.map(function (registro) {

            return (
                formatearFechaCorta(
                    registro.fecha
                )
                +
                " · "
                +
                formatearHora(
                    registro.hora
                )
            );

        });


    // --------------------------------------
    // Valores
    // --------------------------------------

    const valores =
        registros.map(function (registro) {

            return Number(
                registro.glucosa
            );

        });


    // --------------------------------------
    // Si ya existe una gráfica
    // --------------------------------------

    if (graficaGlucosa) {

        graficaGlucosa.destroy();

    }


    // --------------------------------------
    // Crear gráfica
    // --------------------------------------

    graficaGlucosa =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: etiquetas,

                    datasets: [

                        {

                            label:
                                "Glucosa (mg/dL)",

                            data: valores,

                            tension: 0.3,

                            fill: false,

                            pointRadius: 5,

                            pointHoverRadius: 7,

                            borderWidth: 3

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    interaction: {

                        intersect: false,

                        mode: "index"

                    },


                    plugins: {

                        legend: {

                            display: false

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (context) {

                                        return (
                                            " " +
                                            context.parsed.y +
                                            " mg/dL"
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        y: {

                            beginAtZero: false,

                            title: {

                                display: true,

                                text:
                                    "mg/dL"

                            }

                        },


                        x: {

                            ticks: {

                                maxRotation: 45,

                                minRotation: 45,

                                font: {

                                    size: 9

                                }

                            }

                        }

                    }

                }

            }
        );

}

// ==========================================
// FECHA CORTA PARA GRÁFICA
// ==========================================

function formatearFechaCorta(fecha) {

    if (!fecha) {

        return "";

    }


    // Formato DD/MM/YYYY

    if (fecha.includes("/")) {

        const partes =
            fecha.split("/");


        if (partes.length === 3) {

            return `${partes[0]}/${partes[1]}`;

        }

    }


    // Formato YYYY-MM-DD

    if (fecha.includes("-")) {

        const partes =
            fecha.split("-");


        if (partes.length === 3) {

            return `${partes[2]}/${partes[1]}`;

        }

    }


    return fecha;

}

// ==========================================
// BOTÓN GRÁFICA
// ==========================================

const btnGrafica =
    document.getElementById(
        "btnGrafica"
    );


const contenedorGrafica =
    document.getElementById(
        "contenedorGrafica"
    );


btnGrafica.addEventListener(
    "click",
    function () {

        // Mostrar gráfica

        contenedorGrafica.classList.toggle(
            "visible"
        );


        // Si se está mostrando

        if (
            contenedorGrafica.classList.contains(
                "visible"
            )
        ) {

            crearGraficaGlucosa();

            btnGrafica.innerHTML =
                "📉 Ocultar gráfica";

        } else {

            btnGrafica.innerHTML =
                "📈 Ver gráfica";

        }

    }
);

// ==========================================
// GENERAR PDF
// ==========================================

async function generarPDF() {

    // --------------------------------------
    // Verificar registros
    // --------------------------------------

    if (
        !registrosActuales ||
        registrosActuales.length === 0
    ) {

        alert(
            "No hay registros para generar el PDF."
        );

        return;

    }


    // --------------------------------------
    // Obtener jsPDF
    // --------------------------------------

    const {
        jsPDF
    } = window.jspdf;


    // --------------------------------------
    // Crear documento
    // --------------------------------------

    const documento =
        new jsPDF({

            orientation: "portrait",

            unit: "mm",

            format: "a4"

        });


    // --------------------------------------
    // Datos generales
    // --------------------------------------

    const fechaGeneracion =
        new Date();


    const fechaTexto =
        fechaGeneracion.toLocaleDateString(
            "es-CO"
        );


    const horaTexto =
        fechaGeneracion.toLocaleTimeString(
            "es-CO",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    // --------------------------------------
    // TÍTULO
    // --------------------------------------

    documento.setFont(
        "helvetica",
        "bold"
    );

    documento.setFontSize(20);

    documento.text(
        "CONTROL DE GLUCOSA",
        105,
        20,
        {
            align: "center"
        }
    );


    documento.setFont(
        "helvetica",
        "normal"
    );

    documento.setFontSize(10);

    documento.text(
        "Registro de mediciones",
        105,
        27,
        {
            align: "center"
        }
    );


    documento.setTextColor(
        100,
        100,
        100
    );

    documento.text(
        `Informe generado: ${fechaTexto} ${horaTexto}`,
        105,
        34,
        {
            align: "center"
        }
    );


    // --------------------------------------
    // RESUMEN
    // --------------------------------------

    const valores =
        registrosActuales.map(
            function (registro) {

                return Number(
                    registro.glucosa
                );

            }
        );


    const promedio =
        valores.reduce(
            function (total, valor) {

                return total + valor;

            },
            0
        ) / valores.length;


    const minimo =
        Math.min(...valores);


    const maximo =
        Math.max(...valores);


    documento.setTextColor(
        31,
        41,
        55
    );


    documento.setFont(
        "helvetica",
        "bold"
    );

    documento.setFontSize(12);

    documento.text(
        "Resumen",
        14,
        46
    );


    documento.setFont(
        "helvetica",
        "normal"
    );

    documento.setFontSize(10);


    documento.text(
        `Total de mediciones: ${valores.length}`,
        14,
        54
    );


    documento.text(
        `Promedio: ${promedio.toFixed(1)} mg/dL`,
        14,
        61
    );


    documento.text(
        `Valor mínimo: ${minimo} mg/dL`,
        14,
        68
    );


    documento.text(
        `Valor máximo: ${maximo} mg/dL`,
        14,
        75
    );


    // --------------------------------------
    // TABLA
    // --------------------------------------

    const registrosOrdenados =
        [...registrosActuales].sort(
            function (a, b) {

                return (
                    Number(b.id) -
                    Number(a.id)
                );

            }
        );


    const filas =
        registrosOrdenados.map(
            function (registro) {

                return [

                    formatearFecha(
                        registro.fecha
                    ),

                    formatearHora(
                        registro.hora
                    ),

                    `${registro.glucosa} mg/dL`,

                    registro.momento,

                    registro.observacion || "-"

                ];

            }
        );


    documento.autoTable({

        startY: 83,

        head: [[

            "Fecha",

            "Hora",

            "Glucosa",

            "Momento",

            "Observación"

        ]],

        body: filas,

        theme: "grid",

        styles: {

            font: "helvetica",

            fontSize: 8,

            cellPadding: 3,

            valign: "middle"

        },

        headStyles: {

            fontStyle: "bold",

            fillColor: [31, 83, 221],

            textColor: [255, 255, 255],

            halign: "center",

            valign: "middle"

        },

        columnStyles: {

            0: {
                cellWidth: 30
            },

            1: {
                cellWidth: 22
            },

            2: {
                cellWidth: 28
            },

            3: {
                cellWidth: 38
            },

            4: {
                cellWidth: "auto"
            }

        },

        margin: {

            left: 14,

            right: 14

        }

    });


    // --------------------------------------
    // GRÁFICA PARA PDF
    // --------------------------------------

    if (
        registrosActuales &&
        registrosActuales.length > 0
    ) {

        // ----------------------------------
        // Crear canvas temporal de alta
        // resolución
        // ----------------------------------

        const canvasPDF =
            document.createElement("canvas");

        canvasPDF.width = 1400;

        canvasPDF.height = 650;


        // ----------------------------------
        // Obtener contexto
        // ----------------------------------

        const contexto =
            canvasPDF.getContext("2d");


        // ----------------------------------
        // Ordenar registros
        // ----------------------------------

        const registrosGrafica =
            [...registrosActuales].sort(
                function (a, b) {

                    return (
                        Number(a.id) -
                        Number(b.id)
                    );

                }
            );


        // ----------------------------------
        // Etiquetas
        // ----------------------------------

        const etiquetasPDF =
            registrosGrafica.map(
                function (registro) {

                    return (
                        formatearFechaPDF(
                            registro.fecha
                        )
                        +
                        "\n" +
                        formatearHora(
                            registro.hora
                        )
                    );

                }
            );


        // ----------------------------------
        // Valores
        // ----------------------------------

        const valoresPDF =
            registrosGrafica.map(
                function (registro) {

                    return Number(
                        registro.glucosa
                    );

                }
            );


        // ----------------------------------
        // Crear gráfica
        // ----------------------------------

        const graficaPDF =
            new Chart(
                contexto,
                {

                    type: "line",

                    data: {

                        labels: etiquetasPDF,

                        datasets: [

                            {

                                label:
                                    "Glucosa (mg/dL)",

                                data: valoresPDF,

                                borderColor:
                                    "#1F53DD",

                                backgroundColor:
                                    "rgba(31, 83, 221, 0.10)",

                                borderWidth: 5,

                                pointRadius: 8,

                                pointHoverRadius: 8,

                                pointBackgroundColor:
                                    "#1F53DD",

                                pointBorderColor:
                                    "#FFFFFF",

                                pointBorderWidth: 3,

                                tension: 0.25,

                                fill: true

                            }

                        ]

                    },


                    options: {

                        responsive: false,

                        animation: false,

                        maintainAspectRatio: false,


                        plugins: {

                            legend: {

                                display: false

                            },


                            tooltip: {

                                enabled: false

                            }

                        },


                        scales: {

                            y: {

                                beginAtZero: false,

                                suggestedMin:
                                    Math.max(
                                        0,
                                        Math.min(
                                            ...valoresPDF
                                        ) - 10
                                    ),

                                suggestedMax:
                                    Math.max(
                                        ...valoresPDF
                                    ) + 10,

                                title: {

                                    display: true,

                                    text:
                                        "Glucosa (mg/dL)",

                                    font: {

                                        size: 18,

                                        weight: "bold"

                                    }

                                },

                                ticks: {

                                    font: {

                                        size: 16

                                    }

                                },

                                grid: {

                                    color:
                                        "#E5E7EB"

                                }

                            },


                            x: {

                                title: {

                                    display: true,

                                    text:
                                        "Fecha y hora",

                                    font: {

                                        size: 18,

                                        weight: "bold"

                                    }

                                },

                                ticks: {

                                    font: {

                                        size: 15

                                    },

                                    maxRotation: 0,

                                    minRotation: 0

                                },

                                grid: {

                                    color:
                                        "#E5E7EB"

                                }

                            }

                        }

                    }

                }
            );


        // ----------------------------------
        // Posición en PDF
        // ----------------------------------

        let posicionY =
            documento.lastAutoTable.finalY + 15;


        // ----------------------------------
        // Nueva página si es necesario
        // ----------------------------------

        if (posicionY > 195) {

            documento.addPage();

            posicionY = 20;

        }


        // ----------------------------------
        // Título
        // ----------------------------------

        documento.setTextColor(
            31,
            41,
            55
        );

        documento.setFont(
            "helvetica",
            "bold"
        );

        documento.setFontSize(13);

        documento.text(
            "Evolución de glucosa",
            14,
            posicionY
        );


        // ----------------------------------
        // Convertir gráfica a imagen
        // ----------------------------------

        const imagenGrafica =
            canvasPDF.toDataURL(
                "image/png",
                1.0
            );


        // ----------------------------------
        // Agregar gráfica
        // ----------------------------------

        documento.addImage(

            imagenGrafica,

            "PNG",

            14,

            posicionY + 7,

            182,

            90

        );


        // ----------------------------------
        // Destruir Chart temporal
        // ----------------------------------

        graficaPDF.destroy();

    }


    // --------------------------------------
    // PIE DE PÁGINA
    // --------------------------------------

    const numeroPaginas =
        documento.internal
            .getNumberOfPages();


    for (
        let pagina = 1;
        pagina <= numeroPaginas;
        pagina++
    ) {

        documento.setPage(
            pagina
        );


        documento.setFontSize(8);

        documento.setFont(
            "helvetica",
            "normal"
        );


        documento.setTextColor(
            120,
            120,
            120
        );


        documento.text(
            `Control de Glucosa • Página ${pagina} de ${numeroPaginas}`,
            105,
            290,
            {
                align: "center"
            }
        );

    }


    // --------------------------------------
    // DESCARGAR
    // --------------------------------------

    documento.save(
        `control-glucosa-${fechaTexto.replace(
            /\//g,
            "-"
        )}.pdf`
    );

}

// ==========================================
// BOTÓN PDF
// ==========================================

const btnPDF =
    document.getElementById(
        "btnPDF"
    );


btnPDF.addEventListener(
    "click",
    function () {

        generarPDF();

    }
);

// ==========================================
// FORMATEAR FECHA PARA PDF
// ==========================================

function formatearFechaPDF(fecha) {

    if (!fecha) {

        return "";

    }


    const meses = [

        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC"

    ];


    // ------------------------------
    // DD/MM/YYYY
    // ------------------------------

    if (fecha.includes("/")) {

        const partes =
            fecha.split("/");


        if (partes.length === 3) {

            const dia = partes[0];

            const mes = partes[1];

            const año = partes[2];


            return `${dia} ${meses[
                Number(mes) - 1
            ]} ${año}`;

        }

    }


    // ------------------------------
    // YYYY-MM-DD
    // ------------------------------

    if (fecha.includes("-")) {

        const partes =
            fecha.split("-");


        if (partes.length === 3) {

            const año = partes[0];

            const mes = partes[1];

            const dia = partes[2];


            return `${dia} ${meses[
                Number(mes) - 1
            ]} ${año}`;

        }

    }


    return fecha;

}

// ==========================================
// REGISTRAR PWA
// ==========================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(function(registro) {

                    console.log(
                        "PWA: Service Worker registrado",
                        registro.scope
                    );

                })
                .catch(function(error) {

                    console.error(
                        "PWA: Error registrando Service Worker:",
                        error
                    );

                });

        }
    );

}
