const courseService = require('../services/courseService');
const instructorService = require('../services/instructorService');
const badgeService = require('../services/badgeService');

// ── Données fictives (à remplacer par vrai service DB) ────────────────────────
function getMockUsers() {
  return [
    { id: 'u1', name: 'Alain Mbarga', email: 'alain@mail.cm', enrolledCount: 3, status: 'active', createdAt: '2024-12-01' },
    { id: 'u2', name: 'Carine Essomba', email: 'carine@mail.cm', enrolledCount: 1, status: 'active', createdAt: '2025-01-15' },
    { id: 'u3', name: 'Boris Nkemdirim', email: 'boris@mail.cm', enrolledCount: 5, status: 'inactive', createdAt: '2025-02-20' },
    { id: 'u4', name: 'Diane Fotso', email: 'diane@mail.cm', enrolledCount: 2, status: 'active', createdAt: '2025-03-08' },
  ];
}

function getMockPayments() {
  return [
    { ref: '10042', userName: 'Alain Mbarga', courseName: 'Flutter Avancé', amount: 15000, method: 'Orange Money', status: 'paid', date: '2025-06-20' },
    { ref: '10041', userName: 'Carine Essomba', courseName: 'Python pour débutants', amount: 8000, method: 'MTN MoMo', status: 'paid', date: '2025-06-18' },
    { ref: '10040', userName: 'Boris Nkemdirim', courseName: 'Design UI/UX', amount: 12000, method: 'Mobile Money', status: 'pending', date: '2025-06-17' },
    { ref: '10039', userName: 'Diane Fotso', courseName: 'JavaScript Moderne', amount: 10000, method: 'Orange Money', status: 'paid', date: '2025-06-15' },
    { ref: '10038', userName: 'Marc Tagne', courseName: 'React Native', amount: 18000, method: 'MTN MoMo', status: 'failed', date: '2025-06-14' },
  ];
}

function getMockPendingContent(courses) {
  // On simule des contenus à valider — à terme, filtre sur isPublished=false par un formateur
  return [];
}

// ── Controllers ───────────────────────────────────────────────────────────────

async function index(req, res, next) {
  try {
    const [courses, instructors, badges] = await Promise.all([
      courseService.listCourses(),
      instructorService.listInstructors(),
      badgeService.listBadges(),
    ]);

    const users = getMockUsers();
    const payments = getMockPayments();
    const pendingContent = getMockPendingContent(courses);

    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const revenueGrowth = 12; // % simulé

    res.render('admin/index', {
      title: 'Administration',
      stats: {
        totalUsers: users.length,
        newUsersThisMonth: 2,
        totalRevenue,
        revenueGrowth,
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.isPublished).length,
        pendingContent: pendingContent.length,
        completedCourses: 7,
        badgesDelivered: badges.length,
        activeInstructors: instructors.length,
      },
      pendingContent,
      recentPayments: payments.slice(0, 5),
      recentUsers: users.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = getMockUsers();
    res.render('admin/users', { title: 'Utilisateurs', users });
  } catch (err) {
    next(err);
  }
}

async function toggleUser(req, res, next) {
  try {
    // TODO: appeler userService.toggleStatus(req.params.userId)
    req.flash('success', 'Statut de l\'utilisateur mis à jour.');
    res.redirect('/admin/users');
  } catch (err) {
    next(err);
  }
}

async function listPayments(req, res, next) {
  try {
    const payments = getMockPayments();
    const paidPayments = payments.filter(p => p.status === 'paid');
    const summary = {
      totalRevenue: paidPayments.reduce((s, p) => s + p.amount, 0),
      paidCount: paidPayments.length,
      pendingCount: payments.filter(p => p.status === 'pending').length,
    };
    res.render('admin/payments', { title: 'Paiements', payments, summary });
  } catch (err) {
    next(err);
  }
}

async function approveContent(req, res, next) {
  try {
    // TODO: appeler contentService.approve(req.params.contentId)
    req.flash('success', 'Contenu validé et publié.');
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
}

async function rejectContent(req, res, next) {
  try {
    // TODO: appeler contentService.reject(req.params.contentId)
    req.flash('success', 'Contenu rejeté.');
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, listUsers, toggleUser, listPayments, approveContent, rejectContent };
