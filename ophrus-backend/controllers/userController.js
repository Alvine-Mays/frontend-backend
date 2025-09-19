const mongoose = require("mongoose"); 
const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const generateToken = require("../utils/generateToken");
const { sendEmail } = require('../services/emailService');
const { logger } = require("../utils/logging");

// Génère un token de rafraîchissement
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

/* ------------------------------------------------------------------ */
/* GET /api/users/profil – Retourne l'utilisateur actuel              */
/* ------------------------------------------------------------------ */
exports.getUser = async (req, res) => {
  try {
    if (!req.user) {
      logger.warn("Tentative d'accès non autorisé au profil");
      return res.status(401).json({ message: "Non autorisé." });
    }

    logger.debug(`Récupération du profil utilisateur ID: ${req.user.id}`);
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      logger.error(`Utilisateur non trouvé ID: ${req.user.id}`);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    logger.info(`Profil récupéré avec succès ID: ${user._id}`);
    res.json(user);
  } catch (error) {
    logger.error(`Erreur lors de la récupération du profil: ${error.message}`, {
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/users/register – Inscription                             */
/* ------------------------------------------------------------------ */
exports.registerUser = async (req, res) => {
  try {
    const { nom, email, telephone, password } = req.body;
    logger.debug(`Tentative d'inscription: ${email}`);

    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn(`Email déjà utilisé: ${email}`);
      return res.status(400).json({ message: "Utilisateur déjà inscrit." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      nom, 
      email, 
      telephone, 
      password: hashed,
      refreshTokens: []
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    };
    res.cookie('rt', refreshToken, cookieOptions);

    res.status(201).json({
      success: true,
      user: { _id: user._id, nom: user.nom, email: user.email },
      token,
      message: "Inscription réussie."
    });

  } catch (error) {
    logger.error(`Erreur lors de l'inscription: ${error.message}`, {
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/users/login – Connexion                                 */
/* ------------------------------------------------------------------ */
exports.loginUser = async (req, res) => {
  try {
    logger.debug(`Requête de connexion reçue: ${JSON.stringify(req.body)}`);
    const identifier = req.body.identifier || req.body.email || req.body.nom;
    const { password } = req.body;
    logger.debug(`Tentative de connexion: ${identifier}`);

    const user = await User.findOne({
      $or: [{ email: identifier }, { nom: identifier }],
    }).select("+password +refreshTokens");

    logger.debug(`Utilisateur trouvé: ${user ? user.email : "aucun"}`);

    if (!user) {
      logger.warn(`Identifiant non trouvé: ${identifier}`);
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    logger.debug(`Password match result: ${isMatch}`);
    if (!isMatch) {
      logger.warn(`Mot de passe incorrect pour l'utilisateur: ${user.email}`);
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    };
    res.cookie('rt', refreshToken, cookieOptions);

    logger.info(`Connexion réussie ID: ${user._id}`, {
      email: user.email,
      ip: req.ip
    });

    res.json({
      success: true,
      user: { _id: user._id, nom: user.nom, email: user.email },
      token
    });
  } catch (error) {
    logger.error(`Erreur lors de la connexion: ${error.message}`, {
      stack: error.stack,
      identifier: req.body.identifier
    });
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/users/logout – Déconnexion                               */
/* ------------------------------------------------------------------ */
exports.logoutUser = async (req, res) => {
  try {
    logger.debug("Tentative de déconnexion");

    const refreshToken = (req.cookies && req.cookies.rt) || req.body?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && Array.isArray(user.refreshTokens)) {
          user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
          await user.save();
        }
      } catch (err) {
        logger.warn(`Erreur lors de la vérification du refresh token au logout: ${err.message}`);
      }
    }

    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    };
    res.clearCookie('rt', clearOptions);

    logger.info(`Déconnexion effectuée`);
    res.status(200).json({ message: "Déconnexion réussie." });
  } catch (error) {
    logger.error(`Erreur lors de la déconnexion: ${error.message}`, {
      stack: error.stack
    });
    res.status(500).json({ message: "Erreur serveur." });
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/users/refresh-token – Renouvelle les tokens              */
/* ------------------------------------------------------------------ */
exports.refreshToken = async (req, res) => {
  try {
    logger.debug("Tentative de renouvellement de token");

    const refreshToken = req.cookies?.rt;

    if (!refreshToken) {
      logger.warn("Refresh token manquant (cookie)");
      return res.status(401).json({ message: "Refresh token requis" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !Array.isArray(user.refreshTokens) || !user.refreshTokens.includes(refreshToken)) {
      logger.warn(`Refresh token invalide pour l'utilisateur ID: ${decoded.id}`);
      return res.status(403).json({ message: "Token invalide." });
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(newRefreshToken);
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    };
    res.cookie('rt', newRefreshToken, cookieOptions);

    logger.info(`Tokens renouvelés avec succès ID: ${user._id}`);

    res.status(200).json({
      token: newAccessToken
    });
  } catch (error) {
    logger.error(`Erreur lors du refresh token: ${error.message}`, {
      stack: error.stack
    });
    res.status(403).json({ message: "Token expiré ou invalide." });
  }
};

/* ------------------------------------------------------------------ */
/* PUT /api/users/:id – Mise à jour du profil                         */
/* ------------------------------------------------------------------ */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, telephone } = req.body;
    logger.debug(`Tentative de mise à jour du profil ID: ${id}`);

    const user = await User.findById(id);
    if (!user) {
      logger.error(`Utilisateur non trouvé pour mise à jour ID: ${id}`);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (user._id.toString() !== req.user.id) {
      logger.warn(`Tentative de modification non autorisée ID: ${id} par l'utilisateur ID: ${req.user.id}`);
      return res.status(403).json({ message: "Accès interdit." });
    }

    const updates = {};
    if (nom) updates.nom = nom;
    if (email) updates.email = email;
    if (telephone) updates.telephone = telephone;

    Object.assign(user, updates);
    await user.save();

    logger.info(`Profil mis à jour avec succès ID: ${user._id}`, {
      updatedFields: Object.keys(updates)
    });

    res.json({
      _id: user._id,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone,
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du profil: ${error.message}`, {
      stack: error.stack,
      userId: req.params.id
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/users/reset-request – Envoie un code de réinitialisation */
/* ------------------------------------------------------------------ */
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    logger.debug(`Demande de réinitialisation de mot de passe pour: ${email}`);

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Email non trouvé pour réinitialisation: ${email}`);
      return res
        .status(404)
        .json({ message: "Aucun utilisateur trouvé avec cet e-mail." });
    }

    // Vérifier si un code est déjà actif et non expiré
    if (user.resetCodeExpires && user.resetCodeExpires > Date.now()) {
      const remaining = Math.ceil((user.resetCodeExpires - Date.now()) / 60000);
      logger.warn(`Tentative trop fréquente pour: ${email} - Temps restant: ${remaining} min`);
      return res.status(429).json({
        message: `Un code vous a déjà été envoyé. Réessayez dans ${remaining} minute(s).`,
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // Code valide 10 minutes

    await user.save();
    
    // Envoi de l'email
    await sendEmail({
      to: user.email,
      subject: 'Votre code de réinitialisation',
      template: 'resetPassword', // views/emails/templates/resetPassword.hbs
      context: {
        code: user.resetCode,
        name: user.firstName || 'Utilisateur',
      },
    }); 



    logger.info(`Code de réinitialisation envoyé à: ${email}`, {
      userId: user._id
    });

    res.status(200).json({ message: "Code envoyé par email." });
  } catch (error) {
    logger.error(`Erreur lors de la demande de réinitialisation: ${error.message}`, {
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ message: "Erreur serveur." });
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/users/reset-verify – Vérifie le code de réinitialisation */
/* ------------------------------------------------------------------ */
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    logger.debug(`Vérification du code de réinitialisation pour: ${email}`);

    const user = await User.findOne({ email });

    if (
      !user ||
      !user.resetCode ||
      !user.resetCodeExpires ||
      user.resetCodeExpires < Date.now()
    ) {
      logger.warn(`Code invalide/expiré pour: ${email}`);
      return res.status(400).json({ message: "Code invalide ou expiré." });
    }

    if (user.resetCode !== String(code).trim()) {
      logger.warn(`Code incorrect pour: ${email}`);
      return res.status(400).json({ message: "Code invalide ou expiré." });
    }

    // Le code est valide, mais on ne supprime pas le code ici.
    // Il sera supprimé seulement après la réinitialisation effective du mot de passe.
    logger.info(`Code vérifié avec succès pour: ${email}`);

    res.status(200).json({ message: "Code valide." });
  } catch (error) {
    logger.error(`Erreur lors de la vérification du code: ${error.message}`, {
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ message: "Erreur serveur." });
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/users/reset-password – Change le mot de passe */
/* ------------------------------------------------------------------ */
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    logger.debug(`Demande de réinitialisation de mot de passe pour: ${email}`);

    // Récupérer l'utilisateur avec le code de réinitialisation et le mot de passe
    const user = await User.findOne({ email, resetCode: code }).select("+password");

    // Vérifier si l'utilisateur existe et si le code est valide/non expiré
    if (!user || user.resetCodeExpires < Date.now()) {
      logger.warn(`Code invalide/expiré pour la réinitialisation: ${email}`);
      return res.status(400).json({ message: "Code invalide ou expiré." });
    }

    // Mettre à jour le mot de passe
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = null; // Supprimer le code après utilisation
    user.resetCodeExpires = null; // Supprimer l'expiration après utilisation
    await user.save();

    logger.info(`Mot de passe réinitialisé avec succès pour: ${email}`, {
      userId: user._id
    });

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    logger.error(`Erreur lors de la réinitialisation du mot de passe: ${error.message}`, {
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ message: "Erreur serveur." });
  }
};

/* ------------------------------------------------------------------ */
/* GET /api/users/search – Rechercher des utilisateurs                */
/* ------------------------------------------------------------------ */
exports.searchUsers = async (req, res) => {
  try {
    const { nom, email } = req.query;
    logger.debug(`Recherche d'utilisateurs - nom: ${nom}, email: ${email}`);

    const query = [];
    if (nom) query.push({ nom: { $regex: nom, $options: "i" } });
    if (email) query.push({ email: { $regex: email, $options: "i" } });

    const users = await User.find(query.length ? { $or: query } : {}).select(
      "_id nom email"
    );

    logger.info(`Recherche effectuée - résultats: ${users.length}`);

    res.json(users);
  } catch (error) {
    logger.error(`Erreur lors de la recherche d'utilisateurs: ${error.message}`, {
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ message: "Erreur serveur." });
  }
};

/* ------------------------------------------------------------------ */
/* DELETE /api/users/:id – Soft delete amélioré                       */
/* ------------------------------------------------------------------ */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn(`ID utilisateur invalide: ${id}`);
      return res.status(400).json({ 
        success: false,
        message: "ID utilisateur invalide" 
      });
    }

    const userToDelete = await User.findById(id);
    
    // Vérifications combinées
    if (!userToDelete || userToDelete.deleted) {
      logger.warn(`Utilisateur introuvable ID: ${id}`);
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }

    // Vérification des permissions améliorée
    const isOwner = currentUser.id === id;
    const isAdmin = currentUser.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      logger.warn(`Tentative de suppression non autorisée par ${currentUser.email}`);
      return res.status(403).json({ 
        success: false,
        message: "Action non autorisée" 
      });
    }

    // Protection admin renforcée
    if (userToDelete.role === 'admin') {
      const activeAdmins = await User.countDocuments({ 
        role: 'admin', 
        deleted: false,
        _id: { $ne: id } // Exclut l'utilisateur actuel
      });
      
      if (activeAdmins < 1) {
        logger.warn(`Tentative de suppression du dernier admin ID: ${id}`);
        return res.status(400).json({
          success: false,
          message: "Impossible de supprimer le dernier administrateur"
        });
      }
    }

    // Soft delete optimisé
    const result = await User.findByIdAndUpdate(
      id,
      {
        $set: { 
          deleted: true,
          deletedAt: new Date() 
        },
        $unset: {
          refreshTokens: "",
          resetCode: "",
          resetCodeExpires: ""
        }
      },
      { new: true }
    );

    logger.info(`Soft delete réussi ID: ${id}`, {
      actionBy: currentUser.email,
      deletedAt: result.deletedAt
    });

    return res.status(200).json({
      success: true,
      data: {
        id: result._id,
        email: result.email,
        deletedAt: result.deletedAt
      }
    });

  } catch (error) {
    logger.error(`Erreur suppression utilisateur: ${error.message}`, {
      error,
      userId: req.params.id
    });
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};

/* ------------------------------------------------------------------ */
/* PATCH /api/users/:id/restore – Restaure un utilisateur             */
/* ------------------------------------------------------------------ */
exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    // Seul un admin peut restaurer
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, deleted: true },
      { 
        $set: { deleted: false },
        $unset: { deletedAt: 1 }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur supprimé non trouvé" });
    }

    logger.info(`Utilisateur restauré - ID: ${id} par ${req.user.email}`);

    res.status(200).json({ 
      success: true,
      message: "Utilisateur restauré avec succès",
      data: {
        id: user._id,
        email: user.email
      }
    });

  } catch (error) {
    logger.error(`Erreur restauration: ${error.message}`, {
      userId: req.params.id,
      error
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ------------------------------------------------------------------ */
/* GET /api/users/deleted – Liste des utilisateurs supprimés (admin)  */
/* ------------------------------------------------------------------ */
exports.getDeletedUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const users = await User.find({ deleted: true })
      .select("nom email role deletedAt")
      .sort({ deletedAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    logger.error(`Erreur liste utilisateurs supprimés: ${error.message}`);
    res.status(500).json({ message: "Erreur serveur" });
  }
}; 
