const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const { logger } = require("../utils/logging");

let storage;
if (cloudinary) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "ophrus-annonces",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });
  logger.info('✅ Storage Cloudinary activé');
} else {
  // Fallback mémoire pour éviter de crasher si Cloudinary n'est pas configuré
  storage = multer.memoryStorage();
  logger.warn('⚠️ Storage mémoire activé (Cloudinary indisponible)');
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

module.exports = upload;
