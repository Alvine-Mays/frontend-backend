require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');
const cloudinary = require('../config/cloudinary');

const CITIES = ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Owando', 'Impfondo'];
const CATEGORIES = ['Appartement', 'Maison', 'Terrain', 'Commercial', 'Autre'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const fetchAndUploadImages = async (count = 3) => {
  const imgs = [];
  for (let i = 0; i < count; i++) {
    const id = Math.floor(Math.random() * 1000) + 1;
    const remoteUrl = `https://picsum.photos/id/${id}/1200/800`;
    if (cloudinary) {
      try {
        const up = await cloudinary.uploader.upload(remoteUrl, { folder: 'ophrus-annonces' });
        imgs.push({ url: up.secure_url, public_id: up.public_id });
      } catch (e) {
        console.warn('Cloudinary upload failed, using remote URL fallback', e.message);
        imgs.push({ url: remoteUrl, public_id: null });
      }
    } else {
      imgs.push({ url: remoteUrl, public_id: null });
    }
  }
  return imgs;
};

async function run() {
  try {
    await connectDB();

    let admin = await User.findOne({ email: 'admin@ophrus.com' }).select('_id email');
    if (!admin) {
      const hashed = await bcrypt.hash('Admin123!', 10);
      admin = await User.create({
        nom: 'Administrateur',
        email: 'admin@ophrus.com',
        telephone: '+242061234567',
        password: hashed,
        role: 'admin',
      });
      console.log('✅ Admin créé:', admin.email);
    } else {
      console.log('ℹ️  Admin déjà existant:', admin.email);
    }

    const countBefore = await Property.countDocuments({});
    const toCreate = [];
    for (let i = 1; i <= 10; i++) {
      const titre = `Bien démo ${i}`;
      const ville = pick(CITIES);
      const categorie = pick(CATEGORIES);
      const prix = Math.floor(Math.random() * 900000) + 100000;

      const images = await fetchAndUploadImages(3);

      toCreate.push({
        titre,
        description: `Description du ${titre} situé à ${ville}.`,
        prix,
        ville,
        adresse: `${i} Rue Démo, ${ville}`,
        categorie,
        images,
        utilisateur: admin._id,
        noteMoyenne: 0,
      });
    }

    await Property.insertMany(toCreate);
    const countAfter = await Property.countDocuments({});

    console.log(`✅ ${toCreate.length} biens créés. Total: ${countAfter} (avant: ${countBefore})`);
  } catch (err) {
    console.error('❌ Erreur seed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
