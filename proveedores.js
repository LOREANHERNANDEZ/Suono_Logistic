
const express = require('express');
const router = express.Router();
const Proveedor = require('./modeloProveedor'); // Asegúrate que modeloProveedor.js está en la MISMA carpeta que proveedores.js

// Obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const proveedores = await Proveedor.find();
    res.json(proveedores);
  } catch (err) {
    console.error("❌ Error al obtener proveedores:", err);
    res.status(500).json({ error: 'Error al obtener proveedores: ' + err.message });
  }
});

// Crear un nuevo proveedor
router.post('/', async (req, res) => {
  try {
    // Control de duplicidad por email y telefono
    const { email, telefono } = req.body;
    const proveedorExistente = await Proveedor.findOne({ $or: [ { email }, { telefono } ] });
    if (proveedorExistente) {
      return res.status(409).json({ error: 'Ya existe un proveedor con ese correo o teléfono.' });
    }
    const nuevoProveedor = new Proveedor(req.body);
    await nuevoProveedor.save();
    res.status(201).json(nuevoProveedor);
  } catch (err) {
    console.error("❌ Error al crear proveedor:", err);
    res.status(400).json({ error: 'Error al crear proveedor: ' + err.message });
  }
});


// Obtener un proveedor específico por ID
router.get('/:id', async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(proveedor);
  } catch (err) {
    console.error("❌ Error al obtener proveedor:", err);
    res.status(400).json({ error: 'Error al obtener proveedor: ' + err.message });
  }
});

// Modificar un proveedor
router.put('/:id', async (req, res) => {
  try {
    const proveedorActualizado = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(proveedorActualizado);
  } catch (err) {
    console.error("❌ Error al actualizar proveedor:", err);
    res.status(400).json({ error: 'Error al actualizar proveedor: ' + err.message });
  }
});

// Eliminar un proveedor
router.delete('/:id', async (req, res) => {
  try {
    await Proveedor.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Proveedor eliminado correctamente' });
  } catch (err) {
    console.error("❌ Error al eliminar proveedor:", err);
    res.status(400).json({ error: 'Error al eliminar proveedor: ' + err.message });
  }
});

module.exports = router;
