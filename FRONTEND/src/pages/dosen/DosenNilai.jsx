import { useEffect, useMemo, useState } from "react";
import {
  FaBookOpen,
  FaClipboardList,
  FaGraduationCap,
  FaSearch,
  FaTasks,
  FaTimes,
  FaTrophy,
  FaUserGraduate,
} from "react-icons/fa";

import "../../css/dosen/DosenNilai.css";

import { getAllPretestResults } from "../../service/pretestResultService";
import { getAllQuizResults } from "../../service/quizResultService";
import { getModules } from "../../service/moduleService";
import { getAssignments } from "../../service/assignmentService";
import { getSubmissionsByAssignment } from "../../service/assignmentSubmissionService";

/* =========================================================
   NORMALIZE MODULE
========================================================= */

const normalizeModule = (module) => ({
  id: module.id,
  title: module.title || "Module Tanpa Judul",
  order_number: Number(module.order_number ?? 0),
});

/* =========================================================
   NORMALIZE TUGAS
========================================================= */

const normalizeAssignment = (assignment) => ({
  id: assignment.id,
  title: assignment.title || "Tugas Tanpa Judul",
});

/* =========================================================
   GABUNGKAN DATA NILAI DAN STATUS TUGAS
========================================================= */

const buildStudentData = ({
  students,
  modules,
  assignments,
  pretestResults,
  quizResults,
  submissions,
}) => {
  return students.map((student) => {
    /* =====================================================
       NILAI PRETEST
    ===================================================== */

    const studentPretests = pretestResults.filter(
      (result) => result.student_id === student.id,
    );

    /* =====================================================
       NILAI QUIZ
    ===================================================== */

    const studentQuizzes = quizResults.filter(
      (result) => result.student_id === student.id,
    );

    /* =====================================================
       NILAI SETIAP MODULE
    ===================================================== */

    const moduleScores = modules.map((module) => {
      const modulePretests = studentPretests.filter(
        (result) =>
          result.pretests?.module_id === module.id ||
          result.module_id === module.id,
      );

      const moduleQuizzes = studentQuizzes.filter(
        (result) => result.module_id === module.id,
      );

      // Ambil hasil pretest terbaru.
      const latestPretest =
        modulePretests.length > 0
          ? [...modulePretests].sort(
              (a, b) =>
                new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0),
            )[0]
          : null;

      // Ambil percobaan terakhir untuk setiap quiz.
      const quizMap = new Map();

      moduleQuizzes.forEach((result) => {
        const existing = quizMap.get(result.quiz_id);

        if (
          !existing ||
          new Date(result.submitted_at || 0) >
            new Date(existing.submitted_at || 0)
        ) {
          quizMap.set(result.quiz_id, result);
        }
      });

      const latestQuizResults = Array.from(quizMap.values());

      // Jika ada beberapa quiz dalam satu module,
      // tampilkan nilai quiz dengan waktu pengumpulan terbaru.
      const latestQuiz =
        latestQuizResults.length > 0
          ? [...latestQuizResults].sort(
              (a, b) =>
                new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0),
            )[0]
          : null;

      return {
        moduleId: module.id,
        moduleName: module.title,
        pretest: latestPretest?.score ?? null,
        quiz: latestQuiz?.score ?? null,
      };
    });

    /* =====================================================
       STATUS DAN NILAI TUGAS
    ===================================================== */

    const taskScores = assignments.map((assignment) => {
      const submission = submissions.find(
        (item) =>
          item.assignment_id === assignment.id &&
          item.student_id === student.id,
      );

      // Periksa apakah mahasiswa sudah mengumpulkan tugas.
      const isSubmitted = Boolean(submission);

      // Status tugas berdasarkan data submission.
      let status = "belum_dikumpulkan";

      if (isSubmitted) {
        status = submission.status === "dinilai" ? "dinilai" : "dikumpulkan";
      }

      return {
        taskId: assignment.id,
        taskTitle: assignment.title,
        isSubmitted,
        status,

        // Nilai hanya tersedia setelah dosen memberikan nilai.
        score:
          submission?.score !== null && submission?.score !== undefined
            ? submission.score
            : null,

        submittedAt: submission?.submitted_at ?? null,
        submissionUrl: submission?.submission_url ?? null,
      };
    });

    return {
      id: student.id,
      name: student.nama_lengkap || "Nama tidak tersedia",
      nim: student.nim || "-",
      moduleScores,
      taskScores,
    };
  });
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenNilai() {
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [pretestResults, setPretestResults] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     AMBIL SEMUA DATA
  ======================================================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [moduleData, assignmentData, pretestData, quizData] =
          await Promise.all([
            getModules(),
            getAssignments(),
            getAllPretestResults(),
            getAllQuizResults(),
          ]);

        /* ===============================================
           NORMALISASI MODULE
        =============================================== */

        const normalizedModules = (Array.isArray(moduleData) ? moduleData : [])
          .filter(
            (module) =>
              module.status === "publik" ||
              module.is_published === true ||
              module.status === undefined,
          )
          .map(normalizeModule)
          .sort((a, b) => a.order_number - b.order_number);

        /* ===============================================
           NORMALISASI TUGAS
        =============================================== */

        const normalizedAssignments = (
          Array.isArray(assignmentData) ? assignmentData : []
        ).map(normalizeAssignment);

        const normalizedPretests = Array.isArray(pretestData)
          ? pretestData
          : [];

        const normalizedQuizzes = Array.isArray(quizData) ? quizData : [];

        /* ===============================================
           KUMPULKAN DATA MAHASISWA
        =============================================== */

        const studentMap = new Map();

        // Mahasiswa yang memiliki hasil pretest.
        normalizedPretests.forEach((result) => {
          if (!result.student_id) return;

          const profile = result.profiles || {};

          if (!studentMap.has(result.student_id)) {
            studentMap.set(result.student_id, {
              id: result.student_id,
              nama_lengkap:
                profile.nama_lengkap ||
                result.nama_lengkap ||
                "Nama tidak tersedia",
              nim: profile.nim || result.nim || "-",
            });
          }
        });

        // Mahasiswa yang memiliki hasil quiz.
        normalizedQuizzes.forEach((result) => {
          if (!result.student_id) return;

          if (!studentMap.has(result.student_id)) {
            studentMap.set(result.student_id, {
              id: result.student_id,
              nama_lengkap: result.nama_lengkap || "Nama tidak tersedia",
              nim: result.nim || "-",
            });
          }
        });

        /* ===============================================
           AMBIL SEMUA PENGUMPULAN TUGAS
        =============================================== */

        const submissionResults = await Promise.all(
          normalizedAssignments.map(async (assignment) => {
            try {
              const data = await getSubmissionsByAssignment(assignment.id);

              return Array.isArray(data) ? data : [];
            } catch (submissionError) {
              console.error(
                `Gagal mengambil submission tugas ${assignment.id}:`,
                submissionError,
              );

              // Jangan menganggap kegagalan API sebagai
              // bukti bahwa mahasiswa belum mengumpulkan.
              throw submissionError;
            }
          }),
        );

        const allSubmissions = submissionResults.flat();

        /* ===============================================
           TAMBAHKAN MAHASISWA DARI SUBMISSION
        =============================================== */

        allSubmissions.forEach((submission) => {
          if (!submission.student_id) return;

          if (!studentMap.has(submission.student_id)) {
            studentMap.set(submission.student_id, {
              id: submission.student_id,
              nama_lengkap:
                submission.nama_lengkap ||
                submission.student_name ||
                "Nama tidak tersedia",
              nim: submission.nim || "-",
            });
          }
        });

        const studentList = Array.from(studentMap.values());

        /* ===============================================
           SIMPAN DATA KE STATE
        =============================================== */

        setModules(normalizedModules);
        setAssignments(normalizedAssignments);
        setPretestResults(normalizedPretests);
        setQuizResults(normalizedQuizzes);
        setSubmissions(allSubmissions);
        setStudents(studentList);
      } catch (loadError) {
        console.error("Gagal mengambil data nilai:", loadError);

        setError(
          loadError.message ||
            "Gagal mengambil data nilai mahasiswa. Silakan coba kembali.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* =======================================================
     BENTUK DATA UNTUK TAMPILAN
  ======================================================= */

  const studentsWithScores = useMemo(() => {
    return buildStudentData({
      students,
      modules,
      assignments,
      pretestResults,
      quizResults,
      submissions,
    });
  }, [
    students,
    modules,
    assignments,
    pretestResults,
    quizResults,
    submissions,
  ]);

  /* =======================================================
     FILTER MAHASISWA
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    if (!keyword) return studentsWithScores;

    return studentsWithScores.filter(
      (student) =>
        student.name.toLowerCase().includes(keyword) ||
        student.nim.toLowerCase().includes(keyword),
    );
  }, [studentsWithScores, searchTerm]);

  /* =======================================================
     STATISTIK
  ======================================================= */

  const totalStudents = students.length;
  const totalModules = modules.length;
  const totalTasks = assignments.length;

  /* =======================================================
     BUKA DAN TUTUP DETAIL
  ======================================================= */

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  const handleCloseDetail = () => {
    setSelectedStudent(null);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-nilai-page">
      {/* HEADER */}

      <div className="dosen-nilai-header">
        <div className="dosen-nilai-title">
          <div className="dosen-nilai-title-icon">
            <FaGraduationCap />
          </div>

          <div>
            <h1>Nilai Mahasiswa</h1>
            <p>Rekap hasil penilaian mahasiswa</p>
          </div>
        </div>
      </div>

      {/* STATISTIK */}

      <div className="dosen-nilai-stats">
        <div className="dosen-nilai-stat-card">
          <div className="dosen-nilai-stat-icon blue">
            <FaUserGraduate />
          </div>

          <div>
            <span>Total Mahasiswa</span>
            <strong>{loading ? "..." : totalStudents}</strong>
          </div>
        </div>

        <div className="dosen-nilai-stat-card">
          <div className="dosen-nilai-stat-icon green">
            <FaBookOpen />
          </div>

          <div>
            <span>Jumlah Module</span>
            <strong>{loading ? "..." : totalModules}</strong>
          </div>
        </div>

        <div className="dosen-nilai-stat-card">
          <div className="dosen-nilai-stat-icon orange">
            <FaTasks />
          </div>

          <div>
            <span>Jumlah Tugas</span>
            <strong>{loading ? "..." : totalTasks}</strong>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* PENCARIAN */}

      <div className="dosen-nilai-toolbar">
        <div className="dosen-nilai-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari nama atau NIM mahasiswa..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="dosen-nilai-search-clear"
              onClick={() => setSearchTerm("")}
              aria-label="Hapus pencarian"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <span className="dosen-nilai-result-count">
          {filteredStudents.length} mahasiswa
        </span>
      </div>

      {/* DAFTAR MAHASISWA */}

      <div className="dosen-nilai-content">
        <div className="dosen-nilai-list-header">
          <div>
            <h2>Daftar Mahasiswa</h2>
            <p>Pilih mahasiswa untuk melihat detail nilai dan status tugas</p>
          </div>
        </div>

        {loading ? (
          <div className="dosen-nilai-empty">
            <FaUserGraduate />
            <h3>Memuat data nilai...</h3>
            <p>
              Sedang mengambil data mahasiswa, module, quiz, pretest, dan
              pengumpulan tugas.
            </p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="dosen-nilai-student-list">
            {filteredStudents.map((student) => {
              return (
                <div className="dosen-nilai-student-card" key={student.id}>
                  {/* IDENTITAS MAHASISWA */}

                  <div className="dosen-nilai-student-info">
                    <div className="dosen-nilai-avatar">
                      {student.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3>{student.name}</h3>
                      <span>NIM: {student.nim}</span>
                    </div>
                  </div>

                  {/* TOMBOL DETAIL */}

                  <button
                    type="button"
                    className="dosen-nilai-view-button"
                    onClick={() => handleViewStudent(student)}
                  >
                    Lihat Nilai
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dosen-nilai-empty">
            <FaUserGraduate />
            <h3>Mahasiswa tidak ditemukan</h3>

            <p>
              Tidak ada mahasiswa yang sesuai dengan pencarian "{searchTerm}".
            </p>

            <button type="button" onClick={() => setSearchTerm("")}>
              Tampilkan Semua
            </button>
          </div>
        )}
      </div>

      {/* DETAIL NILAI MAHASISWA */}

      {selectedStudent && (
        <div className="dosen-nilai-modal-overlay" onClick={handleCloseDetail}>
          <div
            className="dosen-nilai-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* HEADER MODAL */}

            <div className="dosen-nilai-modal-header">
              <div className="dosen-nilai-modal-student">
                <div className="dosen-nilai-avatar large">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <span>DETAIL NILAI MAHASISWA</span>
                  <h2>{selectedStudent.name}</h2>
                  <p>NIM: {selectedStudent.nim}</p>
                </div>
              </div>

              <button
                type="button"
                className="dosen-nilai-close-button"
                onClick={handleCloseDetail}
                aria-label="Tutup"
              >
                <FaTimes />
              </button>
            </div>

            {/* ISI MODAL */}

            <div className="dosen-nilai-modal-body">
              {/* NILAI MODULE */}

              <section className="dosen-nilai-section">
                <div className="dosen-nilai-section-title">
                  <div className="dosen-nilai-section-icon blue">
                    <FaBookOpen />
                  </div>

                  <div>
                    <h3>Nilai Module</h3>
                    <p>Nilai pretest dan quiz setiap module</p>
                  </div>
                </div>

                <div className="dosen-nilai-module-list">
                  {selectedStudent.moduleScores.length > 0 ? (
                    selectedStudent.moduleScores.map((module) => (
                      <div
                        className="dosen-nilai-module-card"
                        key={module.moduleId}
                      >
                        <div className="dosen-nilai-module-name">
                          <strong>{module.moduleName}</strong>
                        </div>

                        <div className="dosen-nilai-module-scores">
                          <div>
                            <span>Pretest</span>
                            <strong>
                              {module.pretest !== null ? module.pretest : "—"}
                            </strong>
                          </div>

                          <div>
                            <span>Quiz</span>
                            <strong>
                              {module.quiz !== null ? module.quiz : "—"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Belum ada data module yang tersedia.</p>
                  )}
                </div>
              </section>

              {/* STATUS DAN NILAI TUGAS */}

              <section className="dosen-nilai-section">
                <div className="dosen-nilai-section-title">
                  <div className="dosen-nilai-section-icon orange">
                    <FaClipboardList />
                  </div>

                  <div>
                    <h3>Status dan Nilai Tugas</h3>
                    <p>
                      Informasi pengumpulan dan hasil penilaian setiap tugas
                    </p>
                  </div>
                </div>

                <div className="dosen-nilai-task-list">
                  {selectedStudent.taskScores.length > 0 ? (
                    selectedStudent.taskScores.map((task) => (
                      <div className="dosen-nilai-task-card" key={task.taskId}>
                        <div className="dosen-nilai-task-name">
                          <strong>{task.taskTitle}</strong>
                        </div>

                        <div className="dosen-nilai-task-score">
                          {!task.isSubmitted ? (
                            <span
                              className="not-graded"
                              style={{
                                display: "inline-block",
                                color: "#dc3545",
                                backgroundColor: "#fce8e8",
                                padding: "7px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              Belum Dikumpulkan
                            </span>
                          ) : task.status === "dinilai" ? (
                            <>
                              <strong>{task.score ?? "—"}</strong>
                              <span
                                style={{
                                  display: "inline-block",
                                  color: "#198754",
                                  backgroundColor: "#e5f6ec",
                                  padding: "5px 8px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                }}
                              >
                                Sudah Dinilai
                              </span>
                            </>
                          ) : (
                            <span
                              className="not-graded"
                              style={{
                                display: "inline-block",
                                color: "#b7791f",
                                backgroundColor: "#fff4d6",
                                padding: "7px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              Sudah Dikumpulkan Namun Belum Dinilai
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Belum ada tugas yang tersedia.</p>
                  )}
                </div>
              </section>
            </div>

            {/* FOOTER MODAL */}

            <div className="dosen-nilai-modal-footer">
              <div>
                <FaTrophy />

                <span>
                  Status pengumpulan dan nilai ditampilkan berdasarkan data
                  submission yang tersedia.
                </span>
              </div>

              <button type="button" onClick={handleCloseDetail}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenNilai;
