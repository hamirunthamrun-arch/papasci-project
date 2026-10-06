import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/pretest-results";

// Fungsi utama untuk request ke backend
const request = async (url, options = {}) => {
  const response = await fetchWithAuth(url, options);
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    const error = new Error(
      result?.message || "Gagal memproses hasil pretest.",
    );

    // Menyimpan kode error dari backend jika tersedia
    error.code = result?.code || result?.error?.code;

    throw error;
  }

  return result;
};

// Menghitung nilai sementara tanpa menyimpan hasil resmi
export const evaluatePretest = async (pretestId, answers) => {
  if (!pretestId) {
    throw new Error("ID pretest wajib diisi.");
  }

  const result = await request(`${API_URL}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pretest_id: pretestId,
      answers,
    }),
  });

  return result.data;
};

// Menyimpan hasil resmi saat mahasiswa menekan tombol Submit Nilai
export const submitPretestResult = async (pretestId, answers) => {
  if (!pretestId) {
    throw new Error("ID pretest wajib diisi.");
  }

  const result = await request(`${API_URL}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pretest_id: pretestId,
      answers,
    }),
  });

  return result.data;
};

// Mengambil riwayat hasil pretest mahasiswa yang sedang login
export const getMyPretestResults = async () => {
  const result = await request(`${API_URL}/my`);

  return result.data || [];
};
// Mengambil seluruh hasil pretest untuk rekap nilai dosen
export const getAllPretestResults = async () => {
  const result = await request(`${API_URL}/all`);
  return result.data || [];
};
