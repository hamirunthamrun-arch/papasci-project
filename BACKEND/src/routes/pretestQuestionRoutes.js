const express = require("express");
const router = express.Router();

const {
  getQuestionsByPretest,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getStudentQuestionsByPretest
} = require("../controllers/pretestQuestionController");

// GET semua soal berdasarkan ID pretest
router.get("/pretest/:pretestId", getQuestionsByPretest);

// GET soal untuk mahasiswa (tanpa kunci jawaban)
router.get("/pretest/:pretestId/student", getStudentQuestionsByPretest);

// GET detail satu soal
router.get("/:id", getQuestionById);

// POST menambahkan soal baru
router.post("/", createQuestion);

// PUT memperbarui soal
router.put("/:id", updateQuestion);

// DELETE menghapus soal
router.delete("/:id", deleteQuestion);

module.exports = router;
