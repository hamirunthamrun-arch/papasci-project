const express = require("express");
const router = express.Router();
const {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
} = require("../controllers/taskController");

router.get("/", getAllAssignments);
router.get("/:id", getAssignmentById);
router.post("/", createAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);
router.post("/submit", submitAssignment);

module.exports = router;
