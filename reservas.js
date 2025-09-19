const express = require('express');
const router = express.Router();
const Reserva = require('./modeloReserva');

// Obtener todas las reservas
router.get('/', async (req, res) => {
  try {
    const reservas = await Reserva.find();
    console.log('Reservas:', reservas);
    res.json(reservas);
  } catch (err) {
    console.error('❌ Error al obtener reservas:', err);
    res.status(500).json({ error: 'Error al obtener reservas: ' + err.message });
  }
});

// Obtener una reserva por ID
router.get('/:id', async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    console.log('Reserva encontrada:', reserva);
    res.json(reserva);
  } catch (err) {
    console.error('❌ Error al obtener reserva por id:', err);
    res.status(400).json({ error: 'Error al obtener reserva: ' + err.message });
  }
});

// Crear una nueva reserva
router.post('/', async (req, res) => {
  try {
    const { cliente, fecha, servicio } = req.body;
    if (!cliente || typeof cliente !== 'string') {
      return res.status(400).json({ error: 'El campo cliente es requerido y debe ser un string.' });
    }
    if (!fecha || isNaN(Date.parse(fecha))) {
      return res.status(400).json({ error: 'El campo fecha es requerido y debe ser una fecha válida.' });
    }
    if (!servicio || typeof servicio !== 'string') {
      return res.status(400).json({ error: 'El campo servicio es requerido y debe ser un string.' });
    }
    const nuevaReserva = new Reserva({ cliente, fecha, servicio });
    await nuevaReserva.save();
    console.log('Reserva creada:', nuevaReserva);
    res.status(201).json(nuevaReserva);
  } catch (err) {
    console.error('❌ Error al crear reserva:', err);
    res.status(400).json({ error: 'Error al crear reserva: ' + err.message });
  }
});

// Modificar una reserva
router.put('/:id', async (req, res) => {
  try {
    const { cliente, fecha, servicio } = req.body;
    const updateFields = {};
    if (cliente !== undefined) {
      if (typeof cliente !== 'string' || !cliente) {
        return res.status(400).json({ error: 'El campo cliente debe ser un string válido.' });
      }
      updateFields.cliente = cliente;
    }
    if (fecha !== undefined) {
      if (isNaN(Date.parse(fecha))) {
        return res.status(400).json({ error: 'El campo fecha debe ser una fecha válida.' });
      }
      updateFields.fecha = fecha;
    }
    if (servicio !== undefined) {
      if (typeof servicio !== 'string' || !servicio) {
        return res.status(400).json({ error: 'El campo servicio debe ser un string válido.' });
      }
      updateFields.servicio = servicio;
    }
    const reservaActualizada = await Reserva.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    console.log('Reserva actualizada:', reservaActualizada);
    res.json(reservaActualizada);
  } catch (err) {
    console.error('❌ Error al actualizar reserva:', err);
    res.status(400).json({ error: 'Error al actualizar reserva: ' + err.message });
  }
});

// Eliminar una reserva
router.delete('/:id', async (req, res) => {
  try {
    await Reserva.findByIdAndDelete(req.params.id);
    console.log('Reserva eliminada:', req.params.id);
    res.json({ mensaje: 'Reserva eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar reserva:', err);
    res.status(400).json({ error: 'Error al eliminar reserva: ' + err.message });
  }
});

module.exports = router;
