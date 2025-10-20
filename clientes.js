const express = require('express');
const router = express.Router();
const Cliente = require('./modeloCliente'); // Asegúrate que modeloCliente.js está en la MISMA carpeta que clientes.js

// Obtener todos los clientes
router.get('/', async (req, res) => {
  console.log('Cliente:', Cliente);
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (err) {
    console.error("❌ Error al obtener clientes:", err);
    res.status(500).json({ error: 'Error al obtener clientes: ' + err.message });
  }
});

// Obtener un cliente por id
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (err) {
    console.error("❌ Error al obtener cliente por id:", err);
    res.status(400).json({ error: 'Error al obtener cliente: ' + err.message });
  }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  try {
    // Control de duplicidad por email
    const { email } = req.body;
    const clienteExistente = await Cliente.findOne({ email });
    if (clienteExistente) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese correo.' });
    }
    const nuevoCliente = new Cliente(req.body);
    await nuevoCliente.save();
    res.status(201).json(nuevoCliente);
  } catch (err) {
    console.error("❌ Error al crear cliente:", err);
    res.status(400).json({ error: 'Error al crear cliente: ' + err.message });
  }
});

// Modificar un cliente
router.put('/:id', async (req, res) => {
  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(clienteActualizado);
  } catch (err) {
    console.error("❌ Error al actualizar cliente:", err);
    res.status(400).json({ error: 'Error al actualizar cliente: ' + err.message });
  }
});

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error("❌ Error al eliminar cliente:", err);
    res.status(400).json({ error: 'Error al eliminar cliente: ' + err.message });
  }
});

module.exports = router;