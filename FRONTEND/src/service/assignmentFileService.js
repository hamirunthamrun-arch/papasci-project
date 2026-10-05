import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/assignment-files";

// =========================================================
// GET SEMUA FILE DARI SATU ASSIGNMENT
// =========================================================

export const getFilesByAssignment = async (assignmentId) => {
  if (!assignmentId) {
    throw new Error("Assignment ID wajib diberikan.");
  }

  const response = await fetchWithAuth(`${API_URL}/assignment/${assignmentId}`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil file tugas.");
  }

  return result.data;
};

// =========================================================
// GET SATU FILE
// =========================================================

export const getAssignmentFileById = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil file tugas.");
  }

  return result.data;
};

// =========================================================
// CREATE FILE
// =========================================================

export const createAssignmentFile = async (fileData) => {
  const response = await fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify(fileData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menyimpan file tugas.");
  }

  return result.data;
};

// =========================================================
// UPDATE FILE
// =========================================================

export const updateAssignmentFile = async (id, fileData) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(fileData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengubah file tugas.");
  }

  return result.data;
};

// =========================================================
// DELETE FILE
// =========================================================

export const deleteAssignmentFile = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menghapus file tugas.");
  }

  return result;
};
