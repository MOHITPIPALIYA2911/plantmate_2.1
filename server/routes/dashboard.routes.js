const router = require('express').Router();
const auth = require('../middleware/authRequired');
const { waterTasks, stats } = require('../controllers/dashboard.controller');

router.get('/water-tasks', auth, waterTasks);
router.get('/stats', auth, stats);

module.exports = router;
