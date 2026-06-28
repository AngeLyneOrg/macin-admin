const courseService = require('../services/courseService');
const instructorService = require('../services/instructorService');
const r2Service = require('../services/r2Service');

async function list(req, res, next) {
  try {
    const courses = await courseService.listCourses();
    res.render('courses/list', { title: 'Formations', courses });
  } catch (err) { next(err); }
}

async function showCreateForm(req, res, next) {
  try {
    const instructors = await instructorService.listInstructors();
    res.render('courses/form', { title: 'Nouvelle formation', course: null, instructors });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    let thumbnailUrl = '';
    if (req.file) {
      const uploaded = await r2Service.uploadBuffer(req.file.buffer, 'course-thumbnails', req.file.originalname);
      thumbnailUrl = uploaded.url;
    }
    const courseId = await courseService.createCourse({ ...req.body, thumbnailUrl });
    req.flash('success', 'Formation créée avec succès.');
    res.redirect(`/instructor/courses/${courseId}`);
  } catch (err) { next(err); }
}

async function detail(req, res, next) {
  try {
    const course = await courseService.getCourse(req.params.courseId);
    if (!course) {
      req.flash('error', 'Formation introuvable.');
      return res.redirect('/instructor/courses');
    }
    const modules = await courseService.listModules(course.id);
    const exerciseService = require('../services/exerciseService');
    const modulesWithLessons = await Promise.all(
      modules.map(async (m) => ({
        ...m,
        lessons: await courseService.listLessons(course.id, m.id),
        exercises: await exerciseService.listExercises(course.id, m.id),
      }))
    );
    const instructor = course.instructorId ? await instructorService.getInstructor(course.instructorId) : null;

    res.render('courses/detail', {
      title: course.title,
      course,
      modules: modulesWithLessons,
      instructor,
    });
  } catch (err) { next(err); }
}

async function showEditForm(req, res, next) {
  try {
    const course = await courseService.getCourse(req.params.courseId);
    if (!course) {
      req.flash('error', 'Formation introuvable.');
      return res.redirect('/instructor/courses');
    }
    const instructors = await instructorService.listInstructors();
    res.render('courses/form', { title: `Modifier — ${course.title}`, course, instructors });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const data = { ...req.body };
    if (req.file) {
      const uploaded = await r2Service.uploadBuffer(req.file.buffer, 'course-thumbnails', req.file.originalname);
      data.thumbnailUrl = uploaded.url;
    }
    await courseService.updateCourse(req.params.courseId, data);
    req.flash('success', 'Formation mise à jour.');
    res.redirect(`/instructor/courses/${req.params.courseId}`);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await courseService.deleteCourse(req.params.courseId);
    req.flash('success', 'Formation supprimée.');
    res.redirect('/instructor/courses');
  } catch (err) { next(err); }
}

// ── Modules ────────────────────────────────────────────────

async function createModule(req, res, next) {
  try {
    await courseService.createModule(req.params.courseId, req.body);
    req.flash('success', 'Module ajouté.');
    res.redirect(`/instructor/courses/${req.params.courseId}`);
  } catch (err) { next(err); }
}

async function removeModule(req, res, next) {
  try {
    await courseService.deleteModule(req.params.courseId, req.params.moduleId);
    req.flash('success', 'Module supprimé.');
    res.redirect(`/instructor/courses/${req.params.courseId}`);
  } catch (err) { next(err); }
}

// ── Leçons ─────────────────────────────────────────────────

async function createLesson(req, res, next) {
  try {
    const { courseId, moduleId } = req.params;
    const data = { ...req.body };

    if (req.file) {
      const folder = data.type === 'pdf' || data.type === 'article' ? 'lesson-docs' : 'lesson-videos';
      const uploaded = await r2Service.uploadBuffer(req.file.buffer, folder, req.file.originalname);
      data.contentUrl = uploaded.url;
    }

    await courseService.createLesson(courseId, moduleId, data);
    req.flash('success', 'Leçon ajoutée.');
    res.redirect(`/instructor/courses/${courseId}`);
  } catch (err) { next(err); }
}

async function showEditLessonForm(req, res, next) {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const lesson = await courseService.getLesson(courseId, moduleId, lessonId);
    if (!lesson) {
      req.flash('error', 'Leçon introuvable.');
      return res.redirect(`/instructor/courses/${courseId}`);
    }
    res.render('courses/lesson-form', {
      title: `Modifier — ${lesson.title}`,
      courseId, moduleId, lesson,
      blocksJsonPretty: JSON.stringify(lesson.blocks || [], null, 2),
    });
  } catch (err) { next(err); }
}

async function updateLesson(req, res, next) {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const data = { ...req.body };

    if (req.file) {
      const folder = data.type === 'pdf' || data.type === 'article' ? 'lesson-docs' : 'lesson-videos';
      const uploaded = await r2Service.uploadBuffer(req.file.buffer, folder, req.file.originalname);
      data.contentUrl = uploaded.url;
    }

    await courseService.updateLesson(courseId, moduleId, lessonId, data);
    req.flash('success', 'Leçon mise à jour.');
    res.redirect(`/instructor/courses/${courseId}`);
  } catch (err) { next(err); }
}

async function removeLesson(req, res, next) {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    await courseService.deleteLesson(courseId, moduleId, lessonId);
    req.flash('success', 'Leçon supprimée.');
    res.redirect(`/instructor/courses/${courseId}`);
  } catch (err) { next(err); }
}

module.exports = {
  list, showCreateForm, create, detail, showEditForm, update, remove,
  createModule, removeModule, createLesson, showEditLessonForm, updateLesson, removeLesson,
};
