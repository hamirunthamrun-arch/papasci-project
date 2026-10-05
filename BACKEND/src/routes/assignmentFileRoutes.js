const express = require("express");

const router = express.Router();

const {
  getFilesByAssignment,
  getAssignmentFileById,
  createAssignmentFile,
  updateAssignmentFile,
  deleteAssignmentFile,
} = require("../controllers/assignmentFileController");

// =========================================================
// GET SEMUA FILE MILIK ASSIGNMENT
// =========================================================

router.get("/assignment/:assignmentId", getFilesByAssignment);

// =========================================================
// GET SATU FILE
// =========================================================

router.get("/:id", getAssignmentFileById);

// =========================================================
// CREATE FILE
// =========================================================

router.post("/", createAssignmentFile);

// =========================================================
// UPDATE FILE
// =========================================================

router.put("/:id", updateAssignmentFile);

// =========================================================
// DELETE FILE
// =========================================================

router.delete("/:id", deleteAssignmentFile);

module.exports = router;
