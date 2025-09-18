// Configuration globale pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/ophrus_test';

// Augmenter le timeout pour les tests
jest.setTimeout(30000);

// Mock des services externes
jest.mock('../utils/sendEmail', () => ({
  initEmailTransporter: jest.fn().mockResolvedValue(true),
  sendEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}));

// Mock du service de cache Redis pour les tests
jest.mock('../services/cacheService', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
  delPattern: jest.fn().mockResolvedValue(true),
  isAvailable: jest.fn().mockReturnValue(false)
}));

// Supprimer les logs pendant les tests
const winston = require('winston');
winston.configure({
  level: 'error',
  transports: [
    new winston.transports.Console({ silent: true })
  ]
});

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

