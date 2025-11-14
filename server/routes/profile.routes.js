const router = require('express').Router();
const auth = require('../middleware/authRequired');
const { getMe, updateMe } = require('../controllers/profile.controller');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

module.exports = router;
