import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/quiz-results";

const request = async (url, options = {}) => {
  const response = await fetchWithAuth(url, options);
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Gagal memproses hasil kuis.");
  }

  return result;
};

// Menilai percobaan kuis sementara
export const evaluateQuizAttempt = async (quizId, answers) => {
  const result = await request(`${API_URL}/attempt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quiz_id: quizId,
      answers,
    }),
  });

  return result.data;
};

// Mengirim hasil kuis sebagai hasil resmi
export const submitQuizResult = async (quizId, answers) => {
  const result = await request(`${API_URL}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quiz_id: quizId,
      answers,
    }),
  });

  return result.data;
};
export const getAllQuizResults = async () => {
  const response = await fetchWithAuth(`${API_URL}/all`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil hasil quiz mahasiswa.");
  }

  return result.data || [];
};
