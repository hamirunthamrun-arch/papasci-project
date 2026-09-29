const express = require("express");

const router = express.Router();

const {
  register,
  login,
  refreshToken,
  getCurrentUser,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", getCurrentUser);

module.exports = router;
