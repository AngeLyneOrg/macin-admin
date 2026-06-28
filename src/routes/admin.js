const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middlewares/auth');

router.use(requireAdmin);

router.get('/',                            adminController.index);
router.get('/users',                       adminController.listUsers);
router.post('/users/:id/toggle',           adminController.toggleUser);
router.get('/payments',                    adminController.listPayments);
router.get('/messages',                    adminController.messages);
router.get('/notifications',               adminController.notifications);
router.post('/notifications/:id/read',     adminController.markNotifRead);
router.get('/courses/pending',             adminController.pendingCourses);
router.post('/courses/:id/approve',        adminController.approveCourse);
router.post('/courses/:id/reject',         adminController.rejectCourse);
router.get('/instructors',                 adminController.listInstructors);
router.post('/instructors/:id/approve',    adminController.approveInstructor);

module.exports = router;
