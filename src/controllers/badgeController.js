const badgeService = require('../services/badgeService');
const r2Service = require('../services/r2Service');

async function list(req, res, next) {
  try {
    const badges = await badgeService.listBadges();
    res.render('badges/list', { title: 'Badges', badges });
  } catch (err) { next(err); }
}

function showCreateForm(req, res) {
  res.render('badges/form', { title: 'Nouveau badge' });
}

async function create(req, res, next) {
  try {
    let iconUrl = '';
    if (req.file) {
      const uploaded = await r2Service.uploadBuffer(req.file.buffer, 'badge-icons', req.file.originalname);
      iconUrl = uploaded.url;
    }
    await badgeService.createBadge({ ...req.body, iconUrl });
    req.flash('success', 'Badge créé.');
    res.redirect('/dashboard/badges');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await badgeService.deleteBadge(req.params.badgeId);
    req.flash('success', 'Badge supprimé.');
    res.redirect('/dashboard/badges');
  } catch (err) { next(err); }
}

module.exports = { list, showCreateForm, create, remove };
