const { db, admin } = require('../config/firebase');

const usersCol = () => db.collection('users');

async function listInstructors() {
  const snap = await usersCol().where('role', '==', 'instructor').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getInstructor(uid) {
  const doc = await usersCol().doc(uid).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Crée un formateur. Si l'UID Firebase Auth existe déjà (créé ailleurs),
 * passe-le dans data.uid. Sinon, on génère un ID de document Firestore.
 */
async function createInstructor(data) {
  const ref = data.uid ? usersCol().doc(data.uid) : usersCol().doc();
  await ref.set({
    displayName: data.displayName,
    email: data.email,
    photoUrl: data.photoUrl || null,
    role: 'instructor',
    level: 1,
    xp: 0,
    walletBalance: 0,
    referralCode: data.referralCode || ref.id.slice(0, 8).toUpperCase(),
    referredBy: null,
    badgeIds: [],
    enrolledCourseIds: [],
    learningProfile: { style: 'visual', pace: 'normal', lastActiveAt: admin.firestore.Timestamp.now() },
    bio: data.bio || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  return ref.id;
}

async function updateInstructor(uid, data) {
  await usersCol().doc(uid).set({
    displayName: data.displayName,
    email: data.email,
    bio: data.bio || '',
    ...(data.photoUrl ? { photoUrl: data.photoUrl } : {}),
  }, { merge: true });
}

async function deleteInstructor(uid) {
  await usersCol().doc(uid).delete();
}

module.exports = { listInstructors, getInstructor, createInstructor, updateInstructor, deleteInstructor };
