const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Cliente = require('../../modeloCliente'); // colección clientes

// POST /api/cliente/login
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

  const cliente = await Cliente.findOne({ email });
    if (!cliente) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const esValida = await bcrypt.compare(password, cliente.password);
    if (!esValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Guardar en sesión
    req.session.cliente = {
      id: cliente._id,
      nombre: cliente.nombre,
      email: cliente.email
    };

    // Asegurarnos de persistir la sesión antes de responder al cliente.
    // Esto evita condiciones de carrera donde el cliente actúa sobre la sesión
    // antes de que esté guardada en el store.
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('❌ Error guardando sesión en loginClienteRoutes:', saveErr);
        return res.status(500).json({ error: 'Error guardando la sesión' });
      }
      res.json({ mensaje: 'Login exitoso', cliente: req.session.cliente });
    });

  } catch (err) {
    console.error('❌ Error en loginClienteRoutes:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
