import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaEdit,
  FaFlask,
  FaImage,
  FaLink,
  FaPlus,
  FaSave,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

import {
  getSimulasi,
  createSimulasi,
  updateSimulasi,
  deleteSimulasi,
} from "../../service/simulasiService";

import { getAccessToken } from "../../service/authService";

import "../../css/dosen/DosenLabSimulasi.css";

/* =========================================================
   KONFIGURASI STORAGE
========================================================= */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_BUCKET = "media-storage";
const STORAGE_FOLDER = "lab-simulasi";

/* =========================================================
   HELPER STORAGE
========================================================= */

const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

const getPublicUrl = (path) => {
  if (!path || !SUPABASE_URL) return "";

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodePath(path)}`;
};

/* =========================================================
   UPLOAD GAMBAR
========================================================= */

const uploadSimulasiImage = async (file) => {
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

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran gambar maksimal 5 MB.");
  }

  const extension = file.name.split(".").pop().toLowerCase();
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const path = `${STORAGE_FOLDER}/${fileName}`;

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodePath(path)}`,
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

  return path;
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

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodePath(path)}`,
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
   COMPONENT
========================================================= */

function DosenLabSimulasi() {
  const [simulations, setSimulations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSimulation, setEditingSimulation] = useState(null);

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    link_simulasi: "",
    image_path: "",
    status: "draft",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fileInputRef = useRef(null);

  /* =======================================================
     AMBIL DATA
  ======================================================= */

  const loadSimulasi = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      setPageError("");

      const data = await getSimulasi();

      setSimulations(Array.isArray(data) ? data : []);
    } catch (error) {
      setPageError(error.message || "Gagal mengambil daftar simulasi.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await getSimulasi();

        if (isMounted) {
          setSimulations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setPageError(error.message || "Gagal mengambil daftar simulasi.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredSimulations = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    if (!keyword) return simulations;

    return simulations.filter(
      (simulation) =>
        (simulation.judul || "").toLowerCase().includes(keyword) ||
        (simulation.deskripsi || "").toLowerCase().includes(keyword),
    );
  }, [simulations, searchTerm]);

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setFormData({
      judul: "",
      deskripsi: "",
      link_simulasi: "",
      image_path: "",
      status: "draft",
    });

    setSelectedImage(null);
    setPreviewUrl("");
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     TAMBAH
  ======================================================= */

  const handleAdd = () => {
    setEditingSimulation(null);
    resetForm();
    setShowModal(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (simulation) => {
    setEditingSimulation(simulation);

    setFormData({
      judul: simulation.judul || "",
      deskripsi: simulation.deskripsi || "",
      link_simulasi: simulation.link_simulasi || "",
      image_path: simulation.image_path || "",
      status: simulation.status || "draft",
    });

    setSelectedImage(null);
    setPreviewUrl(
      simulation.image_path ? getPublicUrl(simulation.image_path) : "",
    );

    setFormError("");
    setShowModal(true);
  };

  /* =======================================================
     INPUT
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
      setFormError("Gunakan gambar JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Ukuran gambar maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setSelectedImage(file);

    setPreviewUrl(URL.createObjectURL(file));
  };

  /* =======================================================
     HAPUS GAMBAR DARI FORM
  ======================================================= */

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    setFormData((previous) => ({
      ...previous,
      image_path: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSimulation(null);
    resetForm();
  };

  /* =======================================================
     VALIDASI URL
  ======================================================= */

  const isValidUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  /* =======================================================
     SIMPAN
  ======================================================= */

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.judul.trim()) {
      setFormError("Judul simulasi harus diisi.");
      return;
    }

    if (!formData.deskripsi.trim()) {
      setFormError("Deskripsi simulasi harus diisi.");
      return;
    }

    if (!formData.link_simulasi.trim()) {
      setFormError("Link simulasi harus diisi.");
      return;
    }

    if (!isValidUrl(formData.link_simulasi.trim())) {
      setFormError("Masukkan link simulasi yang valid.");
      return;
    }

    if (!selectedImage && !formData.image_path) {
      setFormError("Gambar simulasi harus ditambahkan.");
      return;
    }

    setSaving(true);
    setFormError("");
    setSuccessMessage("");

    let uploadedPath = null;
    let databaseSaved = false;

    try {
      let imagePath = formData.image_path || null;

      /* UPLOAD GAMBAR BARU */

      if (selectedImage) {
        uploadedPath = await uploadSimulasiImage(selectedImage);
        imagePath = uploadedPath;
      }

      const payload = {
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim(),
        link_simulasi: formData.link_simulasi.trim(),
        image_path: imagePath,
        status: formData.status,
      };

      /* EDIT */

      if (editingSimulation) {
        await updateSimulasi(editingSimulation.id, payload);
        databaseSaved = true;

        /* Hapus gambar lama setelah update berhasil */

        if (
          uploadedPath &&
          editingSimulation.image_path &&
          editingSimulation.image_path.startsWith(`${STORAGE_FOLDER}/`)
        ) {
          try {
            await deleteStorageImage(editingSimulation.image_path);
          } catch (error) {
            console.warn("Gambar lama gagal dihapus:", error);
          }
        }

        setSuccessMessage("Simulasi berhasil diperbarui.");
      } else {
        /* TAMBAH */

        await createSimulasi(payload);
        databaseSaved = true;

        setSuccessMessage("Simulasi berhasil ditambahkan.");
      }

      setShowModal(false);
      setEditingSimulation(null);
      resetForm();

      await loadSimulasi();
    } catch (error) {
      /* Bersihkan gambar baru jika penyimpanan database gagal */

      if (uploadedPath && !databaseSaved) {
        try {
          await deleteStorageImage(uploadedPath);
        } catch (cleanupError) {
          console.warn("Gambar baru gagal dibersihkan:", cleanupError);
        }
      }

      setFormError(error.message || "Gagal menyimpan simulasi.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     HAPUS DATA
  ======================================================= */

  const handleDelete = async (simulation) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus simulasi "${simulation.judul}"?`,
    );

    if (!confirmed) return;

    setDeletingId(simulation.id);
    setPageError("");
    setSuccessMessage("");

    try {
      await deleteSimulasi(simulation.id);

      if (
        simulation.image_path &&
        simulation.image_path.startsWith(`${STORAGE_FOLDER}/`)
      ) {
        try {
          await deleteStorageImage(simulation.image_path);
        } catch (error) {
          console.warn("Data terhapus, tetapi gambar gagal dihapus:", error);
        }
      }

      setSuccessMessage("Simulasi berhasil dihapus.");
      await loadSimulasi();
    } catch (error) {
      setPageError(error.message || "Gagal menghapus simulasi.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-lab-page">
      {/* HEADER */}

      <div className="dosen-lab-header">
        <div>
          <div className="dosen-lab-title">
            <div className="dosen-lab-title-icon">
              <FaFlask />
            </div>

            <div>
              <h1>Lab Simulasi</h1>

              <p>Kelola simulasi pembelajaran IPA untuk mahasiswa.</p>
            </div>
          </div>
        </div>

        <button type="button" className="dosen-lab-add-btn" onClick={handleAdd}>
          <FaPlus />
          Tambah Simulasi
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
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={() => loadSimulasi(true)}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* TOOLBAR */}

      <div className="dosen-lab-toolbar">
        <div className="dosen-lab-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari simulasi..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="dosen-lab-total">
          {filteredSimulations.length} Simulasi
        </div>
      </div>

      {/* CARD GRID */}

      {loading ? (
        <div className="dosen-lab-empty">
          <FaFlask />
          <h3>Memuat simulasi...</h3>
        </div>
      ) : filteredSimulations.length === 0 ? (
        <div className="dosen-lab-empty">
          <FaFlask />

          <h3>
            {searchTerm ? "Simulasi tidak ditemukan" : "Belum ada simulasi"}
          </h3>

          <p>
            {searchTerm
              ? "Coba gunakan kata pencarian yang berbeda."
              : "Klik Tambah Simulasi untuk membuat data baru."}
          </p>
        </div>
      ) : (
        <div className="dosen-lab-grid">
          {filteredSimulations.map((simulation) => (
            <div className="dosen-lab-card" key={simulation.id}>
              {/* IMAGE */}

              <div className="dosen-lab-card-image">
                {simulation.image_path ? (
                  <img
                    src={getPublicUrl(simulation.image_path)}
                    alt={simulation.judul}
                  />
                ) : (
                  <div className="dosen-lab-image-upload">
                    <FaImage />
                    <span>Belum ada gambar</span>
                  </div>
                )}

                <span
                  className={`dosen-lab-status ${
                    simulation.status === "public" ? "published" : "draft"
                  }`}
                >
                  {simulation.status === "public" ? "Public" : "Draft"}
                </span>
              </div>

              {/* CONTENT */}

              <div className="dosen-lab-card-content">
                <h3>{simulation.judul}</h3>

                <p>{simulation.deskripsi || "Belum ada deskripsi simulasi."}</p>

                <div className="dosen-lab-url">
                  <FaLink />

                  <a
                    href={simulation.link_simulasi}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={simulation.link_simulasi}
                  >
                    {simulation.link_simulasi}
                  </a>
                </div>

                {/* ACTIONS */}

                <div className="dosen-lab-card-actions">
                  <button
                    type="button"
                    className="dosen-lab-edit-btn"
                    onClick={() => handleEdit(simulation)}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="dosen-lab-delete-btn"
                    onClick={() => handleDelete(simulation)}
                    disabled={deletingId === simulation.id}
                  >
                    <FaTrash />
                    {deletingId === simulation.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TAMBAH / EDIT */}

      {showModal && (
        <div
          className="dosen-lab-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="dosen-lab-modal">
            {/* HEADER MODAL */}

            <div className="dosen-lab-modal-header">
              <div>
                <h2>
                  {editingSimulation ? "Edit Simulasi" : "Tambah Simulasi"}
                </h2>

                <p>Lengkapi informasi simulasi pembelajaran.</p>
              </div>

              <button
                type="button"
                className="dosen-lab-close-btn"
                onClick={handleCloseModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            {/* FORM */}

            <form className="dosen-lab-form" onSubmit={handleSave}>
              {formError && (
                <div className="alert alert-danger" role="alert">
                  {formError}
                </div>
              )}

              {/* GAMBAR */}

              <div className="dosen-lab-form-group">
                <label>
                  Gambar Simulasi
                  <span>*</span>
                </label>

                {previewUrl ? (
                  <div className="dosen-lab-image-preview">
                    <img src={previewUrl} alt="Preview simulasi" />

                    <div className="dosen-lab-image-actions">
                      <label className="dosen-lab-change-image">
                        <FaUpload />
                        Ganti Gambar
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          disabled={saving}
                        />
                      </label>

                      <button
                        type="button"
                        className="dosen-lab-remove-image"
                        onClick={handleRemoveImage}
                        disabled={saving}
                      >
                        <FaTrash />
                        Hapus Gambar
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="dosen-lab-image-upload">
                    <FaImage />

                    <strong>Tambahkan gambar simulasi</strong>

                    <span>JPG, PNG, WEBP — maksimal 5 MB</span>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={saving}
                    />
                  </label>
                )}
              </div>

              {/* JUDUL */}

              <div className="dosen-lab-form-group">
                <label htmlFor="judul">
                  Judul Simulasi
                  <span>*</span>
                </label>

                <input
                  id="judul"
                  type="text"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  placeholder="Contoh: Gaya dan Gerak"
                  disabled={saving}
                  required
                />
              </div>

              {/* DESKRIPSI */}

              <div className="dosen-lab-form-group">
                <label htmlFor="deskripsi">
                  Deskripsi
                  <span>*</span>
                </label>

                <textarea
                  id="deskripsi"
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  placeholder="Tuliskan deskripsi simulasi..."
                  rows="4"
                  disabled={saving}
                  required
                />
              </div>

              {/* LINK */}

              <div className="dosen-lab-form-group">
                <label htmlFor="link_simulasi">
                  Link Simulasi
                  <span>*</span>
                </label>

                <div className="dosen-lab-url-input">
                  <FaLink />

                  <input
                    id="link_simulasi"
                    type="url"
                    name="link_simulasi"
                    value={formData.link_simulasi}
                    onChange={handleChange}
                    placeholder="https://..."
                    disabled={saving}
                    required
                  />
                </div>
              </div>

              {/* STATUS */}

              <div className="dosen-lab-form-group">
                <label htmlFor="status">Status</label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="draft">Draft</option>
                  <option value="public">Public</option>
                </select>
              </div>

              {/* FOOTER */}

              <div className="dosen-lab-modal-footer">
                <button
                  type="button"
                  className="dosen-lab-cancel-btn"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  <FaTimes />
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-lab-save-btn"
                  disabled={saving}
                >
                  <FaSave />

                  {saving
                    ? "Menyimpan..."
                    : editingSimulation
                      ? "Simpan Perubahan"
                      : "Simpan Simulasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenLabSimulasi;
