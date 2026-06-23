function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  req.flash('error', 'Merci de te connecter pour accéder à cette page.');
  return res.redirect('/login');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/');
  }
  next();
}

module.exports = { requireAuth, redirectIfAuth };
