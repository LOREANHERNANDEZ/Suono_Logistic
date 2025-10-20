const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  fecha: { type: Date, required: true },
  lugar: { type: String, required: true },
  descripcion: { type: String },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evento', eventoSchema);