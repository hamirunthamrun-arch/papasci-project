const express = require("express");

const router = express.Router();

const supabase = require("../config/supabaseClient");

router.get("/protected", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header tidak ditemukan.",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak valid.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Access token valid.",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Protected endpoint error:", error);

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
});

module.exports = router;