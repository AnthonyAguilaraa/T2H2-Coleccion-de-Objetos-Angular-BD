const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true }, // Mantenemos tu código manual
    nombre: { type: String, required: true },
    tarifaDia: { type: Number, required: true },
    requiereEdad: { type: Boolean, required: true },
    estado: { 
        type: String, 
        enum: ['DISPONIBLE', 'ALQUILADO'], 
        default: 'DISPONIBLE' 
    }
});

module.exports = mongoose.model('Vehiculo', vehiculoSchema);