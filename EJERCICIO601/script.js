const CLAVE = "cancha_s4";
const pagina = document.body.dataset.pagina;
let datos = null;

try {
  datos = JSON.parse(sessionStorage.getItem(CLAVE));
} catch {
  sessionStorage.removeItem(CLAVE);
}

const moneda = n => "S/ " + n.toFixed(2);

// Lógica para index.html
const form = document.querySelector("#reserva");
if (form) {
  // Reto opcional: establecer fecha mínima como la fecha actual del equipo
  const inputFecha = form.elements.fecha;
  const hoy = new Date().toISOString().split("T")[0];
  inputFecha.min = hoy;

  // Restaurar datos al presionar 'Editar'
  if (datos) {
    for (const campo of ["responsable", "celular", "fecha", "turno", "horas"]) {
      form.elements[campo].value = datos[campo] || "";
    }
    form.querySelectorAll('[name="implementos"]').forEach(c => {
      c.checked = (datos.implementos || []).includes(c.value);
    });
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const mensaje = document.querySelector("#mensaje");
    mensaje.textContent = "";

    const responsable = form.elements.responsable.value.trim();
    const celular = form.elements.celular.value.trim();
    const fecha = form.elements.fecha.value;
    const turno = form.elements.turno.value;
    const horas = Number(form.elements.horas.value);
    const implementos = Array.from(
      form.querySelectorAll('[name="implementos"]:checked'),
      c => c.value
    );

    // Validaciones
    if (responsable.length < 3 || responsable.length > 70) {
      mensaje.textContent = "El responsable debe tener entre 3 y 70 caracteres.";
      return;
    }
    if (!/^9\d{8}$/.test(celular)) {
      mensaje.textContent = "El celular debe ser de 9 dígitos y comenzar con 9.";
      return;
    }
    if (fecha < hoy) {
      mensaje.textContent = "La fecha no puede ser anterior al día de hoy.";
      return;
    }
    if (!Number.isInteger(horas) || horas < 1 || horas > 3) {
      mensaje.textContent = "Las horas deben ser un número entero entre 1 y 3.";
      return;
    }

    // Cálculo de Tarifa con Switch
    let tarifaPorHora = 0;
    switch (turno) {
      case "Mañana":
        tarifaPorHora = 40;
        break;
      case "Tarde":
        tarifaPorHora = 50;
        break;
      case "Noche":
        tarifaPorHora = 65;
        break;
    }

    const costoHoras = horas * tarifaPorHora;
    const costoBalon = implementos.includes("Balón") ? 5 : 0;
    const costoChalecos = implementos.includes("Chalecos") ? 10 : 0;
    const costoImplementos = costoBalon + costoChalecos;
    const total = costoHoras + costoImplementos;

    datos = {
      responsable,
      celular,
      fecha,
      turno,
      horas,
      implementos,
      tarifaPorHora,
      costoHoras,
      costoImplementos,
      total,
      estado: "borrador"
    };

    sessionStorage.setItem(CLAVE, JSON.stringify(datos));
    location.href = "confirmar.html";
  });
}

// Lógica para confirmar.html y resumen.html
if (pagina === "confirmar" || pagina === "resumen") {
  if (!datos) {
    location.replace("index.html");
  } else if (pagina === "resumen" && datos.estado !== "confirmado") {
    location.replace("confirmar.html");
  } else {
    const textoImplementos = datos.implementos.length > 0 ? datos.implementos.join(", ") : "Ninguno";
    
    document.querySelector("#detalle").textContent = [
      "Responsable: " + datos.responsable,
      "Celular: " + datos.celular,
      "Fecha: " + datos.fecha,
      "Turno: " + datos.turno + " (" + moneda(datos.tarifaPorHora) + "/h)",
      "Horas reservadas: " + datos.horas,
      "Implementos: " + textoImplementos,
      "-----------------------------------",
      "Subtotal Horas: " + moneda(datos.costoHoras),
      "Subtotal Implementos: " + moneda(datos.costoImplementos),
      "Total a pagar: " + moneda(datos.total),
      "Estado: " + datos.estado
    ].join("\n");

    if (pagina === "confirmar") {
      document.querySelector("#confirmar").addEventListener("click", () => {
        datos.estado = "confirmado";
        sessionStorage.setItem(CLAVE, JSON.stringify(datos));
        location.href = "resumen.html";
      });
    } else {
      document.querySelector("#nuevo").addEventListener("click", () => {
        sessionStorage.removeItem(CLAVE);
        location.href = "index.html";
      });
    }
  }
}