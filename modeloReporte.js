const mongoose = require('mongoose');
require('./conexion');

const ReporteSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  fecha: { type: String, required: true }
});

module.exports = mongoose.model('Reporte', ReporteSchema);
