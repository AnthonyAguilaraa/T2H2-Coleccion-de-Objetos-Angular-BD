const mongoose = require('mongoose');
const Alquiler = require('../models/Alquiler');
const Vehiculo = require('../models/Vehiculo');
const Cliente = require('../models/Cliente');

// 1. Clientes que alquilaron más de un vehículo (Recurrentes)
exports.getClientesRecurrentes = async (req, res) => {
    try {
        const reporte = await Alquiler.aggregate([
            // 1. Agrupar por cliente y contar cuántos alquileres tiene
            {
                $group: {
                    _id: "$clienteId", // Agrupamos por el ID del cliente
                    cantidadAlquileres: { $sum: 1 } // Sumamos 1 por cada documento encontrado
                }
            },
            // 2. Filtrar solo los que tengan más de 1 alquiler
            {
                $match: {
                    cantidadAlquileres: { $gt: 1 }
                }
            },
            // 3. Traer la información del Cliente (Join)
            {
                $lookup: {
                    from: 'clientes',       // Nombre de la colección en MongoDB (suele ser minúscula y plural)
                    localField: '_id',      // El ID que tenemos en el grupo
                    foreignField: '_id',    // El ID en la colección clientes
                    as: 'infoCliente'       // Nombre del campo donde se guardará el array
                }
            },
            // 4. Limpiar la salida para que se vea bonita
            {
                $project: {
                    _id: 0,
                    cliente: { $arrayElemAt: ["$infoCliente.nombre", 0] }, // Sacar el nombre del array
                    totalAlquileres: "$cantidadAlquileres"
                }
            }
        ]);

        res.json(reporte);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al generar reporte de clientes recurrentes' });
    }
};

// 2. Vehículos más alquilados (ordenados de mayor a menor)
exports.getVehiculosPopulares = async (req, res) => {
    try {
        const reporte = await Alquiler.aggregate([
            // 1. Agrupar por código de vehículo
            {
                $group: {
                    _id: "$vehiculoCodigo",
                    vecesAlquilado: { $sum: 1 }
                }
            },
            // 2. Ordenar descendente (-1)
            {
                $sort: { vecesAlquilado: -1 }
            },
            // 3. Traer datos del vehículo para ver el nombre, no solo el código
            {
                $lookup: {
                    from: 'vehiculos',
                    localField: '_id',      // Aquí _id es el código del vehículo (por el group anterior)
                    foreignField: 'codigo', // En la colección vehiculos, el campo es 'codigo'
                    as: 'detalleVehiculo'
                }
            },
            {
                $project: {
                    _id: 0,
                    codigo: "$_id",
                    nombre: { $arrayElemAt: ["$detalleVehiculo.nombre", 0] },
                    vecesAlquilado: 1
                }
            }
        ]);

        res.json(reporte);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al generar reporte de vehículos populares' });
    }
};

// 3. Alquileres con AMBOS descuentos (Extendido y Frecuente)
exports.getDescuentosCompletos = async (req, res) => {
    try {
        // Aquí podemos usar un .find() normal con filtros, es más sencillo que una agregación
        const reporte = await Alquiler.find({
            descuentoExtendido: { $gt: 0 }, // Mayor a 0
            descuentoFrecuente: { $gt: 0 }  // Mayor a 0
        })
        .select('clienteId vehiculoCodigo descuentoExtendido descuentoFrecuente totalPagadoInicial') // Seleccionar solo campos útiles
        .populate('clienteId', 'nombre'); // Traer el nombre del cliente

        res.json(reporte);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al buscar descuentos dobles' });
    }
};

// 4. Total recaudado (Neto + Depósitos + Multas)
exports.getTotalRecaudado = async (req, res) => {
    try {
        const reporte = await Alquiler.aggregate([
            {
                $group: {
                    _id: null, // No agrupamos por nada específico, queremos todo junto
                    totalBase: { $sum: "$totalPagadoInicial" }, // Esto ya incluye (Base - Desc + Deposito)
                    totalMultas: { $sum: "$multa" },
                    
                    // Si quisieras desglosar el depósito (asumiendo que está dentro del totalPagadoInicial):
                    // No hace falta sumar extra si totalPagadoInicial ya es lo que entró a caja.
                }
            },
            {
                $project: {
                    _id: 0,
                    totalIngresos: { $add: ["$totalBase", "$totalMultas"] }, // Sumamos lo pagado al inicio + las multas finales
                    desglose: {
                        pagosIniciales: "$totalBase",
                        multasCobradas: "$totalMultas"
                    }
                }
            }
        ]);

        // Si no hay datos, devolver 0
        if (reporte.length === 0) {
            return res.json({ totalIngresos: 0 });
        }

        res.json(reporte[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al calcular total recaudado' });
    }
};

// 5. Clientes con multa mayor al depósito (Pérdidas o Deudas)
// exports.getMultasAltas = async (req, res) => {
//     try {
//         // Usamos $expr para comparar dos campos dentro del mismo documento
//         const reporte = await Alquiler.find({
//             $expr: { $gt: ["$multa", "$deposito"] } // Donde multa > deposito
//         })
//         .populate('clienteId', 'nombre')
//         .select('clienteId vehiculoCodigo multa deposito diasMora');

//         res.json(reporte);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ msg: 'Error al buscar multas altas' });
//     }
// };

// 5. Clientes con multa mayor al depósito (y asegurando que ambos valores existan)
exports.getMultasAltas = async (req, res) => {
    try {
        const reporte = await Alquiler.find({
            // 1. FILTRO DE EXISTENCIA:
            // Aseguramos que ambos campos tengan un valor real (mayor a 0)
            multa: { $gt: 0 },
            deposito: { $gt: 0 },

            // 2. COMPARACIÓN:
            // Usamos $expr para comparar que la multa sea estrictamente mayor al depósito
            $expr: { $gt: ["$multa", "$deposito"] } 
        })
        .populate('clienteId', 'nombre')
        .select('clienteId vehiculoCodigo multa deposito diasMora');

        res.json(reporte);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al buscar multas altas' });
    }
};