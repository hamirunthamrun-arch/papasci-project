import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/pedagogic-scores";

// ======================================================
// GET DATA PENILAIAN
//
// STUDENT:
// hanya mendapatkan data miliknya.
//
// DOSEN:
// mendapatkan semua data mahasiswa.
//
// ADMIN:
// ditolak oleh backend.
// ======================================================
export const getPedagogicScores = async () => {
  const response = await fetchWithAuth(API_URL);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Gagal mengambil data penilaian kompetensi pedagogik.",
    );
  }

  return result.data;
};

// ======================================================
// GET DATA BERDASARKAN ID
// ======================================================
export const getPedagogicScoreById = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil data penilaian.");
  }

  return result.data;
};

// ======================================================
// MAHASISWA MENGIRIM / MEMPERBARUI VIDEO
//
// POST
//
// Backend menentukan student_id
// berdasarkan access token.
// ======================================================
export const createPedagogicScore = async (scoreData) => {
  const response = await fetchWithAuth(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(scoreData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Gagal mengirim video kompetensi pedagogik.",
    );
  }

  return result.data;
};

// ======================================================
// UPDATE
//
// STUDENT:
// update link video.
//
// DOSEN:
// update nilai.
// ======================================================
export const updatePedagogicScore = async (id, scoreData) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(scoreData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal memperbarui data penilaian.");
  }

  return result.data;
};

// ======================================================
// DELETE
//
// Saat ini tidak digunakan.
// Backend memang menolak DELETE.
// ======================================================
export const deletePedagogicScore = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menghapus data penilaian.");
  }

  return result;
};
