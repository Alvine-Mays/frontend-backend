const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Property = require('../models/Property');

describe('Properties Tests', () => {
  let authToken;
  let userId;
  let propertyId;

  const testUser = {
    nom: 'Test',
    prenom: 'User',
    email: 'test@example.com',
    motDePasse: 'TestPassword123!',
    telephone: '+242 06 123 45 67'
  };

  const testProperty = {
    titre: 'Belle maison moderne',
    description: 'Une magnifique maison avec jardin et piscine, idéale pour une famille.',
    prix: 150000000,
    type: 'maison',
    statut: 'vente',
    superficie: 200,
    nombreChambres: 4,
    nombreSallesBain: 2,
    adresse: '123 Avenue de la Paix, Brazzaville',
    ville: 'Brazzaville',
    quartier: 'Centre-ville',
    latitude: -4.2634,
    longitude: 15.2429
  };

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ophrus_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Property.deleteMany({});

    // Créer un utilisateur et obtenir le token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    userId = registerResponse.body.user._id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        motDePasse: testUser.motDePasse
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/properties', () => {
    it('should create a new property with valid data', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProperty)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.property).toHaveProperty('titre', testProperty.titre);
      expect(response.body.property).toHaveProperty('proprietaire', userId);
      propertyId = response.body.property._id;
    });

    it('should not create property without authentication', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send(testProperty)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not create property with invalid data', async () => {
      const invalidProperty = { ...testProperty, prix: -1000 };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProperty)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should not create property with missing required fields', async () => {
      const incompleteProperty = { titre: 'Test' };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteProperty)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/properties', () => {
    beforeEach(async () => {
      // Créer quelques propriétés de test
      await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProperty);

      await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testProperty,
          titre: 'Appartement moderne',
          type: 'appartement',
          prix: 80000000
        });
    });

    it('should get all properties', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.properties).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter properties by type', async () => {
      const response = await request(app)
        .get('/api/properties?type=appartement')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.properties).toHaveLength(1);
      expect(response.body.properties[0].type).toBe('appartement');
    });

    it('should filter properties by price range', async () => {
      const response = await request(app)
        .get('/api/properties?prixMin=70000000&prixMax=90000000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.properties).toHaveLength(1);
      expect(response.body.properties[0].prix).toBe(80000000);
    });

    it('should search properties by title', async () => {
      const response = await request(app)
        .get('/api/properties?search=appartement')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.properties).toHaveLength(1);
      expect(response.body.properties[0].titre).toContain('Appartement');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/properties?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.properties).toHaveLength(1);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/properties/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProperty);
      propertyId = response.body.property._id;
    });

    it('should get property by valid ID', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.property).toHaveProperty('_id', propertyId);
      expect(response.body.property).toHaveProperty('titre', testProperty.titre);
    });

    it('should return 404 for non-existent property', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/properties/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/properties/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/properties/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProperty);
      propertyId = response.body.property._id;
    });

    it('should update property with valid data', async () => {
      const updatedData = {
        titre: 'Maison rénovée',
        prix: 160000000
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.property.titre).toBe(updatedData.titre);
      expect(response.body.property.prix).toBe(updatedData.prix);
    });

    it('should not update property without authentication', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .send({ titre: 'Test' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not update property with invalid data', async () => {
      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ prix: -1000 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/properties/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProperty);
      propertyId = response.body.property._id;
    });

    it('should delete property by owner', async () => {
      const response = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('supprimée');
    });

    it('should not delete property without authentication', async () => {
      const response = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when deleting non-existent property', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/properties/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

