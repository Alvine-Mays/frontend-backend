const User = require('../models/User');
const Property = require('../models/Property');
const { logger } = require('../utils/logging');

// POST /api/properties/:id/visit
exports.recordVisit = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.id;

    const property = await Property.findById(propertyId).select('_id');
    if (!property) {
      logger.warn(`Visite: bien introuvable ${propertyId}`);
      return res.status(404).json({ message: 'Bien introuvable.' });
    }

    const user = await User.findById(userId).select('visited');
    if (!user) {
      logger.warn(`Visite: utilisateur introuvable ${userId}`);
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const idx = (user.visited || []).findIndex(v => v.property?.toString() === propertyId);
    if (idx >= 0) {
      user.visited[idx].lastVisitedAt = new Date();
      user.visited[idx].count = (user.visited[idx].count || 0) + 1;
    } else {
      user.visited = user.visited || [];
      user.visited.unshift({ property: propertyId, lastVisitedAt: new Date(), count: 1 });
      // garder un historique raisonnable (ex. 100)
      if (user.visited.length > 100) {
        user.visited = user.visited.slice(0, 100);
      }
    }

    await user.save();
    logger.info(`Visite enregistrée - user:${userId} property:${propertyId}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`Erreur recordVisit: ${error.message}`, { stack: error.stack, userId: req.user?.id, propertyId: req.params.id });
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/users/visited?limit=&page=
exports.getVisited = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);

    const user = await User.findById(userId)
      .select('visited')
      .populate({ path: 'visited.property', select: '_id titre ville prix images noteMoyenne createdAt' });

    if (!user) {
      logger.warn(`Visited: utilisateur introuvable ${userId}`);
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const sorted = (user.visited || []).sort((a, b) => new Date(b.lastVisitedAt) - new Date(a.lastVisitedAt));
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = sorted.slice(start, end).map(v => ({
      _id: v.property?._id,
      titre: v.property?.titre,
      ville: v.property?.ville,
      prix: v.property?.prix,
      images: v.property?.images,
      noteMoyenne: v.property?.noteMoyenne || 0,
      lastVisitedAt: v.lastVisitedAt,
      count: v.count || 1,
    })).filter(i => i._id);

    return res.json({
      total: sorted.length,
      page,
      limit,
      totalPages: Math.ceil(sorted.length / limit),
      items,
    });
  } catch (error) {
    logger.error(`Erreur getVisited: ${error.message}`, { stack: error.stack, userId: req.user?.id });
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
