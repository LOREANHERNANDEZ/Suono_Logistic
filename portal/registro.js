// ======= Inputs =======
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const emailInput = document.getElementById("email");
const telefonoInput = document.getElementById("telefono");
const contraseñaInput = document.getElementById("contraseña");
const confirmarContraseñaInput = document.getElementById("confirmarContraseña");
const errorMensaje = document.getElementById("errorMensaje");
const aceptaTerminos = document.getElementById("aceptaTerminos");
const consentimiento = document.getElementById("consentimiento");

// ======= Modal =======
const modal = document.getElementById("modalExito");
const cerrarModal = document.getElementById("cerrarModal");

// ======= Iconos de ojo =======
const toggleContraseña = document.getElementById("toggleContraseña");
const toggleConfirmarContraseña = document.getElementById("toggleConfirmarContraseña");

// Evitar números o símbolos en nombre y apellido
[nombreInput, apellidoInput].forEach(input => {
  input.addEventListener("input", function() {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');
  });
});

// Evitar letras en teléfono
telefonoInput.addEventListener("input", function() {
  this.value = this.value.replace(/\D/g, '');
});

// Validación de coincidencia de contraseñas en tiempo real
confirmarContraseñaInput.addEventListener("input", function() {
  if (contraseñaInput.value !== confirmarContraseñaInput.value) {
    errorMensaje.textContent = "Las contraseñas no coinciden.";
  } else {
    errorMensaje.textContent = "";
  }
});

// Toggle contraseña y cambiar icono
function togglePassword(input, icon) {
  if (input.type === "password") {
    input.type = "text";
    icon.textContent = "🙈"; // ojo cerrado
  } else {
    input.type = "password";
    icon.textContent = "👁️"; // ojo abierto
  }
}

toggleContraseña.addEventListener("click", () => togglePassword(contraseñaInput, toggleContraseña));
toggleConfirmarContraseña.addEventListener("click", () => togglePassword(confirmarContraseñaInput, toggleConfirmarContraseña));

// ======= Función para mostrar modal =======
function mostrarModalExito() {
  modal.classList.add("show");
}

// Cerrar modal y redirigir
cerrarModal.onclick = function() {
  modal.classList.remove("show");
  setTimeout(() => {
    window.location.href = "/portal/panel_cliente.html";
  }, 300);
};

// Cerrar modal si se hace clic fuera del contenido
window.onclick = function(event) {
  if (event.target === modal) {
    modal.classList.remove("show");
    setTimeout(() => {
      window.location.href = "/portal/panel_cliente.html";
    }, 300);
  }
};

// ======= Validación y envío del formulario =======
document.getElementById("formRegistro").addEventListener("submit", async function(e) {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const apellido = apellidoInput.value.trim();
  const correo = (emailInput && emailInput.value || '').trim();
  const telefono = telefonoInput.value.trim();
  const contraseña = contraseñaInput.value;
  const confirmarContraseña = confirmarContraseñaInput.value;
  const acepta = aceptaTerminos ? aceptaTerminos.checked : false;
  const consiente = consentimiento ? consentimiento.checked : false;

  // Validaciones
  if (!nombre) { errorMensaje.textContent = "Ingrese su nombre."; return; }
  if (!apellido) { errorMensaje.textContent = "Ingrese su apellido."; return; }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  if (!correoValido) { errorMensaje.textContent = "Ingrese un correo válido."; return; }

  const telefonoValido = /^\d{1,10}$/.test(telefono);
  if (!telefonoValido) { errorMensaje.textContent = "El teléfono debe tener máximo 10 dígitos y solo números."; return; }

  if (contraseña.length < 8) { errorMensaje.textContent = "La contraseña debe tener mínimo 8 caracteres."; return; }
  if (contraseña !== confirmarContraseña) { errorMensaje.textContent = "Las contraseñas no coinciden."; return; }

  if (!acepta) { errorMensaje.textContent = "Debes aceptar la política de privacidad."; return; }
  if (!consiente) { errorMensaje.textContent = "Debes aceptar los Términos y Condiciones de Suono Logistic."; return; }

  // ======= Enviar datos al backend =======
  try {
  const res = await fetch("/api/cliente/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        apellido,
        email: correo,
        telefono,
        password: contraseña,
        aceptaTerminos: acepta,
        consentimiento: consiente
      })
    });

    const data = await res.json();

    if (res.ok) {
      errorMensaje.textContent = "";
      this.reset();
      mostrarModalExito();
    } else {
      errorMensaje.textContent = data.message || "Error al registrar usuario";
    }

  } catch (err) {
    console.error(err);
    errorMensaje.textContent = "Error al conectarse al servidor.";
  }
});
