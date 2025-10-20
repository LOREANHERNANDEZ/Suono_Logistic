const express = require('express');
const router = express.Router();
const Usuario = require('./modeloUsuario'); // Modelo Usuario
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const TokenRecuperacion = require('./modeloTokenRecuperacion'); // Modelo Token

router.use(express.urlencoded({ extended: true }));

// --- Página de inicio de recuperación (formulario para poner email) ---
router.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Recuperar contraseña</title>
      <link rel="stylesheet" href="/public/estilos.css">
    </head>
    <body>
      <div class="container">
        <div class="left-section">
          <div class="image-placeholder"></div>
        </div>
        <div class="right-section">
          <h2>Recuperar contraseña</h2>
          <form action="/recuperar" method="POST">
            <label>Correo electrónico</label>
            <input type="email" name="email" placeholder="ejemplo@correo.com" required>
            <button type="submit">Enviar enlace</button>
          </form>
          <p class="center-text"><a href="/login">Volver al login</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// --- Solicitar token de recuperación ---
router.post('/', async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    return res.send(`
      <html>
      <head><title>Error</title><link rel="stylesheet" href="/public/estilos.css"></head>
      <body>
        <div class="container">
          <div class="left-section"><div class="image-placeholder"></div></div>
          <div class="right-section">
            <h2>❌ Correo no registrado</h2>
            <p>El correo ingresado no está en nuestra base de datos.</p>
            <p class="center-text"><a href="/recuperar">Intentar de nuevo</a></p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  // Genera token temporal
  const token = crypto.randomBytes(32).toString('hex');
  const expiracion = Date.now() + 3600000; // 1 hora

  // Guarda/actualiza token en BD
  await TokenRecuperacion.findOneAndUpdate(
    { usuario: usuario._id },
    { token, expiracion },
    { upsert: true, new: true }
  );

  // Enlace de recuperación
  const link = `http://localhost:3000/recuperar/reset/${token}`;

  // Configuración de correo
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || "logisticsuono@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD || "dglx dhju ojsr pwfx"
    }
  });

  const opciones = {
    from: process.env.GMAIL_USER || "logisticsuono@gmail.com",
    to: usuario.email,
    subject: 'Restablecer contraseña',
    html: `<p>Hola ${usuario.nombre || usuario.email},</p>
           <p>Haz clic para restablecer tu contraseña (válido 1 hora):</p>
           <a href="${link}">${link}</a>`
  };

  try {
    await transporter.sendMail(opciones);
    res.send(`
      <html>
      <head><title>Correo enviado</title><link rel="stylesheet" href="/public/estilos.css"></head>
      <body>
        <div class="container">
          <div class="left-section"><div class="image-placeholder"></div></div>
          <div class="right-section">
            <h2>📬 Correo enviado</h2>
            <p>Revisa tu bandeja y sigue el enlace para restablecer tu contraseña.</p>
            <p class="center-text"><a href="/login">Volver al login</a></p>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.send(`
      <html>
      <head><title>Error</title><link rel="stylesheet" href="/public/estilos.css"></head>
      <body>
        <div class="container">
          <div class="left-section"><div class="image-placeholder"></div></div>
          <div class="right-section">
            <h2>❌ Error al enviar correo</h2>
            <p>Ocurrió un problema al enviar el email. Intenta más tarde.</p>
            <p class="center-text"><a href="/recuperar">Volver a intentar</a></p>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// --- Formulario para resetear contraseña ---
router.get('/reset/:token', async (req, res) => {
  const { token } = req.params;
  const registro = await TokenRecuperacion.findOne({ token });

  if (!registro || registro.expiracion < Date.now()) {
    return res.send(`
      <html>
      <head><title>Token inválido</title><link rel="stylesheet" href="/public/estilos.css"></head>
      <body>
        <div class="container">
          <div class="left-section"><div class="image-placeholder"></div></div>
          <div class="right-section">
            <h2>❌ Token inválido o expirado</h2>
            <p>Solicita un nuevo enlace de recuperación.</p>
            <p class="center-text"><a href="/recuperar">Solicitar nuevo</a></p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  res.send(`
    <html>
    <head>
      <title>Restablecer contraseña</title>
      <link rel="stylesheet" href="/public/estilos.css">
    </head>
    <body>
      <div class="container">
        <div class="left-section"><div class="image-placeholder"></div></div>
        <div class="right-section">
          <h2>Restablecer contraseña</h2>
          <form action="/recuperar/reset/${token}" method="POST">
            <label>Nueva contraseña</label>
            <input type="password" name="password" required minlength="7">
            <label>Confirmar contraseña</label>
            <input type="password" name="confirmar" required minlength="7">
            <button type="submit">Actualizar</button>
          </form>
          <p class="center-text"><a href="/login">Cancelar</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// --- Procesar nueva contraseña ---
router.post('/reset/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirmar } = req.body;
  const registro = await TokenRecuperacion.findOne({ token });

  if (!registro || registro.expiracion < Date.now()) {
    return res.send(`
      <html>
      <head><title>Error</title><link rel="stylesheet" href="/public/estilos.css"></head>
      <body>
        <div class="container">
          <div class="left-section"><div class="image-placeholder"></div></div>
          <div class="right-section">
            <h2>❌ Token inválido o expirado</h2>
            <p>Vuelve a solicitar un nuevo enlace.</p>
            <p class="center-text"><a href="/recuperar">Solicitar nuevo</a></p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  if (password !== confirmar) {
    return res.send(`
      <html>
      <head><title>Error</title><link rel="stylesheet" href="/public/estilos.css"></head>
      <body>
        <div class="container">
          <div class="left-section"><div class="image-placeholder"></div></div>
          <div class="right-section">
            <h2>❌ Las contraseñas no coinciden</h2>
            <p>Vuelve a intentarlo.</p>
            <p class="center-text"><a href="/recuperar/reset/${token}">Intentar de nuevo</a></p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  const hashed = await bcrypt.hash(password, 10);
  await Usuario.findByIdAndUpdate(registro.usuario, { password: hashed });
  await TokenRecuperacion.deleteOne({ token }); // Elimina el token usado

  res.send(`
    <html>
    <head><title>Contraseña actualizada</title><link rel="stylesheet" href="/public/estilos.css"></head>
    <body>
      <div class="container">
        <div class="left-section"><div class="image-placeholder"></div></div>
        <div class="right-section">
          <h2>✅ Contraseña actualizada</h2>
          <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <p class="center-text"><a href="/login">Ir al login</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;