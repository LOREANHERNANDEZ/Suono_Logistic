
const express = require('express');
const router = express.Router();
const Evento = require('./modeloEvento');

// Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.find();
    console.log('Eventos:', eventos);
    res.json(eventos);
  } catch (err) {
    console.error('❌ Error al obtener eventos:', err);
    res.status(500).json({ error: 'Error al obtener eventos: ' + err.message });
  }
});

// Obtener un evento por id
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    console.log('Evento encontrado:', evento);
    res.json(evento);
  } catch (err) {
    console.error('❌ Error al obtener evento por id:', err);
    res.status(400).json({ error: 'Error al obtener evento: ' + err.message });
  }
});

// Crear un nuevo evento
router.post('/', async (req, res) => {
  try {
    const { nombre, fecha, lugar, descripcion } = req.body;
    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ error: 'El campo nombre es requerido y debe ser un string.' });
    }
    if (!fecha || isNaN(Date.parse(fecha))) {
      return res.status(400).json({ error: 'El campo fecha es requerido y debe ser una fecha válida.' });
    }
    if (!lugar || typeof lugar !== 'string') {
      return res.status(400).json({ error: 'El campo lugar es requerido y debe ser un string.' });
    }
    const nuevoEvento = new Evento({ nombre, fecha, lugar, descripcion });
    await nuevoEvento.save();
    console.log('Evento creado:', nuevoEvento);
    res.status(201).json(nuevoEvento);
  } catch (err) {
    console.error('❌ Error al crear evento:', err);
    res.status(400).json({ error: 'Error al crear evento: ' + err.message });
  }
});

// Modificar un evento
router.put('/:id', async (req, res) => {
  try {
    const { nombre, fecha, lugar, descripcion } = req.body;
    const updateFields = {};
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || !nombre) {
        return res.status(400).json({ error: 'El campo nombre debe ser un string válido.' });
      }
      updateFields.nombre = nombre;
    }
    if (fecha !== undefined) {
      if (isNaN(Date.parse(fecha))) {
        return res.status(400).json({ error: 'El campo fecha debe ser una fecha válida.' });
      }
      updateFields.fecha = fecha;
    }
    if (lugar !== undefined) {
      if (typeof lugar !== 'string' || !lugar) {
        return res.status(400).json({ error: 'El campo lugar debe ser un string válido.' });
      }
      updateFields.lugar = lugar;
    }
    if (descripcion !== undefined) {
      if (typeof descripcion !== 'string') {
        return res.status(400).json({ error: 'El campo descripcion debe ser un string.' });
      }
      updateFields.descripcion = descripcion;
    }
    const eventoActualizado = await Evento.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    console.log('Evento actualizado:', eventoActualizado);
    res.json(eventoActualizado);
  } catch (err) {
    console.error('❌ Error al actualizar evento:', err);
    res.status(400).json({ error: 'Error al actualizar evento: ' + err.message });
  }
});

// Eliminar un evento
router.delete('/:id', async (req, res) => {
  try {
    await Evento.findByIdAndDelete(req.params.id);
    console.log('Evento eliminado:', req.params.id);
    res.json({ mensaje: 'Evento eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar evento:', err);
    res.status(400).json({ error: 'Error al eliminar evento: ' + err.message });
  }
});

module.exports = router;