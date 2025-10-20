const mongoose = require('mongoose');
require('./conexion');

const TokenRecuperacionSchema = new mongoose.Schema({
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  token: { 
    type: String, 
    required: true 
  },
  expiracion: { 
    type: Number,   // Guardamos el tiempo como número (timestamp)
    required: true 
  }
});

// --- Opcional: eliminar tokens vencidos automáticamente ---
TokenRecuperacionSchema.index({ expiracion: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenRecuperacion', TokenRecuperacionSchema);