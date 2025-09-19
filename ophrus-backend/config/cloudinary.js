const { logger } = require('../utils/logging');
let cloudinary = null;

const name = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;

if (name && key && secret) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({ cloud_name: name, api_key: key, api_secret: secret });
  logger.info('✅ Cloudinary configuré');
} else {
  logger.warn('⚠️ Cloudinary non configuré (CLOUDINARY_* manquants) — les uploads seront indisponibles');
}

module.exports = cloudinary;
