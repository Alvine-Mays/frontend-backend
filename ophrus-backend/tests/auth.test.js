const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Configuration de test
const testUser = {
  nom: 'Test',
  prenom: 'User',
  email: 'test@example.com',
  motDePasse: 'TestPassword123!',
  telephone: '+242 06 123 45 67'
};

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Connexion à la base de données de test
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ophrus_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Fermer la connexion après tous les tests
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Inscription réussie');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('motDePasse');
    });

    it('should not register user with invalid email', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should not register user with weak password', async () => {
      const weakPasswordUser = { ...testUser, motDePasse: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should not register user with duplicate email', async () => {
      // Créer un utilisateur
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Tenter de créer un autre utilisateur avec le même email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('existe déjà');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Créer un utilisateur pour les tests de connexion
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          motDePasse: testUser.motDePasse
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('motDePasse');
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          motDePasse: testUser.motDePasse
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Identifiants invalides');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          motDePasse: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Identifiants invalides');
    });

    it('should not login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
          // motDePasse manquant
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should send reset code for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Code de réinitialisation envoyé');
    });

    it('should handle non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        })
        .expect(200);

      // Pour des raisons de sécurité, on retourne toujours success
      expect(response.body.success).toBe(true);
    });

    it('should not accept invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login attempts', async () => {
      // Faire plusieurs tentatives de connexion échouées
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'wrong@example.com',
              motDePasse: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Les premières tentatives devraient retourner 401
      expect(responses[0].status).toBe(401);
      expect(responses[4].status).toBe(401);
      
      // La 6ème tentative devrait être bloquée par rate limiting
      expect(responses[5].status).toBe(429);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });
});

