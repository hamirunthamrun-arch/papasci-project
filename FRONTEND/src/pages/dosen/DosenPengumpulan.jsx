import { useMemo, useState } from "react";
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
} from "react-icons/fa";

import "../../css/dosen/DosenPengumpulan.css";

/* =========================================================
   DATA DUMMY PENGUMPULAN
========================================================= */

const initialSubmissions = [
  {
    id: 1,
    studentName: "Andi Saputra",
    nim: "20240001",
    submittedAt: "2026-10-12T09:30:00",
    submissionUrl: "https://drive.google.com/drive/folders/contoh-andi",
    score: 90,
    status: "Sudah Dinilai",
  },

  {
    id: 2,
    studentName: "Budi Pratama",
    nim: "20240002",
    submittedAt: "2026-10-13T10:15:00",
    submissionUrl: "https://drive.google.com/drive/folders/contoh-budi",
    score: null,
    status: "Belum Dinilai",
  },

  {
    id: 3,
    studentName: "Citra Lestari",
    nim: "20240003",
    submittedAt: "2026-10-19T14:20:00",
    submissionUrl: "https://drive.google.com/drive/folders/contoh-citra",
    score: 88,
    status: "Sudah Dinilai",
  },

  {
    id: 4,
    studentName: "Dina Wulandari",
    nim: "20240004",
    submittedAt: "2026-10-20T08:45:00",
    submissionUrl: "https://drive.google.com/drive/folders/contoh-dina",
    score: null,
    status: "Belum Dinilai",
  },

  {
    id: 5,
    studentName: "Eka Putri",
    nim: "20240005",
    submittedAt: "2026-10-27T11:10:00",
    submissionUrl: "https://drive.google.com/drive/folders/contoh-eka",
    score: 92,
    status: "Sudah Dinilai",
  },

  {
    id: 6,
    studentName: "Fajar Ramadhan",
    nim: "20240006",
    submittedAt: "2026-10-28T15:30:00",
    submissionUrl: "https://drive.google.com/drive/folders/contoh-fajar",
    score: null,
    status: "Belum Dinilai",
  },
];

/* =========================================================
   FORMAT TANGGAL
========================================================= */

