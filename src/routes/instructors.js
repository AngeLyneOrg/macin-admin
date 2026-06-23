const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const upload = require('../middlewares/upload');

router.get('/', instructorController.list);
router.get('/new', instructorController.showCreateForm);
router.post('/', upload.single('photo'), instructorController.create);

router.get('/:uid/edit', instructorController.showEditForm);
router.post('/:uid', upload.single('photo'), instructorController.update);
router.post('/:uid/delete', instructorController.remove);

module.exports = router;
