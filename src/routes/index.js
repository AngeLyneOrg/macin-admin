const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middlewares/auth');

const coursesRouter = require('./courses');
const instructorsRouter = require('./instructors');
const badgesRouter = require('./badges');

router.use(requireAuth);

router.get('/', dashboardController.index);
router.use('/courses', coursesRouter);
router.use('/instructors', instructorsRouter);
router.use('/badges', badgesRouter);

module.exports = router;
