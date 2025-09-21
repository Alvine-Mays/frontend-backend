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
  validateChangePassword,
} = require("../middlewares/security");

const userController = require("../controllers/userController");
const { getVisited } = require("../controllers/visitedController");
const upload = require("../middlewares/multer");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

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
router.get("/visited", protect, getVisited);
router.get("/stats", protect, userController.getUserStats);
router.patch("/:id/password", protect, validateChangePassword, userController.changePassword);
router.post("/:id/avatar", protect, upload.single('avatar'), async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit.' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    if (!req.file?.path) return res.status(400).json({ message: 'Fichier manquant.' });
    if (!cloudinary) return res.status(503).json({ message: 'Cloudinary non configuré.' });

    if (user.avatarPublicId) {
      try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch (_) {}
    }

    const up = await cloudinary.uploader.upload(req.file.path, { folder: 'ophrus-avatars', overwrite: true });
    user.avatarUrl = up.secure_url;
    user.avatarPublicId = up.public_id;
    await user.save();

    return res.json({ success: true, avatarUrl: user.avatarUrl });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.delete("/:id/avatar", protect, async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit.' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    if (user.avatarPublicId && cloudinary) {
      try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch (_) {}
    }
    user.avatarUrl = null;
    user.avatarPublicId = null;
    await user.save();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.get("/search", protect, userController.searchUsers);

module.exports = router;

