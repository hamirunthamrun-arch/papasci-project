const express = require("express");

const {
  getAllPedagogicCompetencies,
  getPedagogicCompetencyById,
  createPedagogicCompetency,
  updatePedagogicCompetency,
  deletePedagogicCompetency,
} = require("../controllers/pedagogicCompetencyController");

const router = express.Router();

// =========================================================
// PEDAGOGIC COMPETENCIES ROUTES
// =========================================================

// GET semua kompetensi pedagogik
router.get("/", getAllPedagogicCompetencies);

// GET kompetensi pedagogik berdasarkan ID
router.get("/:id", getPedagogicCompetencyById);

// CREATE kompetensi pedagogik
router.post("/", createPedagogicCompetency);

// UPDATE kompetensi pedagogik
router.put("/:id", updatePedagogicCompetency);

// DELETE kompetensi pedagogik
router.delete("/:id", deletePedagogicCompetency);

module.exports = router;
