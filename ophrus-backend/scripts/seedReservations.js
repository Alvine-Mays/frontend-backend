require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Property = require('../models/Property');

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI manquant');
    await mongoose.connect(uri);

    const ownerEmail = 'owner@ophrus.test';
    let owner = await User.findOne({ email: ownerEmail });
    if (!owner) {
      owner = await User.create({
        nom: 'Owner Test',
        email: ownerEmail,
        telephone: '+242061234567',
        password: await bcrypt.hash('OwnerPass123!', 10),
        refreshTokens: []
      });
    }

    const items = [
      { titre: 'Appartement centre-ville', description: '2 pièces', prix: 150000, ville: 'Brazzaville', adresse: 'Centre', categorie: 'Appartement' },
      { titre: 'Maison avec jardin', description: '4 chambres', prix: 350000, ville: 'Pointe-Noire', adresse: 'Quartier Nord', categorie: 'Maison' },
      { titre: 'Bureau moderne', description: 'Open space', prix: 500000, ville: 'Brazzaville', adresse: 'Business District', categorie: 'Commercial' }
    ];

    for (const it of items) {
      const exists = await Property.findOne({ titre: it.titre });
      if (!exists) {
        await Property.create({ ...it, images: [], utilisateur: owner._id });
      }
    }

    console.log('Seed terminé. Owner:', owner.email);
    process.exit(0);
  } catch (e) {
    console.error('Seed erreur:', e.message);
    process.exit(1);
  }
})();
