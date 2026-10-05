import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Spinner } from "react-bootstrap";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClipboardList,
  FaDownload,
  FaEye,
  FaFilePdf,
  FaTimes,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

import { getAssignmentById } from "../../service/assignmentService";

import {
  getFilesByAssignment,
  createAssignmentFile,
  deleteAssignmentFile,
} from "../../service/assignmentFileService";

import { getAccessToken } from "../../service/authService";

import "../../css/dosen/DosenKelolaFile.css";

/* =========================================================
   KONFIGURASI SUPABASE STORAGE
========================================================= */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_BUCKET = "media-storage";
const STORAGE_FOLDER = "microteaching/pdf";

/* =========================================================
   HELPER PUBLIC URL
========================================================= */

const getPublicUrl = (path) => {
  if (!path || !SUPABASE_URL) {
    return "";
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodedPath}`;
};

/* =========================================================
   NORMALISASI DATA ASSIGNMENT
========================================================= */

const normalizeAssignment = (assignment) => ({
  ...assignment,

  title: assignment?.title || "",

  description: assignment?.description || "",

  deadline: assignment?.deadline || "",

  is_active: Boolean(assignment?.is_active),
});

/* =========================================================
   NORMALISASI FILE
========================================================= */

const normalizeFile = (file) => ({
  ...file,

  file_name: file?.file_name || "File PDF",

  file_path: file?.file_path || "",

  file_url: file?.file_path ? getPublicUrl(file.file_path) : "",
});

/* =========================================================
   FORMAT TANGGAL
========================================================= */

const formatDate = (dateString) => {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

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
  if (!bytes || bytes <= 0) {
    return "-";
  }

  const mb = bytes / (1024 * 1024);

  if (mb < 1) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${mb.toFixed(2)} MB`;
};

/* =========================================================
   UPLOAD PDF KE SUPABASE STORAGE
========================================================= */

