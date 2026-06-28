// ── Rôles disponibles ─────────────────────────────────────
// req.session.role = 'admin' | 'instructor'
// req.session.userEmail
// req.session.userName  (formateur seulement)

function requireAuth(req, res, next) {
  if (req.session && req.session.role) return next();
  req.flash('error', 'Connecte-toi pour accéder à cette page.');
  return res.redirect('/login');
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.role === 'admin') return next();
  req.flash('error', 'Accès réservé aux administrateurs.');
  return res.redirect('/login');
}

function requireInstructor(req, res, next) {
  if (req.session && req.session.role === 'instructor') return next();
  req.flash('error', 'Accès réservé aux formateurs.');
  return res.redirect('/login');
}

function redirectIfAuth(req, res, next) {
  if (!req.session || !req.session.role) return next();
  if (req.session.role === 'admin') return res.redirect('/admin');
  return res.redirect('/instructor');
}

module.exports = { requireAuth, requireAdmin, requireInstructor, redirectIfAuth };
