import { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaFilePdf,
  FaCalendarAlt,
  FaBookOpen,
  FaLink,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaFolderOpen,
  FaChevronRight,
  FaSpinner,
  FaStar,
} from "react-icons/fa";

import { getAssignmentById } from "../service/assignmentService";
import { getFilesByAssignment } from "../service/assignmentFileService";
import {
  getSubmissionByStudent,
  createAssignmentSubmission,
  updateAssignmentSubmission,
} from "../service/assignmentSubmissionService";

import "../css/DetailTugas.css";

/* =========================================================
   SUPABASE STORAGE
========================================================= */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const STORAGE_BUCKET = "media-storage";

/* =========================================================
   MEMBUAT PUBLIC URL FILE STORAGE
========================================================= */

const getPublicUrl = (path) => {
  if (!path || !SUPABASE_URL) {
    return "";
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodedPath}`;
};

/* =========================================================
   MENDAPATKAN USER YANG SEDANG LOGIN
========================================================= */

const getCurrentUser = () => {
  let userData = null;

  /*
   * Prioritaskan localStorage jika pasangan token lengkap tersedia.
   * Ini mengikuti sistem yang digunakan authService.js.
   */
  if (
    localStorage.getItem("access_token") &&
    localStorage.getItem("refresh_token")
  ) {
    userData = localStorage.getItem("user");
  }

  /*
   * Jika tidak ada, gunakan sessionStorage.
   */
  if (!userData) {
    userData = sessionStorage.getItem("user");
  }

  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error("Gagal membaca data user:", error);
    return null;
  }
};

/* =========================================================
   FORMAT TANGGAL
========================================================= */

const formatDeadline = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/* =========================================================
   COMPONENT
========================================================= */

function DetailTugas() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* =======================================================
     DATA TUGAS
  ======================================================= */

  const [tugas, setTugas] = useState(null);

  const [files, setFiles] = useState([]);

  const [submission, setSubmission] = useState(null);

  /* =======================================================
     FORM
  ======================================================= */

  const [link, setLink] = useState("");

  const [error, setError] = useState("");

  /* =======================================================
     STATUS LOAD
  ======================================================= */

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  /* =======================================================
     PDF AKTIF
  ======================================================= */

  const [activePdfIndex, setActivePdfIndex] = useState(0);

  /* =======================================================
     STATUS EDIT
  ======================================================= */

  const [isEditing, setIsEditing] = useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        /*
         * ================================================
         * USER LOGIN
         * ================================================
         */

        const currentUser = getCurrentUser();

        if (!currentUser?.id) {
          throw new Error(
            "Data pengguna tidak ditemukan. Silakan login kembali.",
          );
        }

        /*
         * ================================================
         * AMBIL DATA TUGAS
         * ================================================
         */

        const assignmentData = await getAssignmentById(id);

        /*
         * ================================================
         * NORMALISASI DATA TUGAS
         * ================================================
         */

        const normalizedAssignment = {
          ...assignmentData,

          title:
            assignmentData.title ||
            assignmentData.judul ||
            assignmentData.name ||
            "Tugas Microteaching",

          description:
            assignmentData.description || assignmentData.deskripsi || "",

          deadline:
            assignmentData.deadline ||
            assignmentData.due_date ||
            assignmentData.dueDate ||
            null,

          icon: assignmentData.icon || "📚",
        };

        setTugas(normalizedAssignment);

        /*
         * ================================================
         * AMBIL SEMUA FILE TUGAS
         * ================================================
         */

        const assignmentFiles = await getFilesByAssignment(id);

        /*
         * ================================================
         * NORMALISASI FILE PDF
         *
         * Database menyimpan:
         * file_path
         *
         * Contoh:
         * microteaching/pdf/uuid.pdf
         *
         * Kemudian file_path diubah menjadi:
         * Public URL Supabase Storage
         * ================================================
         */

        const normalizedFiles = (assignmentFiles || []).map((file) => {
          const filePath = file.file_path || "";

          const fileUrl =
            file.file_url ||
            file.fileUrl ||
            file.url ||
            file.file ||
            (filePath ? getPublicUrl(filePath) : "");

          console.log("FILE PDF:", {
            id: file.id,
            file_name: file.file_name,
            file_path: filePath,
            file_url: fileUrl,
          });

          return {
            ...file,

            title:
              file.title ||
              file.judul ||
              file.name ||
              file.file_name ||
              "Dokumen Tugas",

            description:
              file.description || file.deskripsi || "Dokumen pendukung tugas",

            file_path: filePath,

            file_url: fileUrl,

            file: fileUrl,
          };
        });

        setFiles(normalizedFiles);

        /*
         * ================================================
         * AMBIL SUBMISSION MAHASISWA
         * ================================================
         */

        try {
          const submissionData = await getSubmissionByStudent(
            id,
            currentUser.id,
          );

          if (submissionData) {
            const normalizedSubmission = {
              ...submissionData,

              submissionUrl:
                submissionData.submission_url ||
                submissionData.submissionUrl ||
                submissionData.link ||
                "",

              status: submissionData.status || "dikumpulkan",

              score:
                submissionData.score !== null &&
                submissionData.score !== undefined
                  ? submissionData.score
                  : null,
            };

            setSubmission(normalizedSubmission);
            setLink(normalizedSubmission.submissionUrl);
          }
        } catch (submissionError) {
          /*
           * Jika mahasiswa belum pernah mengumpulkan tugas,
           * submission bisa saja tidak ditemukan.
           */

          console.log(
            "Belum ada submission untuk tugas ini:",
            submissionError.message,
          );

          setSubmission(null);
          setLink("");
        }
      } catch (loadError) {
        console.error("Gagal memuat detail tugas:", loadError);

        setError(
          loadError.message || "Gagal memuat data tugas. Silakan coba lagi.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  /* =======================================================
     PDF AKTIF
  ======================================================= */

  const activePdf = files[activePdfIndex] || files[0];

  /* =======================================================
     STATUS SUBMISSION
  ======================================================= */

  const isSubmitted = Boolean(submission);

  const isGraded =
    submission?.status === "dinilai" ||
    (submission?.score !== null && submission?.score !== undefined);

  /* =======================================================
     HANDLE SUBMIT
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /*
     * ================================================
     * VALIDASI LINK
     * ================================================
     */

    if (!link.trim()) {
      setError("Silakan masukkan link hasil pekerjaanmu.");
      return;
    }

    /*
     * ================================================
     * VALIDASI URL
     * ================================================
     */

    try {
      new URL(link.trim());
    } catch {
      setError(
        "Link yang kamu masukkan belum valid. Pastikan diawali dengan https://",
      );

      return;
    }

    /*
     * ================================================
     * CEK USER
     * ================================================
     */

    const currentUser = getCurrentUser();

    if (!currentUser?.id) {
      setError("Session pengguna tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * ==============================================
       * JIKA BELUM PERNAH SUBMIT
       * ==============================================
       */

      if (!submission) {
        const newSubmission = await createAssignmentSubmission({
          assignment_id: id,
          student_id: currentUser.id,
          submission_url: link.trim(),
        });

        const normalizedSubmission = {
          ...newSubmission,

          submissionUrl:
            newSubmission.submission_url ||
            newSubmission.submissionUrl ||
            newSubmission.link ||
            link.trim(),

          status: newSubmission.status || "dikumpulkan",

          score:
            newSubmission.score !== null && newSubmission.score !== undefined
              ? newSubmission.score
              : null,
        };

        setSubmission(normalizedSubmission);
        setLink(normalizedSubmission.submissionUrl);
        setIsEditing(false);

        return;
      }

      /*
       * ==============================================
       * JIKA SUDAH ADA SUBMISSION
       * UPDATE LINK
       * ==============================================
       */

      const updatedSubmission = await updateAssignmentSubmission(
        submission.id,
        {
          submission_url: link.trim(),
        },
      );

      const normalizedSubmission = {
        ...updatedSubmission,

        submissionUrl:
          updatedSubmission.submission_url ||
          updatedSubmission.submissionUrl ||
          updatedSubmission.link ||
          link.trim(),

        status: updatedSubmission.status || submission.status || "dikumpulkan",

        score:
          updatedSubmission.score !== null &&
          updatedSubmission.score !== undefined
            ? updatedSubmission.score
            : submission.score,
      };

      setSubmission(normalizedSubmission);
      setLink(normalizedSubmission.submissionUrl);
      setIsEditing(false);
    } catch (submitError) {
      console.error("Gagal mengumpulkan tugas:", submitError);

      setError(
        submitError.message || "Gagal mengumpulkan tugas. Silakan coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     EDIT LINK
  ======================================================= */

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  /* =======================================================
     PILIH PDF
  ======================================================= */

  const handleSelectPdf = (index) => {
    setActivePdfIndex(index);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="detail-task-page">
        <Container>
          <div className="task-loading">
            <FaSpinner className="loading-spinner" />

            <h2>Memuat tugas...</h2>

            <p>Sedang mengambil informasi tugas dan dokumen pembelajaran.</p>
          </div>
        </Container>
      </div>
    );
  }

  /* =======================================================
     ERROR / TUGAS TIDAK DITEMUKAN
  ======================================================= */

  if (!tugas) {
    return (
      <div className="detail-task-page">
        <Container>
          <div className="task-not-found">
            <div className="not-found-icon">🔎</div>

            <h2>Tugas tidak ditemukan</h2>

            <p>{error || "Maaf, tugas yang kamu cari belum tersedia."}</p>

            <Button
              className="back-button"
              onClick={() => navigate("/microteaching")}
            >
              <FaArrowLeft />
              Kembali ke Microteaching
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="detail-task-page">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="detail-task-header">
        <Container>
          {/* BACK */}

          <button
            type="button"
            className="detail-back"
            onClick={() => navigate("/microteaching")}
          >
            <FaArrowLeft />
            Kembali ke Microteaching
          </button>

          {/* HEADING */}

          <div className="detail-heading">
            <div className="detail-heading-icon">{tugas.icon}</div>

            <div className="detail-heading-text">
              <span className="detail-label">TUGAS MICROTEACHING</span>

              <h1>{tugas.title}</h1>

              <p>Pelajari petunjuk tugas dengan teliti sebelum mengerjakan.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <section className="detail-task-content">
        <Container>
          <div className="detail-layout">
            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <main className="detail-main">
              {/* ===============================================
                  PDF SECTION
              =============================================== */}

              <section className="pdf-section">
                {/* HEADER */}

                <div className="pdf-header">
                  <div className="pdf-title">
                    <div className="pdf-title-icon">
                      <FaFilePdf />
                    </div>

                    <div>
                      <h2>Dokumen Tugas</h2>

                      <span>Pilih dokumen yang ingin kamu baca</span>
                    </div>
                  </div>

                  {activePdf?.file && (
                    <a
                      href={activePdf.file}
                      target="_blank"
                      rel="noreferrer"
                      className="open-pdf"
                    >
                      Buka PDF
                      <FaExternalLinkAlt />
                    </a>
                  )}
                </div>

                {/* =========================================
                    PDF NAVIGATION
                ========================================= */}

                {files.length > 0 && (
                  <div className="pdf-document-list">
                    {files.map((pdf, index) => {
                      const isActive = index === activePdfIndex;

                      return (
                        <button
                          type="button"
                          key={pdf.id || `${pdf.file}-${index}`}
                          className={`pdf-document-item ${
                            isActive ? "active" : ""
                          }`}
                          onClick={() => handleSelectPdf(index)}
                        >
                          <div className="pdf-document-icon">
                            <FaFilePdf />
                          </div>

                          <div className="pdf-document-info">
                            <strong>{pdf.title}</strong>

                            <span>{pdf.description || "Dokumen tugas"}</span>
                          </div>

                          <FaChevronRight className="pdf-document-arrow" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* =========================================
                    ACTIVE PDF INFO
                ========================================= */}

                {activePdf && (
                  <div className="active-pdf-info">
                    <div>
                      <FaFilePdf />

                      <div>
                        <strong>{activePdf.title}</strong>

                        <span>
                          Dokumen {activePdfIndex + 1} dari {files.length}
                        </span>
                      </div>
                    </div>

                    {activePdf.file && (
                      <a href={activePdf.file} target="_blank" rel="noreferrer">
                        Buka di tab baru
                        <FaExternalLinkAlt />
                      </a>
                    )}
                  </div>
                )}

                {/* =========================================
                    PDF VIEWER
                ========================================= */}

                <div className="pdf-viewer">
                  {activePdf?.file ? (
                    <iframe
                      src={activePdf.file}
                      title={activePdf.title || tugas.title}
                    />
                  ) : (
                    <div className="pdf-empty">
                      <FaFilePdf />

                      <h3>Dokumen belum tersedia</h3>

                      <p>File tugas belum tersedia untuk dibaca.</p>
                    </div>
                  )}
                </div>

                {/* NOTE */}

                <div className="pdf-note">
                  <FaFilePdf />

                  <span>
                    Jika PDF tidak muncul, tekan <strong>"Buka PDF"</strong>{" "}
                    untuk melihat dokumen di tab baru.
                  </span>
                </div>
              </section>
            </main>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <aside className="task-information">
              {/* ===============================================
                  TASK INFO
              =============================================== */}

              <div className="info-card">
                <div className="info-card-title">
                  <FaBookOpen />

                  <span>Informasi Tugas</span>
                </div>

                {/* DESKRIPSI / PETUNJUK TUGAS */}

                <div className="info-item info-description">
                  <span>Petunjuk Tugas</span>

                  <strong>
                    {tugas.description || "Belum ada deskripsi tugas."}
                  </strong>
                </div>

                {/* BATAS PENGUMPULAN */}

                <div className="info-item">
                  <span>Batas Pengumpulan</span>

                  <strong className="deadline">
                    <FaCalendarAlt />

                    {formatDeadline(tugas.deadline)}
                  </strong>
                </div>

                {/* JUMLAH DOKUMEN */}

                <div className="info-pdf-count">
                  <FaFolderOpen />

                  <span>{files.length} dokumen tersedia</span>
                </div>
              </div>

              {/* ===============================================
                  SUBMISSION
              =============================================== */}

              <div className="submission-card">
                {!isSubmitted || isEditing ? (
                  <>
                    <div className="submission-heading">
                      <div className="submission-icon">
                        <FaLink />
                      </div>

                      <div>
                        <h2>
                          {isEditing ? "Edit Pengumpulan" : "Kumpulkan Tugas"}
                        </h2>

                        <p>Masukkan link hasil pekerjaanmu.</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="submission-form">
                      <label htmlFor="task-link">Link Hasil Pekerjaan</label>

                      <div
                        className={`link-input ${error ? "input-error" : ""}`}
                      >
                        <FaLink />

                        <input
                          id="task-link"
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={link}
                          onChange={(event) => setLink(event.target.value)}
                        />
                      </div>

                      {error && (
                        <div className="form-error">
                          <FaExclamationCircle />

                          {error}
                        </div>
                      )}

                      <p className="link-hint">
                        💡 Kamu bisa menggunakan Google Drive, YouTube, Canva,
                        atau platform lain sesuai petunjuk tugas.
                      </p>

                      <button
                        type="submit"
                        className="submit-task-button"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <FaSpinner className="loading-spinner-small" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane />
                            {isEditing ? "Simpan Perubahan" : "Kumpulkan Tugas"}
                          </>
                        )}
                      </button>

                      {isEditing && (
                        <button
                          type="button"
                          className="edit-link-button"
                          onClick={() => {
                            setIsEditing(false);
                            setError("");
                            setLink(submission?.submissionUrl || "");
                          }}
                        >
                          Batal
                        </button>
                      )}
                    </form>
                  </>
                ) : (
                  /* =========================================
                     SUCCESS
                  ========================================= */

                  <div className="submission-success">
                    <div className="success-icon">
                      <FaCheckCircle />
                    </div>

                    <span className="success-label">
                      {isGraded
                        ? "TUGAS SUDAH DINILAI"
                        : "BERHASIL DIKUMPULKAN"}
                    </span>

                    <h2>
                      {isGraded
                        ? "Tugas Sudah Dinilai! 🎉"
                        : "Tugas Berhasil Dikumpulkan! 🎉"}
                    </h2>

                    <p>
                      {isGraded
                        ? "Dosen sudah memberikan nilai untuk tugasmu."
                        : "Link pekerjaanmu sudah tersimpan."}
                    </p>

                    {/* LINK */}

                    <div className="submitted-link">
                      <FaLink />

                      <span>{link}</span>
                    </div>

                    {/* STATUS */}

                    <div className="success-status">
                      <FaCheckCircle />

                      {isGraded
                        ? "Tugas telah dinilai oleh dosen"
                        : "Menunggu penilaian dosen"}
                    </div>

                    {/* NILAI */}

                    {isGraded && (
                      <div className="submission-score">
                        <div className="score-icon">
                          <FaStar />
                        </div>

                        <div className="score-content">
                          <span className="score-label">NILAI TUGAS</span>

                          <div className="score-number">
                            <strong>{submission.score}</strong>

                            <span>/100</span>
                          </div>

                          <small>Nilai yang diberikan oleh dosen</small>
                        </div>
                      </div>
                    )}

                    {/* ACTION */}

                    <div className="success-actions">
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="view-link-button"
                      >
                        Lihat Hasil
                        <FaExternalLinkAlt />
                      </a>

                      {!isGraded && (
                        <button
                          type="button"
                          className="edit-link-button"
                          onClick={handleEdit}
                        >
                          Edit Link
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default DetailTugas;
