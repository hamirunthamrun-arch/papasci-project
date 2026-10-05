import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaEdit,
  FaImage,
  FaPlus,
  FaSave,
  FaSeedling,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import {
  getMaterialsByModule,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../../service/moduleMaterialService";

import { getModuleById } from "../../service/moduleService";
import { getAccessToken } from "../../service/authService";

import "../../css/dosen/DosenMateri.css";

/* =========================================================
   KONFIGURASI STORAGE
========================================================= */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_BUCKET = "media-storage";
const STORAGE_FOLDER = "modules/materials";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const initialForm = {
  title: "",
  subtitle: "",
  image_url: "",
  content: "",
  order: 1,
};

/* =========================================================
   HELPER STORAGE
========================================================= */

const uploadMaterialImage = async (file) => {
  if (!file) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Gunakan gambar JPG, PNG, atau WEBP.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ukuran gambar maksimal 2 MB.");
  }

  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("Session tidak ditemukan. Silakan login kembali.");
  }

  const extension = file.name.split(".").pop().toLowerCase();
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `${STORAGE_FOLDER}/${fileName}`;

  const uploadUrl =
    `${SUPABASE_URL}/storage/v1/object/` + `${STORAGE_BUCKET}/${filePath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body: file,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengunggah gambar.");
  }

  return (
    `${SUPABASE_URL}/storage/v1/object/public/` +
    `${STORAGE_BUCKET}/${filePath}`
  );
};

/* =========================================================
   HAPUS GAMBAR STORAGE
========================================================= */

const deleteMaterialImage = async (imageUrl) => {
  if (!imageUrl) return;

  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) return;

  const filePath = decodeURIComponent(
    imageUrl.substring(markerIndex + marker.length),
  );

  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("Session tidak ditemukan.");
  }

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
    },
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Gagal menghapus gambar dari Storage.");
  }
};

/* =========================================================
   NORMALISASI DATA
========================================================= */

const normalizeMaterial = (item) => ({
  ...item,
  order: Number(item.order_number ?? item.order ?? 1),
});

/* =========================================================
   COMPONENT
========================================================= */

function DosenMateri() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  /* =======================================================
     STATE
  ======================================================= */

  const [currentModule, setCurrentModule] = useState(null);
  const [materi, setMateri] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMateri, setEditingMateri] = useState(null);

  const [formData, setFormData] = useState(initialForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  /* =======================================================
   LOAD DATA
======================================================= */

  const loadData = useCallback(async () => {
    if (!moduleId) {
      setPageError("ID module tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      const [moduleResult, materialResult] = await Promise.all([
        getModuleById(moduleId),
        getMaterialsByModule(moduleId),
      ]);

      setCurrentModule(moduleResult);

      const materialList = Array.isArray(materialResult)
        ? materialResult
        : materialResult?.data || [];

      setMateri(
        materialList.map(normalizeMaterial).sort((a, b) => a.order - b.order),
      );

      setPageError("");
    } catch (error) {
      console.error("Gagal memuat materi:", error);

      setPageError(error.message || "Gagal memuat data materi.");
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadData]);
  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setFormData(initialForm);
    setSelectedImage(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     TAMBAH MATERI
  ======================================================= */

  const handleAdd = () => {
    setEditingMateri(null);

    setFormData({
      ...initialForm,
      order:
        materi.length > 0
          ? Math.max(...materi.map((item) => item.order)) + 1
          : 1,
    });

    setSelectedImage(null);
    setPreviewUrl("");
    setPageError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  /* =======================================================
     EDIT MATERI
  ======================================================= */

  const handleEdit = (item) => {
    setEditingMateri(item);

    setFormData({
      title: item.title || "",
      subtitle: item.subtitle || "",
      image_url: item.image_url || "",
      content: item.content || "",
      order: item.order || 1,
    });

    setSelectedImage(null);
    setPreviewUrl(item.image_url || "");
    setPageError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     PILIH GAMBAR
  ======================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Gunakan gambar JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Ukuran gambar maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setPreviewUrl(objectUrl);
  };

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingMateri(null);

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    resetForm();
  };

  /* =======================================================
     SIMPAN MATERI
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Judul materi wajib diisi.");
      return;
    }

    if (!formData.subtitle.trim()) {
      alert("Subjudul materi wajib diisi.");
      return;
    }

    if (!formData.content.trim()) {
      alert("Isi materi wajib diisi.");
      return;
    }

    const orderNumber = Number(formData.order);

    if (!Number.isInteger(orderNumber) || orderNumber < 1) {
      alert("Urutan materi harus berupa bilangan bulat minimal 1.");
      return;
    }

    setSaving(true);
    setPageError("");
    setSuccessMessage("");

    let uploadedImageUrl = null;

    try {
      let imageUrl = editingMateri?.image_url || null;

      if (selectedImage) {
        uploadedImageUrl = await uploadMaterialImage(selectedImage);
        imageUrl = uploadedImageUrl;
      }

      const payload = {
        module_id: moduleId,
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        image_url: imageUrl,
        content: formData.content.trim(),
        order_number: orderNumber,
      };

      if (editingMateri) {
        await updateMaterial(editingMateri.id, payload);
      } else {
        await createMaterial(payload);
      }

      if (editingMateri && selectedImage && editingMateri.image_url) {
        try {
          await deleteMaterialImage(editingMateri.image_url);
        } catch (imageError) {
          console.warn("Gambar lama belum berhasil dihapus:", imageError);
        }
      }

      setShowModal(false);
      setEditingMateri(null);
      resetForm();

      setSuccessMessage(
        editingMateri
          ? "Materi berhasil diperbarui."
          : "Materi berhasil ditambahkan.",
      );

      await loadData();
    } catch (error) {
      console.error("Gagal menyimpan materi:", error);

      if (uploadedImageUrl) {
        try {
          await deleteMaterialImage(uploadedImageUrl);
        } catch (cleanupError) {
          console.warn(
            "Gagal membersihkan gambar yang baru diunggah:",
            cleanupError,
          );
        }
      }

      setPageError(error.message || "Gagal menyimpan materi.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     HAPUS MATERI
  ======================================================= */

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus materi "${item.title}"?`,
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setPageError("");
    setSuccessMessage("");

    try {
      await deleteMaterial(item.id);

      if (item.image_url) {
        try {
          await deleteMaterialImage(item.image_url);
        } catch (imageError) {
          console.warn(
            "Materi terhapus, tetapi gambar belum terhapus:",
            imageError,
          );
        }
      }

      setMateri((previous) =>
        previous.filter((material) => material.id !== item.id),
      );

      setSuccessMessage("Materi berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus materi:", error);
      setPageError(error.message || "Gagal menghapus materi.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     KEMBALI
  ======================================================= */

  const handleBack = () => {
    navigate("/dosen/module");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-materi-page">
      {/* HEADER */}

      <div className="dosen-materi-header">
        <div className="dosen-materi-header-info">
          <button
            type="button"
            className="dosen-materi-back-btn"
            onClick={handleBack}
          >
            <FaArrowLeft />
            Kembali ke Module
          </button>

          <span className="dosen-materi-eyebrow">
            <FaBookOpen />
            {currentModule
              ? currentModule.title.toUpperCase()
              : "MATERI PEMBELAJARAN"}
          </span>

          <h1>Materi Pembelajaran</h1>

          <p>
            Kelola materi pembelajaran yang akan dipelajari mahasiswa pada
            module ini.
          </p>
        </div>

        <button
          type="button"
          className="dosen-materi-add-btn"
          onClick={handleAdd}
          disabled={loading || !currentModule}
        >
          <FaPlus />
          Tambah Materi
        </button>
      </div>

      {/* PESAN */}

      {pageError && <div className="dosen-materi-alert error">{pageError}</div>}

      {successMessage && (
        <div className="dosen-materi-alert success">{successMessage}</div>
      )}

      {/* INFO MODULE */}

      <div className="dosen-materi-module-info">
        <div className="dosen-materi-module-icon">
          <FaSeedling />
        </div>

        <div className="dosen-materi-module-detail">
          <span>MODULE</span>

          <h2>{currentModule?.title || "Memuat module..."}</h2>

          <p>
            {currentModule?.description || "Daftar materi untuk module ini."}
          </p>
        </div>

        <div className="dosen-materi-module-total">
          <strong>{materi.length}</strong>
          <span>Materi</span>
        </div>
      </div>

      {/* DAFTAR MATERI */}

      <div className="dosen-materi-list">
        {loading ? (
          <div className="dosen-materi-empty">
            <p>Memuat daftar materi...</p>
          </div>
        ) : materi.length > 0 ? (
          [...materi]
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <article className="dosen-materi-card" key={item.id}>
                {/* GAMBAR */}

                <div className="dosen-materi-card-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} />
                  ) : (
                    <div className="dosen-materi-image-placeholder">
                      <FaImage />
                      <span>Belum ada gambar</span>
                    </div>
                  )}

                  <span className="dosen-materi-number">
                    MATERI {String(item.order).padStart(2, "0")}
                  </span>
                </div>

                {/* KONTEN */}

                <div className="dosen-materi-card-content">
                  <h3>{item.title}</h3>

                  <p className="dosen-materi-subtitle">{item.subtitle}</p>

                  <p className="dosen-materi-description">{item.content}</p>

                  {/* AKSI */}

                  <div className="dosen-materi-card-footer">
                    <button
                      type="button"
                      className="dosen-materi-edit-btn"
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit />
                      Edit Materi
                    </button>

                    <button
                      type="button"
                      className="dosen-materi-delete-btn"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      title="Hapus materi"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </article>
            ))
        ) : (
          <div className="dosen-materi-empty">
            <FaBookOpen />

            <h3>Belum ada materi</h3>

            <p>Tambahkan materi pertama untuk module ini.</p>

            <button type="button" onClick={handleAdd}>
              <FaPlus />
              Tambah Materi
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}

      {showModal && (
        <div
          className="dosen-materi-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="dosen-materi-modal">
            {/* MODAL HEADER */}

            <div className="dosen-materi-modal-header">
              <div>
                <span>{editingMateri ? "EDIT MATERI" : "MATERI BARU"}</span>

                <h2>{editingMateri ? "Edit Materi" : "Tambah Materi"}</h2>
              </div>

              <button
                type="button"
                className="dosen-materi-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              {/* GAMBAR */}

              <div className="dosen-materi-field">
                <label>Gambar Materi</label>

                <div className="dosen-materi-image-upload">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview materi" />
                  ) : (
                    <div className="dosen-materi-upload-placeholder">
                      <FaImage />
                      <span>Pilih gambar untuk materi</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  className="dosen-materi-file-input"
                  id="materi-image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />

                <label
                  htmlFor="materi-image"
                  className="dosen-materi-upload-btn"
                >
                  <FaImage />
                  {previewUrl ? "Ganti Gambar" : "Pilih Gambar"}
                </label>

                <small>JPG, JPEG, PNG, atau WEBP. Maksimal 2 MB.</small>
              </div>

              {/* JUDUL */}

              <div className="dosen-materi-field">
                <label htmlFor="materi-title">Judul Materi</label>

                <input
                  id="materi-title"
                  name="title"
                  type="text"
                  placeholder="Contoh: Apa Itu Makhluk Hidup?"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* SUBJUDUL */}

              <div className="dosen-materi-field">
                <label htmlFor="materi-subtitle">Subjudul</label>

                <input
                  id="materi-subtitle"
                  name="subtitle"
                  type="text"
                  placeholder="Contoh: Mari mengenal dunia makhluk hidup"
                  value={formData.subtitle}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* ISI MATERI */}

              <div className="dosen-materi-field">
                <label htmlFor="materi-content">Isi Materi</label>

                <textarea
                  id="materi-content"
                  name="content"
                  rows="9"
                  placeholder="Tuliskan isi materi pembelajaran..."
                  value={formData.content}
                  onChange={handleChange}
                  required
                />

                <small>
                  Tuliskan materi pembelajaran secara lengkap dan mudah dipahami
                  mahasiswa.
                </small>
              </div>

              {/* URUTAN */}

              <div className="dosen-materi-field">
                <label htmlFor="materi-order">Urutan Materi</label>

                <input
                  id="materi-order"
                  name="order"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.order}
                  onChange={handleChange}
                  required
                />

                <small>
                  Urutan menentukan posisi materi saat dipelajari mahasiswa.
                </small>
              </div>

              {/* TOMBOL */}

              <div className="dosen-materi-modal-actions">
                <button
                  type="button"
                  className="dosen-materi-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-materi-save-btn"
                  disabled={saving}
                >
                  <FaSave />
                  {saving
                    ? "Menyimpan..."
                    : editingMateri
                      ? "Simpan Perubahan"
                      : "Simpan Materi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenMateri;
