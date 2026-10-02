import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaEdit,
  FaImage,
  FaPlus,
  FaSave,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
} from "../../service/moduleService";

import { getAccessToken } from "../../service/authService";

import "../../css/dosen/DosenModule.css";

/* =========================================================
   KONFIGURASI STORAGE
========================================================= */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_BUCKET = "media-storage";
const STORAGE_FOLDER = "modules";

/* =========================================================
   HELPER STORAGE
========================================================= */

const getPublicUrl = (path) => {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodedPath}`;
};

const getStoragePath = (imageUrl) => {
  if (!imageUrl || !SUPABASE_URL) return null;

  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
};

/* =========================================================
   UPLOAD GAMBAR
========================================================= */

const uploadModuleImage = async (file) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error("Session tidak ditemukan. Silakan login kembali.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Gunakan gambar JPG, PNG, atau WEBP.");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Ukuran gambar maksimal 2 MB.");
  }

  const extension = file.name.split(".").pop().toLowerCase();
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const path = `${STORAGE_FOLDER}/${fileName}`;

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodedPath}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: file,
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || result.error || "Gagal mengunggah gambar.",
    );
  }

  return {
    path,
    url: getPublicUrl(path),
  };
};

/* =========================================================
   HAPUS GAMBAR STORAGE
========================================================= */

const deleteStorageImage = async (path) => {
  if (!path) return;

  const token = getAccessToken();

  if (!token) {
    throw new Error("Session tidak ditemukan.");
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodedPath}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || result.error || "Gagal menghapus gambar.",
    );
  }
};

/* =========================================================
   NORMALISASI DATA
========================================================= */

const normalizeModule = (module) => ({
  ...module,
  order_number: Number(module.order_number ?? 1),
  status:
    module.status === "publik" || module.status === "Publik"
      ? "publik"
      : "draf",
});

/* =========================================================
   COMPONENT
========================================================= */

function DosenModule() {
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    order_number: "",
    status: "draf",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fileInputRef = useRef(null);

  /* =========================================================
   AMBIL DATA MODULE
========================================================= */

  const loadModules = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setPageError("");

      const data = await getModules();

      setModules((Array.isArray(data) ? data : []).map(normalizeModule));
    } catch (error) {
      setPageError(error.message || "Gagal mengambil daftar module.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await getModules();
        setModules((Array.isArray(data) ? data : []).map(normalizeModule));
      } catch (error) {
        setPageError(error.message || "Gagal mengambil daftar module.");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  /* =========================================================
     FILTER MODULE
  ========================================================= */

  const filteredModules = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return modules;

    return modules.filter(
      (module) =>
        (module.title || "").toLowerCase().includes(keyword) ||
        (module.description || "").toLowerCase().includes(keyword),
    );
  }, [modules, search]);

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      order_number: "",
      status: "draf",
    });

    setSelectedImage(null);
    setPreviewUrl("");
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     TAMBAH MODULE
  ========================================================= */

  const handleAdd = () => {
    setEditingModule(null);
    resetForm();
    setShowModal(true);
  };

  /* =========================================================
     EDIT MODULE
  ========================================================= */

  const handleEdit = (module) => {
    setEditingModule(module);

    setFormData({
      title: module.title || "",
      description: module.description || "",
      image_url: module.image_url || "",
      order_number: String(module.order_number ?? 1),
      status: module.status,
    });

    setSelectedImage(null);
    setPreviewUrl(module.image_url || "");
    setFormError("");
    setShowModal(true);
  };

  /* =========================================================
     INPUT FORM
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     PILIH GAMBAR
  ========================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setFormError("Gunakan gambar JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Ukuran gambar maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* =========================================================
     TUTUP MODAL
  ========================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingModule(null);
    resetForm();
  };

  /* =========================================================
     SIMPAN MODULE
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setFormError("Judul module wajib diisi.");
      return;
    }

    if (!formData.description.trim()) {
      setFormError("Deskripsi module wajib diisi.");
      return;
    }

    const orderNumber = Number(formData.order_number);

    if (
      !formData.order_number ||
      !Number.isInteger(orderNumber) ||
      orderNumber < 1
    ) {
      setFormError("Urutan module harus berupa bilangan bulat minimal 1.");
      return;
    }

    setSaving(true);
    setFormError("");
    setSuccessMessage("");

    let uploadedImage = null;
    let databaseSaved = false;

    try {
      let imageUrl = formData.image_url || null;

      /* =========================================
         UPLOAD GAMBAR BARU
      ========================================== */

      if (selectedImage) {
        uploadedImage = await uploadModuleImage(selectedImage);
        imageUrl = uploadedImage.url;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image_url: imageUrl,
        order_number: orderNumber,
        status: formData.status,
      };

      /* =========================================
         EDIT MODULE
      ========================================== */

      if (editingModule) {
        await updateModule(editingModule.id, payload);
        databaseSaved = true;

        /* Hapus gambar lama setelah update berhasil */
        if (uploadedImage) {
          const oldPath = getStoragePath(editingModule.image_url);

          if (oldPath && oldPath.startsWith(`${STORAGE_FOLDER}/`)) {
            try {
              await deleteStorageImage(oldPath);
            } catch (error) {
              console.warn("Gambar lama gagal dihapus:", error);
            }
          }
        }

        setSuccessMessage("Module berhasil diperbarui.");
      } else {
        /* =========================================
           TAMBAH MODULE
        ========================================== */

        await createModule(payload);
        databaseSaved = true;

        setSuccessMessage("Module berhasil ditambahkan.");
      }

      setShowModal(false);
      setEditingModule(null);
      resetForm();

      await loadModules();
    } catch (error) {
      /* Bersihkan file baru jika database gagal */
      if (uploadedImage && !databaseSaved) {
        try {
          await deleteStorageImage(uploadedImage.path);
        } catch (cleanupError) {
          console.warn("File hasil upload gagal dibersihkan:", cleanupError);
        }
      }

      setFormError(error.message || "Gagal menyimpan module.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     HAPUS MODULE
  ========================================================= */

  const handleDelete = async (module) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus module "${module.title}"?`,
    );

    if (!confirmed) return;

    setDeletingId(module.id);
    setPageError("");
    setSuccessMessage("");

    try {
      await deleteModule(module.id);

      const imagePath = getStoragePath(module.image_url);

      if (imagePath && imagePath.startsWith(`${STORAGE_FOLDER}/`)) {
        try {
          await deleteStorageImage(imagePath);
        } catch (error) {
          console.warn("Module terhapus, tetapi gambar gagal dihapus:", error);
        }
      }

      setSuccessMessage("Module berhasil dihapus.");
      await loadModules();
    } catch (error) {
      setPageError(error.message || "Gagal menghapus module.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     KELOLA MATERI
  ========================================================= */

  const handleManageMaterial = (module) => {
    navigate(`/dosen/module/${module.id}/materi`);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dosen-module-page">
      {/* HEADER */}

      <div className="dosen-module-header">
        <div className="dosen-module-header-info">
          <span className="dosen-module-eyebrow">
            <FaBookOpen />
            PEMBELAJARAN
          </span>

          <h1>Module</h1>

          <p>Kelola module pembelajaran IPA yang akan digunakan mahasiswa.</p>
        </div>

        <button
          type="button"
          className="dosen-module-add-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Tambah Module
        </button>
      </div>

      {/* PESAN */}

      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      )}

      {pageError && (
        <div className="alert alert-danger" role="alert">
          {pageError}
        </div>
      )}

      {/* TOOLBAR */}

      <div className="dosen-module-toolbar">
        <div className="dosen-module-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari module..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="dosen-module-total">
          <strong>{filteredModules.length}</strong>
          <span>Module</span>
        </div>
      </div>

      {/* DAFTAR MODULE */}

      <div className="dosen-module-list">
        {loading ? (
          <div className="dosen-module-empty">
            <p>Memuat daftar module...</p>
          </div>
        ) : filteredModules.length > 0 ? (
          filteredModules.map((module) => (
            <article className="dosen-module-card" key={module.id}>
              {/* GAMBAR MODULE */}

              <div className="dosen-module-card-image">
                {module.image_url ? (
                  <img src={module.image_url} alt={module.title} />
                ) : (
                  <div className="dosen-module-image-placeholder">
                    <FaImage />
                    <span>Belum ada gambar</span>
                  </div>
                )}

                <span
                  className={`dosen-module-status ${
                    module.status === "publik" ? "published" : "draft"
                  }`}
                >
                  {module.status === "publik" ? "Publik" : "Draft"}
                </span>

                <div className="dosen-module-number">
                  MODULE {String(module.order_number).padStart(2, "0")}
                </div>
              </div>

              {/* INFORMASI MODULE */}

              <div className="dosen-module-card-content">
                <h3>{module.title}</h3>

                <p>{module.description}</p>

                {/* AKSI */}

                <div className="dosen-module-card-actions">
                  <button
                    type="button"
                    className="dosen-module-manage-btn"
                    onClick={() => handleManageMaterial(module)}
                  >
                    <FaBookOpen />
                    Kelola Materi
                  </button>

                  <button
                    type="button"
                    className="dosen-module-edit-btn"
                    onClick={() => handleEdit(module)}
                    title="Edit module"
                  >
                    <FaEdit />
                  </button>

                  <button
                    type="button"
                    className="dosen-module-delete-btn"
                    onClick={() => handleDelete(module)}
                    title="Hapus module"
                    disabled={deletingId === module.id}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="dosen-module-empty">
            <FaBookOpen />

            <h3>{search ? "Module tidak ditemukan" : "Belum ada module"}</h3>

            <p>
              {search
                ? "Tidak ada module yang sesuai dengan pencarian."
                : "Klik Tambah Module untuk membuat module baru."}
            </p>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT */}

      {showModal && (
        <div className="dosen-module-modal-overlay" onMouseDown={closeModal}>
          <div
            className="dosen-module-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* HEADER MODAL */}

            <div className="dosen-module-modal-header">
              <div>
                <span>{editingModule ? "EDIT MODULE" : "MODULE BARU"}</span>

                <h2>{editingModule ? "Edit Module" : "Tambah Module"}</h2>
              </div>

              <button
                type="button"
                className="dosen-module-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="alert alert-danger" role="alert">
                  {formError}
                </div>
              )}

              {/* GAMBAR */}

              <div className="dosen-module-field">
                <label>Gambar Module</label>

                <div className="dosen-module-image-upload">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Pratinjau gambar module" />
                  ) : (
                    <div className="dosen-module-upload-placeholder">
                      <FaImage />
                      <span>Pilih gambar cover module</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  className="dosen-module-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  disabled={saving}
                />

                <button
                  type="button"
                  className="dosen-module-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  <FaImage />
                  {selectedImage || previewUrl
                    ? "Ganti Gambar"
                    : "Pilih Gambar"}
                </button>

                <small>Gunakan JPG, JPEG, PNG, atau WEBP. Maksimal 2 MB.</small>
              </div>

              {/* JUDUL */}

              <div className="dosen-module-field">
                <label htmlFor="title">Judul Module</label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Contoh: Makhluk Hidup"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={saving}
                  required
                />
              </div>

              {/* DESKRIPSI */}

              <div className="dosen-module-field">
                <label htmlFor="description">Deskripsi</label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Tuliskan deskripsi singkat module..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={saving}
                  required
                />
              </div>

              {/* URUTAN + STATUS */}

              <div className="dosen-module-form-row">
                <div className="dosen-module-field">
                  <label htmlFor="order_number">Urutan Module</label>

                  <input
                    id="order_number"
                    name="order_number"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    value={formData.order_number}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="dosen-module-field">
                  <label htmlFor="status">Status</label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="draf">Draft</option>
                    <option value="publik">Publik</option>
                  </select>
                </div>
              </div>

              {/* TOMBOL MODAL */}

              <div className="dosen-module-modal-actions">
                <button
                  type="button"
                  className="dosen-module-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-module-save-btn"
                  disabled={saving}
                >
                  <FaSave />

                  {saving
                    ? "Menyimpan..."
                    : editingModule
                      ? "Simpan Perubahan"
                      : "Simpan Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenModule;
