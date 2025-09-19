const express = require('express');
const router = express.Router();
const Usuario = require('./modeloUsuario');
const bcrypt = require('bcryptjs');

router.use(express.urlencoded({ extended: true }));

// Función para renderizar el formulario con valores y mensajes
function renderFormulario({
  mensaje = '',
  tipo = 'info',
  redireccionar = false,
  redireccionURL = '/login',
  nombre = '',
  telefono = '',
  email = ''
}) {
  const color = tipo === 'error' ? 'red' : 'green';

  return `
    <html>
    <head>
      <title>Registro</title>
      <link rel="stylesheet" href="/public/estilos.css">
      ${redireccionar ? `<meta http-equiv="refresh" content="2;url=${redireccionURL}">` : ''}
    </head>
    <body>
      <div class="container">
        <div class="left-section">
          <div class="image-placeholder"></div>
        </div>
        <div class="right-section">
          <h2>Crear cuenta</h2>
          ${mensaje ? `<p style="color: ${color}; font-weight: bold; text-align: center;">${mensaje}</p>` : ''}
          <form action="/insertar" method="POST">
              <label>Nombre</label>
              <input type="text" name="nombre" pattern="[A-Za-z\\s]+" title="Solo letras" required value="${nombre}">

              <label>Teléfono</label>
              <input type="tel" name="telefono" pattern="[0-9]+" title="Solo números" required value="${telefono}">

              <label>Email</label>
              <input type="email" name="email" required value="${email}">

              <label>Contraseña</label>
              <input type="password" name="password" minlength="7" required>

              <label>Confirmar contraseña</label>
              <input type="password" name="confirmar_password" minlength="7" required>

              <button type="submit">Registrarse</button>
          </form>
          <p class="center-text">¿Ya estás registrado? <a href="/login">Iniciar sesión</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// GET
router.get('/', (req, res) => {
  res.send(renderFormulario({}));
});

// POST
router.post('/', async (req, res) => {
  const { nombre, telefono, email, password, confirmar_password } = req.body;
  const datos = { nombre, telefono, email };

  if (password !== confirmar_password) {
    return res.send(renderFormulario({
      mensaje: 'Las contraseñas no coinciden.',
      tipo: 'error',
      ...datos
    }));
  }

  if (password.length < 7) {
    return res.send(renderFormulario({
      mensaje: 'La contraseña debe tener al menos 7 caracteres.',
      tipo: 'error',
      ...datos
    }));
  }

  const existente = await Usuario.findOne({ $or: [{ email }, { nombre }] });
  if (existente) {
    return res.send(renderFormulario({
      mensaje: 'El correo o nombre ya están registrados.',
      tipo: 'error',
      ...datos
    }));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await Usuario.create({ nombre, telefono, email, password: hashedPassword });
    res.send(renderFormulario({
      mensaje: '✅ Cuenta registrada. Redirigiendo al panel...',
      tipo: 'success',
      redireccionar: true,
      redireccionURL: '/paneladmi/admin.html'
    }));
  } catch (err) {
    res.send(renderFormulario({
      mensaje: 'Error al insertar: ' + err.message,
      tipo: 'error',
      ...datos
    }));
  }
});

module.exports = router;
