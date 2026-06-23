const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const upload = require('../middlewares/upload');

router.get('/', badgeController.list);
router.get('/new', badgeController.showCreateForm);
router.post('/', upload.single('icon'), badgeController.create);
router.post('/:badgeId/delete', badgeController.remove);

module.exports = router;
