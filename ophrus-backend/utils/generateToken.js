const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logging');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('JWT_SECRET manquant — génération de token impossible');
    throw new Error('Configuration JWT manquante');
  }
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

module.exports = generateToken;
