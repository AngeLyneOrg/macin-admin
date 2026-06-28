const courseService = require('../services/courseService');
const instructorService = require('../services/instructorService');
const badgeService = require('../services/badgeService');

// ── Mock data (remplacer par services DB) ─────────────────
function mockUsers() {
  return [
    { id:'u1', name:'Alain Mbarga',    email:'alain@mail.cm',   enrolledCount:3, status:'active',   createdAt:'2024-12-01' },
    { id:'u2', name:'Carine Essomba',  email:'carine@mail.cm',  enrolledCount:1, status:'active',   createdAt:'2025-01-15' },
    { id:'u3', name:'Boris Nkemdirim', email:'boris@mail.cm',   enrolledCount:5, status:'inactive', createdAt:'2025-02-20' },
    { id:'u4', name:'Diane Fotso',     email:'diane@mail.cm',   enrolledCount:2, status:'active',   createdAt:'2025-03-08' },
    { id:'u5', name:'Eric Talla',      email:'eric@mail.cm',    enrolledCount:0, status:'active',   createdAt:'2025-04-12' },
  ];
}
function mockPayments() {
  return [
    { ref:'10042', userName:'Alain Mbarga',   courseName:'Flutter Avancé',      amount:15000, method:'Orange Money', status:'paid',    date:'2025-06-20' },
    { ref:'10041', userName:'Carine Essomba', courseName:'Python pour débutants',amount:8000, method:'MTN MoMo',    status:'paid',    date:'2025-06-18' },
    { ref:'10040', userName:'Boris Nkemdirim',courseName:'Design UI/UX',         amount:12000, method:'Mobile Money',status:'pending', date:'2025-06-17' },
    { ref:'10039', userName:'Diane Fotso',    courseName:'JavaScript Moderne',   amount:10000, method:'Orange Money',status:'paid',    date:'2025-06-15' },
    { ref:'10038', userName:'Marc Tagne',     courseName:'React Native',         amount:18000, method:'MTN MoMo',   status:'failed',  date:'2025-06-14' },
  ];
}
function mockNotifications() {
  return [
    { id:'n1', type:'course',   icon:'fa-book-open',       color:'blue',   text:'Nouvelle formation soumise par Jean Fouda',        time:'Il y a 10 min',  read:false },
    { id:'n2', type:'user',     icon:'fa-user-plus',       color:'green',  text:'Nouveau formateur inscrit : Marie Ateba',           time:'Il y a 1h',      read:false },
    { id:'n3', type:'payment',  icon:'fa-credit-card',     color:'purple', text:'Paiement reçu — Boris Nkemdirim (12 000 XAF)',      time:'Il y a 3h',      read:true  },
    { id:'n4', type:'alert',    icon:'fa-triangle-exclamation', color:'orange', text:'Contenu signalé dans "Python débutants"',      time:'Hier',           read:true  },
  ];
}
function mockMessages() {
  return [
    { id:'m1', from:'Jean Fouda',   avatar:'J', subject:'Question sur la validation',          preview:'Bonjour, j\'ai soumis ma formation il y a 3 jours...', time:'10:24', unread:true  },
    { id:'m2', from:'Marie Ateba',  avatar:'M', subject:'Problème d\'upload de vidéo',          preview:'Je n\'arrive pas à uploader ma leçon en MP4...', time:'Hier',  unread:true  },
    { id:'m3', from:'Support MACIN',avatar:'S', subject:'Rapport mensuel disponible',           preview:'Le rapport de juin est disponible dans votre espace.', time:'Lun',   unread:false },
  ];
}
function mockPendingCourses() {
  return [
    { id:'c1', title:'Bases de l\'électronique',    instructor:'Jean Fouda',  submittedAt:'2025-06-25', modules:4, lessons:12 },
    { id:'c2', title:'Marketing Digital Niveau 2',  instructor:'Paul Nkomo',  submittedAt:'2025-06-24', modules:3, lessons:8  },
  ];
}

// ── Dashboard admin ───────────────────────────────────────
async function index(req, res, next) {
  try {
    const [courses, instructors, badges] = await Promise.all([
      courseService.listCourses(),
      instructorService.listInstructors(),
      badgeService.listBadges(),
    ]);
    const users    = mockUsers();
    const payments = mockPayments();
    const notifs   = mockNotifications();
    const pending  = mockPendingCourses();
    const paidRev  = payments.filter(p => p.status === 'paid').reduce((s,p) => s+p.amount, 0);

    res.render('admin/index', {
      title: 'Administration',
      stats: {
        totalUsers: users.length,
        newUsersThisMonth: 2,
        totalRevenue: paidRev,
        revenueGrowth: 12,
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.isPublished).length,
        pendingCourses: pending.length,
        completedCourses: 7,
        badgesDelivered: badges.length,
        activeInstructors: instructors.length,
        unreadNotifs: notifs.filter(n => !n.read).length,
        unreadMessages: mockMessages().filter(m => m.unread).length,
      },
      pendingCourses: pending,
      recentPayments: payments.slice(0, 5),
      recentUsers: users.slice(0, 4),
      recentNotifs: notifs.slice(0, 4),
    });
  } catch(err) { next(err); }
}

async function listUsers(req, res, next) {
  try {
    res.render('admin/users', { title:'Utilisateurs', users: mockUsers() });
  } catch(err) { next(err); }
}
async function toggleUser(req, res, next) {
  try {
    req.flash('success', 'Statut utilisateur mis à jour.');
    res.redirect('/admin/users');
  } catch(err) { next(err); }
}
async function listPayments(req, res, next) {
  try {
    const payments = mockPayments();
    const paid = payments.filter(p => p.status === 'paid');
    res.render('admin/payments', {
      title:'Paiements', payments,
      summary: { totalRevenue: paid.reduce((s,p)=>s+p.amount,0), paidCount: paid.length, pendingCount: payments.filter(p=>p.status==='pending').length },
    });
  } catch(err) { next(err); }
}
async function messages(req, res, next) {
  try {
    res.render('admin/messages', { title:'Messagerie', messages: mockMessages() });
  } catch(err) { next(err); }
}
async function notifications(req, res, next) {
  try {
    res.render('admin/notifications', { title:'Notifications', notifications: mockNotifications() });
  } catch(err) { next(err); }
}
async function markNotifRead(req, res) {
  req.flash('success','Notification marquée comme lue.');
  res.redirect('/admin/notifications');
}
async function pendingCourses(req, res, next) {
  try {
    res.render('admin/pending-courses', { title:'Formations en attente', courses: mockPendingCourses() });
  } catch(err) { next(err); }
}
async function approveCourse(req, res) {
  req.flash('success','Formation validée et publiée.');
  res.redirect('/admin/courses/pending');
}
async function rejectCourse(req, res) {
  req.flash('success','Formation rejetée. Le formateur sera notifié.');
  res.redirect('/admin/courses/pending');
}
async function listInstructors(req, res, next) {
  try {
    const instructors = await instructorService.listInstructors();
    res.render('admin/instructors', { title:'Formateurs', instructors });
  } catch(err) { next(err); }
}
async function approveInstructor(req, res) {
  req.flash('success','Formateur approuvé.');
  res.redirect('/admin/instructors');
}

module.exports = { index, listUsers, toggleUser, listPayments, messages, notifications, markNotifRead, pendingCourses, approveCourse, rejectCourse, listInstructors, approveInstructor };
