import { fetchWithAuth } from "../service/authService";

const API_URL = "http://localhost:5000/api/quiz-questions";

/**
 * Fungsi utama untuk request ke backend.
 * Menggunakan JWT melalui fetchWithAuth.
 */
const request = async (url, options = {}) => {
  const headers = {
    ...(options.headers || {}),
  };

  // Tambahkan Content-Type hanya jika request memiliki body.
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetchWithAuth(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("Request error:", error);
    throw error;
  }

  // Baca respons dengan aman.
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || `Request gagal dengan status ${response.status}.`,
    );
  }

  if (result?.success === false) {
    throw new Error(result.message || "Gagal memproses data soal.");
  }

  return result;
};

/**
 * GET: Mengambil daftar soal berdasarkan ID kuis.
 */
export const getQuestionsByQuiz = async (quizId) => {
  if (!quizId) {
    throw new Error("ID kuis wajib diisi.");
  }

  const result = await request(`${API_URL}/quiz/${encodeURIComponent(quizId)}`);

  return result.data || [];
};

/**
 * GET: Mengambil detail soal berdasarkan ID.
 */
export const getQuestionById = async (id) => {
  if (!id) {
    throw new Error("ID soal wajib diisi.");
  }

  const result = await request(`${API_URL}/${encodeURIComponent(id)}`);

  return result.data;
};

/**
 * POST: Menambahkan soal baru.
 */
export const createQuestion = async (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Data soal tidak valid.");
  }

  const result = await request(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result.data;
};

/**
 * PUT: Memperbarui soal.
 */
export const updateQuestion = async (id, payload) => {
  if (!id) {
    throw new Error("ID soal wajib diisi.");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Data soal tidak valid.");
  }

  const result = await request(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return result.data;
};

/**
 * DELETE: Menghapus soal.
 */
export const deleteQuestion = async (id) => {
  if (!id) {
    throw new Error("ID soal wajib diisi.");
  }

  const result = await request(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  return result.data;
};

/**
 * GET: Mengambil soal untuk siswa tanpa jawaban benar.
 */
export const getStudentQuestions = async (quizId) => {
  if (!quizId) {
    throw new Error("ID kuis wajib diisi.");
  }

  const result = await request(
    `${API_URL}/student/${encodeURIComponent(quizId)}`,
  );

  return result.data || [];
};
