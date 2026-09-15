const CLAVE = "encomienda_s4";
const pagina = document.body.dataset.pagina;
let datos = null;

const moneda = n => "S/ " + Number(n).toFixed(2);

try {
  datos = JSON.parse(sessionStorage.getItem(CLAVE));
} catch {
  sessionStorage.removeItem(CLAVE);
}

const form = document.querySelector("#encomienda");

if (form) {
  if (datos) {
    form.elements.remitente.value = datos.remitente || "";
    form.elements.correo.value = datos.correo || "";
    form.elements.destino.value = datos.destino || "";
    form.elements.peso.value = datos.peso || "";
    form.elements.servicio.value = datos.servicio || "estandar";
    form.elements.embalaje.checked = datos.embalaje === "si";
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const mensaje = document.querySelector("#mensaje");
    const remitente = form.elements.remitente.value.trim();
    const peso = Number(form.elements.peso.value);

    if (remitente.length < 3) {
      mensaje.textContent = "El remitente debe tener al menos 3 caracteres.";
      return;
    }
    if (peso < 0.1 || peso > 30) {
      mensaje.textContent = "El peso debe estar entre 0.1 y 30 kg.";
      return;
    }

    datos = {
      remitente,
      correo: form.elements.correo.value.trim(),
      destino: form.elements.destino.value,
      peso: peso,
      servicio: form.elements.servicio.value,
      embalaje: form.elements.embalaje.checked ? "si" : "no",
      estado: "borrador"
    };

    sessionStorage.setItem(CLAVE, JSON.stringify(datos));
    location.href = "confirmar.html";
  });
}

function calcularCotizacion(d) {
  const tarifasBase = { "Lima": 12, "Cusco": 10, "Puno": 9 };
  const base = tarifasBase[d.destino];
  
  const pesoFacturable = Math.ceil(d.peso);
  const costoPeso = pesoFacturable * 3;
  
  const subtotal = base + costoPeso;
  
  const expres = d.servicio === "expres" ? Math.round((subtotal * 0.20) * 100) / 100 : 0;
  
  const embalajeCosto = d.embalaje === "si" ? 5 : 0;
  
  const total = subtotal + expres + embalajeCosto;

  return { base, pesoFacturable, costoPeso, expres, embalajeCosto, total };
}

if (pagina === "confirmar" || pagina === "resumen") {
  if (!datos) {
    location.replace("index.html");
  } else if (pagina === "resumen" && datos.estado !== "confirmado") {
    location.replace("confirmar.html");
  } else {
    const calc = calcularCotizacion(datos);

    document.querySelector("#detalle").textContent = [
      "Remitente: " + datos.remitente,
      "Correo: " + datos.correo,
      "Destino: " + datos.destino,
      "Servicio: " + (datos.servicio === "expres" ? "Exprés" : "Estándar"),
      "- Desglose -",
      "Peso real: " + datos.peso + " kg",
      "Peso facturable: " + calc.pesoFacturable + " kg",
      "Base por destino: " + moneda(calc.base),
      "Costo por peso: " + moneda(calc.costoPeso),
      "Recargo Exprés: " + moneda(calc.expres),
      "Costo de Embalaje: " + moneda(calc.embalajeCosto),
      "TOTAL A PAGAR: " + moneda(calc.total),
      "---",
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