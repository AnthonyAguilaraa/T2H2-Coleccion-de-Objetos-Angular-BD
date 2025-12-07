const Cliente = require('../models/Cliente');

// Obtener todos los clientes
exports.obtenerClientes = async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al obtener los clientes' });
    }
};

// Crear un nuevo cliente
exports.crearCliente = async (req, res) => {
    try {
        // Extraer datos del body
        const { nombre, edad, esFrecuente } = req.body;

        // Validación básica
        if (!nombre || !edad) {
            return res.status(400).json({ msg: 'El nombre y la edad son obligatorios' });
        }

        const nuevoCliente = new Cliente({
            nombre,
            edad,
            esFrecuente: esFrecuente || false // Si no viene, asume falso
        });

        await nuevoCliente.save();
        res.status(201).json(nuevoCliente);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al crear el cliente' });
    }
};

// Eliminar un cliente por su ID (Mongo ID)
exports.eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const cliente = await Cliente.findById(id);

        if (!cliente) {
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        }

        await Cliente.findByIdAndDelete(id);
        res.json({ msg: 'Cliente eliminado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al eliminar el cliente' });
    }
};