const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  descripcion: { type: String },
  ubicacion: { type: String },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventario', inventarioSchema);