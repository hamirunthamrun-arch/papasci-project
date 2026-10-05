const express = require("express");

const router = express.Router();

const {
  getAllPretests,
  getPretestById,
  createPretest,
  updatePretest,
  deletePretest,
  getPublishedPretestByModule,
  submitPretest,
} = require("../controllers/pretestController");

// GET semua pretest
router.get("/", getAllPretests);

// GET pretest yang dipublikasikan berdasarkan moduleId
router.get("/modules/:moduleId", getPublishedPretestByModule);

// GET pretest berdasarkan ID
router.get("/:id", getPretestById);

// CREATE pretest
router.post("/", createPretest);

// UPDATE pretest
router.put("/:id", updatePretest);

// DELETE pretest
router.delete("/:id", deletePretest);

// SUBMIT pretest
router.post("/:id/submit", submitPretest);

module.exports = router;
