const express = require("express");
const router = express.Router();
const c = require("../controllers/moodController");
const verifyToken = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

router.use(verifyToken);

// Fixed paths must come before "/:id"
router.get("/dashboard", c.getDashboard);       // recent 10 + 30-day history
router.get("/daily-count", c.getDailyCount);
router.get("/insights", c.getInsights);

router.post("/", validate({ body: schemas.moodCreate }), c.addMood);
router.get("/", validate({ query: schemas.listQuery }), c.listMoods); // paginated history

router.put("/:id", validate({ params: schemas.idParam, body: schemas.moodUpdate }), c.updateMood);
router.delete("/:id", validate({ params: schemas.idParam }), c.deleteMood);

module.exports = router;
