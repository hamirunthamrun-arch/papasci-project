import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/pretests";

/**
 * Mengambil seluruh daftar pretest.
 */
export const getPretests = async () => {
  const response = await fetchWithAuth(API_URL);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil daftar pretest.");
  }

  return result.data;
};

/**
 * Mengambil pretest berdasarkan ID.
 */
export const getPretestById = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil pretest.");
  }

  return result.data;
};

/**
 * Menambahkan pretest baru.
 */
export const createPretest = async (pretestData) => {
  const response = await fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify(pretestData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menambahkan pretest.");
  }

  return result.data;
};

/**
 * Mengubah data pretest.
 */
export const updatePretest = async (id, pretestData) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(pretestData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengubah pretest.");
  }

  return result.data;
};

/**
 * Menghapus pretest.
 */
export const deletePretest = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menghapus pretest.");
  }

  return result;
};

/**
 * Mengambil pretest publik berdasarkan ID module.
 */
export const getPublishedPretestByModule = async (moduleId) => {
  if (!moduleId) {
    throw new Error("ID module wajib diisi.");
  }

  const response = await fetchWithAuth(
    `${API_URL}/modules/${encodeURIComponent(moduleId)}`,
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil pretest publik.");
  }

  return result.data;
};
