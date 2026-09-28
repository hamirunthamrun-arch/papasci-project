import { useState } from "react";
import {
  FaClipboardList,
  FaEdit,
  FaFilePdf,
  FaPlus,
  FaSearch,
  FaSave,
  FaTimes,
  FaTrash,
  FaCalendarAlt,
  FaImage,
} from "react-icons/fa";

import "../../css/dosen/DosenTugas.css";

/* =========================================================
   DATA DUMMY TUGAS
========================================================= */

const initialTasks = [
  {
    id: 1,
    title: "Praktik Mengajar Materi Makhluk Hidup",
    description:
      "Buat video praktik mengajar materi Makhluk Hidup untuk siswa sekolah dasar dengan menggunakan metode pembelajaran yang sesuai.",
    deadline: "2026-10-15",

    imageUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    imageName: "makhluk-hidup.jpg",
    imageSize: 0,

    pdfUrl: "",
    pdfName: "",
    pdfSize: 0,
  },

  {
    id: 2,
    title: "Praktik Mengajar Gaya dan Gerak",
    description:
      "Buat video pembelajaran mengenai konsep gaya dan gerak serta berikan contoh sederhana yang dapat dipahami oleh siswa SD.",
    deadline: "2026-10-22",

    imageUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    imageName: "gaya-gerak.jpg",
    imageSize: 0,

    pdfUrl: "",
    pdfName: "",
    pdfSize: 0,
  },

  {
    id: 3,
    title: "Praktik Mengajar Materi Energi",
    description:
      "Buat video praktik mengajar materi energi dengan penyampaian yang menarik dan mudah dipahami oleh siswa.",
    deadline: "2026-10-30",

    imageUrl:
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80",
    imageName: "energi.jpg",
    imageSize: 0,

    pdfUrl: "",
    pdfName: "",
    pdfSize: 0,
  },

  {
    id: 4,
    title: "Praktik Mengajar Perubahan Wujud Air",
    description:
      "Buat video pembelajaran tentang perubahan wujud air dengan memberikan contoh dari kehidupan sehari-hari.",
    deadline: "2026-11-05",

    imageUrl:
      "https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&w=1200&q=80",
    imageName: "air.jpg",
    imageSize: 0,

    pdfUrl: "",
    pdfName: "",
    pdfSize: 0,
  },
];

/* =========================================================
   FORMAT TANGGAL
========================================================= */

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/* =========================================================
   FORMAT UKURAN FILE
========================================================= */

