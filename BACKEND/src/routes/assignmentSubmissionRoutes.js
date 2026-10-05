const express = require("express");

const router = express.Router();

const {
  getSubmissionsByAssignment,
  getAssignmentSubmissionById,
  getSubmissionByStudent,
  createAssignmentSubmission,
  updateAssignmentSubmission,
  deleteAssignmentSubmission,
} = require("../controllers/assignmentSubmissionController");

// =========================================================
// GET SEMUA SUBMISSION MILIK ASSIGNMENT
// =========================================================

router.get(
  "/assignment/:assignmentId",
  getSubmissionsByAssignment,
);

// =========================================================
// GET SUBMISSION MILIK MAHASISWA
// =========================================================

router.get(
  "/assignment/:assignmentId/student/:studentId",
  getSubmissionByStudent,
);

// =========================================================
// GET SATU SUBMISSION
// =========================================================

router.get(
  "/:id",
  getAssignmentSubmissionById,
);

// =========================================================
// CREATE SUBMISSION
// =========================================================

router.post(
  "/",
  createAssignmentSubmission,
);

// =========================================================
// UPDATE SUBMISSION
// =========================================================

router.put(
  "/:id",
  updateAssignmentSubmission,
);

// =========================================================
// DELETE SUBMISSION
// =========================================================

router.delete(
  "/:id",
  deleteAssignmentSubmission,
);

module.exports = router;