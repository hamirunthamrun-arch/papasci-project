import { useEffect, useMemo, useState } from "react";
import {
  FaBookOpen,
  FaClipboardList,
  FaExternalLinkAlt,
  FaGraduationCap,
  FaSearch,
  FaTasks,
  FaTimes,
  FaTrophy,
  FaUserGraduate,
} from "react-icons/fa";

import "../../css/dosen/DosenNilai.css";

import { getAccessToken } from "../../service/authService";
import { getAllPretestResults } from "../../service/pretestResultService";
import { getAllQuizResults } from "../../service/quizResultService";
import { getModules } from "../../service/moduleService";
import { getAssignments } from "../../service/assignmentService";
import { getSubmissionsByAssignment } from "../../service/assignmentSubmissionService";
import { getPedagogicScores } from "../../service/pedagogicScoreService";

/* =========================================================
   KONFIGURASI SUPABASE STORAGE
========================================================= */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(
  /\/+$/,
  "",
);

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const STORAGE_BUCKET = "media-storage";

/* =========================================================
   AMBIL FOTO PROFIL DARI SUPABASE
========================================================= */

const getProfileAvatarUrl = (path) => {
  if (!path || typeof path !== "string") {
    return "";
  }

  const cleanPath = path.trim();

  if (!cleanPath) {
    return "";
  }

  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath;
  }

  if (!SUPABASE_URL) {
    return "";
  }

  const normalizedPath = cleanPath
    .replace(/^\/+/, "")
    .replace(/^media-storage\//, "");

  const encodedPath = normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodedPath}`;
};

/* =========================================================
   HEADER REQUEST SUPABASE
========================================================= */

const getProfileHeaders = () => {
  const token = getAccessToken();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.",
    );
  }

  if (!token) {
    throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
  }

  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
};

/* =========================================================
   AMBIL PROFIL MAHASISWA BERDASARKAN USER ID
========================================================= */

const getProfilesByIds = async (userIds) => {
  const uniqueIds = [
    ...new Set(
      userIds.filter((id) => typeof id === "string" && id.trim() !== ""),
    ),
  ];

  if (uniqueIds.length === 0) {
    return [];
  }

  const headers = getProfileHeaders();

  const query = new URLSearchParams({
    select: "id,nama_lengkap,nim,email,avatar_url",
    id: `in.(${uniqueIds.join(",")})`,
  });

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?${query.toString()}`,
    {
      method: "GET",
      headers,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Gagal mengambil profil mahasiswa (${response.status}): ${errorText}`,
    );
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
};

/* =========================================================
   KOMPONEN FOTO PROFIL
========================================================= */

function StudentAvatar({ name, avatarUrl, large = false }) {
  const [failedUrl, setFailedUrl] = useState("");

  const imageUrl = getProfileAvatarUrl(avatarUrl);

  const imageFailed = Boolean(imageUrl && failedUrl === imageUrl);

  const initial = (name || "Mahasiswa").trim().charAt(0).toUpperCase() || "M";

  return (
    <div
      className={`dosen-nilai-avatar${large ? " large" : ""}`}
      aria-label={`Foto profil ${name || "mahasiswa"}`}
    >
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={`Foto profil ${name || "mahasiswa"}`}
          className="dosen-nilai-profile-photo"
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <span className="dosen-nilai-avatar-fallback">{initial}</span>
      )}
    </div>
  );
}

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
   GABUNGKAN DATA NILAI
========================================================= */

const buildStudentData = ({
  students,
  modules,
  assignments,
  pretestResults,
  quizResults,
  submissions,
  pedagogicScores,
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

      const latestPretest =
        modulePretests.length > 0
          ? [...modulePretests].sort(
              (a, b) =>
                new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0),
            )[0]
          : null;

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

      const isSubmitted = Boolean(submission);

      let status = "belum_dikumpulkan";

      if (isSubmitted) {
        status = submission.status === "dinilai" ? "dinilai" : "dikumpulkan";
      }

      return {
        taskId: assignment.id,
        taskTitle: assignment.title,
        isSubmitted,
        status,
        score:
          submission?.score !== null && submission?.score !== undefined
            ? submission.score
            : null,
        submittedAt: submission?.submitted_at ?? null,
        submissionUrl: submission?.submission_url ?? null,
      };
    });

    /* =====================================================
       NILAI KOMPETENSI PEDAGOGIK
    ===================================================== */

    const studentPedagogicScores = pedagogicScores.filter(
      (result) => result.student_id === student.id,
    );

    const latestPedagogicScore =
      studentPedagogicScores.length > 0
        ? [...studentPedagogicScores].sort(
            (a, b) =>
              new Date(b.updated_at || b.created_at || 0) -
              new Date(a.updated_at || a.created_at || 0),
          )[0]
        : null;

    return {
      id: student.id,
      name: student.nama_lengkap || "Nama tidak tersedia",
      nim: student.nim || "-",
      avatar_url: student.avatar_url || "",
      moduleScores,
      taskScores,

      /* DATA KOMPETENSI PEDAGOGIK */
      pedagogicScore: latestPedagogicScore?.nilai ?? null,

      pedagogicStatus: latestPedagogicScore?.status ?? null,

      pedagogicVideoUrl: latestPedagogicScore?.vidio_url ?? null,

      pedagogicUpdatedAt:
        latestPedagogicScore?.updated_at ??
        latestPedagogicScore?.created_at ??
        null,
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

  /* DATA KOMPETENSI PEDAGOGIK */
  const [pedagogicScores, setPedagogicScores] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =======================================================
     AMBIL SEMUA DATA
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          moduleData,
          assignmentData,
          pretestData,
          quizData,
          pedagogicData,
        ] = await Promise.all([
          getModules(),
          getAssignments(),
          getAllPretestResults(),
          getAllQuizResults(),

          /* DATA NILAI KOMPETENSI PEDAGOGIK */
          getPedagogicScores(),
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

        /* ===============================================
           NORMALISASI PRETEST
        =============================================== */

        const normalizedPretests = Array.isArray(pretestData)
          ? pretestData
          : [];

        /* ===============================================
           NORMALISASI QUIZ
        =============================================== */

        const normalizedQuizzes = Array.isArray(quizData) ? quizData : [];

        /* ===============================================
           NORMALISASI PEDAGOGIK
        =============================================== */

        const normalizedPedagogicScores = Array.isArray(pedagogicData)
          ? pedagogicData
          : [];

        /* ===============================================
           KUMPULKAN DATA MAHASISWA
        =============================================== */

        const studentMap = new Map();

        /* -----------------------------------------------
           Mahasiswa dari PRETEST
        ------------------------------------------------ */

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
              avatar_url: profile.avatar_url || "",
            });
          }
        });

        /* -----------------------------------------------
           Mahasiswa dari QUIZ
        ------------------------------------------------ */

        normalizedQuizzes.forEach((result) => {
          if (!result.student_id) return;

          if (!studentMap.has(result.student_id)) {
            const profile = result.profiles || {};

            studentMap.set(result.student_id, {
              id: result.student_id,
              nama_lengkap:
                profile.nama_lengkap ||
                result.nama_lengkap ||
                "Nama tidak tersedia",
              nim: profile.nim || result.nim || "-",
              avatar_url: profile.avatar_url || "",
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
              avatar_url: submission.avatar_url || "",
            });
          }
        });

        /* ===============================================
           TAMBAHKAN MAHASISWA DARI
           KOMPETENSI PEDAGOGIK
        =============================================== */

        normalizedPedagogicScores.forEach((result) => {
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
              avatar_url: profile.avatar_url || "",
            });
          }
        });

        /* ===============================================
           AMBIL FOTO PROFIL
        =============================================== */

        const studentIds = Array.from(studentMap.keys());

        let profileMap = new Map();

        if (studentIds.length > 0) {
          try {
            const profileData = await getProfilesByIds(studentIds);

            profileMap = new Map(
              profileData.map((profile) => [profile.id, profile]),
            );
          } catch (profileError) {
            console.error(
              "Gagal mengambil foto profil mahasiswa:",
              profileError,
            );
          }
        }

        /* ===============================================
           GABUNGKAN DATA PROFIL
        =============================================== */

        const studentList = Array.from(studentMap.values()).map((student) => {
          const profile = profileMap.get(student.id);

          return {
            ...student,

            nama_lengkap:
              profile?.nama_lengkap ||
              student.nama_lengkap ||
              "Nama tidak tersedia",

            nim: profile?.nim || student.nim || "-",

            avatar_url: profile?.avatar_url || student.avatar_url || "",
          };
        });

        if (cancelled) return;

        /* ===============================================
           SIMPAN DATA KE STATE
        =============================================== */

        setModules(normalizedModules);

        setAssignments(normalizedAssignments);

        setPretestResults(normalizedPretests);

        setQuizResults(normalizedQuizzes);

        setSubmissions(allSubmissions);

        setPedagogicScores(normalizedPedagogicScores);

        setStudents(studentList);
      } catch (loadError) {
        console.error("Gagal mengambil data nilai:", loadError);

        if (!cancelled) {
          setError(
            loadError.message ||
              "Gagal mengambil data nilai mahasiswa. Silakan coba kembali.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
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
      pedagogicScores,
    });
  }, [
    students,
    modules,
    assignments,
    pretestResults,
    quizResults,
    submissions,
    pedagogicScores,
  ]);

  /* =======================================================
     FILTER MAHASISWA
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    if (!keyword) {
      return studentsWithScores;
    }

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
     BUKA DETAIL
  ======================================================= */

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  /* =======================================================
     TUTUP DETAIL
  ======================================================= */

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
              Sedang mengambil data mahasiswa, module, quiz, pretest,
              pengumpulan tugas, kompetensi pedagogik, dan foto profil.
            </p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="dosen-nilai-student-list">
            {filteredStudents.map((student) => (
              <div className="dosen-nilai-student-card" key={student.id}>
                {/* IDENTITAS */}

                <div className="dosen-nilai-student-info">
                  <StudentAvatar
                    name={student.name}
                    avatarUrl={student.avatar_url}
                  />

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
            ))}
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

      {/* ===================================================
          DETAIL NILAI MAHASISWA
      =================================================== */}

      {selectedStudent && (
        <div className="dosen-nilai-modal-overlay" onClick={handleCloseDetail}>
          <div
            className="dosen-nilai-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* HEADER MODAL */}

            <div className="dosen-nilai-modal-header">
              <div className="dosen-nilai-modal-student">
                <StudentAvatar
                  name={selectedStudent.name}
                  avatarUrl={selectedStudent.avatar_url}
                  large
                />

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
              {/* =================================================
                  NILAI MODULE
              ================================================= */}

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

              {/* =================================================
                  STATUS DAN NILAI TUGAS
              ================================================= */}

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
                            <span className="not-graded">
                              Belum Dikumpulkan
                            </span>
                          ) : task.status === "dinilai" ? (
                            <>
                              <strong>{task.score ?? "—"}</strong>

                              <span className="graded-label">
                                Sudah Dinilai
                              </span>
                            </>
                          ) : (
                            <span className="waiting-label">
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

              {/* =================================================
                  KOMPETENSI PEDAGOGIK
              ================================================= */}

              <section className="dosen-nilai-section">
                <div className="dosen-nilai-section-title">
                  <div className="dosen-nilai-section-icon purple">
                    <FaGraduationCap />
                  </div>

                  <div>
                    <h3>Nilai Kompetensi Pedagogik</h3>

                    <p>Hasil penilaian video mengajar mahasiswa</p>
                  </div>
                </div>

                <div className="dosen-nilai-pedagogic-card">
                  {/* NILAI */}

                  <div className="dosen-nilai-pedagogic-main">
                    <div className="dosen-nilai-pedagogic-label">
                      Nilai Kompetensi Pedagogik
                    </div>

                    <div className="dosen-nilai-pedagogic-score">
                      <strong>
                        {selectedStudent.pedagogicScore !== null
                          ? selectedStudent.pedagogicScore
                          : "—"}
                      </strong>

                      <span>/ 100</span>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="dosen-nilai-pedagogic-status">
                    {selectedStudent.pedagogicStatus === "dinilai" ? (
                      <span className="pedagogic-status graded">
                        Sudah Dinilai
                      </span>
                    ) : selectedStudent.pedagogicStatus === "dikumpulkan" ? (
                      <span className="pedagogic-status waiting">
                        Menunggu Penilaian
                      </span>
                    ) : selectedStudent.pedagogicStatus ===
                      "perlu_dinilai_ulang" ? (
                      <span className="pedagogic-status resubmission">
                        Menunggu Penilaian Ulang
                      </span>
                    ) : (
                      <span className="pedagogic-status empty">
                        Belum Mengumpulkan
                      </span>
                    )}
                  </div>

                  {/* VIDEO */}

                  {selectedStudent.pedagogicVideoUrl && (
                    <a
                      href={selectedStudent.pedagogicVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dosen-nilai-pedagogic-video"
                    >
                      <FaExternalLinkAlt />

                      <span>Lihat Video Mengajar</span>
                    </a>
                  )}
                </div>
              </section>
            </div>

            {/* FOOTER MODAL */}

            <div className="dosen-nilai-modal-footer">
              <div>
                <FaTrophy />

                <span>
                  Status pengumpulan dan nilai ditampilkan berdasarkan data yang
                  tersedia.
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
