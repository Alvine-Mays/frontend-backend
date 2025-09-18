const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const adminController = require("../controllers/adminController");

// Middleware pour toutes les routes admin
router.use(protect);
router.use(adminOnly);

// Dashboard - Statistiques générales
router.get("/dashboard/stats", adminController.getDashboardStats);

// Gestion des propriétés
router.get("/properties", adminController.getAllProperties);
router.get("/properties/:id", adminController.getPropertyById);
router.put("/properties/:id/status", adminController.updatePropertyStatus);
router.delete("/properties/:id", adminController.deleteProperty);

// Gestion des utilisateurs
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.put("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);
router.patch("/users/:id/restore", adminController.restoreUser);

// Gestion des messages
router.get("/messages", adminController.getAllMessages);
router.get("/messages/:id", adminController.getMessageById);
router.put("/messages/:id/status", adminController.updateMessageStatus);
router.delete("/messages/:id", adminController.deleteMessage);

// Analytics
router.get("/analytics/properties", adminController.getPropertyAnalytics);
router.get("/analytics/users", adminController.getUserAnalytics);
router.get("/analytics/revenue", adminController.getRevenueAnalytics);

// Paramètres système
router.get("/settings", adminController.getSystemSettings);
router.put("/settings", adminController.updateSystemSettings);

module.exports = router;

