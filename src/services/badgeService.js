const { db } = require('../config/firebase');

const badgesCol = () => db.collection('badges');

async function listBadges() {
  const snap = await badgesCol().get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getBadge(badgeId) {
  const doc = await badgesCol().doc(badgeId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function createBadge(data) {
  const badgeId = data.badgeId || slugify(data.name);
  await badgesCol().doc(badgeId).set({
    name: data.name,
    description: data.description || '',
    iconUrl: data.iconUrl || '',
    category: data.category || 'achievement',
    xpBonus: Number(data.xpBonus) || 0,
    rarity: data.rarity || 'common',
  }, { merge: true });
  return badgeId;
}

async function deleteBadge(badgeId) {
  await badgesCol().doc(badgeId).delete();
}

module.exports = { listBadges, getBadge, createBadge, deleteBadge };
