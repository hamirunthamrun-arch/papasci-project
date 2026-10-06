import { useEffect, useRef, useState } from "react";
import {
  FaUserGraduate,
  FaIdCard,
  FaEnvelope,
  FaCamera,
  FaImage,
  FaSave,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

import { getAccessToken } from "../service/authService";
import "../css/Profil.css";

/* =========================================================
   KONFIGURASI SUPABASE
========================================================= */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_BUCKET = "media-storage";
const STORAGE_FOLDER = "profile-photos";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

/* =========================================================
   HELPER URL STORAGE
========================================================= */

const getPublicUrl = (path) => {
  if (!path || !SUPABASE_URL) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodedPath}`;
};

const getStoragePath = (imageUrl) => {
  if (!imageUrl) return null;

  if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    return url.pathname
      .slice(index + marker.length)
      .split("/")
      .map(decodeURIComponent)
      .join("/");
  } catch {
    return null;
  }
};

/* =========================================================
   HELPER RESPONSE API
========================================================= */

const readResponse = async (response) => {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.msg ||
        result.error_description ||
        result.error ||
        `Permintaan gagal dengan status ${response.status}.`,
    );
  }

  return result;
};

const getAuthHeaders = () => {
  const token = getAccessToken();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Konfigurasi Supabase belum tersedia di file .env.");
  }

  if (!token) {
    throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
  }

  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
};

/* =========================================================
   AMBIL DATA PENGGUNA DARI SUPABASE AUTH
========================================================= */

const getCurrentUser = async () => {
  const headers = getAuthHeaders();

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers,
  });

  return readResponse(response);
};

/* =========================================================
   AMBIL PROFIL DARI TABEL PROFILES
   Kolom nama menggunakan nama_lengkap.
========================================================= */

const getProfile = async (userId) => {
  const headers = getAuthHeaders();

  const query = new URLSearchParams({
    select: "id,nama_lengkap,email,role,nim,avatar_url",
    id: `eq.${userId}`,
  });

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?${query.toString()}`,
    {
      method: "GET",
      headers,
    },
  );

  const result = await readResponse(response);

  return Array.isArray(result) ? result[0] || null : null;
};

/* =========================================================
   UPLOAD FOTO PROFIL KE STORAGE
========================================================= */

const uploadProfileImage = async (file, userId) => {
  const headers = getAuthHeaders();

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Gunakan gambar JPG, PNG, atau WEBP.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran gambar maksimal 2 MB.");
  }

  const extension = file.name.split(".").pop().toLowerCase();
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const path = `${STORAGE_FOLDER}/${userId}/${fileName}`;

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodedPath}`,
    {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: file,
    },
  );

  await readResponse(response);

  return {
    path,
    url: getPublicUrl(path),
  };
};

/* =========================================================
   SIMPAN PATH FOTO KE TABEL PROFILES
========================================================= */

const updateProfileImage = async (userId, imagePath) => {
  const headers = getAuthHeaders();

  const query = new URLSearchParams({
    id: `eq.${userId}`,
  });

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?${query.toString()}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        avatar_url: imagePath,
      }),
    },
  );

  const result = await readResponse(response);

  if (!Array.isArray(result) || result.length === 0) {
    throw new Error(
      "Profil tidak berhasil diperbarui. Periksa kebijakan UPDATE tabel profiles.",
    );
  }

  return result[0];
};

/* =========================================================
   HAPUS FOTO LAMA DARI STORAGE
========================================================= */

const deleteStorageImage = async (path, userId) => {
  if (!path) return;

  const expectedPrefix = `${STORAGE_FOLDER}/${userId}/`;

  // Pastikan hanya foto profil milik pengguna ini yang dihapus.
  if (!path.startsWith(expectedPrefix)) {
    return;
  }

  const headers = getAuthHeaders();

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodedPath}`,
    {
      method: "DELETE",
      headers,
    },
  );

  await readResponse(response);
};

/* =========================================================
   COMPONENT PROFIL
========================================================= */

