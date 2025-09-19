const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Property = require('../models/Property');
const Message = require('../models/Message');
const { logger } = require('../utils/logging');

// POST /api/reservations
// body: { propertyId, date }
// Auth: user
exports.createReservation = asyncHandler(async (req, res) => {
  const { propertyId, date } = req.body;
  const userId = req.user.id;

  try {
    if (!propertyId || !date) {
      return res.status(400).json({ message: 'propertyId et date sont requis.' });
    }

    const when = new Date(date);
    if (isNaN(when.getTime())) {
      return res.status(400).json({ message: 'Date invalide.' });
    }
    const now = new Date();
    if (when < now) {
      return res.status(400).json({ message: 'La date de réservation doit être dans le futur.' });
    }

    const property = await Property.findById(propertyId).populate('utilisateur', 'nom email');
    if (!property) {
      return res.status(404).json({ message: 'Bien introuvable.' });
    }

    // Option: empêcher les doublons en attente pour le même bien/usager/date (même jour)
    const startDay = new Date(when); startDay.setHours(0,0,0,0);
    const endDay = new Date(when); endDay.setHours(23,59,59,999);
    const existing = await Reservation.findOne({
      property: propertyId,
      user: userId,
      date: { $gte: startDay, $lte: endDay },
      status: { $in: ['en attente', 'confirmée'] }
    });
    if (existing) {
      return res.status(409).json({ message: 'Une réservation existe déjà pour ce bien à cette date.' });
    }

    const reservation = await Reservation.create({
      property: propertyId,
      user: userId,
      date: when,
      status: 'en attente'
    });

    // Assimiler la mise en contact via message
    try {
      if (property.utilisateur && property.utilisateur._id.toString() !== userId.toString()) {
        const contenu = `Nouvelle demande de réservation pour le bien "${property.titre}" le ${when.toLocaleDateString()} (ID réservation: ${reservation._id}).`;
        await Message.create({
          expediteur: userId,
          destinataire: property.utilisateur._id,
          contenu
        });
      }
    } catch (msgErr) {
      logger.warn('Échec de création du message de réservation', { error: msgErr.message });
    }

    logger.info('Réservation créée', { reservationId: reservation._id, userId, propertyId });
    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès.',
      reservation
    });
  } catch (error) {
    logger.error('Erreur création réservation', { error: error.message, stack: error.stack, userId, propertyId });
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/reservations/my
// Auth: user
exports.getMyReservations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const reservations = await Reservation.find({ user: userId })
      .populate('property', 'titre ville adresse prix categorie images utilisateur')
      .sort({ createdAt: -1 });
    res.json({ success: true, reservations });
  } catch (error) {
    logger.error('Erreur getMyReservations', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/reservations/owner
// Auth: user (propriétaire) — liste les réservations reçues sur ses biens
exports.getOwnerReservations = asyncHandler(async (req, res) => {
  try {
    const ownerId = req.user.id;
    // Trouver les biens du propriétaire
    const properties = await Property.find({ utilisateur: ownerId }).select('_id');
    const propIds = properties.map(p => p._id);
    const reservations = await Reservation.find({ property: { $in: propIds } })
      .populate('property', 'titre ville adresse prix categorie images utilisateur')
      .populate('user', 'nom email')
      .sort({ createdAt: -1 });
    res.json({ success: true, reservations });
  } catch (error) {
    logger.error('Erreur getOwnerReservations', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PATCH /api/reservations/:id/cancel
// Auth: user ou propriétaire du bien ou admin
exports.cancelReservation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user; // { id, role }
    const r = await Reservation.findById(id).populate('property', 'utilisateur');
    if (!r) return res.status(404).json({ message: 'Réservation introuvable.' });

    const isOwner = r.property?.utilisateur?.toString() === user.id;
    const isRequester = r.user.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isRequester && !isAdmin) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    r.status = 'annulée';
    await r.save();

    res.json({ success: true, message: 'Réservation annulée.', reservation: r });
  } catch (error) {
    logger.error('Erreur annulation réservation', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PATCH /api/reservations/:id/confirm
// Auth: propriétaire du bien ou admin
exports.confirmReservation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const r = await Reservation.findById(id).populate('property', 'utilisateur titre');
    if (!r) return res.status(404).json({ message: 'Réservation introuvable.' });

    const isOwner = r.property?.utilisateur?.toString() === user.id;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Non autorisé.' });

    r.status = 'confirmée';
    await r.save();

    // Notifier l’utilisateur par message
    try {
      const contenu = `Votre réservation pour "${r.property.titre}" le ${new Date(r.date).toLocaleDateString()} a été confirmée.`;
      await Message.create({
        expediteur: user.id,
        destinataire: r.user,
        contenu
      });
    } catch (msgErr) {
      logger.warn('Échec message confirmation réservation', { error: msgErr.message });
    }

    res.json({ success: true, message: 'Réservation confirmée.', reservation: r });
  } catch (error) {
    logger.error('Erreur confirmation réservation', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/reservations/:id
exports.getReservationById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const r = await Reservation.findById(id)
      .populate('property', 'titre ville adresse prix categorie images utilisateur')
      .populate('user', 'nom email');
    if (!r) return res.status(404).json({ message: 'Réservation introuvable.' });
    // Autorisation de lecture: demandeur, propriétaire du bien, admin
    const isOwner = r.property?.utilisateur?.toString() === req.user.id;
    const isRequester = r.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isRequester && !isAdmin) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }
    res.json({ success: true, reservation: r });
  } catch (error) {
    logger.error('Erreur getReservationById', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
