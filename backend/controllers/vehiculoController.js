const Vehiculo = require('../models/Vehiculo');

exports.obtenerVehiculos = async (req, res) => {
    try {
        const vehiculos = await Vehiculo.find();
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener vehículos' });
    }
};

exports.crearVehiculo = async (req, res) => {
    try {
        const nuevoVehiculo = new Vehiculo(req.body);
        await nuevoVehiculo.save();
        res.status(201).json(nuevoVehiculo);
    } catch (error) {
        res.status(400).json({ msg: 'Error al crear vehículo', error });
    }
};

// Se pueden añadir métodos para actualizar estado, borrar, etc.