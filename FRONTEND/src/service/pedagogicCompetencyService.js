import { fetchWithAuth } from "./authService";

const API_URL =
  "http://localhost:5000/api/pedagogic-competencies";

/**
 * Mengambil seluruh daftar kompetensi pedagogik.
 */
export const getPedagogicCompetencies = async () => {
  const response = await fetchWithAuth(API_URL);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Gagal mengambil daftar kompetensi pedagogik."
    );
  }

  return result.data;
};

/**
 * Mengambil satu kompetensi pedagogik berdasarkan ID.
 */
export const getPedagogicCompetencyById = async (id) => {
  const response = await fetchWithAuth(
    `${API_URL}/${id}`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Gagal mengambil kompetensi pedagogik."
    );
  }

  return result.data;
};

/**
 * Menambahkan kompetensi pedagogik baru.
 */
export const createPedagogicCompetency = async (
  competencyData
) => {
  const response = await fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify(competencyData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Gagal menambahkan kompetensi pedagogik."
    );
  }

  return result.data;
};

/**
 * Mengubah data kompetensi pedagogik.
 */
export const updatePedagogicCompetency = async (
  id,
  competencyData
) => {
  const response = await fetchWithAuth(
    `${API_URL}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(competencyData),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Gagal mengubah kompetensi pedagogik."
    );
  }

  return result.data;
};

/**
 * Menghapus kompetensi pedagogik.
 */
export const deletePedagogicCompetency = async (id) => {
  const response = await fetchWithAuth(
    `${API_URL}/${id}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Gagal menghapus kompetensi pedagogik."
    );
  }

  return result;
};