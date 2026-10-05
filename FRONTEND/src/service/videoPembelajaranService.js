import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:5000/api/video-pembelajaran";

/**
 * Mengambil seluruh daftar video pembelajaran.
 */
export const getVideoPembelajaran = async () => {
  const response = await fetchWithAuth(API_URL);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Gagal mengambil daftar video pembelajaran.",
    );
  }

  return result.data;
};

/**
 * Mengambil satu video berdasarkan ID.
 */
export const getVideoPembelajaranById = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil video pembelajaran.");
  }

  return result.data;
};

/**
 * Menambahkan video pembelajaran baru.
 */
export const createVideoPembelajaran = async (videoData) => {
  const response = await fetchWithAuth(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menambahkan video pembelajaran.");
  }

  return result.data;
};

/**
 * Mengubah data video pembelajaran.
 */
export const updateVideoPembelajaran = async (id, videoData) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengubah video pembelajaran.");
  }

  return result.data;
};

/**
 * Menghapus video pembelajaran.
 */
export const deleteVideoPembelajaran = async (id) => {
  const response = await fetchWithAuth(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menghapus video pembelajaran.");
  }

  return result;
};
