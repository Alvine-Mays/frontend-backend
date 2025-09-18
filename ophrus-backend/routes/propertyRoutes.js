const express = require("express");
const router = express.Router();
const {
  creerProperty,
  getAllProperty,
  getPropertyById,
  updateProperty,
  deleteProperty,
  toggleFavori,
  rateProperty,
  getPropertyWithRating,
} = require("../controllers/propertyController");

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// -------------------------------
// Routes PUBLIQUES (sans authentification)
// -------------------------------

// ✅ CORRECTION : Routes publiques sans protection
router.get("/", getAllProperty);                    // Public - Récupérer toutes les annonces
router.get("/:id", getPropertyById);               // Public - Récupérer une annonce par ID

// -------------------------------
// Routes PROTÉGÉES (avec authentification)
// -------------------------------

// Créer une nouvelle annonce (nécessite une authentification)
router.post("/", protect, upload.array("images", 10), creerProperty);

// Mettre à jour une annonce (nécessite une authentification)
router.put("/:id", protect, updateProperty);

// Supprimer une annonce (nécessite une authentification)
router.delete("/:id", protect, deleteProperty);

// Gérer les favoris (nécessite une authentification)
router.post("/:id/favoris", protect, toggleFavori);

// Noter une propriété (nécessite une authentification)
router.post("/:id/rate", protect, rateProperty);

// Récupérer une propriété avec ses évaluations (nécessite une authentification)
router.get("/:id/rating", protect, getPropertyWithRating);

module.exports = router;