const router = require('express').Router();
const auth = require('../middleware/authRequired');
const ctrl = require('../controllers/calendar.controller');

router.get('/', auth, ctrl.list);
router.post('/', auth, ctrl.create);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
