const express = require("express");
const router = express.Router();

const {
  getAllSimulasi,
  getSimulasiById,
  createSimulasi,
  updateSimulasi,
  deleteSimulasi,
} = require("../controllers/simulasiController");

// GET semua simulasi
router.get("/", getAllSimulasi);

// GET simulasi berdasarkan ID
router.get("/:id", getSimulasiById);

// CREATE simulasi
router.post("/", createSimulasi);

// UPDATE simulasi
router.put("/:id", updateSimulasi);

// DELETE simulasi
router.delete("/:id", deleteSimulasi);

module.exports = router;
