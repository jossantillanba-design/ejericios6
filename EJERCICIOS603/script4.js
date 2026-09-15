const formulario = document.querySelector("#pedido");
const salida = document.querySelector("#resultado");
const mensaje = document.querySelector("#mensaje");
const moneda = n => "S/ " + n.toFixed(2);

function calcularYProcesar(guardar = false) {
  mensaje.textContent = "";

  const cliente = formulario.elements.cliente.value.trim();
  const correo = formulario.elements.correo.value.trim();
  const color = formulario.elements.color.value;
  const s = Number(formulario.elements.tallaS.value);
  const m = Number(formulario.elements.tallaM.value);
  const l = Number(formulario.elements.tallaL.value);
  const estampado = formulario.elements.estampado.checked;
  const observaciones = formulario.elements.observaciones.value.trim();

  if (guardar && !cliente) {
    mensaje.textContent = "Escribe un nombre, no solo espacios.";
    formulario.elements.cliente.focus();
    return false;
  }

  const tallas = [s, m, l];
  const sonValidas = tallas.every(n => Number.isInteger(n) && n >= 0 && n <= 200);

  if (!sonValidas) {
    salida.textContent = "";
    mensaje.textContent = "Cantidad decimal o negativa: No permite continuar.";
    return false;
  }

  const totalPolos = tallas.reduce((acc, cant) => acc + cant, 0);

  if (totalPolos === 0) {
    salida.textContent = "";
    mensaje.textContent = "Bloqueo por total cero.";
    return false;
  }
  if (totalPolos > 200) {
    salida.textContent = "";
    mensaje.textContent = "Bloqueo por total > 200.";
    return false;
  }

  const subtotal = totalPolos * 1800;
  const descuento = totalPolos >= 24 ? Math.round(subtotal * 0.07) : 0;
  const costoEstampado = estampado ? (totalPolos * 400) : 0;
  const total = subtotal - descuento + costoEstampado;

  salida.textContent = [
    "Cliente: " + (cliente || "Sin especificar") + " (" + (correo || "Sin correo") + ")",
    "Color: " + color.toUpperCase(),
    "Tallas: S=" + s + ", M=" + m + ", L=" + l,
    "Total prendas: " + totalPolos + " polos",
    "Subtotal prendas: " + moneda(subtotal / 100),
    "Descuento (7%): " + moneda(descuento / 100),
    "Estampado: " + moneda(costoEstampado / 100),
    "Total a pagar: " + moneda(total / 100)
  ].join("\n");

  if (guardar) {
    const pedidoObj = {
      cliente, correo, color,
      tallas: { S: s, M: m, L: l },
      estampado, observaciones,
      totales: { totalPolos, subtotal: subtotal / 100, descuento: descuento / 100, estampado: costoEstampado / 100, total: total / 100 }
    };
    localStorage.setItem("textil_s4", JSON.stringify(pedidoObj));
    alert("¡Pedido guardado correctamente con la clave textil_s4!");
  }

  return true;
}

formulario.addEventListener("submit", event => {
  event.preventDefault();
  calcularYProcesar(true);
});

formulario.addEventListener("input", () => calcularYProcesar(false));
formulario.addEventListener("reset", () => setTimeout(() => calcularYProcesar(false), 10));

calcularYProcesar(false);