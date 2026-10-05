const express = require("express");
const router = express.Router();

const {
  getMyPretestResults,
  getAllPretestResults,
  evaluatePretest,
  submitPretestResult,
} = require("../controllers/pretestResultController");

// Mengambil hasil pretest
router.get("/my", getMyPretestResults);
router.get("/all", getAllPretestResults);

// Mengevaluasi jawaban tanpa menyimpan hasil resmi
router.post("/evaluate", evaluatePretest);

// Menyimpan hasil resmi pretest
router.post("/submit", submitPretestResult);

module.exports = router;