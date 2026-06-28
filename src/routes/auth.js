const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuth } = require('../middlewares/auth');

// Landing page publique
router.get('/', (req, res) => {
  if (req.session.role === 'admin') return res.redirect('/admin');
  if (req.session.role === 'instructor') return res.redirect('/instructor');
  const apkUrl = process.env.APK_DOWNLOAD_URL || null;
  res.render('landing', { layout: false, apkUrl });
});

// Login
router.get('/login', redirectIfAuth, authController.showLogin);
router.post('/login', redirectIfAuth, authController.login);

// Signup formateur
router.get('/devenir-formateur', redirectIfAuth, authController.showSignup);
router.post('/devenir-formateur', authController.signup);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
