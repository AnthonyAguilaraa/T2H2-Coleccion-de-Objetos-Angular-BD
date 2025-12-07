const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Conectado a eco_move_db');
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        process.exit(1);
    }
};

module.exports = connectDB;