const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorDashController');
const courseController = require('../controllers/courseController');
const exerciseController = require('../controllers/exerciseController');
const badgeController = require('../controllers/badgeController');
const upload = require('../middlewares/upload');
const { requireInstructor } = require('../middlewares/auth');

router.use(requireInstructor);

// Dashboard
router.get('/', instructorController.index);

// Profil
router.get('/profile', instructorController.showProfile);
router.post('/profile', instructorController.updateProfile);

// Messagerie
router.get('/messages', instructorController.messages);

// Visioconférences (à venir)
router.get('/visio', instructorController.visio);

// ── Formations ────────────────────────────────────────────
router.get('/courses',               courseController.list);
router.get('/courses/new',           courseController.showCreateForm);
router.post('/courses',              upload.single('thumbnail'), courseController.create);
router.get('/courses/:courseId',     courseController.detail);
router.get('/courses/:courseId/edit', courseController.showEditForm);
router.post('/courses/:courseId',    upload.single('thumbnail'), courseController.update);
router.post('/courses/:courseId/delete', courseController.remove);

// Modules
router.post('/courses/:courseId/modules', courseController.createModule);
router.post('/courses/:courseId/modules/:moduleId/delete', courseController.removeModule);

// Leçons
router.post('/courses/:courseId/modules/:moduleId/lessons', upload.single('content'), courseController.createLesson);
router.get('/courses/:courseId/modules/:moduleId/lessons/:lessonId/edit', courseController.showEditLessonForm);
router.post('/courses/:courseId/modules/:moduleId/lessons/:lessonId', upload.single('content'), courseController.updateLesson);
router.post('/courses/:courseId/modules/:moduleId/lessons/:lessonId/delete', courseController.removeLesson);

// Exercices
router.get('/courses/:courseId/modules/:moduleId/exercises/new', exerciseController.showCreateForm);
router.post('/courses/:courseId/modules/:moduleId/exercises', exerciseController.create);
router.get('/courses/:courseId/modules/:moduleId/exercises/:exerciseId/edit', exerciseController.showEditForm);
router.post('/courses/:courseId/modules/:moduleId/exercises/:exerciseId', exerciseController.update);
router.post('/courses/:courseId/modules/:moduleId/exercises/:exerciseId/delete', exerciseController.remove);

// Badges
router.get('/courses/:courseId/badges',     badgeController.list);
router.get('/courses/:courseId/badges/new', badgeController.showCreateForm);
router.post('/courses/:courseId/badges',    upload.single('image'), badgeController.create);
router.post('/courses/:courseId/badges/:badgeId/delete', badgeController.remove);

module.exports = router;
