const express = require("express");
const router = express.Router();

const {
  getAllQuizzes,
  getQuizById,
  getQuizByModule,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getModulesForQuiz,
} = require("../controllers/quizController");

// GET daftar modul untuk dropdown form kuis
router.get("/modules", getModulesForQuiz);

// GET kuis berdasarkan modul
router.get("/module/:moduleId", getQuizByModule);

// GET semua kuis
router.get("/", getAllQuizzes);

// CREATE kuis
router.post("/", createQuiz);

// UPDATE kuis
router.put("/:id", updateQuiz);

// DELETE kuis
router.delete("/:id", deleteQuiz);

// GET kuis berdasarkan ID
router.get("/:id", getQuizById);

module.exports = router;