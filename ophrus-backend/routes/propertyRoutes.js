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
const { recordVisit } = require("../controllers/visitedController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// -------------------------------
// Routes PUBLIQUES (sans authentification)
// -------------------------------
router.get("/", getAllProperty);                    // Public - Récupérer toutes les annonces
router.get("/:id", getPropertyById);               // Public - Récupérer une annonce par ID

// -------------------------------
// Routes PROTÉGÉES (avec authentification)
// -------------------------------
// Création / mise à jour / suppression réservées à l'agence (admin)
router.post("/", protect, adminOnly, upload.array("images", 10), creerProperty);
router.put("/:id", protect, adminOnly, updateProperty);
router.delete("/:id", protect, adminOnly, deleteProperty);

// Actions client
router.post("/:id/favoris", protect, toggleFavori);
router.post("/:id/rate", protect, rateProperty);
router.get("/:id/rating", protect, getPropertyWithRating);
router.post("/:id/visit", protect, recordVisit);

module.exports = router;