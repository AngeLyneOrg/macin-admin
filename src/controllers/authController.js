// ── Auth Controller ───────────────────────────────────────
// Gère : page login, connexion admin/formateur, signup formateur, logout

function showLogin(req, res) {
  res.render('auth/login', { title: 'Connexion' });
}

function login(req, res) {
  const { email, password } = req.body;

  // ── Connexion Admin ──────────────────────────────────────
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.role = 'admin';
    req.session.userEmail = email;
    req.session.userName = 'Administrateur';
    return res.redirect('/admin');
  }

  // ── Connexion Formateur (env) ────────────────────────────
  if (
    email === process.env.INSTITUTOR_EMAIL &&
    password === process.env.INSTITUTOR_PASSWORD
  ) {
    req.session.role = 'instructor';
    req.session.userEmail = email;
    req.session.userName = 'Formateur';
    return res.redirect('/instructor');
  }

  // TODO: quand DB active → vérifier dans Firestore les comptes formateurs approuvés

  req.flash('error', 'Email ou mot de passe incorrect.');
  res.redirect('/login');
}

function showSignup(req, res) {
  res.render('auth/signup', { title: "Devenir formateur" });
}

function signup(req, res) {
  const { name, email, phone, specialty, motivation } = req.body;

  // TODO: enregistrer dans Firestore collection "instructor_requests" avec statut "pending"
  // puis envoyer un email de confirmation à l'admin

  req.flash('success', `Demande envoyée ! Nous reviendrons vers vous à l'adresse ${email} sous 48h.`);
  res.redirect('/login');
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/login'));
}

module.exports = { showLogin, login, showSignup, signup, logout };
