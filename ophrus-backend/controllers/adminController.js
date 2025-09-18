const User = require("../models/User");
const Property = require("../models/Property");
const Message = require("../models/Message");
const { logger } = require("../utils/logging");

// Dashboard - Statistiques générales
const getDashboardStats = async (req, res) => {
  try {
    // Statistiques des propriétés
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments();
    const pendingProperties = 0; // Pas de statut dans le modèle actuel

    // Statistiques des utilisateurs
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { 
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
      }
    });

    // Statistiques des messages
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ 
      lu: false 
    });

    // Propriétés les plus vues (simulé)
    const topProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('titre ville prix categorie');

    // Activités récentes (simulé)
    const recentActivities = [
      {
        type: 'property',
        title: 'Nouvelle propriété ajoutée',
        description: 'Appartement 3 pièces - Paris 15ème',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success'
      },
      {
        type: 'user',
        title: 'Nouvel utilisateur inscrit',
        description: 'Marie Dubois - Client',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'info'
      },
      {
        type: 'message',
        title: 'Nouveau message',
        description: 'Demande d\'information pour Villa Cannes',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'warning'
      }
    ];

    // Données pour les graphiques
    const salesData = [
      { name: 'Jan', ventes: 4000, locations: 2400 },
      { name: 'Fév', ventes: 3000, locations: 1398 },
      { name: 'Mar', ventes: 2000, locations: 9800 },
      { name: 'Avr', ventes: 2780, locations: 3908 },
      { name: 'Mai', ventes: 1890, locations: 4800 },
      { name: 'Jun', ventes: 2390, locations: 3800 },
    ];

    const propertyTypes = await Property.aggregate([
      { $group: { _id: '$categorie', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProperties,
          activeProperties,
          pendingProperties,
          totalUsers,
          activeUsers,
          newUsersThisMonth,
          totalMessages,
          unreadMessages
        },
        topProperties,
        recentActivities,
        salesData,
        propertyTypes
      }
    });

  } catch (error) {
    logger.error('Erreur getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Gestion des propriétés
const getAllProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10, categorie, search } = req.query;
    
    const query = {};
    
    if (categorie) query.categorie = categorie;
    if (search) {
      query.$or = [
        { titre: { $regex: search, $options: 'i' } },
        { ville: { $regex: search, $options: 'i' } }
      ];
    }

    const properties = await Property.find(query)
      .populate('utilisateur', 'nom email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Property.countDocuments(query);

    res.json({
      success: true,
      data: {
        properties,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    logger.error('Erreur getAllProperties:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des propriétés'
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('utilisateur', 'nom email telephone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propriété non trouvée'
      });
    }

    res.json({
      success: true,
      data: property
    });

  } catch (error) {
    logger.error('Erreur getPropertyById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la propriété'
    });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!property || property.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Propriété non trouvée'
      });
    }

    logger.info(`Statut de la propriété ${property._id} mis à jour: ${status}`);

    res.json({
      success: true,
      data: property,
      message: 'Statut mis à jour avec succès'
    });

  } catch (error) {
    logger.error('Erreur updatePropertyStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propriété non trouvée'
      });
    }

    logger.info(`Propriété ${property._id} supprimée par admin ${req.user._id}`);

    res.json({
      success: true,
      message: 'Propriété supprimée avec succès'
    });

  } catch (error) {
    logger.error('Erreur deleteProperty:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

// Gestion des utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, status } = req.query;
    
    const query = { isDeleted: false };
    
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    logger.error('Erreur getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Erreur getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { nom, email, telephone, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nom, email, telephone, isActive },
      { new: true }
    ).select('-password');

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    logger.info(`Utilisateur ${user._id} mis à jour par admin ${req.user._id}`);

    res.json({
      success: true,
      data: user,
      message: 'Utilisateur mis à jour avec succès'
    });

  } catch (error) {
    logger.error('Erreur updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour'
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    logger.info(`Rôle de l'utilisateur ${user._id} mis à jour: ${role}`);

    res.json({
      success: true,
      data: user,
      message: 'Rôle mis à jour avec succès'
    });

  } catch (error) {
    logger.error('Erreur updateUserRole:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du rôle'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    logger.info(`Utilisateur ${user._id} supprimé par admin ${req.user._id}`);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    logger.error('Erreur deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

const restoreUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    logger.info(`Utilisateur ${user._id} restauré par admin ${req.user._id}`);

    res.json({
      success: true,
      message: 'Utilisateur restauré avec succès'
    });

  } catch (error) {
    logger.error('Erreur restoreUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la restauration'
    });
  }
};

// Gestion des messages
const getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = { isDeleted: false };
    
    if (status) query.isRead = status === 'read';
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const messages = await Message.find(query)
      .populate('sender', 'nom email')
      .populate('property', 'titre')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    logger.error('Erreur getAllMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
};

const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'nom email telephone')
      .populate('property', 'titre localisation prix');

    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    logger.error('Erreur getMessageById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du message'
    });
  }
};

