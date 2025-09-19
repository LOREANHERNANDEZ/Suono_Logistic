const express = require('express');
const router = express.Router();
const Reporte = require('./modeloReporte');

router.use(express.json());

// Obtener todos los reportes
router.get('/', async (req, res) => {
  try {
    const reportes = await Reporte.find();
    console.log('Reportes:', reportes);
    res.json(reportes);
  } catch (err) {
    console.error('❌ Error al obtener reportes:', err);
    res.status(500).json({ error: 'Error al obtener reportes: ' + err.message });
  }
});

// Crear un nuevo reporte
router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion, fecha } = req.body;
    if (!titulo || typeof titulo !== 'string') {
      return res.status(400).json({ error: 'El campo titulo es requerido y debe ser un string.' });
    }
    if (!descripcion || typeof descripcion !== 'string') {
      return res.status(400).json({ error: 'El campo descripcion es requerido y debe ser un string.' });
    }
    if (!fecha || typeof fecha !== 'string') {
      return res.status(400).json({ error: 'El campo fecha es requerido y debe ser un string.' });
    }
    const nuevoReporte = new Reporte({ titulo, descripcion, fecha });
    await nuevoReporte.save();
    console.log('Reporte creado:', nuevoReporte);
    res.status(201).json(nuevoReporte);
  } catch (err) {
    console.error('❌ Error al crear reporte:', err);
    res.status(400).json({ error: 'Error al crear reporte: ' + err.message });
  }
});
// Obtener un reporte por ID
router.get('/:id', async (req, res) => {
  try {
    const reporte = await Reporte.findById(req.params.id);
    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    console.log('Reporte encontrado:', reporte);
    res.json(reporte);
  } catch (err) {
    console.error('❌ Error al obtener reporte por id:', err);
    res.status(400).json({ error: 'Error al obtener reporte: ' + err.message });
  }
});
// Modificar un reporte
router.put('/:id', async (req, res) => {
  try {
    const { titulo, descripcion, fecha } = req.body;
    const updateFields = {};
    if (titulo !== undefined) {
      if (typeof titulo !== 'string' || !titulo) {
        return res.status(400).json({ error: 'El campo titulo debe ser un string válido.' });
      }
      updateFields.titulo = titulo;
    }
    if (descripcion !== undefined) {
      if (typeof descripcion !== 'string' || !descripcion) {
        return res.status(400).json({ error: 'El campo descripcion debe ser un string válido.' });
      }
      updateFields.descripcion = descripcion;
    }
    if (fecha !== undefined) {
      if (typeof fecha !== 'string' || !fecha) {
        return res.status(400).json({ error: 'El campo fecha debe ser un string válido.' });
      }
      updateFields.fecha = fecha;
    }
    const reporteActualizado = await Reporte.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    console.log('Reporte actualizado:', reporteActualizado);
    res.json(reporteActualizado);
  } catch (err) {
    console.error('❌ Error al actualizar reporte:', err);
    res.status(400).json({ error: 'Error al actualizar reporte: ' + err.message });
  }
});
// Eliminar un reporte
router.delete('/:id', async (req, res) => {
  try {
    await Reporte.findByIdAndDelete(req.params.id);
    console.log('Reporte eliminado:', req.params.id);
    res.json({ mensaje: 'Reporte eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar reporte:', err);
    res.status(400).json({ error: 'Error al eliminar reporte: ' + err.message });
  }
});

module.exports = router;