const uploadPdf = async (file) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error("Session tidak ditemukan. Silakan login kembali.");
  }

  /* VALIDASI FILE */

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error(`File "${file.name}" bukan file PDF.`);
  }

  /* VALIDASI UKURAN */

  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`File "${file.name}" melebihi ukuran maksimal 10 MB.`);
  }

  /* BUAT NAMA FILE UNIK */

  const fileName = `${crypto.randomUUID()}.pdf`;

  const filePath = `${STORAGE_FOLDER}/${fileName}`;

  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");

  /* UPLOAD */

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodedPath}`,
    {
      method: "POST",

      headers: {
        apikey: SUPABASE_ANON_KEY,

        Authorization: `Bearer ${token}`,

        "Content-Type": "application/pdf",

        "x-upsert": "false",
      },

      body: file,
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || result.error || `Gagal mengunggah "${file.name}".`,
    );
  }

  return {
    path: filePath,

    originalName: file.name,
  };
};

/* =========================================================
   HAPUS PDF DARI SUPABASE STORAGE
========================================================= */

const removePdf = async (filePath) => {
  if (!filePath) {
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error("Session tidak ditemukan. Silakan login kembali.");
  }

  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");

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
      result.message || result.error || "Gagal menghapus PDF dari Storage.",
    );
  }
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenKelolaFile() {
  const navigate = useNavigate();

  const { assignmentId } = useParams();

  /* =======================================================
     DATA ASSIGNMENT
  ======================================================= */

  const [assignment, setAssignment] = useState(null);

  /* =======================================================
     DATA FILE
  ======================================================= */

  const [files, setFiles] = useState([]);

  /* =======================================================
     LOADING
  ======================================================= */

  const [loadingAssignment, setLoadingAssignment] = useState(true);

  const [loadingFiles, setLoadingFiles] = useState(true);

  /* =======================================================
     UPLOAD
  ======================================================= */

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [uploading, setUploading] = useState(false);

  /* =======================================================
     DELETE
  ======================================================= */

  const [deletingId, setDeletingId] = useState(null);

  /* =======================================================
     MESSAGE
  ======================================================= */

  const [pageError, setPageError] = useState("");

  const [uploadError, setUploadError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  /* =========================================================
     LOAD FILE
  ========================================================= */

  const loadFiles = async () => {
    try {
      setLoadingFiles(true);

      setPageError("");

      if (!assignmentId) {
        throw new Error("ID tugas tidak ditemukan.");
      }

      const result = await getFilesByAssignment(assignmentId);

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setFiles(data.map(normalizeFile));
    } catch (error) {
      console.error("Load assignment files error:", error);

      setPageError(error.message || "Gagal mengambil file tugas.");
    } finally {
      setLoadingFiles(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (!assignmentId) {
      navigate("/dosen/tugas", {
        replace: true,
      });

      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoadingAssignment(true);

        setLoadingFiles(true);

        setPageError("");

        /* ===============================================
           AMBIL ASSIGNMENT + FILE BERSAMAAN
        =============================================== */

        const [assignmentResult, filesResult] = await Promise.all([
          getAssignmentById(assignmentId),

          getFilesByAssignment(assignmentId),
        ]);

        if (cancelled) {
          return;
        }

        /* ===============================================
           NORMALISASI ASSIGNMENT
        =============================================== */

        const assignmentData = assignmentResult?.data ?? assignmentResult;

        if (!assignmentData) {
          throw new Error("Data tugas tidak ditemukan.");
        }

        /* ===============================================
           NORMALISASI FILE
        =============================================== */

        const filesData = Array.isArray(filesResult)
          ? filesResult
          : Array.isArray(filesResult?.data)
            ? filesResult.data
            : [];

        setAssignment(normalizeAssignment(assignmentData));

        setFiles(filesData.map(normalizeFile));
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Gagal memuat data:", error);

        setPageError(error.message || "Gagal mengambil data tugas.");
      } finally {
        if (!cancelled) {
          setLoadingAssignment(false);

          setLoadingFiles(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [assignmentId, navigate]);

  /* =========================================================
     PILIH FILE PDF
  ========================================================= */

  const handleFileChange = (event) => {
    const selected = Array.from(event.target.files || []);

    if (selected.length === 0) {
      return;
    }

    setUploadError("");

    setSuccessMessage("");

    /* ===============================================
       VALIDASI FORMAT
    =============================================== */

    const invalidFile = selected.find(
      (file) =>
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf"),
    );

    if (invalidFile) {
      setUploadError(`"${invalidFile.name}" bukan file PDF.`);

      event.target.value = "";

      return;
    }

    /* ===============================================
       VALIDASI UKURAN
    =============================================== */

    const oversizedFile = selected.find((file) => file.size > 10 * 1024 * 1024);

    if (oversizedFile) {
      setUploadError(`"${oversizedFile.name}" melebihi ukuran maksimal 10 MB.`);

      event.target.value = "";

      return;
    }

    setSelectedFiles(selected);
  };

  /* =========================================================
     HAPUS FILE YANG DIPILIH
  ========================================================= */

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  /* =========================================================
     HAPUS SEMUA FILE PILIHAN
  ========================================================= */

  const handleClearSelectedFiles = () => {
    setSelectedFiles([]);

    const input = document.getElementById("assignment-pdf-files");

    if (input) {
      input.value = "";
    }
  };

  /* =========================================================
     UPLOAD FILE
  ========================================================= */

  const handleUpload = async () => {
    if (!assignmentId) {
      setUploadError("ID tugas tidak ditemukan.");

      return;
    }

    if (selectedFiles.length === 0) {
      setUploadError("Pilih minimal satu file PDF.");

      return;
    }

    setUploading(true);

    setUploadError("");

    setPageError("");

    setSuccessMessage("");

    try {
      let successCount = 0;

      /* ===============================================
         UPLOAD SATU PER SATU
      =============================================== */

      for (const file of selectedFiles) {
        let uploaded = null;

        try {
          /* =============================================
             UPLOAD KE STORAGE
          ============================================= */

          uploaded = await uploadPdf(file);

          /* =============================================
             SIMPAN PATH KE DATABASE
          ============================================= */

          await createAssignmentFile({
            assignment_id: assignmentId,

            file_name: uploaded.originalName,

            file_path: uploaded.path,
          });

          successCount++;
        } catch (error) {
          /*
           * Jika Storage berhasil tetapi
           * database gagal, bersihkan Storage.
           */

          if (uploaded?.path) {
            try {
              await removePdf(uploaded.path);
            } catch (cleanupError) {
              console.warn("Gagal membersihkan file Storage:", cleanupError);
            }
          }

          throw error;
        }
      }

      /* ===============================================
         RESET INPUT
      =============================================== */

      setSelectedFiles([]);

      const input = document.getElementById("assignment-pdf-files");

      if (input) {
        input.value = "";
      }

      setSuccessMessage(`${successCount} file PDF berhasil ditambahkan.`);

      /* ===============================================
         REFRESH DAFTAR FILE
      =============================================== */

      await loadFiles();
    } catch (error) {
      console.error("Upload PDF error:", error);

      setUploadError(error.message || "Gagal mengunggah file PDF.");
    } finally {
      setUploading(false);
    }
  };

  /* =========================================================
     HAPUS FILE
  ========================================================= */

  const handleDeleteFile = async (file) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus file "${file.file_name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(file.id);

    setPageError("");

    setSuccessMessage("");

    try {
      /* ===============================================
         HAPUS RECORD DATABASE
      =============================================== */

      await deleteAssignmentFile(file.id);

      /* ===============================================
         HAPUS FILE STORAGE
      =============================================== */

      if (file.file_path && file.file_path.startsWith(`${STORAGE_FOLDER}/`)) {
        try {
          await removePdf(file.file_path);
        } catch (storageError) {
          console.warn(
            "Record database berhasil dihapus, tetapi file Storage gagal dihapus:",
            storageError,
          );
        }
      }

      setSuccessMessage("File PDF berhasil dihapus.");

      /* ===============================================
         REFRESH DAFTAR FILE
      =============================================== */

      await loadFiles();
    } catch (error) {
      console.error("Delete file error:", error);

      setPageError(error.message || "Gagal menghapus file PDF.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     BUKA PDF
  ========================================================= */

  const handleViewPdf = (file) => {
    if (!file.file_url) {
      setPageError("URL PDF tidak tersedia.");

      return;
    }

    window.open(file.file_url, "_blank", "noopener,noreferrer");
  };

  /* =========================================================
     DOWNLOAD PDF
  ========================================================= */

  const handleDownloadPdf = (file) => {
    if (!file.file_url) {
      setPageError("URL PDF tidak tersedia.");

      return;
    }

    const link = document.createElement("a");

    link.href = file.file_url;

    link.target = "_blank";

    link.rel = "noopener noreferrer";

    link.download = file.file_name;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  /* =========================================================
     KEMBALI KE DAFTAR TUGAS
  ========================================================= */

  const handleBack = () => {
    navigate("/dosen/tugas");
  };

  /* =========================================================
     LOADING ASSIGNMENT
  ========================================================= */

  if (loadingAssignment) {
    return (
      <div className="dosen-manage-file-page">
        <div className="dosen-manage-file-empty">
          <Spinner animation="border" />

          <h3>Memuat tugas...</h3>

          <p>Sedang mengambil informasi tugas.</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dosen-manage-file-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dosen-manage-file-header">
        <div>
          <Button
            type="button"
            className="dosen-manage-file-back-btn"
            onClick={handleBack}
          >
            <FaArrowLeft />
            Kembali ke Daftar Tugas
          </Button>

          <div className="dosen-manage-file-heading">
            <div className="dosen-manage-file-heading-icon">
              <FaFilePdf />
            </div>

            <div>
              <span className="dosen-manage-file-eyebrow">
                KELOLA FILE TUGAS
              </span>

              <h1>{assignment?.title || "Tugas Microteaching"}</h1>

              <p>Kelola dokumen PDF untuk tugas mahasiswa.</p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          NOTIFIKASI ERROR
      ===================================================== */}

      {pageError && (
        <Alert
          variant="danger"
          className="dosen-manage-file-alert"
          dismissible
          onClose={() => setPageError("")}
        >
          {pageError}
        </Alert>
      )}

      {/* =====================================================
          NOTIFIKASI SUKSES
      ===================================================== */}

      {successMessage && (
        <Alert
          variant="success"
          className="dosen-manage-file-alert"
          dismissible
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {/* =====================================================
          INFORMASI TUGAS
      ===================================================== */}

      {assignment && (
        <section className="dosen-manage-file-assignment">
          <div className="dosen-manage-file-assignment-icon">
            <FaClipboardList />
          </div>

          <div className="dosen-manage-file-assignment-content">
            <span>INFORMASI TUGAS</span>

            <h2>{assignment.title}</h2>

            <p>{assignment.description || "Tidak ada deskripsi tugas."}</p>

            <div className="dosen-manage-file-assignment-meta">
              <div>
                <FaCalendarAlt />

                <span>
                  Deadline: <strong>{formatDate(assignment.deadline)}</strong>
                </span>
              </div>

              <span
                className={`dosen-manage-file-status ${
                  assignment.is_active ? "active" : "inactive"
                }`}
              >
                {assignment.is_active ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          UPLOAD PDF
      ===================================================== */}

      <section className="dosen-manage-file-upload-section">
        <div className="dosen-manage-file-section-heading">
          <div>
            <span>TAMBAH DOKUMEN</span>

            <h2>Upload File PDF</h2>

            <p>Satu tugas dapat memiliki beberapa file PDF.</p>
          </div>
        </div>

        <div className="dosen-manage-file-upload">
          <input
            id="assignment-pdf-files"
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
          />

          <label htmlFor="assignment-pdf-files">
            <div className="dosen-manage-file-upload-icon">
              <FaUpload />
            </div>

            <div>
              <strong>Pilih File PDF</strong>

              <span>Kamu dapat memilih beberapa PDF sekaligus.</span>

              <small>PDF • Maksimal 10 MB per file</small>
            </div>
          </label>
        </div>

        {/* ERROR UPLOAD */}

        {uploadError && (
          <Alert
            variant="danger"
            className="dosen-manage-file-alert"
            dismissible
            onClose={() => setUploadError("")}
          >
            {uploadError}
          </Alert>
        )}

        {/* FILE TERPILIH */}

        {selectedFiles.length > 0 && (
          <div className="dosen-manage-file-selected">
            <div className="dosen-manage-file-selected-header">
              <strong>{selectedFiles.length} file dipilih</strong>

              <button
                type="button"
                onClick={handleClearSelectedFiles}
                disabled={uploading}
              >
                <FaTimes />
                Hapus Semua
              </button>
            </div>

            <div className="dosen-manage-file-selected-list">
              {selectedFiles.map((file, index) => (
                <div
                  className="dosen-manage-file-selected-item"
                  key={`${file.name}-${index}`}
                >
                  <FaFilePdf />

                  <div>
                    <strong>{file.name}</strong>

                    <span>{formatFileSize(file.size)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedFile(index)}
                    disabled={uploading}
                    aria-label={`Hapus ${file.name}`}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="dosen-manage-file-upload-btn"
              onClick={handleUpload}
              disabled={uploading}
            >
              <FaUpload />

              {uploading ? "Mengunggah..." : "Upload File PDF"}
            </button>
          </div>
        )}
      </section>

      {/* =====================================================
          DAFTAR FILE
      ===================================================== */}

      <section className="dosen-manage-file-list-section">
        <div className="dosen-manage-file-section-heading">
          <div>
            <span>FILE TERSIMPAN</span>

            <h2>Dokumen Tugas</h2>

            <p>{files.length} file PDF terhubung dengan tugas ini.</p>
          </div>

          <span className="dosen-manage-file-count">{files.length} File</span>
        </div>

        {loadingFiles ? (
          <div className="dosen-manage-file-empty">
            <Spinner animation="border" />

            <h3>Memuat file...</h3>

            <p>Sedang mengambil daftar dokumen.</p>
          </div>
        ) : files.length > 0 ? (
          <div className="dosen-manage-file-grid">
            {files.map((file) => (
              <article className="dosen-manage-file-card" key={file.id}>
                {/* ICON */}

                <div className="dosen-manage-file-card-top">
                  <div className="dosen-manage-file-pdf-icon">
                    <FaFilePdf />
                  </div>

                  <span>PDF</span>
                </div>

                {/* CONTENT */}

                <div className="dosen-manage-file-card-content">
                  <h3>{file.file_name}</h3>

                  <div className="dosen-manage-file-info">
                    <FaFilePdf />

                    <span>Dokumen tugas</span>
                  </div>

                  <div className="dosen-manage-file-info">
                    <FaCalendarAlt />

                    <span>Ditambahkan {formatDate(file.created_at)}</span>
                  </div>
                </div>

                {/* ACTION */}

                <div className="dosen-manage-file-actions">
                  <Button
                    type="button"
                    className="dosen-manage-file-view-btn"
                    onClick={() => handleViewPdf(file)}
                  >
                    <FaEye />
                    Buka PDF
                  </Button>

                  <div className="dosen-manage-file-secondary-actions">
                    <Button
                      type="button"
                      className="dosen-manage-file-download-btn"
                      onClick={() => handleDownloadPdf(file)}
                    >
                      <FaDownload />
                      Download
                    </Button>

                    <Button
                      type="button"
                      className="dosen-manage-file-delete-btn"
                      onClick={() => handleDeleteFile(file)}
                      disabled={deletingId === file.id}
                    >
                      <FaTrash />

                      {deletingId === file.id ? "Menghapus..." : "Hapus"}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dosen-manage-file-empty">
            <div className="dosen-manage-file-empty-icon">
              <FaFilePdf />
            </div>

            <h3>Belum ada file PDF</h3>

            <p>Tambahkan satu atau beberapa PDF menggunakan form di atas.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default DosenKelolaFile;
