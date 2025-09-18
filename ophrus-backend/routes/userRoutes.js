const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  validateUser,
  validateLogin,
  validateResetRequest,
  validateResetVerify,
  validateResetPassword,
  resetRequestLimiter,
} = require("../middlewares/security");

const userController = require("../controllers/userController");

// Routes publiques
router.post("/register", validateUser, userController.registerUser);
router.post("/login", validateLogin, userController.loginUser);
router.post("/logout", userController.logoutUser);
router.post("/refresh-token", userController.refreshToken);
router.post("/reset-request", validateResetRequest, resetRequestLimiter, userController.requestPasswordReset);
router.post("/reset-verify", validateResetVerify, userController.verifyResetCode);
router.post("/reset-password", validateResetPassword, userController.resetPasswordWithCode);

// Routes d'authentification pour les tests
router.post("/auth/register", validateUser, userController.registerUser);
router.post("/auth/login", validateLogin, userController.loginUser);
router.post("/auth/forgot-password", validateResetRequest, resetRequestLimiter, userController.requestPasswordReset);
router.get("/auth/me", protect, userController.getUser);

// Routes protégées
router.route("/:id")
  .put(protect, userController.updateUser);

router.get("/profil", protect, userController.getUser);
router.get("/search", protect, userController.searchUsers);

module.exports = router;

