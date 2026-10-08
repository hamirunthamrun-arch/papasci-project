const express = require("express");

const {
  getAllPedagogicScores,
  getPedagogicScoreById,
  createPedagogicScore,
  updatePedagogicScore,
  deletePedagogicScore,
} = require("../controllers/pedagogicScoreController");

const router = express.Router();

// GET semua data penilaian
router.get("/", getAllPedagogicScores);

// GET data penilaian berdasarkan ID
router.get("/:id", getPedagogicScoreById);

// POST pengumpulan video mahasiswa
router.post("/", createPedagogicScore);

// PUT update video / pemberian nilai
router.put("/:id", updatePedagogicScore);

// DELETE data penilaian
router.delete("/:id", deletePedagogicScore);

module.exports = router;
