const express = require('express');
const router = express.Router();

// Importar controladores
const vehiculoCtrl = require('../controllers/vehiculoController');
const alquilerCtrl = require('../controllers/alquilerController');
const clienteCtrl = require('../controllers/clienteController'); // <--- Importamos Cliente
const reporteCtrl = require('../controllers/reporteController');

// ==========================
// RUTAS DE CLIENTES
// ==========================
router.get('/clientes', clienteCtrl.obtenerClientes);
router.post('/clientes', clienteCtrl.crearCliente);
router.put('/clientes/:id', clienteCtrl.actualizarCliente); // <--- NUEVO
router.delete('/clientes/:id', clienteCtrl.eliminarCliente);

// ==========================
// RUTAS DE VEHÍCULOS
// ==========================
router.get('/vehiculos', vehiculoCtrl.obtenerVehiculos);
router.post('/vehiculos', vehiculoCtrl.crearVehiculo);
router.put('/vehiculos/:codigo', vehiculoCtrl.actualizarVehiculo); // <--- NUEVO
router.delete('/vehiculos/:codigo', vehiculoCtrl.eliminarVehiculo);

// ==========================
// RUTAS DE ALQUILERES
// ==========================
router.get('/alquileres', alquilerCtrl.obtenerAlquileres);
router.post('/alquileres', alquilerCtrl.crearAlquiler);
router.put('/alquileres/finalizar/:id', alquilerCtrl.finalizarAlquiler);
router.delete('/alquileres/:id', alquilerCtrl.eliminarAlquiler); // <--- NUEVO

// ==========================
// RUTAS DE REPORTES
// ==========================
// 1. Clientes recurrentes (>1 alquiler)
router.get('/reportes/clientes-recurrentes', reporteCtrl.getClientesRecurrentes);

// 2. Vehículos más populares
router.get('/reportes/vehiculos-populares', reporteCtrl.getVehiculosPopulares);

// 3. Alquileres con doble descuento
router.get('/reportes/descuentos-dobles', reporteCtrl.getDescuentosCompletos);

// 4. Total Recaudado (Caja)
router.get('/reportes/total-recaudado', reporteCtrl.getTotalRecaudado);

// 5. Multas peligrosas (> depósito)
router.get('/reportes/multas-altas', reporteCtrl.getMultasAltas);


module.exports = router;