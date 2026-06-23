const courseService = require('../services/courseService');
const instructorService = require('../services/instructorService');
const badgeService = require('../services/badgeService');

async function index(req, res, next) {
  try {
    const [courses, instructors, badges] = await Promise.all([
      courseService.listCourses(),
      instructorService.listInstructors(),
      badgeService.listBadges(),
    ]);

    const publishedCount = courses.filter((c) => c.isPublished).length;
    const draftCount = courses.length - publishedCount;
    const totalLessons = courses.reduce((s, c) => s + (c.totalLessons || 0), 0);

    res.render('dashboard/index', {
      title: 'Tableau de bord',
      stats: {
        totalCourses: courses.length,
        publishedCount,
        draftCount,
        totalLessons,
        totalInstructors: instructors.length,
        totalBadges: badges.length,
      },
      recentCourses: courses.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { index };
