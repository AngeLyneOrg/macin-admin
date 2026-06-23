const multer = require('multer');

// Stockage en mémoire : le buffer est ensuite envoyé directement vers R2,
// rien n'est jamais écrit sur le disque du serveur.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1 Go max (vidéos)
});

module.exports = upload;
