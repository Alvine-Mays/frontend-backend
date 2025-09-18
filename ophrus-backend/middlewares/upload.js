const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/logging');

// Configuration des dossiers d'upload
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
const tempDir = path.join(uploadDir, 'temp');
const imagesDir = path.join(uploadDir, 'images');

// Créer les dossiers s'ils n'existent pas
[uploadDir, tempDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Stocker temporairement dans le dossier temp
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique avec timestamp et UUID
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    
    // Logger l'upload
    logger.debug('File upload started', {
      originalName: file.originalname,
      filename: filename,
      mimetype: file.mimetype,
      size: file.size,
      traceId: req.traceId
    });
    
    cb(null, filename);
  }
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  // Types MIME autorisés pour les images
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];
  
  // Extensions autorisées
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error(`Type de fichier non autorisé: ${file.mimetype}`);
    error.code = 'INVALID_FILE_TYPE';
    
    logger.warn('Invalid file type upload attempt', {
      originalName: file.originalname,
      mimetype: file.mimetype,
      extension: ext,
      ip: req.ip,
      traceId: req.traceId
    });
    
    cb(error, false);
  }
};

// Configuration de base de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max par fichier
    files: 10, // Maximum 10 fichiers
    fields: 20, // Maximum 20 champs
    fieldNameSize: 100, // Taille max du nom de champ
    fieldSize: 1024 * 1024 // Taille max d'un champ texte (1MB)
  }
});

// Middleware de gestion des erreurs d'upload
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'Erreur lors de l\'upload';
    let statusCode = 400;
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Fichier trop volumineux (maximum 15MB)';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Trop de fichiers (maximum 10)';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Champ de fichier inattendu';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Trop de champs dans la requête';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Nom de champ trop long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Valeur de champ trop longue';
        break;
      default:
        message = `Erreur d'upload: ${error.message}`;
    }
    
    logger.warn('Upload error', {
      code: error.code,
      message: error.message,
      field: error.field,
      ip: req.ip,
      traceId: req.traceId
    });
    
    return res.status(statusCode).json({
      success: false,
      message: message,
      code: error.code
    });
  }
  
  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }
  
  next(error);
};

// Fonction pour déplacer les fichiers du dossier temp vers le dossier final
const moveUploadedFiles = async (files, targetDir = imagesDir) => {
  if (!files || files.length === 0) return [];
  
  const movedFiles = [];
  
  for (const file of files) {
    try {
      const tempPath = file.path;
      const finalPath = path.join(targetDir, file.filename);
      
      // Déplacer le fichier
      fs.renameSync(tempPath, finalPath);
      
      // Mettre à jour le chemin dans l'objet file
      file.path = finalPath;
      file.url = `/uploads/images/${file.filename}`;
      
      movedFiles.push(file);
      
      logger.debug('File moved successfully', {
        filename: file.filename,
        from: tempPath,
        to: finalPath,
        size: file.size
      });
      
    } catch (error) {
      logger.error('Error moving uploaded file', {
        filename: file.filename,
        error: error.message
      });
      
      // Nettoyer le fichier temporaire en cas d'erreur
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
        logger.error('Error cleaning up temp file', {
          filename: file.filename,
          error: cleanupError.message
        });
      }
    }
  }
  
  return movedFiles;
};

// Fonction pour nettoyer les fichiers temporaires
const cleanupTempFiles = (files) => {
  if (!files || files.length === 0) return;
  
  files.forEach(file => {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        logger.debug('Temp file cleaned up', { filename: file.filename });
      }
    } catch (error) {
      logger.error('Error cleaning up temp file', {
        filename: file.filename,
        error: error.message
      });
    }
  });
};

// Fonction pour supprimer un fichier uploadé
const deleteUploadedFile = (filename) => {
  try {
    const filePath = path.join(imagesDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug('Uploaded file deleted', { filename });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error deleting uploaded file', {
      filename,
      error: error.message
    });
    return false;
  }
};

// Middleware pour valider les images après upload
const validateImages = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }
  
  // Vérifier que tous les fichiers sont bien des images
  const invalidFiles = req.files.filter(file => {
    return !file.mimetype.startsWith('image/');
  });
  
  if (invalidFiles.length > 0) {
    // Nettoyer les fichiers uploadés
    cleanupTempFiles(req.files);
    
    return res.status(400).json({
      success: false,
      message: 'Tous les fichiers doivent être des images',
      invalidFiles: invalidFiles.map(f => f.originalname)
    });
  }
  
  next();
};

// Middleware pour optimiser les images (placeholder pour future implémentation)
const optimizeImages = (req, res, next) => {
  // TODO: Implémenter l'optimisation des images avec sharp
  // - Redimensionnement automatique
  // - Compression
  // - Conversion en WebP
  // - Génération de thumbnails
  
  next();
};

// Tâche de nettoyage des fichiers temporaires anciens
const cleanupOldTempFiles = () => {
  try {
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    
    files.forEach(filename => {
      const filePath = path.join(tempDir, filename);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        logger.debug('Old temp file cleaned up', { filename });
      }
    });
  } catch (error) {
    logger.error('Error cleaning up old temp files', { error: error.message });
  }
};

// Planifier le nettoyage des fichiers temporaires toutes les heures
setInterval(cleanupOldTempFiles, 60 * 60 * 1000);

module.exports = {
  upload,
  handleUploadError,
  moveUploadedFiles,
  cleanupTempFiles,
  deleteUploadedFile,
  validateImages,
  optimizeImages,
  
  // Middlewares spécialisés
  single: (fieldName) => upload.single(fieldName),
  multiple: (fieldName, maxCount = 10) => upload.array(fieldName, maxCount),
  fields: (fields) => upload.fields(fields),
  
  // Constantes
  UPLOAD_DIR: uploadDir,
  IMAGES_DIR: imagesDir,
  TEMP_DIR: tempDir,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  MAX_FILES: 10
};

