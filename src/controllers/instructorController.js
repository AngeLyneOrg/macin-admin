const instructorService = require('../services/instructorService');
const r2Service = require('../services/r2Service');

async function list(req, res, next) {
  try {
    const instructors = await instructorService.listInstructors();
    res.render('instructors/list', { title: 'Formateurs', instructors });
  } catch (err) { next(err); }
}

function showCreateForm(req, res) {
  res.render('instructors/form', { title: 'Nouveau formateur', instructor: null });
}

async function create(req, res, next) {
  try {
    let photoUrl = '';
    if (req.file) {
      const uploaded = await r2Service.uploadBuffer(req.file.buffer, 'instructor-photos', req.file.originalname);
      photoUrl = uploaded.url;
    }
    await instructorService.createInstructor({ ...req.body, photoUrl });
    req.flash('success', 'Formateur ajouté.');
    res.redirect('/dashboard/instructors');
  } catch (err) { next(err); }
}

async function showEditForm(req, res, next) {
  try {
    const instructor = await instructorService.getInstructor(req.params.uid);
    if (!instructor) {
      req.flash('error', 'Formateur introuvable.');
      return res.redirect('/dashboard/instructors');
    }
    res.render('instructors/form', { title: `Modifier — ${instructor.displayName}`, instructor });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const data = { ...req.body };
    if (req.file) {
      const uploaded = await r2Service.uploadBuffer(req.file.buffer, 'instructor-photos', req.file.originalname);
      data.photoUrl = uploaded.url;
    }
    await instructorService.updateInstructor(req.params.uid, data);
    req.flash('success', 'Formateur mis à jour.');
    res.redirect('/dashboard/instructors');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await instructorService.deleteInstructor(req.params.uid);
    req.flash('success', 'Formateur supprimé.');
    res.redirect('/dashboard/instructors');
  } catch (err) { next(err); }
}

module.exports = { list, showCreateForm, create, showEditForm, update, remove };