function Profil() {
  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState({
    nama: "",
    nim: "",
    email: "",
    avatar_url: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef(null);
  const previewRef = useRef("");

  /* =======================================================
     BERSIHKAN PREVIEW GAMBAR
  ======================================================= */

  const clearPreview = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
    }

    setPreviewUrl("");
    setSelectedImage(null);
  };

  /* =======================================================
     AMBIL DATA PROFIL
  ======================================================= */

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const authUser = await getCurrentUser();

        if (!authUser?.id) {
          throw new Error("Pengguna tidak ditemukan. Silakan login kembali.");
        }

        const data = await getProfile(authUser.id);

        if (!data) {
          throw new Error("Data profil tidak ditemukan pada tabel profiles.");
        }

        if (!active) return;

        setUser(authUser);

        setProfile({
          nama:
            data.nama_lengkap ||
            authUser.user_metadata?.nama_lengkap ||
            authUser.user_metadata?.nama ||
            "",
          nim: data.nim || "",
          email: data.email || authUser.email || "",
          avatar_url: data.avatar_url || "",
        });
      } catch (error) {
        console.error("Gagal memuat profil:", error);

        if (active) {
          setErrorMessage(error.message || "Gagal mengambil data profil.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;

      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = "";
      }
    };
  }, []);

  /* =======================================================
     PILIH FOTO
  ======================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Gunakan gambar JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("Ukuran gambar maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    // Bersihkan preview sebelumnya.
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const newPreview = URL.createObjectURL(file);

    previewRef.current = newPreview;

    setSelectedImage(file);
    setPreviewUrl(newPreview);
  };

  /* =======================================================
     BATAL PILIH FOTO
  ======================================================= */

  const handleCancelImage = () => {
    clearPreview();

    setErrorMessage("");
    setSuccessMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     SIMPAN FOTO PROFIL
  ======================================================= */

  const handleSavePhoto = async () => {
    if (!user?.id) {
      setErrorMessage("Sesi pengguna tidak tersedia. Silakan login kembali.");
      return;
    }

    if (!selectedImage) {
      setErrorMessage("Silakan pilih foto terlebih dahulu.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    let uploadedImage = null;
    let databaseSaved = false;

    try {
      // 1. Upload foto ke Supabase Storage.
      uploadedImage = await uploadProfileImage(selectedImage, user.id);

      // 2. Simpan path foto ke tabel profiles.
      await updateProfileImage(user.id, uploadedImage.path);

      databaseSaved = true;

      // 3. Perbarui tampilan dengan foto baru.
      const oldPath = getStoragePath(profile.avatar_url);

      setProfile((previous) => ({
        ...previous,
        avatar_url: uploadedImage.path,
      }));

      clearPreview();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccessMessage("Foto profil berhasil diperbarui.");

      // 4. Hapus foto lama jika diizinkan oleh Storage policy.
      if (oldPath && oldPath !== uploadedImage.path) {
        try {
          await deleteStorageImage(oldPath, user.id);
        } catch (error) {
          console.warn(
            "Foto baru tersimpan, tetapi foto lama gagal dihapus:",
            error,
          );
        }
      }
    } catch (error) {
      console.error("Gagal menyimpan foto profil:", error);

      // Jika update database gagal, bersihkan file yang baru diunggah.
      if (uploadedImage && !databaseSaved) {
        try {
          await deleteStorageImage(uploadedImage.path, user.id);
        } catch (cleanupError) {
          console.warn("File baru gagal dibersihkan:", cleanupError);
        }
      }

      setErrorMessage(error.message || "Gagal menyimpan foto profil.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="profil-loading">
        <FaSpinner className="profil-spinner" />
        <p>Memuat profil mahasiswa...</p>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="profil-page">
      <div className="profil-header">
        <div className="profil-header-icon">
          <FaUserGraduate />
        </div>

        <div>
          <span className="profil-eyebrow">AKUN MAHASISWA</span>
          <h1>Profil Saya</h1>
          <p>Kelola informasi dasar dan foto profil kamu.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="profil-alert profil-alert-error" role="alert">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="profil-alert profil-alert-success" role="status">
          {successMessage}
        </div>
      )}

      <div className="profil-card">
        <div className="profil-card-heading">
          <h2>Informasi Profil</h2>
          <p>Informasi dasar akun mahasiswa PAPASCI.</p>
        </div>

        <div className="profil-main">
          {/* FOTO PROFIL */}

          <section className="profil-photo-section">
            <div className="profil-avatar-wrapper">
              {previewUrl || getPublicUrl(profile.avatar_url) ? (
                <img
                  className="profil-avatar"
                  src={previewUrl || getPublicUrl(profile.avatar_url)}
                  alt="Foto profil mahasiswa"
                />
              ) : (
                <div className="profil-avatar-placeholder">
                  <FaUserGraduate />
                </div>
              )}

              <label
                htmlFor="profil-image-input"
                className="profil-camera-button"
                title="Pilih foto profil"
              >
                <FaCamera />
              </label>
            </div>

            <h3>{profile.nama || "Mahasiswa"}</h3>
            <p>Foto Profil Mahasiswa</p>

            <div className="profil-upload-box">
              <input
                ref={fileInputRef}
                id="profil-image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={saving}
              />

              <label htmlFor="profil-image-input">
                <FaImage />
                <span>Pilih Foto</span>
              </label>

              <small>JPG, PNG, WebP · Maksimal 2 MB</small>
            </div>

            {selectedImage && (
              <div className="profil-photo-actions">
                <button
                  type="button"
                  className="profil-save-button"
                  onClick={handleSavePhoto}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSpinner className="profil-spinner" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Simpan Foto
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="profil-cancel-button"
                  onClick={handleCancelImage}
                  disabled={saving}
                >
                  <FaTimes />
                  Batal
                </button>
              </div>
            )}

            <p className="profil-photo-note">
              Pilih foto yang jelas agar profilmu mudah dikenali.
            </p>
          </section>

          {/* DATA MAHASISWA */}

          <section className="profil-information">
            <div className="profil-information-heading">
              <h3>Data Mahasiswa</h3>
              <span>Informasi akun</span>
            </div>

            <div className="profil-field">
              <div className="profil-field-icon">
                <FaUserGraduate />
              </div>

              <div>
                <span>Nama Lengkap</span>
                <strong>{profile.nama || "-"}</strong>
              </div>
            </div>

            <div className="profil-field">
              <div className="profil-field-icon">
                <FaIdCard />
              </div>

              <div>
                <span>Nomor Induk Mahasiswa (NIM)</span>
                <strong>{profile.nim || "-"}</strong>
              </div>
            </div>

            <div className="profil-field">
              <div className="profil-field-icon">
                <FaEnvelope />
              </div>

              <div>
                <span>Email</span>
                <strong>{profile.email || "-"}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profil;
