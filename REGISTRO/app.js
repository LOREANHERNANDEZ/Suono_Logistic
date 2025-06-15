document.getElementById("registroForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
  
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
  
    alert(`¡Bienvenido, ${nombre}!\nTu cuenta ha sido registrada correctamente.`);
  });
  