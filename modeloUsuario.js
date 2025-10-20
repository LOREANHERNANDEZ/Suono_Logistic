const mongoose = require('mongoose');
require('./conexion');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const bcrypt = require('bcryptjs');

UsuarioSchema.methods.compararPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
