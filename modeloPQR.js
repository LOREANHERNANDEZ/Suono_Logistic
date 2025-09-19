const mongoose = require('mongoose');
require('./conexion');

const PQRScheme = new mongoose.Schema({
  usuario: { type: String, required: true },
  tipo: { type: String, required: true },
  descripcion: { type: String, required: true }
});

module.exports = mongoose.model('PQR', PQRScheme);
