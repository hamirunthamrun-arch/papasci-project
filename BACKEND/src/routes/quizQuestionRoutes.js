const express = require("express");
const router = express.Router();

const {
  getQuestionsByQuiz,
  getStudentQuestionsByQuiz,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/quizQuestionController");

// GET: Mengambil soal untuk mahasiswa tanpa kunci jawaban
router.get("/student/:quizId", getStudentQuestionsByQuiz);

// GET: Mengambil semua soal berdasarkan ID kuis
router.get("/quiz/:quizId", getQuestionsByQuiz);

// GET: Mengambil detail satu soal
router.get("/:id", getQuestionById);

// POST: Menambahkan soal
router.post("/", createQuestion);

// PUT: Memperbarui soal
router.put("/:id", updateQuestion);

// DELETE: Menghapus soal
router.delete("/:id", deleteQuestion);

module.exports = router;
