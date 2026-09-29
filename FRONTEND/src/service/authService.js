const API_URL = "http://localhost:5000/api";

/**
 * Mengambil storage yang sedang digunakan.
 *
 * Jika user memilih "Ingat saya",
 * token berada di localStorage.
 *
 * Jika tidak,
 * token berada di sessionStorage.
 */
const getStorage = () => {
  // Gunakan localStorage jika pasangan token lengkap tersedia
  if (
    localStorage.getItem("access_token") &&
    localStorage.getItem("refresh_token")
  ) {
    return localStorage;
  }

  // Gunakan sessionStorage jika pasangan token lengkap tersedia
  if (
    sessionStorage.getItem("access_token") &&
    sessionStorage.getItem("refresh_token")
  ) {
    return sessionStorage;
  }

  return null;
};

/**
 * Mendapatkan access token saat ini.
 */
export const getAccessToken = () => {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  return storage.getItem("access_token");
};

/**
 * Mendapatkan refresh token saat ini.
 */
export const getRefreshToken = () => {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  return storage.getItem("refresh_token");
};

/**
 * Memperbarui access token menggunakan refresh token.
 */
export const refreshAccessToken = async () => {
  const storage = getStorage();

  if (!storage) {
    throw new Error("Session tidak ditemukan.");
  }

  const refreshToken = storage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("Refresh token tidak ditemukan.");
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal memperbarui session.");
  }

  /**
   * Supabase dapat memberikan refresh token baru.
   * Karena itu keduanya harus diperbarui.
   */
  storage.setItem("access_token", result.session.access_token);

  storage.setItem("refresh_token", result.session.refresh_token);

  return result.session.access_token;
};

/**
 * Fetch API dengan access token.
 *
 * Jika access token sudah tidak valid,
 * fungsi akan mencoba refresh token,
 * lalu mengulang request satu kali.
 */
export const fetchWithAuth = async (url, options = {}) => {
  let accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("Access token tidak ditemukan.");
  }

  /**
   * Fungsi untuk melakukan request
   * menggunakan access token tertentu.
   */
  const makeRequest = async (token) => {
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  /* =========================================
     REQUEST PERTAMA
  ========================================== */

  let response = await makeRequest(accessToken);

  /* =========================================
     TOKEN MASIH VALID
  ========================================== */

  if (response.status !== 401) {
    return response;
  }

  /* =========================================
     TOKEN EXPIRED
     COBA REFRESH
  ========================================== */

  try {
    accessToken = await refreshAccessToken();
  } catch (error) {
    clearSession();

    throw new Error("Session telah berakhir. Silakan login kembali.", {
      cause: error,
    });
  }
  /* =========================================
     ULANG REQUEST DENGAN TOKEN BARU
  ========================================== */

  response = await makeRequest(accessToken);

  return response;
};

/**
 * Menghapus session lokal.
 */
export const clearSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
};
