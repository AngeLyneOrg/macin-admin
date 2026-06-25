function showLogin(req, res) {
  res.render('auth/login', { title: 'Connexion' });
}

function login(req, res) {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.adminEmail = email;
    return res.redirect('/dashboard');
  }

  req.flash('error', 'Email ou mot de passe incorrect.');
  res.redirect('/login');
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/login'));
}

module.exports = { showLogin, login, logout };