const updateMessageStatus = async (req, res) => {
  try {
    const { isRead } = req.body;
    
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead },
      { new: true }
    );

    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.json({
      success: true,
      data: message,
      message: 'Statut mis à jour avec succès'
    });

  } catch (error) {
    logger.error('Erreur updateMessageStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    logger.info(`Message ${message._id} supprimé par admin ${req.user._id}`);

    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });

  } catch (error) {
    logger.error('Erreur deleteMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

// Analytics
const getPropertyAnalytics = async (req, res) => {
  try {
    // Données simulées pour les analytics
    const analytics = {
      totalViews: 123456,
      averagePrice: 450000,
      mostViewedType: 'Appartement',
      topLocations: [
        { name: 'Paris', count: 45 },
        { name: 'Lyon', count: 32 },
        { name: 'Marseille', count: 28 }
      ],
      priceRanges: [
        { range: '0-200k', count: 15 },
        { range: '200k-500k', count: 35 },
        { range: '500k-1M', count: 25 },
        { range: '1M+', count: 10 }
      ]
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Erreur getPropertyAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analytics'
    });
  }
};

const getUserAnalytics = async (req, res) => {
  try {
    // Données simulées pour les analytics utilisateurs
    const analytics = {
      totalRegistrations: 8456,
      activeUsers: 6234,
      userGrowth: [
        { month: 'Jan', users: 100 },
        { month: 'Fév', users: 150 },
        { month: 'Mar', users: 200 },
        { month: 'Avr', users: 180 },
        { month: 'Mai', users: 220 },
        { month: 'Jun', users: 250 }
      ],
      usersByRole: [
        { role: 'Client', count: 7800 },
        { role: 'Agent', count: 650 },
        { role: 'Admin', count: 6 }
      ]
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Erreur getUserAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analytics'
    });
  }
};

const getRevenueAnalytics = async (req, res) => {
  try {
    // Données simulées pour les analytics de revenus
    const analytics = {
      totalRevenue: 45678,
      monthlyRevenue: [
        { month: 'Jan', revenue: 35000 },
        { month: 'Fév', revenue: 42000 },
        { month: 'Mar', revenue: 38000 },
        { month: 'Avr', revenue: 45000 },
        { month: 'Mai', revenue: 48000 },
        { month: 'Jun', revenue: 52000 }
      ],
      revenueByType: [
        { type: 'Vente', revenue: 280000 },
        { type: 'Location', revenue: 180000 }
      ]
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Erreur getRevenueAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analytics'
    });
  }
};

// Paramètres système
const getSystemSettings = async (req, res) => {
  try {
    // Paramètres système simulés
    const settings = {
      siteName: 'Ophrus Immobilier',
      siteDescription: 'Plateforme immobilière moderne',
      maintenanceMode: false,
      allowRegistration: true,
      emailNotifications: true,
      maxFileSize: 10, // MB
      supportedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
      currency: 'EUR',
      language: 'fr'
    };

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    logger.error('Erreur getSystemSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres'
    });
  }
};

const updateSystemSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    // En production, sauvegarder en base de données
    logger.info(`Paramètres système mis à jour par admin ${req.user._id}`);

    res.json({
      success: true,
      data: settings,
      message: 'Paramètres mis à jour avec succès'
    });

  } catch (error) {
    logger.error('Erreur updateSystemSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllProperties,
  getPropertyById,
  updatePropertyStatus,
  deleteProperty,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  restoreUser,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
  getPropertyAnalytics,
  getUserAnalytics,
  getRevenueAnalytics,
  getSystemSettings,
  updateSystemSettings
};

