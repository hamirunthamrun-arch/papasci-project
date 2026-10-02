
import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/modules";

/**
 * Mengambil seluruh daftar module.
 */
export const getModules = async () => {
  const response = await fetchWithAuth(API_URL);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Gagal mengambil daftar module."
    );
  }

  return result.data;
};

/**
 * Mengambil satu module berdasarkan ID.
 */
export const getModuleById = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Gagal mengambil module."
    );
  }

  return result.data;
};

/**
 * Menambahkan module baru.
 */
export const createModule = async (moduleData) => {
  const response = await fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify(moduleData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Gagal menambahkan module."
    );
  }

  return result.data;
};

/**
 * Mengubah data module.
 */
export const updateModule = async (id, moduleData) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(moduleData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Gagal mengubah module."
    );
  }

  return result.data;
};

/**
 * Menghapus module.
 */
export const deleteModule = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Gagal menghapus module."
    );
  }

  return result;
};