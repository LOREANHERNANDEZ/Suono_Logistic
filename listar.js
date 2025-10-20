const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('./conexion'); // ✅ Conexión a MongoDB

// Modelos
const Usuario = require('./modeloUsuario');
const TokenRecuperacion = require('./modeloTokenRecuperacion');
const Cliente = require('./modeloCliente');

const app = express();
const PORT = 3000;

// Configuración de sesión
app.use(session({
  secret: 'suono_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true si usas HTTPS
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/portal', express.static(path.join(__dirname, 'portal')));
app.use('/paneladmi', express.static(path.join(__dirname, 'paneladmi')));

// --- Middleware de protección ---
function requireLogin(req, res, next) {
  if (req.session && req.session.usuario) next();
  else res.redirect('/login');
}

// --- Panel protegido ---
app.get('/paneladmi/admin.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'paneladmi', 'admin.html'));
});

// --- Inicio ---
app.get('/', (req, res) => {
  res.redirect('/portal/inicio.html');
});

// --- Listar usuarios ---
app.get('/usuarios', async (req, res) => {
  try {
    const resultados = await Usuario.find();
    let tabla = `
    <html>
    <head>
        <title>Usuarios</title>
        <link rel="stylesheet" href="/public/estilos.css">
    </head>
    <body>
    <div class="container">
      <div class="left-section"><div class="image-placeholder"></div></div>
      <div class="right-section">
        <h2>Lista de Usuarios</h2>
        <a href="/insertar">Agregar Usuario</a> | 
        <a href="/login">Iniciar Sesión</a>
        <table border="1" style="margin-top:15px; width:100%; background:#222; color:white; border-collapse:collapse;">
          <tr><th>ID</th><th>Nombre</th><th>Email</th></tr>`;
    resultados.forEach(u => {
      tabla += `<tr><td>${u._id}</td><td>${u.nombre}</td><td>${u.email}</td></tr>`;
    });
    tabla += `</table></div></div></body></html>`;
    res.send(tabla);
  } catch (err) {
    res.send('❌ Error al consultar la BD: ' + err.message);
  }
});

// --- Usuario logueado ---
app.get('/api/usuario-actual', async (req, res) => {
  if (!req.session || !req.session.usuario) return res.json({});
  try {
    const usuario = await Usuario.findOne({ email: req.session.usuario });
    if (!usuario) return res.json({});
    res.json({ nombre: usuario.nombre, email: usuario.email });
  } catch {
    res.json({});
  }
});

// Devuelve información del cliente logueado (panel cliente)
app.get('/api/cliente/actual', async (req, res) => {
  try {
    if (!req.session || !req.session.cliente) return res.json({});
    const cliente = await Cliente.findById(req.session.cliente.id).select('-password');
    if (!cliente) return res.json({});
    res.json(cliente);
  } catch (err) {
    console.error('Error en /api/cliente/actual', err);
    res.json({});
  }
});

// --- LOGIN & otros módulos ---
app.use('/insertar', require('./insertar'));
app.use('/login', require('./login'));
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Error cerrando sesión' });
    res.clearCookie('connect.sid');
    res.sendStatus(200);
  });
});

// ======================================================
// 🔹 Recuperar contraseña (incluye correo con token)
// ======================================================
app.get('/recuperar', (req, res) => {
  res.send(`
  <html>
  <head><title>Recuperar contraseña</title><link rel="stylesheet" href="/public/estilos.css"></head>
  <body>
    <div class="container">
      <div class="left-section"><div class="image-placeholder"></div></div>
      <div class="right-section">
        <h2>Recuperar contraseña</h2>
        <form method="POST" action="/recuperar">
          <label>Correo electrónico</label>
          <input type="email" name="email" required>
          <button type="submit">Enviar enlace</button>
        </form>
        <div class="center-text"><a href="/login">Volver al login</a></div>
      </div>
    </div>
  </body>
  </html>
  `);
});

