import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/simulasi";

/**
 * Mengambil seluruh daftar simulasi.
 */
export const getSimulasi = async () => {
  const response = await fetchWithAuth(API_URL);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil daftar simulasi.");
  }

  return result.data;
};

/**
 * Mengambil satu simulasi berdasarkan ID.
 */
export const getSimulasiById = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil simulasi.");
  }

  return result.data;
};

/**
 * Menambahkan simulasi baru.
 */
export const createSimulasi = async (simulasiData) => {
  const response = await fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify(simulasiData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menambahkan simulasi.");
  }

  return result.data;
};

/**
 * Mengubah data simulasi.
 */
export const updateSimulasi = async (id, simulasiData) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(simulasiData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengubah simulasi.");
  }

  return result.data;
};

/**
 * Menghapus data simulasi.
 */
export const deleteSimulasi = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menghapus simulasi.");
  }

  return result;
};
