const loginForm = document.getElementById('loginForm');
const errorMensaje = document.getElementById('errorMensaje');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('correo').value.trim();
  const password = document.getElementById('contraseña').value;

  if (!email || !password) {
    errorMensaje.textContent = 'Ingresa correo y contraseña';
    return;
  }

  try {
    const res = await fetch('/api/cliente/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      errorMensaje.textContent = '';

      // ✅ Guardar el cliente en localStorage
      localStorage.setItem("clienteActual", JSON.stringify(data.cliente));

      // ✅ Redirigir al panel de cliente
  window.location.href = '/portal/panel_cliente.html';
    } else {
      errorMensaje.textContent = data.error || 'Error al iniciar sesión';
    }
  } catch (err) {
    console.error('Error al conectar con el servidor:', err);
    errorMensaje.textContent = 'Error en el servidor. Intenta más tarde.';
  }
});

// ===== Toggle password visibility =====
const togglePwdBtn = document.getElementById('togglePassword');
const pwdInput = document.getElementById('contraseña');
if (togglePwdBtn && pwdInput) {
  togglePwdBtn.addEventListener('click', () => {
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      // change icon to indicate visible (simple stroke change)
      const eye = document.getElementById('eyeIcon');
      if (eye) eye.style.opacity = '0.6';
      togglePwdBtn.setAttribute('aria-label', 'Ocultar contraseña');
    } else {
      pwdInput.type = 'password';
      const eye = document.getElementById('eyeIcon');
      if (eye) eye.style.opacity = '1';
      togglePwdBtn.setAttribute('aria-label', 'Mostrar contraseña');
    }
  });
}
