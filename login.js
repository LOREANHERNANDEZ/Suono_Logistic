const express = require('express');
const router = express.Router();
const Usuario = require('./modeloUsuario');

router.use(express.urlencoded({ extended: true }));

// --- FORMULARIO LOGIN ---
router.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Iniciar Sesión</title>
      <link rel="stylesheet" href="/public/estilos.css">
    </head>
    <body>
      <div class="container">
        <div class="left-section">
          <div class="image-placeholder"></div>
        </div>
        <div class="right-section">
          <h2>Iniciar sesión</h2>
          <form action="/login" method="POST">
              <label>Correo electrónico</label>
              <input type="email" name="email" placeholder="ejemplo@correo.com" required>

              <label>Contraseña</label>
              <input type="password" name="password" placeholder="********" required>

              <button type="submit">Entrar</button>
          </form>
          <p class="center-text"><a href="/recuperar">¿Olvidaste tu contraseña?</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// --- PROCESAR LOGIN ---
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.send('<p>❌ Usuario no encontrado</p><a href="/login">Intentar de nuevo</a>');
    }

    // usamos el método compararPassword del modelo
    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.send('<p>❌ Contraseña incorrecta</p><a href="/login">Intentar de nuevo</a>');
    }

    // Determinar rol por correo
    let rol = 'colaborador';
    if (usuario.email.endsWith('@suono.com')) {
      rol = 'admin';
    }

    // Guardar sesión
    req.session.usuario = usuario.email;
    req.session.nombre = usuario.nombre;
    req.session.rol = rol;

    // Enviar rol al frontend (puedes ajustar según si usas fetch/ajax o redirección)
    res.send(`
      <script>
        localStorage.setItem('usuario', JSON.stringify({ email: '${usuario.email}', nombre: '${usuario.nombre}', rol: '${rol}' }));
        window.location.href = '/paneladmi/admin.html';
      </script>
    `);
  } catch (err) {
    console.error(err);
    res.send('<p>⚠️ Error en el servidor</p><a href="/login">Volver</a>');
  }
});

module.exports = router;