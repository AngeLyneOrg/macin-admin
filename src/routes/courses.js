const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const exerciseController = require('../controllers/exerciseController');
const upload = require('../middlewares/upload');

router.get('/', courseController.list);
router.get('/new', courseController.showCreateForm);
router.post('/', upload.single('thumbnail'), courseController.create);

router.get('/:courseId', courseController.detail);
router.get('/:courseId/edit', courseController.showEditForm);
router.post('/:courseId', upload.single('thumbnail'), courseController.update);
router.post('/:courseId/delete', courseController.remove);

// Modules
router.post('/:courseId/modules', courseController.createModule);
router.post('/:courseId/modules/:moduleId/delete', courseController.removeModule);

// Leçons (upload vidéo/PDF directement ici)
router.post('/:courseId/modules/:moduleId/lessons', upload.single('content'), courseController.createLesson);
router.get('/:courseId/modules/:moduleId/lessons/:lessonId/edit', courseController.showEditLessonForm);
router.post('/:courseId/modules/:moduleId/lessons/:lessonId', upload.single('content'), courseController.updateLesson);
router.post('/:courseId/modules/:moduleId/lessons/:lessonId/delete', courseController.removeLesson);

// Exercices / Quiz / Examens / Tests de certification
router.get('/:courseId/modules/:moduleId/exercises/new', exerciseController.showCreateForm);
router.post('/:courseId/modules/:moduleId/exercises', exerciseController.create);
router.get('/:courseId/modules/:moduleId/exercises/:exerciseId/edit', exerciseController.showEditForm);
router.post('/:courseId/modules/:moduleId/exercises/:exerciseId', exerciseController.update);
router.post('/:courseId/modules/:moduleId/exercises/:exerciseId/delete', exerciseController.remove);

module.exports = router;
