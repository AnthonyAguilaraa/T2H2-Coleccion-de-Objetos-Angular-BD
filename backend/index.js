require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Inicializar App
const app = express();

// Conectar BD
connectDB();

// Middlewares
app.use(cors()); // Permite que Angular (puerto 4200) hable con Node (puerto 3000)
app.use(express.json());

// Rutas
app.use('/api', require('./routes/api'));

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
});