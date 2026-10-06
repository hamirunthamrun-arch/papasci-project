const API_URL = "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| REFRESH REQUEST
|--------------------------------------------------------------------------
| Mencegah beberapa request menjalankan refresh token secara bersamaan.
*/

let refreshPromise = null;

/*
|--------------------------------------------------------------------------
| SESSION STORAGE
|--------------------------------------------------------------------------
| Mendukung login dengan localStorage maupun sessionStorage.
*/

const getStorage = () => {
  if (
    localStorage.getItem("access_token") &&
    localStorage.getItem("refresh_token")
  ) {
    return localStorage;
  }

  if (
    sessionStorage.getItem("access_token") &&
    sessionStorage.getItem("refresh_token")
  ) {
    return sessionStorage;
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| GET ACCESS TOKEN
|--------------------------------------------------------------------------
*/

export const getAccessToken = () => {
  const storage = getStorage();

  return storage?.getItem("access_token") ?? null;
};

/*
|--------------------------------------------------------------------------
| GET REFRESH TOKEN
|--------------------------------------------------------------------------
*/

export const getRefreshToken = () => {
  const storage = getStorage();

  return storage?.getItem("refresh_token") ?? null;
};

/*
|--------------------------------------------------------------------------
| CLEAR SESSION
|--------------------------------------------------------------------------
*/

export const clearSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
};

/*
|--------------------------------------------------------------------------
| SESSION EXPIRED EVENT
|--------------------------------------------------------------------------
| Event ini bisa digunakan App.jsx untuk mengarahkan user ke halaman login.
*/

const notifySessionExpired = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:session-expired"));
  }
};

/*
|--------------------------------------------------------------------------
| REFRESH ACCESS TOKEN
|--------------------------------------------------------------------------
*/

export const refreshAccessToken = async () => {
  // Jika proses refresh sudah berjalan, gunakan proses yang sama.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
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

    // Hindari error jika respons server bukan JSON yang valid.
    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error("Respons server saat refresh tidak valid.");
    }

    if (
      !response.ok ||
      !result.success ||
      !result.session?.access_token ||
      !result.session?.refresh_token
    ) {
      throw new Error(
        result.message || "Gagal memperbarui session."
      );
    }

    /*
     * Pastikan token disimpan kembali ke tempat penyimpanan
     * yang sama dengan session yang sedang digunakan.
     */
    storage.setItem(
      "access_token",
      result.session.access_token
    );

    storage.setItem(
      "refresh_token",
      result.session.refresh_token
    );

    return result.session.access_token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

/*
|--------------------------------------------------------------------------
| FETCH WITH AUTH
|--------------------------------------------------------------------------
| 1. Kirim request dengan access token.
| 2. Jika mendapat 401, coba refresh token.
| 3. Ulangi request satu kali.
| 4. Jika masih 401, bersihkan session.
|--------------------------------------------------------------------------
*/

export const fetchWithAuth = async (url, options = {}) => {
  let accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error(
      "Access token tidak ditemukan. Silakan login kembali."
    );
  }

  /*
   * Membuat request dengan token yang diberikan.
   */
  const makeRequest = (token) => {
    const headers = new Headers(options.headers || {});

    headers.set("Authorization", `Bearer ${token}`);

    // Tambahkan Content-Type JSON jika body bukan FormData.
    const isFormData =
      typeof FormData !== "undefined" &&
      options.body instanceof FormData;

    if (options.body != null && !isFormData) {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  // REQUEST PERTAMA
  let response = await makeRequest(accessToken);

  // Respons selain 401 ditangani oleh pemanggil.
  if (response.status !== 401) {
    return response;
  }

  // ACCESS TOKEN DITOLAK: COBA REFRESH.
  try {
    accessToken = await refreshAccessToken();
  } catch (error) {
    clearSession();
    notifySessionExpired();

    throw new Error(
      "Session telah berakhir. Silakan login kembali.",
      { cause: error }
    );
  }

  // ULANGI REQUEST SATU KALI DENGAN TOKEN BARU.
  response = await makeRequest(accessToken);

  // Jika token baru juga ditolak, session tidak valid.
  if (response.status === 401) {
    clearSession();
    notifySessionExpired();
  }

  return response;
};