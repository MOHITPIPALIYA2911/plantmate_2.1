const router = require('express').Router();
const auth = require('../middleware/authRequired');
const ctrl = require('../controllers/plants.controller');

// Catalog endpoint - accessible without auth for public catalog
router.get('/', ctrl.listCatalog);
router.get('/catalog', ctrl.listCatalog);
router.get('/suggestions', auth, ctrl.suggestions);

module.exports = router;
