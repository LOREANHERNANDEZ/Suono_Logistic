const express = require('express');
const router = express.Router();
const {
  CotizacionCliente,
  ReservaCliente,
  PqrCliente,
  ContactarAsesor
} = require('./modelUsuario');
const Cliente = require('../../modeloCliente');
const mongoose = require('mongoose');

// Simple counter model for sequential numbers
const counterSchema = new mongoose.Schema({ name: String, seq: Number });
const Counter = mongoose.model('counter', counterSchema);

// ====================== RUTAS DE CLIENTE ======================

// 1️⃣ Registrar cliente
router.post('/registro', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, password } = req.body;

    // Verificar si ya existe un cliente con el mismo correo
    const existente = await Cliente.findOne({ email });
    if (existente) {
      return res.status(400).json({ message: "❌ El cliente ya está registrado" });
    }

    // Encriptar la contraseña antes de guardar
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo cliente con contraseña encriptada
    const nuevoCliente = new Cliente({
      nombre,
      email,
      telefono,
      password: hashedPassword
    });

    await nuevoCliente.save();
    res.status(201).json({ message: "✅ Cliente registrado correctamente", cliente: nuevoCliente });

  } catch (err) {
    console.error("Error en /registro:", err);
    res.status(500).json({ message: "❌ Error al registrar cliente" });
  }
});

// 2️⃣ Actualizar información del cliente
router.post('/actualizar', async (req, res) => {
  try {
    const { email, telefono } = req.body;
    const cliente = await Cliente.findOneAndUpdate(
      { email },
      { telefono },
      { new: true }
    );
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ message: "✅ Información actualizada correctamente", cliente });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error al actualizar la información" });
  }
});

// 3️⃣ Guardar cotización
router.post('/cotizar', async (req, res) => {
  try {
    const data = req.body;
    // enforce clienteEmail from session if present
    if (req.session && req.session.cliente && req.session.cliente.email) {
      data.clienteEmail = req.session.cliente.email;
    }
    // validate date not in the past
    if (data.fecha && new Date(data.fecha) < new Date()) {
      return res.status(400).json({ message: 'La fecha no puede ser en el pasado' });
    }

    // get next sequence
    let ctr = await Counter.findOneAndUpdate({ name: 'cotizacion' }, { $inc: { seq: 1 } }, { upsert: true, new: true });
    const numero = ctr.seq;
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    data.numero = numero;
    data.identificador = `${numero}-${suffix}`;

    const nuevaCotizacion = new CotizacionCliente(data);
    await nuevaCotizacion.save();
    res.json({ message: "✅ Cotización guardada correctamente", numero, identificador: data.identificador, cotizacion: nuevaCotizacion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error al guardar cotización" });
  }
});

// 4️⃣ Guardar reserva
router.post('/reservar', async (req, res) => {
  try {
    const data = req.body;
    if (req.session && req.session.cliente && req.session.cliente.email) {
      data.clienteEmail = req.session.cliente.email;
    }
    if (data.fecha && new Date(data.fecha) < new Date()) {
      return res.status(400).json({ message: 'La fecha no puede ser en el pasado' });
    }
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    data.identificador = `R-${Date.now().toString().slice(-5)}-${suffix}`;
    const nuevaReserva = new ReservaCliente(data);
    await nuevaReserva.save();
    res.json({ message: "✅ Reserva guardada correctamente", identificador: data.identificador, reserva: nuevaReserva });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error al guardar reserva" });
  }
});

// 5️⃣ Guardar PQR
router.post('/pqr', async (req, res) => {
  try {
    const data = req.body;
    if (req.session && req.session.cliente && req.session.cliente.email) {
      data.clienteEmail = req.session.cliente.email;
    }
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    data.identificador = `P-${Date.now().toString().slice(-5)}-${suffix}`;
    const nuevoPqr = new PqrCliente(data);
    await nuevoPqr.save();
    res.json({ message: "✅ PQR guardada correctamente", identificador: data.identificador, pqr: nuevoPqr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error al guardar PQR" });
  }
});

// Paginated endpoints for client's own items (uses session or ?email= fallback)
function parsePageLimit(q) {
  const page = Math.max(1, parseInt(q.page || '1'));
  const limit = Math.max(1, Math.min(100, parseInt(q.limit || '10')));
  return { page, limit };
}

router.get('/mis-cotizaciones', async (req, res) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    const email = (req.session && req.session.cliente && req.session.cliente.email) || req.query.email;
    if (!email) return res.status(400).json({ message: 'No se encontró cliente en sesión ni email en query' });
    const filter = { clienteEmail: email };
    const total = await CotizacionCliente.countDocuments(filter);
    const items = await CotizacionCliente.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit);
    res.json({ items, page, totalPages: Math.ceil(total/limit), total });
  } catch (err) {
    console.error('Error mis-cotizaciones', err);
    res.status(500).json({ message: 'Error al listar mis cotizaciones' });
  }
});

router.get('/mis-reservas', async (req, res) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    const email = (req.session && req.session.cliente && req.session.cliente.email) || req.query.email;
    if (!email) return res.status(400).json({ message: 'No se encontró cliente en sesión ni email en query' });
    const filter = { clienteEmail: email };
    const total = await ReservaCliente.countDocuments(filter);
    const items = await ReservaCliente.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit);
    res.json({ items, page, totalPages: Math.ceil(total/limit), total });
  } catch (err) {
    console.error('Error mis-reservas', err);
    res.status(500).json({ message: 'Error al listar mis reservas' });
  }
});

