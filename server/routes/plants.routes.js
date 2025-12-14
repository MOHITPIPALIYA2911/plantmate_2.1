// server/routes/plants.routes.js
const router = require("express").Router();
const auth = require("../middleware/authRequired");
const ctrl = require("../controllers/plants.controller");

// Catalog (public)
router.get("/", ctrl.listCatalog);
router.get("/catalog", ctrl.listCatalog);

// Old rule-based suggestions (auth)
router.get("/suggestions", auth, ctrl.suggestions);

// ✅ NEW: AI suggestions (auth)
router.get("/ai-suggestions", auth, ctrl.aiSuggestions);

module.exports = router;
