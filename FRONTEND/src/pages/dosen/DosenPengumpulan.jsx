import { useEffect, useMemo, useState } from "react";
import {
  FaUpload,
  FaSearch,
  FaExternalLinkAlt,
  FaStar,
  FaEdit,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaSave,
  FaClipboardList,
  FaChevronDown,
} from "react-icons/fa";

import { getAssignments } from "../../service/assignmentService";
import {
  getSubmissionsByAssignment,
  updateAssignmentSubmission,
} from "../../service/assignmentSubmissionService";

import "../../css/dosen/DosenPengumpulan.css";

/* =========================================================
   FORMAT TANGGAL
========================================================= */

const formatDateTime = (dateString) => {
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
   FORMAT JAM
========================================================= */

const formatTime = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "-";

  return `${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} WIT`;
};

/* =========================================================
   NORMALISASI STATUS PENILAIAN
========================================================= */

const isGraded = (submission) => {
  const hasScore =
    submission.score !== null &&
    submission.score !== undefined &&
    submission.score !== "";

  return submission.status === "dinilai" || hasScore;
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenPengumpulan() {
  /* =======================================================
     STATE ASSIGNMENT
  ======================================================= */

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");

  /* =======================================================
     STATE SUBMISSION
  ======================================================= */

  const [submissions, setSubmissions] = useState([]);

  /* =======================================================
     STATE UI
  ======================================================= */

  const [searchTerm, setSearchTerm] = useState("");

  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     STATE MODAL
  ======================================================= */

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [gradeData, setGradeData] = useState({
    score: "",
  });

  /* =======================================================
     AMBIL DAFTAR TUGAS
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const loadAssignments = async () => {
      try {
        setLoadingAssignments(true);
        setError("");

        const data = await getAssignments();

        if (!isMounted) return;

        const assignmentList = Array.isArray(data) ? data : [];

        setAssignments(assignmentList);

        if (assignmentList.length > 0) {
          setSelectedAssignmentId(String(assignmentList[0].id));
        } else {
          setSelectedAssignmentId("");
        }
      } catch (err) {
        console.error("Get assignments error:", err);

        if (isMounted) {
          setAssignments([]);
          setSelectedAssignmentId("");
          setError(err.message || "Gagal mengambil daftar tugas.");
        }
      } finally {
        if (isMounted) {
          setLoadingAssignments(false);
        }
      }
    };

    loadAssignments();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     AMBIL SUBMISSION BERDASARKAN TUGAS
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const loadSubmissions = async () => {
      if (!selectedAssignmentId) {
        setSubmissions([]);
        setLoadingSubmissions(false);
        return;
      }

      try {
        setLoadingSubmissions(true);
        setError("");
        setSubmissions([]);

        const data = await getSubmissionsByAssignment(selectedAssignmentId);

        if (!isMounted) return;

        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Get submissions error:", err);

        if (isMounted) {
          setSubmissions([]);
          setError(err.message || "Gagal mengambil pengumpulan tugas.");
        }
      } finally {
        if (isMounted) {
          setLoadingSubmissions(false);
        }
      }
    };

    loadSubmissions();

    return () => {
      isMounted = false;
    };
  }, [selectedAssignmentId]);

  /* =======================================================
     TUGAS TERPILIH
  ======================================================= */

  const selectedAssignment = useMemo(() => {
    return assignments.find(
      (assignment) => String(assignment.id) === String(selectedAssignmentId),
    );
  }, [assignments, selectedAssignmentId]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredSubmissions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return submissions;
    }

    return submissions.filter((submission) => {
      const studentName = String(
        submission.student_name || submission.studentName || "",
      ).toLowerCase();

      const studentNim = String(
        submission.student_nim || submission.nim || "",
      ).toLowerCase();

      const studentId = String(submission.student_id || "").toLowerCase();

      return (
        studentName.includes(keyword) ||
        studentNim.includes(keyword) ||
        studentId.includes(keyword)
      );
    });
  }, [submissions, searchTerm]);

  /* =======================================================
     STATISTIK
  ======================================================= */

  const totalSubmissions = submissions.length;

  const totalGraded = submissions.filter((submission) =>
    isGraded(submission),
  ).length;

  const totalWaiting = totalSubmissions - totalGraded;

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const closeGradeModal = () => {
    if (savingGrade) return;

    setShowGradeModal(false);
    setSelectedSubmission(null);

    setGradeData({
      score: "",
    });
  };

  /* =======================================================
     GANTI TUGAS
  ======================================================= */

  const handleAssignmentChange = (event) => {
    setSelectedAssignmentId(event.target.value);
    setSearchTerm("");
    setError("");

    setShowGradeModal(false);
    setSelectedSubmission(null);

    setGradeData({
      score: "",
    });
  };

  /* =======================================================
     BUKA MODAL PENILAIAN
  ======================================================= */

  const handleOpenGrade = (submission) => {
    setSelectedSubmission(submission);

    setGradeData({
      score:
        submission.score !== null && submission.score !== undefined
          ? String(submission.score)
          : "",
    });

    setShowGradeModal(true);
  };

  /* =======================================================
     INPUT NILAI
  ======================================================= */

  const handleGradeChange = (event) => {
    const { name, value } = event.target;

    setGradeData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     SIMPAN NILAI
  ======================================================= */

  const handleSaveGrade = async (event) => {
    event.preventDefault();

    if (!selectedSubmission) return;

    if (gradeData.score === "" || gradeData.score.trim() === "") {
      alert("Nilai wajib diisi.");
      return;
    }

    const numericScore = Number(gradeData.score);

    if (
      !Number.isFinite(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      alert("Nilai harus berada antara 0 sampai 100.");
      return;
    }

    try {
      setSavingGrade(true);
      setError("");

      /* ===============================================
         UPDATE MELALUI SERVICE
      =============================================== */

      const updatedSubmission = await updateAssignmentSubmission(
        selectedSubmission.id,
        {
          score: numericScore,
          status: "dinilai",
        },
      );

      /* ===============================================
         UPDATE DATA TABEL TANPA RELOAD
      =============================================== */

      setSubmissions((previous) =>
        previous.map((submission) =>
          String(submission.id) === String(selectedSubmission.id)
            ? {
                ...submission,
                ...(updatedSubmission || {}),
                score: numericScore,
                status: "dinilai",
              }
            : submission,
        ),
      );

      alert("Nilai berhasil disimpan.");

      setShowGradeModal(false);
      setSelectedSubmission(null);

      setGradeData({
        score: "",
      });
    } catch (err) {
      console.error("Save grade error:", err);

      alert(err.message || "Gagal menyimpan nilai.");
    } finally {
      setSavingGrade(false);
    }
  };

  /* =======================================================
     DATA MAHASISWA
  ======================================================= */

  const getStudentName = (submission) => {
    return submission.student_name || submission.studentName || "Mahasiswa";
  };

  const getStudentNim = (submission) => {
    return (
      submission.student_nim || submission.nim || submission.student_id || "-"
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-submission-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dosen-submission-header">
        <div className="dosen-submission-title">
          <div className="dosen-submission-title-icon">
            <FaUpload />
          </div>

          <div>
            <span className="dosen-submission-eyebrow">MICROTEACHING</span>

            <h1>Pengumpulan Tugas</h1>

            <p>
              Lihat pengumpulan mahasiswa dan berikan nilai untuk tugas yang
              telah dikumpulkan.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          PILIH TUGAS
      ================================================= */}

      <div className="dosen-submission-assignment-section">
        <div className="dosen-submission-assignment-label">
          <FaClipboardList />

          <div>
            <span>Pilih Tugas</span>

            <small>Pilih tugas untuk melihat pengumpulan mahasiswa.</small>
          </div>
        </div>

        <div className="dosen-submission-select-wrapper">
          <select
            value={selectedAssignmentId}
            onChange={handleAssignmentChange}
            disabled={loadingAssignments || assignments.length === 0}
          >
            {loadingAssignments ? (
              <option value="">Memuat daftar tugas...</option>
            ) : assignments.length === 0 ? (
              <option value="">Belum ada tugas</option>
            ) : (
              assignments.map((assignment) => (
                <option key={assignment.id} value={String(assignment.id)}>
                  {assignment.title || assignment.judul || "Tugas Tanpa Judul"}
                </option>
              ))
            )}
          </select>

          <FaChevronDown />
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="dosen-submission-error" role="alert">
          <strong>Terjadi kesalahan</strong>
          <span>{error}</span>
        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="dosen-submission-stats">
        <div className="dosen-submission-stat-card">
          <div className="dosen-submission-stat-icon blue">
            <FaClipboardList />
          </div>

          <div>
            <span>Total Pengumpulan</span>
            <strong>{totalSubmissions}</strong>
          </div>
        </div>

        <div className="dosen-submission-stat-card">
          <div className="dosen-submission-stat-icon green">
            <FaCheckCircle />
          </div>

          <div>
            <span>Sudah Dinilai</span>
            <strong>{totalGraded}</strong>
          </div>
        </div>

        <div className="dosen-submission-stat-card">
          <div className="dosen-submission-stat-icon orange">
            <FaClock />
          </div>

          <div>
            <span>Belum Dinilai</span>
            <strong>{totalWaiting}</strong>
          </div>
        </div>
      </div>

      {/* =================================================
          ASSIGNMENT INFO
      ================================================= */}

      {selectedAssignment && (
        <div className="dosen-submission-selected-task">
          <div>
            <span>TUGAS YANG DIPILIH</span>

            <h2>
              {selectedAssignment.title ||
                selectedAssignment.judul ||
                "Tugas Tanpa Judul"}
            </h2>
          </div>

          <div className="dosen-submission-selected-count">
            <strong>{totalSubmissions}</strong>
            <span>mahasiswa mengumpulkan</span>
          </div>
        </div>
      )}

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="dosen-submission-toolbar">
        <div className="dosen-submission-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari nama mahasiswa atau NIM..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            disabled={loadingSubmissions}
          />

          {searchTerm && (
            <button
              type="button"
              className="dosen-submission-search-clear"
              onClick={() => setSearchTerm("")}
              aria-label="Hapus pencarian"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <span className="dosen-submission-total">
          {filteredSubmissions.length} Pengumpulan
        </span>
      </div>

      {/* =================================================
          SUBMISSION LIST
      ================================================= */}

      <div className="dosen-submission-content">
        <div className="dosen-submission-list-header">
          <div>
            <h2>Daftar Pengumpulan</h2>

            <p>
              Mahasiswa yang sudah mengumpulkan tugas
              {selectedAssignment
                ? ` "${
                    selectedAssignment.title ||
                    selectedAssignment.judul ||
                    "Tugas Tanpa Judul"
                  }".`
                : "."}
            </p>
          </div>
        </div>

        {/* LOADING */}

        {loadingAssignments || loadingSubmissions ? (
          <div className="dosen-submission-loading">
            <div className="dosen-submission-spinner" />

            <h3>Memuat pengumpulan...</h3>

            <p>Sedang mengambil data pengumpulan mahasiswa.</p>
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <div className="dosen-submission-table-wrapper">
            <table className="dosen-submission-table">
              <thead>
                <tr>
                  <th>Mahasiswa</th>
                  <th>Dikumpulkan</th>
                  <th>Link Tugas</th>
                  <th>Status</th>
                  <th>Nilai</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubmissions.map((submission) => {
                  const studentName = getStudentName(submission);

                  const studentNim = getStudentNim(submission);

                  const graded = isGraded(submission);

                  return (
                    <tr key={submission.id}>
                      {/* MAHASISWA */}

                      <td>
                        <div className="dosen-submission-student">
                          <div className="dosen-submission-avatar">
                            {studentName.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{studentName}</strong>
                            <span>NIM: {studentNim}</span>
                          </div>
                        </div>
                      </td>

                      {/* WAKTU */}

                      <td>
                        <div className="dosen-submission-date">
                          <span>{formatDateTime(submission.submitted_at)}</span>

                          <small>{formatTime(submission.submitted_at)}</small>
                        </div>
                      </td>

                      {/* LINK TUGAS */}

                      <td>
                        {submission.submission_url ? (
                          <a
                            href={submission.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dosen-submission-link-btn"
                          >
                            <FaExternalLinkAlt />
                            <span>Buka Tugas</span>
                          </a>
                        ) : (
                          <span className="dosen-submission-no-score">
                            Link tidak tersedia
                          </span>
                        )}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`dosen-submission-status ${
                            graded ? "graded" : "waiting"
                          }`}
                        >
                          {graded ? <FaCheckCircle /> : <FaClock />}

                          {graded ? "Dinilai" : "Belum Dinilai"}
                        </span>
                      </td>

                      {/* NILAI */}

                      <td>
                        {submission.score !== null &&
                        submission.score !== undefined &&
                        submission.score !== "" ? (
                          <div className="dosen-submission-score">
                            <FaStar />

                            <strong>{submission.score}</strong>

                            <span>/100</span>
                          </div>
                        ) : (
                          <span className="dosen-submission-no-score">—</span>
                        )}
                      </td>

                      {/* AKSI */}

                      <td>
                        <button
                          type="button"
                          className="dosen-submission-grade-btn"
                          onClick={() => handleOpenGrade(submission)}
                          disabled={savingGrade}
                        >
                          <FaEdit />

                          {graded ? "Edit Nilai" : "Nilai"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dosen-submission-empty">
            <div className="dosen-submission-empty-icon">
              <FaUpload />
            </div>

            <h3>
              {searchTerm
                ? "Pengumpulan tidak ditemukan"
                : "Belum ada pengumpulan"}
            </h3>

            <p>
              {searchTerm
                ? `Tidak ada mahasiswa yang sesuai dengan pencarian "${searchTerm}".`
                : error
                  ? "Data pengumpulan gagal dimuat. Periksa pesan kesalahan di atas."
                  : "Belum ada mahasiswa yang mengumpulkan tugas ini."}
            </p>

            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")}>
                Reset Pencarian
              </button>
            )}
          </div>
        )}
      </div>

      {/* =================================================
          MODAL PENILAIAN
      ================================================= */}

      {showGradeModal && selectedSubmission && (
        <div
          className="dosen-submission-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeGradeModal();
            }
          }}
        >
          <div
            className="dosen-submission-grade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dosen-grade-modal-title"
          >
            {/* HEADER */}

            <div className="dosen-submission-modal-header">
              <div>
                <span>PENILAIAN TUGAS</span>

                <h2 id="dosen-grade-modal-title">
                  {getStudentName(selectedSubmission)}
                </h2>
              </div>

              <button
                type="button"
                className="dosen-submission-close-btn"
                onClick={closeGradeModal}
                disabled={savingGrade}
                aria-label="Tutup"
              >
                <FaTimes />
              </button>
            </div>

            {/* FORM */}

            <form
              className="dosen-submission-grade-form"
              onSubmit={handleSaveGrade}
            >
              {/* DATA MAHASISWA */}

              <div className="dosen-submission-grade-info">
                <div className="dosen-submission-avatar large">
                  {getStudentName(selectedSubmission).charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{getStudentName(selectedSubmission)}</strong>

                  <span>NIM: {getStudentNim(selectedSubmission)}</span>
                </div>
              </div>

              {/* LINK TUGAS */}

              <div className="dosen-submission-modal-task">
                <div>
                  <span>HASIL TUGAS</span>
                  <strong>Tugas yang dikumpulkan</strong>
                </div>

                {selectedSubmission.submission_url ? (
                  <a
                    href={selectedSubmission.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaExternalLinkAlt />
                    Buka Hasil Tugas
                  </a>
                ) : (
                  <span>Link tugas tidak tersedia</span>
                )}
              </div>

              {/* NILAI */}

              <div className="dosen-submission-form-group score">
                <label htmlFor="submission-score">
                  Nilai
                  <span>*</span>
                </label>

                <div className="dosen-submission-score-input">
                  <FaStar />

                  <input
                    id="submission-score"
                    type="number"
                    name="score"
                    min="0"
                    max="100"
                    step="0.01"
                    value={gradeData.score}
                    onChange={handleGradeChange}
                    placeholder="0 - 100"
                    required
                    autoFocus
                    disabled={savingGrade}
                  />

                  <span>/ 100</span>
                </div>

                <small>Masukkan nilai antara 0 sampai 100.</small>
              </div>

              {/* FOOTER */}

              <div className="dosen-submission-grade-footer">
                <button
                  type="button"
                  className="dosen-submission-cancel-btn"
                  onClick={closeGradeModal}
                  disabled={savingGrade}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-submission-save-btn"
                  disabled={savingGrade}
                >
                  <FaSave />

                  {savingGrade ? "Menyimpan..." : "Simpan Nilai"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenPengumpulan;
