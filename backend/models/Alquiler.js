const mongoose = require('mongoose');

const alquilerSchema = new mongoose.Schema({
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    vehiculoCodigo: { type: String, required: true }, // Referencia por código según tu lógica
    fechaInicio: { type: Date, required: true },
    fechaTentativa: { type: Date, required: true },
    fechaDevolucionReal: { type: Date },
    
    // Datos financieros
    diasCalculados: Number,
    importeBase: Number,
    descuentoExtendido: Number,
    descuentoFrecuente: Number,
    deposito: Number,
    totalPagadoInicial: Number,
    
    // Datos post-devolución
    diasMora: { type: Number, default: 0 },
    multa: { type: Number, default: 0 },
    
    estado: { 
        type: String, 
        enum: ['ACTIVO', 'FINALIZADO'], 
        default: 'ACTIVO' 
    }
}, { timestamps: true }); // Agrega createdAt y updatedAt automáticamente

module.exports = mongoose.model('Alquiler', alquilerSchema);