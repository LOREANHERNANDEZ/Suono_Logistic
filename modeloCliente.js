const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  telefono: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  direccion: {
    type: String,
    trim: true
  },
  empresa: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);
