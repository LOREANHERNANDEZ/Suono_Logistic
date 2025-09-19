const mongoose = require('mongoose');
require('./conexion');

const ColaboradorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  rol: { type: String, required: true },
  contacto: { type: String, required: true }
});

module.exports = mongoose.model('Colaborador', ColaboradorSchema);
