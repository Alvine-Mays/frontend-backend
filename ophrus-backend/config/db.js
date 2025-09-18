const mongoose = require('mongoose');
const { logger } = require('../utils/logging');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000
    });

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    return conn; // ✅ retourne la promesse résolue
  } catch (err) {
    console.error(`❌ Erreur MongoDB: ${err.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('connecting', () => {
  logger.info('Connexion à MongoDB...');
});
mongoose.connection.on('disconnected', () => {
  logger.warn('Déconnecté de MongoDB');
});
mongoose.connection.on('reconnected', () => {
  logger.info('Reconnecté à MongoDB');
});

module.exports = connectDB;
