const express = require("express");

const router = express.Router();

const {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

// =========================================================
// ASSIGNMENTS
// =========================================================

// GET semua card tugas
router.get("/", getAllAssignments);

// GET satu card tugas
router.get("/:id", getAssignmentById);

// CREATE card tugas
router.post("/", createAssignment);

// UPDATE card tugas
router.put("/:id", updateAssignment);

// DELETE card tugas
router.delete("/:id", deleteAssignment);

module.exports = router;
