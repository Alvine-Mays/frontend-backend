const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../utils/logging');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    logger.warn('Erreurs de validation', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      errors: errorMessages
    });
    
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errorMessages
    });
  }
  next();
};

// Validation pour l'inscription d'utilisateur
const validateUserRegistration = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  body('prenom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('L\'email ne peut pas dépasser 100 caractères'),
  
  body('motDePasse')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
  
  body('telephone')
    .optional()
    .matches(/^\+242\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/)
    .withMessage('Le numéro de téléphone doit être au format +242 XX XXX XX XX'),
  
  handleValidationErrors
];

// Validation pour la connexion
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  
  body('motDePasse')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
  
  handleValidationErrors
];

// Validation pour l'ajout/modification de propriété
const validateProperty = [
  body('titre')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Le titre doit contenir entre 5 et 200 caractères'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('La description doit contenir entre 20 et 2000 caractères'),
  
  body('prix')
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  
  body('type')
    .isIn(['maison', 'appartement', 'terrain', 'bureau', 'commerce'])
    .withMessage('Type de propriété invalide'),
  
  body('statut')
    .isIn(['vente', 'location'])
    .withMessage('Statut invalide'),
  
  body('superficie')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La superficie doit être un nombre positif'),
  
  body('nombreChambres')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Le nombre de chambres doit être entre 0 et 20'),
  
  body('nombreSallesBain')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Le nombre de salles de bain doit être entre 0 et 10'),
  
  body('adresse')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('L\'adresse doit contenir entre 10 et 200 caractères'),
  
  body('ville')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ville doit contenir entre 2 et 50 caractères'),
  
  body('quartier')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le quartier ne peut pas dépasser 100 caractères'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude invalide'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude invalide'),
  
  handleValidationErrors
];

// Validation pour les paramètres d'ID
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('ID invalide'),
  
  handleValidationErrors
];

// Validation pour la réinitialisation de mot de passe
const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  
  handleValidationErrors
];

// Validation pour la confirmation de réinitialisation
const validatePasswordResetConfirm = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Le code doit contenir exactement 6 caractères')
    .isNumeric()
    .withMessage('Le code doit être numérique'),
  
  body('nouveauMotDePasse')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
  
  handleValidationErrors
];

// Validation pour les messages de contact
const validateContactMessage = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  
  body('telephone')
    .optional()
    .matches(/^\+242\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/)
    .withMessage('Le numéro de téléphone doit être au format +242 XX XXX XX XX'),
  
  body('sujet')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Le sujet doit contenir entre 5 et 100 caractères'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Le message doit contenir entre 10 et 1000 caractères'),
  
  handleValidationErrors
];

// Validation pour les requêtes de recherche
const validateSearchQuery = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La recherche ne peut pas dépasser 100 caractères'),
  
  query('type')
    .optional()
    .isIn(['maison', 'appartement', 'terrain', 'bureau', 'commerce'])
    .withMessage('Type de propriété invalide'),
  
  query('statut')
    .optional()
    .isIn(['vente', 'location'])
    .withMessage('Statut invalide'),
  
  query('prixMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix minimum doit être un nombre positif'),
  
  query('prixMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix maximum doit être un nombre positif'),
  
  query('ville')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La ville ne peut pas dépasser 50 caractères'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProperty,
  validateObjectId,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validateContactMessage,
  validateSearchQuery,
  handleValidationErrors
};

