const express = require("express");

const router = express.Router();

const {
  getAllVideoPembelajaran,
  getVideoPembelajaranById,
  createVideoPembelajaran,
  updateVideoPembelajaran,
  deleteVideoPembelajaran,
} = require("../controllers/videoPembelajaranController");

// GET semua video
router.get("/", getAllVideoPembelajaran);

// GET video berdasarkan ID
router.get("/:id", getVideoPembelajaranById);

// CREATE video
router.post("/", createVideoPembelajaran);

// UPDATE video
router.put("/:id", updateVideoPembelajaran);

// DELETE video
router.delete("/:id", deleteVideoPembelajaran);

module.exports = router;
