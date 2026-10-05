import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/quiz";

/**
 * Helper untuk menangani request API.
 */
const request = async (url, options = {}) => {
  const response = await fetchWithAuth(url, options);
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Gagal memproses data kuis.");
  }

  return result;
};

/**
 * Mengambil seluruh daftar kuis.
 */
export const getQuizzes = async () => {
  const result = await request(API_URL);
  return result.data;
};

/**
 * Mengambil kuis berdasarkan ID.
 */
export const getQuizById = async (id) => {
  if (!id) throw new Error("ID kuis wajib diisi.");

  const result = await request(`${API_URL}/${encodeURIComponent(id)}`);

  return result.data;
};

/**
 * Mengambil daftar modul untuk dropdown kuis.
 */
export const getModulesForQuiz = async () => {
  const result = await request(`${API_URL}/modules`);
  return result.data;
};

/**
 * Menambahkan kuis baru.
 */
export const createQuiz = async (quizData) => {
  const result = await request(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quizData),
  });

  return result.data;
};

/**
 * Mengubah data kuis.
 */
export const updateQuiz = async (id, quizData) => {
  if (!id) throw new Error("ID kuis wajib diisi.");

  const result = await request(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quizData),
  });

  return result.data;
};

/**
 * Menghapus kuis.
 */
export const deleteQuiz = async (id) => {
  if (!id) throw new Error("ID kuis wajib diisi.");

  return await request(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

/**
 * Mengambil kuis yang sudah diterbitkan berdasarkan ID modul.
 *
 * Membutuhkan endpoint backend:
 * GET /api/quiz/module/:moduleId
 */
export const getPublishedQuizByModule = async (moduleId) => {
  if (!moduleId) {
    throw new Error("ID modul wajib diisi.");
  }

  const result = await request(
    `${API_URL}/module/${encodeURIComponent(moduleId)}`,
  );

  if (!result?.data) {
    throw new Error("Kuis untuk modul ini belum tersedia.");
  }

  return result.data;
};
