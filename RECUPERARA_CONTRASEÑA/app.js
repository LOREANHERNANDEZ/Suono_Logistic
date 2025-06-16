document.getElementById("resetForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const nueva = document.getElementById("newPass").value;
  const confirmar = document.getElementById("confirmPass").value;

  if (nueva.length < 8) {
    alert("La contraseña debe tener al menos 8 caracteres.");
    return;
  }

  if (nueva !== confirmar) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  alert("Contraseña restablecida exitosamente (simulado).");
  // Aquí iría el llamado a backend real
});