const formatDateTime = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

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

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenPengumpulan() {
  const [submissions, setSubmissions] = useState(initialSubmissions);

  const [searchTerm, setSearchTerm] = useState("");

  const [showGradeModal, setShowGradeModal] = useState(false);

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [gradeData, setGradeData] = useState({
    score: "",
  });

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredSubmissions = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return submissions.filter((submission) => {
      return (
        submission.studentName.toLowerCase().includes(keyword) ||
        submission.nim.toLowerCase().includes(keyword)
      );
    });
  }, [submissions, searchTerm]);

  /* =======================================================
     STATISTIK
  ======================================================= */

  const totalSubmissions = submissions.length;

  const totalGraded = submissions.filter(
    (submission) => submission.status === "Sudah Dinilai",
  ).length;

  const totalWaiting = submissions.filter(
    (submission) => submission.status === "Belum Dinilai",
  ).length;

  /* =======================================================
     BUKA MODAL PENILAIAN
  ======================================================= */

  const handleOpenGrade = (submission) => {
    setSelectedSubmission(submission);

    setGradeData({
      score: submission.score !== null ? submission.score : "",
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

  const handleSaveGrade = (event) => {
    event.preventDefault();

    if (!selectedSubmission) return;

    const numericScore = Number(gradeData.score);

    /* -------------------------------------------------------
       VALIDASI
    ------------------------------------------------------- */

    if (gradeData.score === "" || Number.isNaN(numericScore)) {
      alert("Nilai wajib diisi.");

      return;
    }

    if (numericScore < 0 || numericScore > 100) {
      alert("Nilai harus berada antara 0 sampai 100.");

      return;
    }

    /* -------------------------------------------------------
       UPDATE NILAI
    ------------------------------------------------------- */

    setSubmissions((previous) =>
      previous.map((submission) =>
        submission.id === selectedSubmission.id
          ? {
              ...submission,
              score: numericScore,
              status: "Sudah Dinilai",
            }
          : submission,
      ),
    );

    alert("Nilai berhasil disimpan.");

    closeGradeModal();
  };

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const closeGradeModal = () => {
    setShowGradeModal(false);

    setSelectedSubmission(null);

    setGradeData({
      score: "",
    });
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
            <h1>Pengumpulan Tugas</h1>

            <p>
              Periksa pengumpulan tugas dan berikan penilaian kepada mahasiswa.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="dosen-submission-stats">
        {/* TOTAL */}

        <div className="dosen-submission-stat-card">
          <div className="dosen-submission-stat-icon blue">
            <FaClipboardList />
          </div>

          <div>
            <span>Total Pengumpulan</span>

            <strong>{totalSubmissions}</strong>
          </div>
        </div>

        {/* SUDAH DINILAI */}

        <div className="dosen-submission-stat-card">
          <div className="dosen-submission-stat-icon green">
            <FaCheckCircle />
          </div>

          <div>
            <span>Sudah Dinilai</span>

            <strong>{totalGraded}</strong>
          </div>
        </div>

        {/* BELUM DINILAI */}

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
              Data pengumpulan tugas mahasiswa yang perlu diperiksa dan dinilai.
            </p>
          </div>
        </div>

        {filteredSubmissions.length > 0 ? (
          <div className="dosen-submission-table-wrapper">
            <table className="dosen-submission-table">
              <thead>
                <tr>
                  <th>Mahasiswa</th>
                  <th>Dikumpulkan</th>
                  <th>Status</th>
                  <th>Nilai</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    {/* MAHASISWA */}

                    <td>
                      <div className="dosen-submission-student">
                        <div className="dosen-submission-avatar">
                          {submission.studentName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{submission.studentName}</strong>

                          <span>NIM: {submission.nim}</span>
                        </div>
                      </div>
                    </td>

                    {/* TANGGAL */}

                    <td>
                      <div className="dosen-submission-date">
                        <span>{formatDateTime(submission.submittedAt)}</span>

                        <small>{formatTime(submission.submittedAt)} WIT</small>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`dosen-submission-status ${
                          submission.status === "Sudah Dinilai"
                            ? "graded"
                            : "waiting"
                        }`}
                      >
                        {submission.status === "Sudah Dinilai" ? (
                          <FaCheckCircle />
                        ) : (
                          <FaClock />
                        )}

                        {submission.status}
                      </span>
                    </td>

                    {/* NILAI */}

                    <td>
                      {submission.score !== null ? (
                        <div className="dosen-submission-score">
                          <FaStar />

                          <strong>{submission.score}</strong>
                        </div>
                      ) : (
                        <span className="dosen-submission-no-score">
                          Belum dinilai
                        </span>
                      )}
                    </td>

                    {/* AKSI */}

                    <td>
                      <div className="dosen-submission-actions">
                        {/* BUKA SUBMISSION */}

                        <a
                          href={submission.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="dosen-submission-link-btn"
                        >
                          <FaExternalLinkAlt />
                          Buka
                        </a>

                        {/* NILAI */}

                        <button
                          type="button"
                          className="dosen-submission-grade-btn"
                          onClick={() => handleOpenGrade(submission)}
                        >
                          <FaEdit />

                          {submission.score !== null ? "Edit Nilai" : "Nilai"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dosen-submission-empty">
            <FaUpload />

            <h3>Pengumpulan tidak ditemukan</h3>

            <p>
              Tidak ada data mahasiswa yang sesuai dengan pencarian "
              {searchTerm}".
            </p>

            <button type="button" onClick={() => setSearchTerm("")}>
              Reset Pencarian
            </button>
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
          <div className="dosen-submission-grade-modal">
            {/* HEADER */}

            <div className="dosen-submission-modal-header">
              <div>
                <span>PENILAIAN TUGAS</span>

                <h2>{selectedSubmission.studentName}</h2>
              </div>

              <button
                type="button"
                className="dosen-submission-close-btn"
                onClick={closeGradeModal}
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
                  {selectedSubmission.studentName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{selectedSubmission.studentName}</strong>

                  <span>NIM: {selectedSubmission.nim}</span>
                </div>
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
                    value={gradeData.score}
                    onChange={handleGradeChange}
                    placeholder="0 - 100"
                  />

                  <span>/ 100</span>
                </div>
              </div>

              {/* FOOTER */}

              <div className="dosen-submission-grade-footer">
                <button
                  type="button"
                  className="dosen-submission-cancel-btn"
                  onClick={closeGradeModal}
                >
                  Batal
                </button>

                <button type="submit" className="dosen-submission-save-btn">
                  <FaSave />
                  Simpan Penilaian
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
