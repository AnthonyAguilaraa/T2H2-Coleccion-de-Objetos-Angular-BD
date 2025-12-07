const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    edad: { type: Number, required: true },
    esFrecuente: { type: Boolean, default: false }
    // Nota: MongoDB crea un _id automáticamente, usaremos ese en lugar de 'id' numérico
});

module.exports = mongoose.model('Cliente', clienteSchema);