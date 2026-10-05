import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/assignment-submissions";

// =========================================================
// GET SEMUA SUBMISSION DARI SATU ASSIGNMENT
// =========================================================

export const getSubmissionsByAssignment = async (assignmentId) => {
  if (!assignmentId) {
    throw new Error("Assignment ID wajib diberikan.");
  }

  const response = await fetchWithAuth(`${API_URL}/assignment/${assignmentId}`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil pengumpulan tugas.");
  }

  return result.data;
};

// =========================================================
// GET SATU SUBMISSION
// =========================================================

export const getAssignmentSubmissionById = async (id) => {
  if (!id) {
    throw new Error("Submission ID wajib diberikan.");
  }

  const response = await fetchWithAuth(`${API_URL}/${id}`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil pengumpulan tugas.");
  }

  return result.data;
};

// =========================================================
// GET SUBMISSION MAHASISWA
// =========================================================

export const getSubmissionByStudent = async (assignmentId, studentId) => {
  if (!assignmentId) {
    throw new Error("Assignment ID wajib diberikan.");
  }

  if (!studentId) {
    throw new Error("Student ID wajib diberikan.");
  }

  const response = await fetchWithAuth(
    `${API_URL}/assignment/${assignmentId}/student/${studentId}`,
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil pengumpulan mahasiswa.");
  }

  return result.data;
};

// =========================================================
// CREATE SUBMISSION
// =========================================================

export const createAssignmentSubmission = async (submissionData) => {
  const response = await fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify(submissionData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengumpulkan tugas.");
  }

  return result.data;
};

// =========================================================
// UPDATE SUBMISSION
// =========================================================

export const updateAssignmentSubmission = async (id, submissionData) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(submissionData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal memperbarui pengumpulan tugas.");
  }

  return result.data;
};

// =========================================================
// DELETE SUBMISSION
// =========================================================

export const deleteAssignmentSubmission = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menghapus pengumpulan tugas.");
  }

  return result;
};
