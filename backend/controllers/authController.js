const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.validated.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await User.create({ name, email, password: hashedPassword });
    } catch (err) {
      // Two sign-ups with the same email at the same moment
      if (err.code === 11000) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      throw err;
    }

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.validated.body;
    const { jwtSecret, jwtExpiresIn } = req.app.locals.config;

    const user = await User.findOne({ email });
    // Same message for "no such user" and "wrong password"
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: jwtExpiresIn });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verify = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists", code: "USER_NOT_FOUND" });
    }
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
