const express = require('express');
const router = express.Router();
const Inventario = require('./modeloInventario');


// Obtener todos los productos del inventario
router.get('/', async (req, res) => {
  try {
    const inventario = await Inventario.find();
    res.json(inventario);
  } catch (err) {
    console.error("❌ Error al obtener inventario:", err);
    res.status(500).json({ error: 'Error al obtener inventario: ' + err.message });
  }
});

// Obtener un producto específico por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await Inventario.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (err) {
    console.error("❌ Error al obtener producto:", err);
    res.status(400).json({ error: 'Error al obtener producto: ' + err.message });
  }
});

// Crear un nuevo producto en inventario
router.post('/', async (req, res) => {
  try {
    const nuevoProducto = new Inventario(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (err) {
    console.error("❌ Error al crear producto:", err);
    res.status(400).json({ error: 'Error al crear producto: ' + err.message });
  }
});

// Modificar un producto del inventario
router.put('/:id', async (req, res) => {
  try {
    const productoActualizado = await Inventario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(productoActualizado);
  } catch (err) {
    console.error("❌ Error al actualizar producto:", err);
    res.status(400).json({ error: 'Error al actualizar producto: ' + err.message });
  }
});

// Eliminar un producto del inventario
router.delete('/:id', async (req, res) => {
  try {
    await Inventario.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    res.status(400).json({ error: 'Error al eliminar producto: ' + err.message });
  }
});

module.exports = router;