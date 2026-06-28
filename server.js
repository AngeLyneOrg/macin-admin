require('dotenv').config();

const express       = require('express');
const path          = require('path');
const session       = require('express-session');
const MemoryStore   = require('memorystore')(session);
const flash         = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

require('./src/config/firebase');

const authRoutes       = require('./src/routes/auth');
const adminRoutes      = require('./src/routes/admin');
const instructorRoutes = require('./src/routes/instructor');

const app = express();

// ── Vues ───────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// ── Middlewares ────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({ checkPeriod: 1000 * 60 * 60 * 8 }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 8,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}));
app.use(flash());

// ── Locals globales ────────────────────────────────────────
app.use((req, res, next) => {
  const role = req.session.role;
  res.locals.currentUser = role
    ? { email: req.session.userEmail, name: req.session.userName, role }
    : null;
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages   = req.flash('error');
  res.locals.currentPath     = req.path;
  next();
});

// ── Routes ─────────────────────────────────────────────────
app.use('/',           authRoutes);
app.use('/admin',      adminRoutes);
app.use('/instructor', instructorRoutes);

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page introuvable', layout: false });
});

// ── Erreurs ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('errors/500', { title: 'Erreur serveur', error: err, layout: false });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MACIN lancé sur http://localhost:${PORT}`));
