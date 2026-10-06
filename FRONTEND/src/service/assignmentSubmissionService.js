import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/assignment-submissions";

// =========================================================
// HELPER: MENANGANI RESPONS API
// =========================================================

const handleResponse = async (response, defaultMessage) => {
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Server mengembalikan respons yang tidak valid.");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || defaultMessage);
  }

  return result;
};

// =========================================================
// GET SEMUA SUBMISSION DARI SATU ASSIGNMENT
// =========================================================

export const getSubmissionsByAssignment = async (assignmentId) => {
  if (!assignmentId) {
    throw new Error("Assignment ID wajib diberikan.");
  }

  const response = await fetchWithAuth(
    `${API_URL}/assignment/${encodeURIComponent(assignmentId)}`,
  );

  const result = await handleResponse(
    response,
    "Gagal mengambil pengumpulan tugas.",
  );

  return result.data;
};

// =========================================================
// GET SATU SUBMISSION BERDASARKAN ID
// =========================================================

export const getAssignmentSubmissionById = async (id) => {
  if (!id) {
    throw new Error("Submission ID wajib diberikan.");
  }

  const response = await fetchWithAuth(`${API_URL}/${encodeURIComponent(id)}`);

  const result = await handleResponse(
    response,
    "Gagal mengambil pengumpulan tugas.",
  );

  return result.data;
};

// =========================================================
// GET SUBMISSION MILIK SATU MAHASISWA
// =========================================================

export const getSubmissionByStudent = async (assignmentId, studentId) => {
  if (!assignmentId) {
    throw new Error("Assignment ID wajib diberikan.");
  }

  if (!studentId) {
    throw new Error("Student ID wajib diberikan.");
  }

  const response = await fetchWithAuth(
    `${API_URL}/assignment/${encodeURIComponent(assignmentId)}/student/${encodeURIComponent(studentId)}`,
  );

  const result = await handleResponse(
    response,
    "Gagal mengambil pengumpulan mahasiswa.",
  );

  return result.data;
};

// =========================================================
// CREATE SUBMISSION
// =========================================================

export const createAssignmentSubmission = async (submissionData) => {
  if (!submissionData) {
    throw new Error("Data pengumpulan tugas wajib diberikan.");
  }

  const { assignment_id, student_id, submission_url } = submissionData;

  if (!assignment_id) {
    throw new Error("Assignment ID wajib diberikan.");
  }

  if (!student_id) {
    throw new Error("Student ID wajib diberikan.");
  }

  if (typeof submission_url !== "string" || !submission_url.trim()) {
    throw new Error("Link tugas wajib diisi.");
  }

  const response = await fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify({
      assignment_id,
      student_id,
      submission_url: submission_url.trim(),
    }),
  });

  const result = await handleResponse(response, "Gagal mengumpulkan tugas.");

  return result.data;
};

// =========================================================
// UPDATE SUBMISSION
// =========================================================

export const updateAssignmentSubmission = async (id, submissionData) => {
  if (!id) {
    throw new Error("Submission ID wajib diberikan.");
  }

  if (!submissionData || Object.keys(submissionData).length === 0) {
    throw new Error("Data yang akan diperbarui wajib diberikan.");
  }

  const response = await fetchWithAuth(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(submissionData),
  });

  const result = await handleResponse(
    response,
    "Gagal memperbarui pengumpulan tugas.",
  );

  return result.data;
};

// =========================================================
// DELETE SUBMISSION
// =========================================================

export const deleteAssignmentSubmission = async (id) => {
  if (!id) {
    throw new Error("Submission ID wajib diberikan.");
  }

  const response = await fetchWithAuth(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  return await handleResponse(response, "Gagal menghapus pengumpulan tugas.");
};
