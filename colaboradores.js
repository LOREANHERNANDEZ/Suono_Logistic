const express = require('express');
const router = express.Router();
const Colaborador = require('./modeloColaborador');

router.use(express.json());

// Obtener todos los colaboradores
router.get('/', async (req, res) => {
  try {
    const colaboradores = await Colaborador.find();
    res.json(colaboradores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener colaboradores' });
  }
});


// Crear un nuevo colaborador
router.post('/', async (req, res) => {
  const { nombre, rol, contacto } = req.body;
  if (!nombre || !rol || !contacto) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  try {
    // Control de duplicidad por contacto
    const colaboradorExistente = await Colaborador.findOne({ contacto });
    if (colaboradorExistente) {
      return res.status(409).json({ error: 'Ya existe un colaborador con ese contacto.' });
    }
    const nuevoColaborador = await Colaborador.create({ nombre, rol, contacto });
    res.status(201).json(nuevoColaborador);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear colaborador' });
  }
});

// Obtener colaborador por ID
router.get('/:id', async (req, res) => {
  try {
    const colaborador = await Colaborador.findById(req.params.id);
    if (!colaborador) return res.status(404).json({ error: 'Colaborador no encontrado' });
    res.json(colaborador);
  } catch (err) {
    res.status(400).json({ error: 'Error al obtener colaborador: ' + err.message });
  }
});

// Editar colaborador por ID
router.put('/:id', async (req, res) => {
  try {
    const colaboradorActualizado = await Colaborador.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!colaboradorActualizado) return res.status(404).json({ error: 'Colaborador no encontrado' });
    res.json(colaboradorActualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar colaborador: ' + err.message });
  }
});

// Eliminar colaborador por ID
router.delete('/:id', async (req, res) => {
  try {
    await Colaborador.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Colaborador eliminado correctamente' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar colaborador: ' + err.message });
  }
});

module.exports = router;
