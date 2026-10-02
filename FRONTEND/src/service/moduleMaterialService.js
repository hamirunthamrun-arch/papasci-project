import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/module-materials";

/**
 * Mengambil semua materi berdasarkan ID module.
 */
export const getMaterialsByModule = async (moduleId) => {
  const response = await fetchWithAuth(
    `${API_URL}/module/${moduleId}`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil daftar materi.");
  }

  return result.data;
};

/**
 * Mengambil satu materi berdasarkan ID.
 */
export const getMaterialById = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil materi.");
  }

  return result.data;
};

/**
 * Menambahkan materi baru.
 */
export const createMaterial = async (materialData) => {
  const response = await fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify(materialData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menambahkan materi.");
  }

  return result.data;
};

/**
 * Mengubah materi.
 */
export const updateMaterial = async (id, materialData) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(materialData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengubah materi.");
  }

  return result.data;
};

/**
 * Menghapus materi.
 */
export const deleteMaterial = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menghapus materi.");
  }

  return result;
};