const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";

  const mb = bytes / (1024 * 1024);

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }

  return `${Math.ceil(bytes / 1024)} KB`;
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenTugas() {
  const [tasks, setTasks] = useState(initialTasks);

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingTask, setEditingTask] = useState(null);

  /* =======================================================
     IMAGE STATE
  ======================================================= */

  const [selectedImage, setSelectedImage] = useState(null);

  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  /* =======================================================
     PDF STATE
  ======================================================= */

  const [selectedPdf, setSelectedPdf] = useState(null);

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");

  /* =======================================================
     FORM DATA
  ======================================================= */

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",

    imageUrl: "",
    imageName: "",
    imageSize: 0,

    pdfUrl: "",
    pdfName: "",
    pdfSize: 0,
  });

  /* =======================================================
     FILTER TUGAS
  ======================================================= */

  const filteredTasks = tasks.filter((task) => {
    const keyword = searchTerm.toLowerCase().trim();

    if (!keyword) {
      return true;
    }

    return (
      task.title.toLowerCase().includes(keyword) ||
      task.description.toLowerCase().includes(keyword)
    );
  });

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      deadline: "",

      imageUrl: "",
      imageName: "",
      imageSize: 0,

      pdfUrl: "",
      pdfName: "",
      pdfSize: 0,
    });

    setSelectedImage(null);

    if (imagePreviewUrl && selectedImage) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImagePreviewUrl("");

    setSelectedPdf(null);

    if (pdfPreviewUrl && selectedPdf) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }

    setPdfPreviewUrl("");

    setEditingTask(null);
  };

  /* =======================================================
     TAMBAH TUGAS
  ======================================================= */

  const handleAdd = () => {
    resetForm();

    setShowModal(true);
  };

  /* =======================================================
     EDIT TUGAS
  ======================================================= */

  const handleEdit = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title,
      description: task.description,
      deadline: task.deadline,

      imageUrl: task.imageUrl || "",
      imageName: task.imageName || "",
      imageSize: task.imageSize || 0,

      pdfUrl: task.pdfUrl || "",
      pdfName: task.pdfName || "",
      pdfSize: task.pdfSize || 0,
    });

    setSelectedImage(null);

    setImagePreviewUrl(task.imageUrl || "");

    setSelectedPdf(null);

    setPdfPreviewUrl("");

    setShowModal(true);
  };

  /* =======================================================
     INPUT FORM
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     UPLOAD GAMBAR
  ======================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    /* -------------------------------------------------------
       FORMAT GAMBAR
    ------------------------------------------------------- */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Format gambar harus JPG, PNG, atau WebP.");

      event.target.value = "";

      return;
    }

    /* -------------------------------------------------------
       BATAS UKURAN 5 MB
    ------------------------------------------------------- */

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Ukuran gambar maksimal 5 MB.");

      event.target.value = "";

      return;
    }

    /* -------------------------------------------------------
       HAPUS PREVIEW LAMA JIKA FILE BARU
    ------------------------------------------------------- */

    if (imagePreviewUrl && selectedImage) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    /* -------------------------------------------------------
       SIMPAN FILE
    ------------------------------------------------------- */

    setSelectedImage(file);

    /* -------------------------------------------------------
       BUAT PREVIEW
    ------------------------------------------------------- */

    const previewUrl = URL.createObjectURL(file);

    setImagePreviewUrl(previewUrl);

    setFormData((previous) => ({
      ...previous,

      imageUrl: previewUrl,
      imageName: file.name,
      imageSize: file.size,
    }));
  };

  /* =======================================================
     HAPUS GAMBAR
  ======================================================= */

  const handleRemoveImage = () => {
    if (selectedImage && imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setSelectedImage(null);

    setImagePreviewUrl("");

    setFormData((previous) => ({
      ...previous,

      imageUrl: "",
      imageName: "",
      imageSize: 0,
    }));

    const input = document.getElementById("task-image");

    if (input) {
      input.value = "";
    }
  };

  /* =======================================================
     UPLOAD PDF
  ======================================================= */

  const handlePdfChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    /* -------------------------------------------------------
       CEK FORMAT PDF
    ------------------------------------------------------- */

    if (file.type !== "application/pdf") {
      alert("File yang dipilih harus berupa PDF.");

      event.target.value = "";

      return;
    }

    /* -------------------------------------------------------
       BATAS UKURAN 10 MB
    ------------------------------------------------------- */

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Ukuran PDF maksimal 10 MB.");

      event.target.value = "";

      return;
    }

    /* -------------------------------------------------------
       HAPUS PREVIEW PDF LAMA
    ------------------------------------------------------- */

    if (pdfPreviewUrl && selectedPdf) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }

    /* -------------------------------------------------------
       SIMPAN FILE PDF
    ------------------------------------------------------- */

    setSelectedPdf(file);

    /* -------------------------------------------------------
       BUAT URL SEMENTARA
    ------------------------------------------------------- */

    const previewUrl = URL.createObjectURL(file);

    setPdfPreviewUrl(previewUrl);

    setFormData((previous) => ({
      ...previous,

      pdfUrl: previewUrl,
      pdfName: file.name,
      pdfSize: file.size,
    }));
  };

  /* =======================================================
     HAPUS PDF
  ======================================================= */

  const handleRemovePdf = () => {
    if (selectedPdf && pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }

    setSelectedPdf(null);

    setPdfPreviewUrl("");

    setFormData((previous) => ({
      ...previous,

      pdfUrl: "",
      pdfName: "",
      pdfSize: 0,
    }));

    const input = document.getElementById("task-pdf");

    if (input) {
      input.value = "";
    }
  };

  /* =======================================================
     SIMPAN TUGAS
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    /* -------------------------------------------------------
       VALIDASI
    ------------------------------------------------------- */

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.deadline
    ) {
      alert(
        "Judul, deskripsi, dan deadline wajib diisi."
      );

      return;
    }

    /* -------------------------------------------------------
       DATA GAMBAR
    ------------------------------------------------------- */

    const imageData = selectedImage
      ? {
          imageUrl: imagePreviewUrl,
          imageName: selectedImage.name,
          imageSize: selectedImage.size,
        }
      : {
          imageUrl: formData.imageUrl,
          imageName: formData.imageName,
          imageSize: formData.imageSize,
        };

    /* -------------------------------------------------------
       DATA PDF
    ------------------------------------------------------- */

    const pdfData = selectedPdf
      ? {
          pdfUrl: pdfPreviewUrl,
          pdfName: selectedPdf.name,
          pdfSize: selectedPdf.size,
        }
      : {
          pdfUrl: formData.pdfUrl,
          pdfName: formData.pdfName,
          pdfSize: formData.pdfSize,
        };

    /* -------------------------------------------------------
       EDIT TUGAS
    ------------------------------------------------------- */

    if (editingTask) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...formData,
                ...imageData,
                ...pdfData,
              }
            : task
        )
      );

      alert("Tugas berhasil diperbarui.");
    }

    /* -------------------------------------------------------
       TAMBAH TUGAS
    ------------------------------------------------------- */

    else {
      const newTask = {
        id: Date.now(),

        ...formData,

        ...imageData,

        ...pdfData,
      };

      setTasks((previous) => [
        newTask,
        ...previous,
      ]);

      alert("Tugas berhasil ditambahkan.");
    }

    /* -------------------------------------------------------
       TUTUP MODAL
    ------------------------------------------------------- */

    setShowModal(false);

    /*
      Jangan revoke imagePreviewUrl dan pdfPreviewUrl
      karena URL tersebut masih digunakan oleh card.
    */

    setSelectedImage(null);

    setImagePreviewUrl("");

    setSelectedPdf(null);

    setPdfPreviewUrl("");

    setEditingTask(null);

    setFormData({
      title: "",
      description: "",
      deadline: "",

      imageUrl: "",
      imageName: "",
      imageSize: 0,

      pdfUrl: "",
      pdfName: "",
      pdfSize: 0,
    });
  };

  /* =======================================================
     HAPUS TUGAS
  ======================================================= */

  const handleDelete = (id) => {
    const task = tasks.find(
      (item) => item.id === id
    );

    if (!task) return;

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus tugas "${task.title}"?`
    );

    if (!confirmed) return;

    setTasks((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  };

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const closeModal = () => {
    setShowModal(false);

    /*
      Hanya revoke URL jika merupakan file baru
      yang belum disimpan.
    */

    if (selectedImage && imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (selectedPdf && pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }

    setSelectedImage(null);

    setImagePreviewUrl("");

    setSelectedPdf(null);

    setPdfPreviewUrl("");

    setEditingTask(null);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-task-page">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="dosen-task-header">
        <div className="dosen-task-title">
          <div className="dosen-task-title-icon">
            <FaClipboardList />
          </div>

          <div>
            <h1>Tugas Microteaching</h1>

            <p>
              Kelola tugas praktik mengajar yang akan
              dikerjakan mahasiswa.
            </p>
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

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <div className="dosen-task-toolbar">
        <div className="dosen-task-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari tugas..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          {searchTerm && (
            <button
              type="button"
              className="dosen-task-search-clear"
              onClick={() =>
                setSearchTerm("")
              }
              aria-label="Hapus pencarian"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <span className="dosen-task-total">
          {filteredTasks.length} Tugas
        </span>
      </div>

      {/* ===================================================
          TASK GRID
      =================================================== */}

      <div className="dosen-task-grid">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              className="dosen-task-card"
              key={task.id}
            >
              {/* =================================================
                  CARD IMAGE
              ================================================= */}

              {task.imageUrl ? (
                <div className="dosen-task-card-image">
                  <img
                    src={task.imageUrl}
                    alt={task.title}
                  />
                </div>
              ) : (
                <div className="dosen-task-card-image dosen-task-card-image-empty">
                  <FaClipboardList />
                </div>
              )}

              {/* =================================================
                  CARD HEADER
              ================================================= */}

              <div className="dosen-task-card-header">
                <div className="dosen-task-card-icon">
                  <FaFilePdf />
                </div>

                <span>
                  Tugas Microteaching
                </span>
              </div>

              {/* =================================================
                  CARD CONTENT
              ================================================= */}

              <div className="dosen-task-card-content">
                <h3>{task.title}</h3>

                <p>
                  {task.description}
                </p>

                {/* DEADLINE */}

                <div className="dosen-task-deadline">
                  <FaCalendarAlt />

                  <div>
                    <span>
                      Deadline
                    </span>

                    <strong>
                      {formatDate(
                        task.deadline
                      )}
                    </strong>
                  </div>
                </div>

                {/* PDF */}

                {task.pdfUrl &&
                task.pdfName ? (
                  <a
                    href={task.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="dosen-task-pdf-link"
                  >
                    <FaFilePdf />

                    <span>
                      {task.pdfName}
                    </span>
                  </a>
                ) : (
                  <div className="dosen-task-no-pdf">
                    <FaFilePdf />

                    <span>
                      Belum ada PDF
                    </span>
                  </div>
                )}

                {/* ACTION */}

                <div className="dosen-task-card-actions">
                  <button
                    type="button"
                    className="dosen-task-edit-btn"
                    onClick={() =>
                      handleEdit(task)
                    }
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="dosen-task-delete-btn"
                    onClick={() =>
                      handleDelete(task.id)
                    }
                  >
                    <FaTrash />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="dosen-task-empty">
            <FaClipboardList />

            <h3>
              Tugas tidak ditemukan
            </h3>

            <p>
              Tidak ada tugas yang sesuai
              dengan pencarian "{searchTerm}".
            </p>
          </div>
        )}
      </div>

      {/* ===================================================
          MODAL TAMBAH / EDIT
      =================================================== */}

      {showModal && (
        <div
          className="dosen-task-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="dosen-task-modal">
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="dosen-task-modal-header">
              <div>
                <span>
                  {editingTask
                    ? "EDIT TUGAS"
                    : "TUGAS MICROTEACHING"}
                </span>

                <h2>
                  {editingTask
                    ? "Edit Tugas"
                    : "Tambah Tugas Baru"}
                </h2>
              </div>

              <button
                type="button"
                className="dosen-task-close-btn"
                onClick={closeModal}
                aria-label="Tutup"
              >
                <FaTimes />
              </button>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              className="dosen-task-form"
              onSubmit={handleSubmit}
            >
              {/* =================================================
                  JUDUL
              ================================================= */}

              <div className="dosen-task-form-group">
                <label htmlFor="task-title">
                  Judul Tugas
                  <span>*</span>
                </label>

                <input
                  id="task-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Praktik Mengajar Materi Makhluk Hidup"
                />
              </div>

              {/* =================================================
                  DESKRIPSI
              ================================================= */}

              <div className="dosen-task-form-group">
                <label htmlFor="task-description">
                  Deskripsi / Instruksi Tugas
                  <span>*</span>
                </label>

                <textarea
                  id="task-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan tugas yang harus dikerjakan mahasiswa..."
                  rows="5"
                />
              </div>

              {/* =================================================
                  GAMBAR TUGAS
              ================================================= */}

              <div className="dosen-task-form-group">
                <label>
                  Gambar Tugas
                </label>

                <div className="dosen-task-upload-box">
                  <input
                    id="task-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />

                  <label
                    htmlFor="task-image"
                    className="dosen-task-upload-label"
                  >
                    <div className="dosen-task-upload-icon">
                      <FaImage />
                    </div>

                    <div>
                      <strong>
                        Pilih Gambar
                      </strong>

                      <span>
                        Klik untuk memilih
                        gambar dari perangkat
                      </span>

                      <small>
                        JPG, PNG, WebP •
                        Maksimal 5 MB
                      </small>
                    </div>
                  </label>
                </div>

                {/* PREVIEW GAMBAR */}

                {imagePreviewUrl && (
                  <div className="dosen-task-image-preview">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview tugas"
                    />

                    <button
                      type="button"
                      className="dosen-task-remove-image-btn"
                      onClick={
                        handleRemoveImage
                      }
                    >
                      <FaTimes />
                      Hapus Gambar
                    </button>
                  </div>
                )}

                <small className="dosen-task-upload-note">
                  Gambar digunakan sebagai
                  cover tugas. Setelah backend
                  dihubungkan, gambar akan
                  disimpan ke Supabase Storage.
                </small>
              </div>

              {/* =================================================
                  DEADLINE
              ================================================= */}

              <div className="dosen-task-form-group">
                <label htmlFor="task-deadline">
                  Deadline
                  <span>*</span>
                </label>

                <div className="dosen-task-input-icon">
                  <FaCalendarAlt />

                  <input
                    id="task-deadline"
                    type="date"
                    name="deadline"
                    value={
                      formData.deadline
                    }
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* =================================================
                  PDF UPLOAD
              ================================================= */}

              <div className="dosen-task-form-group">
                <label>
                  File PDF Petunjuk Tugas
                </label>

                <div className="dosen-task-upload-box">
                  <input
                    id="task-pdf"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfChange}
                  />

                  <label
                    htmlFor="task-pdf"
                    className="dosen-task-upload-label"
                  >
                    <div className="dosen-task-upload-icon dosen-task-upload-pdf-icon">
                      <FaFilePdf />
                    </div>

                    <div>
                      <strong>
                        Pilih File PDF
                      </strong>

                      <span>
                        Klik untuk memilih
                        PDF dari perangkat
                      </span>

                      <small>
                        Format PDF •
                        Maksimal 10 MB
                      </small>
                    </div>
                  </label>
                </div>

                {/* FILE TERPILIH */}

                {formData.pdfName && (
                  <div className="dosen-task-selected-file">
                    <div className="dosen-task-selected-file-icon">
                      <FaFilePdf />
                    </div>

                    <div className="dosen-task-selected-file-info">
                      <strong>
                        {formData.pdfName}
                      </strong>

                      <span>
                        {formatFileSize(
                          formData.pdfSize
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="dosen-task-remove-file-btn"
                      onClick={
                        handleRemovePdf
                      }
                      aria-label="Hapus file PDF"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                <small className="dosen-task-upload-note">
                  File PDF akan disimpan ke
                  Supabase Storage setelah
                  backend dihubungkan.
                </small>
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="dosen-task-modal-footer">
                <button
                  type="button"
                  className="dosen-task-cancel-btn"
                  onClick={closeModal}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-task-save-btn"
                >
                  <FaSave />

                  {editingTask
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