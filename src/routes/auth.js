// ─── MODIFICATION À APPORTER dans src/routes/auth.js ───────────────────────
// Ajouter la route GET / (landing page) AVANT les routes login existantes
// Le fichier complet doit ressembler à ceci :

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuth } = require('../middlewares/auth');

// ── LANDING PAGE ──────────────────────────────────────────
// URL publique : https://votre-app.onrender.com/
router.get('/', (req, res) => {
    // Si l'admin est déjà connecté, redirige directement vers le dashboard
    if (req.session.isAdmin) return res.redirect('/dashboard');

    // Mets ici l'URL publique de ton APK Cloudflare R2 une fois uploadé.
    // Exemple: 'https://pub-XXXX.r2.dev/macin-app.apk'
    // Laisse null tant que l'APK n'est pas encore dispo.
    const apkUrl = process.env.APK_DOWNLOAD_URL || null;

    res.render('landing', { layout: false, apkUrl });
});

// ── AUTH ──────────────────────────────────────────────────
router.get('/login', redirectIfAuth, authController.showLogin);
router.post('/login', redirectIfAuth, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