app.post('/recuperar', async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    return res.send(renderMsg("❌ Correo no registrado.", "/recuperar"));
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiracion = Date.now() + 3600000;
  await TokenRecuperacion.findOneAndUpdate(
    { usuario: usuario._id },
    { token, expiracion },
    { upsert: true }
  );

  const link = `http://localhost:${PORT}/recuperar/reset/${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: usuario.email,
      subject: "Restablecer contraseña",
      html: `<p>Hola ${usuario.nombre},</p><p>Haz clic en el enlace para restablecer tu contraseña:</p><a href="${link}">${link}</a>`
    });
    res.send(renderMsg("📬 Correo enviado. Revisa tu bandeja.", "/login"));
  } catch (err) {
    console.error(err);
    res.send(renderMsg("❌ Error al enviar correo.", "/recuperar"));
  }
});

// --- FORM RESET ---
app.get('/recuperar/reset/:token', async (req, res) => {
  const registro = await TokenRecuperacion.findOne({ token: req.params.token });
  if (!registro || registro.expiracion < Date.now()) {
    return res.send(renderMsg("❌ Token inválido o expirado.", "/recuperar"));
  }
  res.send(`
  <html>
  <head><title>Restablecer contraseña</title><link rel="stylesheet" href="/public/estilos.css"></head>
  <body>
    <div class="container">
      <div class="left-section"><div class="image-placeholder"></div></div>
      <div class="right-section">
        <h2>Restablecer contraseña</h2>
        <form method="POST" action="/recuperar/reset/${req.params.token}">
          <label>Nueva contraseña</label>
          <input type="password" name="password" required minlength="7">
          <label>Confirmar contraseña</label>
          <input type="password" name="confirmar" required minlength="7">
          <button type="submit">Actualizar</button>
        </form>
      </div>
    </div>
  </body>
  </html>
  `);
});

app.post('/recuperar/reset/:token', async (req, res) => {
  const registro = await TokenRecuperacion.findOne({ token: req.params.token });
  if (!registro || registro.expiracion < Date.now()) {
    return res.send(renderMsg("❌ Token inválido o expirado.", "/recuperar"));
  }
  if (req.body.password !== req.body.confirmar) {
    return res.send(renderMsg("❌ Las contraseñas no coinciden.", `/recuperar/reset/${req.params.token}`));
  }
  const hashed = await bcrypt.hash(req.body.password, 10);
  await Usuario.findByIdAndUpdate(registro.usuario, { password: hashed });
  await TokenRecuperacion.deleteOne({ token: req.params.token });
  res.send(renderMsg("✅ Contraseña actualizada correctamente.", "/login"));
});

// --- FUNCION PARA MENSAJES ---
function renderMsg(msg, link) {
  return `
  <html>
  <head><title>Mensaje</title><link rel="stylesheet" href="/public/estilos.css"></head>
  <body>
    <div class="container">
      <div class="left-section"><div class="image-placeholder"></div></div>
      <div class="right-section">
        <h2>${msg}</h2>
        <div class="center-text"><a href="${link}">Volver</a></div>
      </div>
    </div>
  </body>
  </html>
  `;
}

// ======================================================
// 🔹 Integración de Rutas Cliente (moved to backend/clientes)
// ======================================================
const clienteRoutes = require('./backend/clientes/clientesRoutes');
const loginClienteRoutes = require('./backend/clientes/loginClienteRoutes');
app.use('/api/cliente', clienteRoutes);
app.use('/api/cliente/login', loginClienteRoutes);

// ======================================================
// 🔹 Rutas de otros módulos
// ======================================================
app.use('/api/clientes', require('./backend/clientes/clientesRoutes'));
app.use('/api/colaboradores', require('./colaboradores'));
app.use('/api/proveedores', require('./proveedores'));
app.use('/api/eventos', require('./eventos'));
app.use('/api/pqr', require('./pqr'));
app.use('/api/reportes', require('./reportes'));
app.use('/api/inventario', require('./inventario'));
app.use('/api/reservas', require('./reservas'));

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
