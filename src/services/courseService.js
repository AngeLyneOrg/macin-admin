const { db, admin } = require('../config/firebase');

const coursesCol = () => db.collection('courses');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function listCourses() {
  const snap = await coursesCol().orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getCourse(courseId) {
  const doc = await coursesCol().doc(courseId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function createCourse(data) {
  const courseId = data.courseId || slugify(data.title);
  await coursesCol().doc(courseId).set({
    title: data.title,
    description: data.description || '',
    instructorId: data.instructorId || '',
    thumbnailUrl: data.thumbnailUrl || '',
    price: Number(data.price) || 0,
    level: data.level || 'beginner',
    tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    totalLessons: 0,
    totalDurationMin: 0,
    certificateTemplate: data.certificateTemplate || null,
    isPublished: data.isPublished === 'on' || data.isPublished === true,
    averageRating: 0,
    totalEnrollments: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return courseId;
}

async function updateCourse(courseId, data) {
  const update = {
    title: data.title,
    description: data.description || '',
    instructorId: data.instructorId || '',
    price: Number(data.price) || 0,
    level: data.level || 'beginner',
    tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    isPublished: data.isPublished === 'on' || data.isPublished === true,
  };
  if (data.thumbnailUrl) update.thumbnailUrl = data.thumbnailUrl;
  await coursesCol().doc(courseId).set(update, { merge: true });
}

async function deleteCourse(courseId) {
  await coursesCol().doc(courseId).delete();
}

// ── Modules ────────────────────────────────────────────────

async function listModules(courseId) {
  const snap = await coursesCol().doc(courseId).collection('modules').orderBy('order').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function createModule(courseId, data) {
  const moduleId = data.moduleId || slugify(data.title);
  await coursesCol().doc(courseId).collection('modules').doc(moduleId).set({
    courseId,
    title: data.title,
    order: Number(data.order) || 0,
    totalLessons: 0,
    totalDurationMin: 0,
  }, { merge: true });
  return moduleId;
}

async function deleteModule(courseId, moduleId) {
  await coursesCol().doc(courseId).collection('modules').doc(moduleId).delete();
}

// ── Leçons ─────────────────────────────────────────────────

async function listLessons(courseId, moduleId) {
  const snap = await coursesCol().doc(courseId)
    .collection('modules').doc(moduleId)
    .collection('lessons').orderBy('order').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function parseBlocksJson(raw) {
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    throw new Error('Le champ "Contenu enrichi (JSON)" n\'est pas un JSON valide : ' + e.message);
  }
}

async function createLesson(courseId, moduleId, data) {
  const lessonId = data.lessonId || slugify(data.title);
  const payload = {
    moduleId,
    courseId,
    title: data.title,
    type: data.type || 'video',
    contentUrl: data.contentUrl || '',
    localPath: null,
    durationMin: Number(data.durationMin) || 0,
    isDownloadable: data.isDownloadable === 'on',
    isPreview: data.isPreview === 'on',
    order: Number(data.order) || 0,
    xpReward: Number(data.xpReward) || 10,
    articleContent: data.articleContent || '',
    blocks: parseBlocksJson(data.blocksJson),
  };
  await coursesCol().doc(courseId)
    .collection('modules').doc(moduleId)
    .collection('lessons').doc(lessonId).set(payload, { merge: true });

  await recalculateCourseTotals(courseId);
  return lessonId;
}

async function getLesson(courseId, moduleId, lessonId) {
  const doc = await coursesCol().doc(courseId)
    .collection('modules').doc(moduleId)
    .collection('lessons').doc(lessonId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function updateLesson(courseId, moduleId, lessonId, data) {
  const payload = {
    title: data.title,
    type: data.type || 'video',
    durationMin: Number(data.durationMin) || 0,
    isDownloadable: data.isDownloadable === 'on',
    isPreview: data.isPreview === 'on',
    order: Number(data.order) || 0,
    xpReward: Number(data.xpReward) || 10,
    articleContent: data.articleContent || '',
    blocks: parseBlocksJson(data.blocksJson),
  };
  if (data.contentUrl) payload.contentUrl = data.contentUrl;

  await coursesCol().doc(courseId)
    .collection('modules').doc(moduleId)
    .collection('lessons').doc(lessonId).set(payload, { merge: true });

  await recalculateCourseTotals(courseId);
}

async function deleteLesson(courseId, moduleId, lessonId) {
  await coursesCol().doc(courseId)
    .collection('modules').doc(moduleId)
    .collection('lessons').doc(lessonId).delete();
  await recalculateCourseTotals(courseId);
}

async function recalculateCourseTotals(courseId) {
  const modules = await listModules(courseId);
  let totalLessons = 0;
  let totalDurationMin = 0;

  for (const mod of modules) {
    const lessons = await listLessons(courseId, mod.id);
    const modDuration = lessons.reduce((s, l) => s + (l.durationMin || 0), 0);
    totalLessons += lessons.length;
    totalDurationMin += modDuration;

    await coursesCol().doc(courseId).collection('modules').doc(mod.id).set({
      totalLessons: lessons.length,
      totalDurationMin: modDuration,
    }, { merge: true });
  }

  await coursesCol().doc(courseId).set({ totalLessons, totalDurationMin }, { merge: true });
}

module.exports = {
  slugify,
  listCourses, getCourse, createCourse, updateCourse, deleteCourse,
  listModules, createModule, deleteModule,
  listLessons, createLesson, getLesson, updateLesson, deleteLesson,
};
