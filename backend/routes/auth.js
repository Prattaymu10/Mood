const express = require("express");
const router = express.Router();
const { signup, login, verify } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { loginLimiter, signupLimiter } = require("../middleware/rateLimiters");
const schemas = require("../validators/schemas");

router.post("/signup", signupLimiter, validate({ body: schemas.signup }), signup);
router.post("/login", loginLimiter, validate({ body: schemas.login }), login);

// GET /api/auth/verify  (checks the Bearer token is valid)
router.get("/verify", verifyToken, verify);

module.exports = router;
