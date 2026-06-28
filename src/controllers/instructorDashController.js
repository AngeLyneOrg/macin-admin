const courseService = require('../services/courseService');
const badgeService  = require('../services/badgeService');

function mockMessages() {
  return [
    { id:'m1', from:'Admin MACIN',   avatar:'A', subject:'Votre formation a été approuvée !',    preview:'Félicitations, votre formation Flutter est maintenant en ligne.', time:'10:24', unread:true  },
    { id:'m2', from:'Alain Mbarga',  avatar:'A', subject:'Question sur le module 2',              preview:'Bonjour, je bloque sur l\'exercice 3 du module 2...', time:'Hier',  unread:true  },
    { id:'m3', from:'Carine Essomba',avatar:'C', subject:'Merci pour la formation !',             preview:'C\'est très clair, merci pour votre pédagogie.', time:'Lun',   unread:false },
  ];
}

async function index(req, res, next) {
  try {
    const courses = await courseService.listCourses();
    const badges  = await badgeService.listBadges();

    const totalStudents = 47; // TODO: compter depuis inscriptions Firestore
    const totalRevenue  = 185000;
    const avgRating     = 4.7;

    res.render('instructor/index', {
      title: 'Mon espace',
      stats: {
        totalCourses:    courses.length,
        publishedCourses: courses.filter(c => c.isPublished).length,
        draftCourses:    courses.filter(c => !c.isPublished).length,
        totalStudents,
        totalRevenue,
        avgRating,
        totalBadges: badges.length,
        unreadMessages: mockMessages().filter(m => m.unread).length,
      },
      recentCourses: courses.slice(0, 3),
      recentMessages: mockMessages().slice(0, 3),
    });
  } catch(err) { next(err); }
}

async function showProfile(req, res, next) {
  try {
    res.render('instructor/profile', {
      title: 'Mon profil',
      profile: {
        name:      req.session.userName || 'Formateur',
        email:     req.session.userEmail,
        bio:       '',
        specialty: '',
        phone:     '',
        linkedin:  '',
        website:   '',
      },
    });
  } catch(err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    // TODO: sauvegarder dans Firestore
    req.flash('success', 'Profil mis à jour.');
    res.redirect('/instructor/profile');
  } catch(err) { next(err); }
}

async function messages(req, res, next) {
  try {
    res.render('instructor/messages', { title:'Messagerie', messages: mockMessages() });
  } catch(err) { next(err); }
}

async function visio(req, res, next) {
  try {
    res.render('instructor/visio', { title:'Visioconférences' });
  } catch(err) { next(err); }
}

module.exports = { index, showProfile, updateProfile, messages, visio };
