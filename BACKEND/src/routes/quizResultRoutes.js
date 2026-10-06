const express = require("express");

const router = express.Router();

const {
  evaluateAttempt,
  submitQuizResult,
  getAllQuizResults,
} = require("../controllers/quizResultController");

// Mengambil seluruh hasil quiz untuk dosen
router.get("/all", getAllQuizResults);

// Menilai percobaan kuis sementara
router.post("/attempt", evaluateAttempt);

// Menyimpan hasil kuis resmi
router.post("/submit", submitQuizResult);

module.exports = router;
// const express = require("express");

// const router = express.Router();

// const {
//   getMyQuizStatus,
//   evaluateAttempt,
//   submitQuizResult,
//   getMyQuizResults,
//   getAllQuizResults,
// } = require("../controllers/quizResultController");

// // Memeriksa status dan jumlah percobaan kuis
// router.get("/my/:quizId", getMyQuizStatus);

// // Menilai jawaban sebagai hasil sementara
// router.post("/attempt", evaluateAttempt);

// // Menyimpan hasil resmi yang dipilih
// router.post("/submit", submitQuizResult);

// // Mengambil hasil resmi mahasiswa
// router.get("/my", getMyQuizResults);

// // Mengambil seluruh hasil resmi untuk dosen
// router.get("/all", getAllQuizResults);

// module.exports = router;
