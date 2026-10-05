import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaEdit,
  FaPlus,
  FaSearch,
  FaSave,
  FaTimes,
  FaTrash,
  FaCalendarAlt,
  FaImage,
  FaArrowRight,
} from "react-icons/fa";

import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../../service/assignmentService";

import { getAccessToken } from "../../service/authService";

import "../../css/dosen/DosenTugas.css";

/* =========================================================
   KONFIGURASI STORAGE
========================================================= */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_BUCKET = "media-storage";
const STORAGE_FOLDER = "microteaching/covers";

/* =========================================================
   HELPER URL GAMBAR
========================================================= */

const getPublicUrl = (path) => {
  if (!path || !SUPABASE_URL) return "";

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodedPath}`;
};

/* =========================================================
   UPLOAD GAMBAR COVER
========================================================= */

const uploadTaskImage = async (file) => {
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
   HAPUS GAMBAR DARI STORAGE
========================================================= */

const deleteStorageImage = async (path) => {
  if (!path) return;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error("Session tidak ditemukan. Silakan login kembali.");
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

const normalizeAssignment = (assignment) => ({
  ...assignment,
  title: assignment.title || "",
  description: assignment.description || "",
  image_path: assignment.image_path || "",
  image_url: assignment.image_path ? getPublicUrl(assignment.image_path) : "",
  deadline: assignment.deadline || "",
  is_active: Boolean(assignment.is_active),
});

/* =========================================================
   FORMAT TANGGAL
========================================================= */

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenTugas() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_path: "",
    deadline: "",
    is_active: true,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fileInputRef = useRef(null);

  /* =========================================================
     AMBIL DATA TUGAS
  ========================================================= */

  const loadTasks = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setPageError("");

      const data = await getAssignments();

      setTasks((Array.isArray(data) ? data : []).map(normalizeAssignment));
    } catch (error) {
      console.error("Load assignments error:", error);

      setPageError(error.message || "Gagal mengambil daftar tugas.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getAssignments();

        setTasks((Array.isArray(data) ? data : []).map(normalizeAssignment));
      } catch (error) {
        console.error("Load assignments error:", error);

        setPageError(error.message || "Gagal mengambil daftar tugas.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  /* =========================================================
     FILTER TUGAS
  ========================================================= */

  const filteredTasks = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return tasks;

    return tasks.filter(
      (task) =>
        (task.title || "").toLowerCase().includes(keyword) ||
        (task.description || "").toLowerCase().includes(keyword),
    );
  }, [tasks, search]);

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    if (selectedImage && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFormData({
      title: "",
      description: "",
      image_path: "",
      deadline: "",
      is_active: true,
    });

    setSelectedImage(null);
    setPreviewUrl("");
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     TAMBAH TUGAS
  ========================================================= */

  const handleAdd = () => {
    setEditingTask(null);
    resetForm();
    setShowModal(true);
  };

  /* =========================================================
     EDIT TUGAS
  ========================================================= */

  const handleEdit = (task) => {
    setEditingTask(task);

    const deadlineDate = task.deadline ? new Date(task.deadline) : null;

    const formattedDeadline =
      deadlineDate && !Number.isNaN(deadlineDate.getTime())
        ? [
            deadlineDate.getFullYear(),
            String(deadlineDate.getMonth() + 1).padStart(2, "0"),
            String(deadlineDate.getDate()).padStart(2, "0"),
          ].join("-")
        : "";

    setFormData({
      title: task.title || "",
      description: task.description || "",
      image_path: task.image_path || "",
      deadline: formattedDeadline,
      is_active: task.is_active,
    });

    setSelectedImage(null);
    setPreviewUrl(task.image_url || "");
    setFormError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  /* =========================================================
     INPUT FORM
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "is_active" ? value === "true" : value,
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

    if (selectedImage && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFormError("");
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* =========================================================
     HAPUS PILIHAN GAMBAR
  ========================================================= */

  const handleRemoveImage = () => {
    if (selectedImage && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     TUTUP MODAL
  ========================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingTask(null);
    resetForm();
  };

  /* =========================================================
     SIMPAN TUGAS
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setFormError("Judul tugas wajib diisi.");
      return;
    }

    if (!formData.description.trim()) {
      setFormError("Deskripsi tugas wajib diisi.");
      return;
    }

    if (!formData.deadline) {
      setFormError("Deadline tugas wajib diisi.");
      return;
    }

    setSaving(true);
    setFormError("");
    setPageError("");
    setSuccessMessage("");

    let uploadedImage = null;
    let databaseSaved = false;

    try {
      let imagePath = formData.image_path || null;

      /* UPLOAD GAMBAR BARU */

      if (selectedImage) {
        uploadedImage = await uploadTaskImage(selectedImage);
        imagePath = uploadedImage.path;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image_path: imagePath,
        deadline: new Date(`${formData.deadline}T23:59:00`).toISOString(),
        is_active: formData.is_active,
      };

      /* EDIT TUGAS */

      if (editingTask) {
        await updateAssignment(editingTask.id, payload);
        databaseSaved = true;

        /* HAPUS GAMBAR LAMA JIKA DIGANTI */

        if (uploadedImage && editingTask.image_path) {
          const oldPath = editingTask.image_path;

          if (oldPath.startsWith(`${STORAGE_FOLDER}/`)) {
            try {
              await deleteStorageImage(oldPath);
            } catch (error) {
              console.warn("Gambar lama gagal dihapus:", error);
            }
          }
        }

        setSuccessMessage("Tugas berhasil diperbarui.");
      } else {
        /* TAMBAH TUGAS */

        await createAssignment(payload);
        databaseSaved = true;

        setSuccessMessage("Tugas berhasil ditambahkan.");
      }

      setShowModal(false);
      setEditingTask(null);
      resetForm();

      await loadTasks();
    } catch (error) {
      /* HAPUS GAMBAR BARU JIKA PENYIMPANAN DATABASE GAGAL */

      if (uploadedImage && !databaseSaved) {
        try {
          await deleteStorageImage(uploadedImage.path);
        } catch (cleanupError) {
          console.warn("File hasil upload gagal dibersihkan:", cleanupError);
        }
      }

      setFormError(error.message || "Gagal menyimpan tugas.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     HAPUS TUGAS
  ========================================================= */

  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus tugas "${task.title}"?`,
    );

    if (!confirmed) return;

    setDeletingId(task.id);
    setPageError("");
    setSuccessMessage("");

    try {
      await deleteAssignment(task.id);

      /* HAPUS GAMBAR COVER DARI STORAGE */

      const imagePath = task.image_path;

      if (imagePath && imagePath.startsWith(`${STORAGE_FOLDER}/`)) {
        try {
          await deleteStorageImage(imagePath);
        } catch (error) {
          console.warn("Tugas terhapus, tetapi gambar gagal dihapus:", error);
        }
      }

      setSuccessMessage("Tugas berhasil dihapus.");

      await loadTasks();
    } catch (error) {
      setPageError(error.message || "Gagal menghapus tugas.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     KELOLA FILE TUGAS
  ========================================================= */

  const handleManageTask = (task) => {
    navigate(`/dosen/tugas/kelola-file/${task.id}`);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dosen-task-page">
      {/* HEADER */}

      <div className="dosen-task-header">
        <div className="dosen-task-title">
          <div className="dosen-task-title-icon">
            <FaClipboardList />
          </div>

          <div>
            <h1>Tugas Microteaching</h1>
            <p>Kelola tugas praktik mengajar yang akan dikerjakan mahasiswa.</p>
          </div>
        </div>

        <button
          type="button"
          className="dosen-task-add-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Tambah Tugas
        </button>
      </div>

      {/* PESAN SUKSES */}

      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      )}

      {/* PESAN ERROR */}

      {pageError && (
        <div className="alert alert-danger" role="alert">
          {pageError}
        </div>
      )}

      {/* TOOLBAR */}

      <div className="dosen-task-toolbar">
        <div className="dosen-task-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari tugas..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <span className="dosen-task-total">{filteredTasks.length} Tugas</span>
      </div>

      {/* DAFTAR KARTU TUGAS */}

      <div className="dosen-task-grid">
        {loading ? (
          <div className="dosen-task-empty">
            <p>Memuat daftar tugas...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <article className="dosen-task-card" key={task.id}>
              {/* GAMBAR COVER */}

              <div className="dosen-task-card-image">
                {task.image_url ? (
                  <img src={task.image_url} alt={task.title} />
                ) : (
                  <div className="dosen-task-card-image-empty">
                    <FaImage />
                    <span>Belum ada gambar</span>
                  </div>
                )}
              </div>

              {/* HEADER CARD */}

              <div className="dosen-task-card-header">
                <div className="dosen-task-card-icon">
                  <FaClipboardList />
                </div>

                <span>Tugas Microteaching</span>

                <span
                  className={`dosen-task-status ${
                    task.is_active ? "active" : "inactive"
                  }`}
                >
                  {task.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              {/* KONTEN CARD */}

              <div className="dosen-task-card-content">
                <h3>{task.title}</h3>

                <p>{task.description}</p>

                <div className="dosen-task-deadline">
                  <FaCalendarAlt />

                  <div>
                    <span>Deadline</span>
                    <strong>{formatDate(task.deadline)}</strong>
                  </div>
                </div>

                {/* AKSI CARD */}

                <div className="dosen-task-card-actions">
                  <button
                    type="button"
                    className="dosen-task-manage-btn"
                    onClick={() => handleManageTask(task)}
                  >
                    <FaClipboardList />
                    Kelola File
                    <FaArrowRight />
                  </button>

                  <div className="dosen-task-secondary-actions">
                    <button
                      type="button"
                      className="dosen-task-edit-btn"
                      onClick={() => handleEdit(task)}
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="dosen-task-delete-btn"
                      onClick={() => handleDelete(task)}
                      disabled={deletingId === task.id}
                    >
                      <FaTrash />
                      {deletingId === task.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="dosen-task-empty">
            <FaClipboardList />

            <h3>{search ? "Tugas tidak ditemukan" : "Belum ada tugas"}</h3>

            <p>
              {search
                ? "Tidak ada tugas yang sesuai dengan pencarian."
                : "Klik Tambah Tugas untuk membuat tugas baru."}
            </p>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT */}

      {showModal && (
        <div
          className="dosen-task-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="dosen-task-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* HEADER MODAL */}

            <div className="dosen-task-modal-header">
              <div>
                <span>
                  {editingTask ? "EDIT TUGAS" : "TUGAS MICROTEACHING"}
                </span>

                <h2>{editingTask ? "Edit Tugas" : "Tambah Tugas Baru"}</h2>
              </div>

              <button
                type="button"
                className="dosen-task-close-btn"
                onClick={closeModal}
                disabled={saving}
                aria-label="Tutup"
              >
                <FaTimes />
              </button>
            </div>

            {/* FORM */}

            <form className="dosen-task-form" onSubmit={handleSubmit}>
              {formError && (
                <div className="alert alert-danger" role="alert">
                  {formError}
                </div>
              )}

              {/* JUDUL */}

              <div className="dosen-task-form-group">
                <label htmlFor="task-title">
                  Judul Tugas <span>*</span>
                </label>

                <input
                  id="task-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Praktik Mengajar Materi Makhluk Hidup"
                  disabled={saving}
                  required
                />
              </div>

              {/* DESKRIPSI */}

              <div className="dosen-task-form-group">
                <label htmlFor="task-description">
                  Deskripsi / Instruksi Tugas <span>*</span>
                </label>

                <textarea
                  id="task-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan tugas yang harus dikerjakan mahasiswa..."
                  rows="5"
                  disabled={saving}
                  required
                />
              </div>

              {/* GAMBAR COVER */}

              <div className="dosen-task-form-group">
                <label>Gambar Cover Tugas</label>

                <div className="dosen-task-upload-box">
                  <input
                    ref={fileInputRef}
                    id="task-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={saving}
                  />

                  <label
                    htmlFor="task-image"
                    className="dosen-task-upload-label"
                  >
                    <div className="dosen-task-upload-icon">
                      <FaImage />
                    </div>

                    <div>
                      <strong>Pilih Gambar</strong>
                      <span>Klik untuk memilih gambar dari perangkat</span>
                      <small>JPG, PNG, WebP • Maksimal 2 MB</small>
                    </div>
                  </label>
                </div>

                {previewUrl && (
                  <div className="dosen-task-image-preview">
                    <img src={previewUrl} alt="Preview cover tugas" />

                    <button
                      type="button"
                      className="dosen-task-remove-image-btn"
                      onClick={handleRemoveImage}
                      disabled={saving}
                    >
                      <FaTimes />
                      Hapus Pilihan Gambar
                    </button>
                  </div>
                )}
              </div>

              {/* DEADLINE */}

              <div className="dosen-task-form-group">
                <label htmlFor="task-deadline">
                  Deadline <span>*</span>
                </label>

                <div className="dosen-task-input-icon">
                  <FaCalendarAlt />

                  <input
                    id="task-deadline"
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>
              </div>

              {/* STATUS */}

              <div className="dosen-task-form-group">
                <label htmlFor="task-status">Status Tugas</label>

                <select
                  id="task-status"
                  name="is_active"
                  value={String(formData.is_active)}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>

              {/* TOMBOL MODAL */}

              <div className="dosen-task-modal-footer">
                <button
                  type="button"
                  className="dosen-task-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-task-save-btn"
                  disabled={saving}
                >
                  <FaSave />

                  {saving
                    ? "Menyimpan..."
                    : editingTask
                      ? "Simpan Perubahan"
                      : "Simpan Tugas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenTugas;
