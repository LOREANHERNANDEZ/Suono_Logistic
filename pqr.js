const express = require('express');
const router = express.Router();
const PQR = require('./modeloPQR');

router.use(express.json());

// Obtener todos los PQR
router.get('/', async (req, res) => {
  try {
    const pqr = await PQR.find();
    res.json(pqr);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener PQR' });
  }
});

// Crear un nuevo PQR
router.post('/', async (req, res) => {
  const { usuario, tipo, descripcion } = req.body;
  if (!usuario || !tipo || !descripcion) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  try {
    const nuevoPQR = await PQR.create({ usuario, tipo, descripcion });
    res.status(201).json(nuevoPQR);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear PQR', detalle: err.message });
  }
});

module.exports = router;
