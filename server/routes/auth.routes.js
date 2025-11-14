const router = require('express').Router();
const { register, login } = require('../controllers/auth.controller');

router.get('/ping', (_req,res)=>res.json({ ok:true, where:'auth' })); // you already saw this
router.post('/register', register);
router.post('/login', login);

module.exports = router;
