const Alquiler = require('../models/Alquiler');
const Vehiculo = require('../models/Vehiculo');
const Cliente = require('../models/Cliente');

// 1. Clientes que alquilaron más de un vehículo
exports.getClientesRecurrentes = async (req, res) => {
    try {
        const data = await Alquiler.aggregate([
            // Agrupar por cliente y contar
            { $group: { _id: "$clienteId", cantidad: { $sum: 1 } } },
            // Filtrar solo los que tienen > 1
            { $match: { cantidad: { $gt: 1 } } },
            // Unir con la colección de clientes para obtener el nombre
            { $lookup: {
                from: "clientes", // Nombre de la colección en Mongo (plural y minúscula)
                localField: "_id",
                foreignField: "_id",
                as: "datosCliente"
            }},
            // Aplanar el array resultante del lookup
            { $unwind: "$datosCliente" },
            // Proyectar solo lo necesario
            { $project: {
                nombre: "$datosCliente.nombre",
                cantidad: 1
            }}
        ]);
        res.json(data);
    } catch (error) {
        res.status(500).json({ msg: 'Error en reporte clientes', error });
    }
};

// 2. Vehículos más alquilados (ordenados)
exports.getVehiculosPopulares = async (req, res) => {
    try {
        const data = await Alquiler.aggregate([
            { $group: { _id: "$vehiculoCodigo", cantidad: { $sum: 1 } } },
            { $sort: { cantidad: -1 } }, // Orden descendente
            // Unir con vehiculos para sacar el nombre.
            // OJO: En Alquiler guardamos 'vehiculoCodigo' (string),
            // así que buscamos en Vehiculo por campo 'codigo', no por '_id'
            { $lookup: {
                from: "vehiculos",
                localField: "_id",
                foreignField: "codigo",
                as: "datosVehiculo"
            }},
            { $unwind: "$datosVehiculo" },
            { $project: {
                nombre: "$datosVehiculo.nombre",
                codigo: "$_id",
                cantidad: 1
            }}
        ]);
        res.json(data);
    } catch (error) {
        res.status(500).json({ msg: 'Error en reporte vehículos', error });
    }
};

// 3. Alquileres con AMBOS descuentos (Extendido y Frecuente)
exports.getDescuentosCompletos = async (req, res) => {
    try {
        const data = await Alquiler.find({
            descuentoExtendido: { $gt: 0 },
            descuentoFrecuente: { $gt: 0 }
        })
        .populate('clienteId', 'nombre'); // Traemos el nombre del cliente
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ msg: 'Error en reporte descuentos', error });
    }
};

// 4. Total recaudado (Neto + Depósitos + Multas)
exports.getTotalRecaudado = async (req, res) => {
    try {
        const data = await Alquiler.aggregate([
            {
                $group: {
                    _id: null, // No agrupamos por nada, sumamos todo
                    total: {
                        $sum: {
                            $add: [
                                // Calculamos Neto: (Base - Desc1 - Desc2)
                                { $subtract: [ 
                                    { $subtract: ["$importeBase", "$descuentoExtendido"] }, 
                                    "$descuentoFrecuente" 
                                ]},
                                // Sumamos Depósito
                                "$deposito",
                                // Sumamos Multa (si no existe, usa 0)
                                { $ifNull: ["$multa", 0] }
                            ]
                        }
                    }
                }
            }
        ]);
        // Si no hay datos devuelve 0, si hay, devuelve la suma
        res.json({ total: data.length > 0 ? data[0].total : 0 });
    } catch (error) {
        res.status(500).json({ msg: 'Error en cálculo total', error });
    }
};

// 5. Clientes con multa > depósito
exports.getMultasAltas = async (req, res) => {
    try {
        // Usamos $expr para comparar dos campos dentro del mismo documento
        const data = await Alquiler.find({
            $expr: { $gt: ["$multa", "$deposito"] }
        })
        .populate('clienteId', 'nombre'); // Para mostrar quién es

        res.json(data);
    } catch (error) {
        res.status(500).json({ msg: 'Error en reporte multas', error });
    }
};