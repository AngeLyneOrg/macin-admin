const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

// Dashboard admin
router.get('/', adminController.index);

// Utilisateurs
router.get('/users', adminController.listUsers);
router.post('/users/:userId/toggle', adminController.toggleUser);

// Paiements
router.get('/payments', adminController.listPayments);

// Validation de contenu
router.post('/content/:contentId/approve', adminController.approveContent);
router.post('/content/:contentId/reject', adminController.rejectContent);

module.exports = router;
