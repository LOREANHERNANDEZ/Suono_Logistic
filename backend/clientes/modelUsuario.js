const mongoose = require('mongoose');

// ==================== ESQUEMAS ====================

// 1️⃣ Registro de Cliente
const registroClienteSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  email: { type: String, unique: true },
  telefono: String,
  password: String,
  aceptaTerminos: { type: Boolean, required: true }, // ✅ Nuevo campo
  fechaConsentimiento: { type: Date, default: Date.now } // ✅ Se guarda cuándo aceptó
}, { timestamps: true });

// 2️⃣ Login de Cliente
const loginClienteSchema = new mongoose.Schema({
  email: String,
  password: String
}, { timestamps: true });

// 3️⃣ Actualizar Información Cliente
const actualizarInfoClienteSchema = new mongoose.Schema({
  email: String,
  telefono: String
}, { timestamps: true });
// 4️⃣ Cotización Cliente
const cotizacionClienteSchema = new mongoose.Schema({
  clienteEmail: String,
  numero: { type: Number, default: null },
  identificador: { type: String, default: "" },
  nombreEvento: String,
  tipoEvento: String,
  fecha: Date,
  horaInicio: String,
  horaFin: String,
  ubicacion: String,
  numeroPersonas: Number,
  descripcion: String,
  // 🔹 Campos añadidos para comunicación admin-cliente
  respuestaAdmin: { type: String, default: "" },
  respondida: { type: Boolean, default: false }
}, { timestamps: true });


// 5️⃣ Reserva Cliente
const reservaClienteSchema = new mongoose.Schema({
  clienteEmail: String,
  identificador: { type: String, default: "" },
  nombreEvento: String,
  tipoEvento: String,
  fecha: Date,
  horaInicio: String,
  horaFin: String,
  ubicacion: String,
  descripcion: String
}, { timestamps: true });

// 6️⃣ PQR Cliente
const pqrClienteSchema = new mongoose.Schema({
  clienteEmail: String,
  identificador: { type: String, default: "" },
  asunto: String,
  descripcion: String,
  // 🔹 Campos añadidos para comunicación admin-cliente
  respuestaAdmin: { type: String, default: "" },
  respondida: { type: Boolean, default: false }
}, { timestamps: true });


// 7️⃣ Contactar Asesor
const contactarAsesorSchema = new mongoose.Schema({
  clienteEmail: String,
  nombre: String,
  correo: String,
  mensaje: String
}, { timestamps: true });

// ==================== MODELOS ====================

const RegistroCliente = mongoose.model('registroCliente', registroClienteSchema);
const LoginCliente = mongoose.model('loginCliente', loginClienteSchema);
const ActualizarInfoCliente = mongoose.model('actualizarInfoCliente', actualizarInfoClienteSchema);
const CotizacionCliente = mongoose.model('cotizacionCliente', cotizacionClienteSchema);
const ReservaCliente = mongoose.model('reservaCliente', reservaClienteSchema);
const PqrCliente = mongoose.model('pqrCliente', pqrClienteSchema);
const ContactarAsesor = mongoose.model('contactarAsesor', contactarAsesorSchema);

// ==================== EXPORT ====================

module.exports = {
  RegistroCliente,
  LoginCliente,
  ActualizarInfoCliente,
  CotizacionCliente,
  ReservaCliente,
  PqrCliente,
  ContactarAsesor
};
