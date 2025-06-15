document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;

  if (correo && contrasena) {
    alert("Inicio de sesión exitoso (simulado)");
  } else {
    alert("Por favor, completa todos los campos.");
  }
});

function recuperarContrasena() {
  const correo = document.getElementById("correo").value;
  if (correo) {
    alert(`Se enviará un correo a ${correo} con instrucciones para recuperar la contraseña.`);
  } else {
    alert("Por favor, ingresa tu correo electrónico.");
  }
}
