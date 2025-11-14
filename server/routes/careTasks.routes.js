const router = require('express').Router();
const auth = require('../middleware/authRequired');
const ctrl = require('../controllers/careTasks.controller');

router.get('/', auth, ctrl.list);
router.post('/', auth, ctrl.create);
router.delete('/:id', auth, ctrl.remove);

router.post('/done', auth, ctrl.done);
router.post('/:id/done', auth, ctrl.done);
router.post('/:id/snooze', auth, ctrl.snooze);
router.post('/:id/reschedule', auth, ctrl.reschedule);
router.post('/:id/bring-today', auth, ctrl.bringToday);

// helper for dashboard (kept here too)
router.get('/_today-water', auth, ctrl.todayWater);

module.exports = router;
