import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/assignments";

// =========================================================
// GET SEMUA CARD TUGAS
// =========================================================

export const getAssignments = async () => {
  const response = await fetchWithAuth(API_URL);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil daftar tugas.");
  }

  return result.data;
};

// =========================================================
// GET CARD TUGAS BERDASARKAN ID
// =========================================================

export const getAssignmentById = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil detail tugas.");
  }

  return result.data;
};

// =========================================================
// CREATE CARD TUGAS
// =========================================================

export const createAssignment = async (assignmentData) => {
  const response = await fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify(assignmentData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menambahkan tugas.");
  }

  return result.data;
};

// =========================================================
// UPDATE CARD TUGAS
// =========================================================

export const updateAssignment = async (id, assignmentData) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(assignmentData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengubah tugas.");
  }

  return result.data;
};

// =========================================================
// DELETE CARD TUGAS
// =========================================================

export const deleteAssignment = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menghapus tugas.");
  }

  return result;
};
