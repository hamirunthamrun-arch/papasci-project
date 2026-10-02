const express = require("express");
const router = express.Router();

const {
  getMaterialsByModule,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/moduleMaterialController");

// GET semua materi dalam satu modul
router.get("/module/:module_id", getMaterialsByModule);

// GET materi berdasarkan ID
router.get("/:id", getMaterialById);

// POST tambah materi
router.post("/", createMaterial);

// PUT ubah materi
router.put("/:id", updateMaterial);

// DELETE hapus materi
router.delete("/:id", deleteMaterial);

module.exports = router;
