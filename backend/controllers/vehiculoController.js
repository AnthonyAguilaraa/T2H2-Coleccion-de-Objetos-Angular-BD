const mongoose = require('mongoose');
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

// Eliminar vehículo
exports.eliminarVehiculo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const vehiculo = await Vehiculo.findOne({ codigo });

        if (!vehiculo) {
            return res.status(404).json({ msg: 'Vehículo no encontrado' });
        }

        await Vehiculo.deleteOne({ codigo });
        res.json({ msg: 'Vehículo eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al eliminar el vehículo' });
    }
};

// Actualizar vehículo (Buscando por código)
exports.actualizarVehiculo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const updateData = req.body; // nombre, tarifaDia, etc.

        // Ojo: Usamos findOneAndUpdate porque usas 'codigo' manual, no el _id de Mongo
        const vehiculo = await Vehiculo.findOneAndUpdate(
            { codigo: codigo },
            updateData,
            { new: true }
        );

        if (!vehiculo) {
            return res.status(404).json({ msg: 'Vehículo no encontrado' });
        }

        res.json(vehiculo);
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar vehículo' });
    }
};
// Se pueden añadir métodos para actualizar estado, borrar, etc.