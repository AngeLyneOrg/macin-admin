const exerciseService = require('../services/exerciseService');
const courseService = require('../services/courseService');

async function showCreateForm(req, res, next) {
  try {
    const { courseId, moduleId } = req.params;
    const course = await courseService.getCourse(courseId);
    res.render('exercises/form', {
      title: 'Nouvel exercice',
      courseId, moduleId, courseTitle: course ? course.title : '',
      exercise: null,
    });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { courseId, moduleId } = req.params;
    await exerciseService.createExercise(courseId, moduleId, req.body);
    req.flash('success', 'Exercice créé.');
    res.redirect(`/instructor/courses/${courseId}`);
  } catch (err) { next(err); }
}

async function showEditForm(req, res, next) {
  try {
    const { courseId, moduleId, exerciseId } = req.params;
    const [course, exercise] = await Promise.all([
      courseService.getCourse(courseId),
      exerciseService.getExercise(courseId, moduleId, exerciseId),
    ]);
    if (!exercise) {
      req.flash('error', 'Exercice introuvable.');
      return res.redirect(`/instructor/courses/${courseId}`);
    }
    res.render('exercises/form', {
      title: `Modifier — ${exercise.title}`,
      courseId, moduleId, courseTitle: course ? course.title : '',
      exercise,
    });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { courseId, moduleId, exerciseId } = req.params;
    await exerciseService.updateExercise(courseId, moduleId, exerciseId, req.body);
    req.flash('success', 'Exercice mis à jour.');
    res.redirect(`/instructor/courses/${courseId}`);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { courseId, moduleId, exerciseId } = req.params;
    await exerciseService.deleteExercise(courseId, moduleId, exerciseId);
    req.flash('success', 'Exercice supprimé.');
    res.redirect(`/instructor/courses/${courseId}`);
  } catch (err) { next(err); }
}

module.exports = { showCreateForm, create, showEditForm, update, remove };