router.get('/mis-pqrs', async (req, res) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    const email = (req.session && req.session.cliente && req.session.cliente.email) || req.query.email;
    if (!email) return res.status(400).json({ message: 'No se encontró cliente en sesión ni email en query' });
    const filter = { clienteEmail: email };
    const total = await PqrCliente.countDocuments(filter);
    const items = await PqrCliente.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit);
    res.json({ items, page, totalPages: Math.ceil(total/limit), total });
  } catch (err) {
    console.error('Error mis-pqrs', err);
    res.status(500).json({ message: 'Error al listar mis pqr' });
  }
});

// 6️⃣ Contactar asesor
router.post('/contactar-asesor', async (req, res) => {
  try {
    const nuevoMensaje = new ContactarAsesor(req.body);
    await nuevoMensaje.save();
    res.json({ message: "✅ Mensaje enviado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error al enviar el mensaje" });
  }
});

// 7️⃣ Listar clientes (para panel admin)
// Root listing for compatibility with admin panel fetch('/api/clientes')
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find().select('-password'); // ocultar password
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error al listar clientes' });
  }
});

// Legacy /listar kept for backward compatibility
router.get('/listar', async (req, res) => {
  try {
    const clientes = await Cliente.find().select('-password'); // ocultar password
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error al listar clientes' });
  }
});

// ================== ELIMINAR CUENTA ==================
router.delete("/eliminar", async (req, res) => {
  try {
    // Preferir email de la sesión si está disponible (más seguro)
    const emailFromBody = req.body && req.body.email;
    const emailFromSession = req.session && req.session.cliente && req.session.cliente.email;
    const email = emailFromSession || emailFromBody;
    if (!email) {
      return res.status(400).json({ message: "El email es obligatorio (o no hay sesión activa)" });
    }

    const eliminado = await Cliente.findOneAndDelete({ email });
    if (!eliminado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Si la sesión existe, destruirla y limpiar la cookie
    if (req.session) {
      req.session.destroy(err => {
        if (err) console.error('Error destruyendo sesión tras eliminar cuenta:', err);
      });
    }
    try { res.clearCookie && res.clearCookie('connect.sid'); } catch(e) {}

    res.json({ message: "Cuenta eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error eliminando cliente:", err);
    res.status(500).json({ message: "Error eliminando cliente" });
  }
});

// ================== PANEL ADMIN: COTIZACIONES ==================

// Listar todas las cotizaciones
router.get('/cotizaciones', async (req, res) => {
  try {
    const cotizaciones = await CotizacionCliente.find();
    res.json(cotizaciones);
  } catch (err) {
    console.error("❌ Error al listar cotizaciones:", err);
    res.status(500).json({ message: "Error al listar cotizaciones" });
  }
});

// Responder cotización
router.post('/cotizaciones/responder', async (req, res) => {
  try {
    const { idCotizacion, respuesta } = req.body;

    const cotizacion = await CotizacionCliente.findByIdAndUpdate(
      idCotizacion,
      { respuestaAdmin: respuesta, respondida: true },
      { new: true }
    );

    if (!cotizacion) return res.status(404).json({ message: "Cotización no encontrada" });

    res.json({ message: "✅ Respuesta enviada correctamente", cotizacion });
  } catch (err) {
    console.error("❌ Error respondiendo cotización:", err);
    res.status(500).json({ message: "Error respondiendo cotización" });
  }
});

// ================== PANEL ADMIN: PQR ==================

// Listar todas las PQR
router.get('/pqr/listar', async (req, res) => {
  try {
    const pqrs = await PqrCliente.find();
    res.json(pqrs);
  } catch (err) {
    console.error("❌ Error al listar PQR:", err);
    res.status(500).json({ message: "Error al listar PQR" });
  }
});

// Responder PQR
router.post('/pqr/responder', async (req, res) => {
  try {
    const { idPqr, respuesta } = req.body;

    const pqr = await PqrCliente.findByIdAndUpdate(
      idPqr,
      { respuestaAdmin: respuesta, respondida: true },
      { new: true }
    );

    if (!pqr) return res.status(404).json({ message: "PQR no encontrada" });

    res.json({ message: "✅ Respuesta enviada correctamente", pqr });
  } catch (err) {
    console.error("❌ Error respondiendo PQR:", err);
    res.status(500).json({ message: "Error respondiendo PQR" });
  }
});

// Cerrar sesión
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid'); // limpiar cookie de sesión
    res.json({ mensaje: 'Sesión cerrada correctamente' });
  });
});

module.exports = router;
