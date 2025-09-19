const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/reservationController');

// Créer une réservation
router.post('/', protect, ctrl.createReservation);

// Mes réservations (côté client)
router.get('/my', protect, ctrl.getMyReservations);

// Réservations reçues (propriétaire)
router.get('/owner', protect, ctrl.getOwnerReservations);

// Mettre à jour le statut
router.patch('/:id/cancel', protect, ctrl.cancelReservation);
router.patch('/:id/confirm', protect, ctrl.confirmReservation);

// Détail
router.get('/:id', protect, ctrl.getReservationById);

module.exports = router;
