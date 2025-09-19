// modeloProveedor.js
const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email:  { type: String, required: true, unique: true },
  telefono: { type: String },
  direccion: { type: String }
}, { versionKey: false });

module.exports = mongoose.model('Proveedor', proveedorSchema);
