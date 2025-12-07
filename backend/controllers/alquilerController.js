const Alquiler = require('../models/Alquiler');
const Vehiculo = require('../models/Vehiculo');

exports.crearAlquiler = async (req, res) => {
    // Aquí recibimos los datos ya calculados del Front, 
    // O idealmente recalculamos todo para seguridad. 
    // Por ahora, guardamos lo que envía el Front para facilitar la migración.
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const alquilerData = req.body;
        
        // 1. Guardar Alquiler
        const nuevoAlquiler = new Alquiler(alquilerData);
        await nuevoAlquiler.save({ session });

        // 2. Actualizar estado del vehículo a ALQUILADO
        await Vehiculo.findOneAndUpdate(
            { codigo: alquilerData.vehiculoCodigo },
            { estado: 'ALQUILADO' },
            { session }
        );

        await session.commitTransaction();
        res.status(201).json(nuevoAlquiler);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ msg: 'Error al procesar alquiler', error });
    } finally {
        session.endSession();
    }
};

exports.obtenerAlquileres = async (req, res) => {
    try {
        // Populate trae los datos del Cliente en lugar de solo el ID
        const alquileres = await Alquiler.find().populate('clienteId'); 
        res.json(alquileres);
    } catch (error) {
        res.status(500).json({ msg: 'Error obteniendo alquileres' });
    }
};

exports.finalizarAlquiler = async (req, res) => {
    const { id } = req.params;
    const { fechaDevolucionReal, diasMora, multa } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Actualizar Alquiler
        const alquiler = await Alquiler.findByIdAndUpdate(id, {
            estado: 'FINALIZADO',
            fechaDevolucionReal,
            diasMora,
            multa
        }, { new: true, session });

        // 2. Liberar Vehículo
        await Vehiculo.findOneAndUpdate(
            { codigo: alquiler.vehiculoCodigo },
            { estado: 'DISPONIBLE' },
            { session }
        );

        await session.commitTransaction();
        res.json(alquiler);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ msg: 'Error finalizando alquiler' });
    } finally {
        session.endSession();
    }
};