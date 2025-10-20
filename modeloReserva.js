const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  fecha: { type: Date, required: true },
  servicio: { type: String, required: true },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', reservaSchema);
