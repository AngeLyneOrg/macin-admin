const { db } = require('../config/firebase');

const lessonsParent = (courseId, moduleId) =>
  db.collection('courses').doc(courseId).collection('modules').doc(moduleId);

function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Reconstruit le tableau de questions tel qu'attendu par QuestionModel
 * (lib/shared/models/exercise_model.dart côté Flutter).
 * req.body.questions est déjà un tableau d'objets grâce à express.urlencoded({extended:true}).
 */
function normalizeQuestions(rawQuestions) {
  if (!rawQuestions) return [];
  const arr = Array.isArray(rawQuestions) ? rawQuestions : Object.values(rawQuestions);
  return arr
    .filter((q) => q && q.questionText && q.questionText.trim())
    .map((q, i) => ({
      id: q.id && q.id.trim() ? q.id.trim() : `q${i + 1}`,
      questionText: q.questionText,
      type: q.type || 'mcq',
      options: typeof q.options === 'string'
        ? q.options.split('\n').map((o) => o.trim()).filter(Boolean)
        : (q.options || []),
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      points: Number(q.points) || 1,
    }));
}

async function listExercises(courseId, moduleId) {
  const snap = await lessonsParent(courseId, moduleId).collection('exercises').orderBy('order').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getExercise(courseId, moduleId, exerciseId) {
  const doc = await lessonsParent(courseId, moduleId).collection('exercises').doc(exerciseId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function createExercise(courseId, moduleId, data) {
  const exerciseId = data.exerciseId || slugify(data.title);
  await lessonsParent(courseId, moduleId).collection('exercises').doc(exerciseId).set({
    moduleId,
    courseId,
    type: data.type || 'quiz',
    title: data.title,
    description: data.description || '',
    questions: normalizeQuestions(data.questions),
    codeTemplate: data.codeTemplate || null,
    codeLanguage: data.codeLanguage || null,
    expectedOutput: data.expectedOutput || null,
    timeLimitMin: data.timeLimitMin ? Number(data.timeLimitMin) : null,
    passingScore: Number(data.passingScore) || 70,
    xpReward: Number(data.xpReward) || 25,
    badgeIdOnSuccess: data.badgeIdOnSuccess || null,
    unlocksCertificate: data.unlocksCertificate === 'on',
    order: Number(data.order) || 0,
  }, { merge: true });
  return exerciseId;
}

async function updateExercise(courseId, moduleId, exerciseId, data) {
  await lessonsParent(courseId, moduleId).collection('exercises').doc(exerciseId).set({
    type: data.type || 'quiz',
    title: data.title,
    description: data.description || '',
    questions: normalizeQuestions(data.questions),
    codeTemplate: data.codeTemplate || null,
    codeLanguage: data.codeLanguage || null,
    expectedOutput: data.expectedOutput || null,
    timeLimitMin: data.timeLimitMin ? Number(data.timeLimitMin) : null,
    passingScore: Number(data.passingScore) || 70,
    xpReward: Number(data.xpReward) || 25,
    badgeIdOnSuccess: data.badgeIdOnSuccess || null,
    unlocksCertificate: data.unlocksCertificate === 'on',
    order: Number(data.order) || 0,
  }, { merge: true });
}

async function deleteExercise(courseId, moduleId, exerciseId) {
  await lessonsParent(courseId, moduleId).collection('exercises').doc(exerciseId).delete();
}

module.exports = { listExercises, getExercise, createExercise, updateExercise, deleteExercise };
