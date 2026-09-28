import { useMemo, useState } from "react";
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

/* =========================================================
   DATA DUMMY MAHASISWA
========================================================= */

const initialStudents = [
  {
    id: 1,
    name: "Andi Pratama",
    nim: "20230001",

    moduleScores: [
      {
        moduleId: 1,
        moduleName: "Makhluk Hidup",
        pretest: 70,
        quiz: 85,
      },
      {
        moduleId: 2,
        moduleName: "Gaya dan Gerak",
        pretest: 75,
        quiz: 88,
      },
      {
        moduleId: 3,
        moduleName: "Energi",
        pretest: 80,
        quiz: 90,
      },
    ],

    taskScores: [
      {
        taskId: 1,
        taskTitle: "Observasi Makhluk Hidup",
        score: 80,
      },
      {
        taskId: 2,
        taskTitle: "Laporan Pengamatan",
        score: 90,
      },
      {
        taskId: 3,
        taskTitle: "Microteaching",
        score: 85,
      },
      {
        taskId: 4,
        taskTitle: "Praktik Mengajar",
        score: 88,
      },
    ],
  },

  {
    id: 2,
    name: "Budi Santoso",
    nim: "20230002",

    moduleScores: [
      {
        moduleId: 1,
        moduleName: "Makhluk Hidup",
        pretest: 80,
        quiz: 90,
      },
      {
        moduleId: 2,
        moduleName: "Gaya dan Gerak",
        pretest: 78,
        quiz: 86,
      },
      {
        moduleId: 3,
        moduleName: "Energi",
        pretest: 82,
        quiz: 88,
      },
    ],

    taskScores: [
      {
        taskId: 1,
        taskTitle: "Observasi Makhluk Hidup",
        score: 88,
      },
      {
        taskId: 2,
        taskTitle: "Laporan Pengamatan",
        score: 85,
      },
      {
        taskId: 3,
        taskTitle: "Microteaching",
        score: 92,
      },
    ],
  },

  {
    id: 3,
    name: "Citra Lestari",
    nim: "20230003",

    moduleScores: [
      {
        moduleId: 1,
        moduleName: "Makhluk Hidup",
        pretest: 65,
        quiz: 78,
      },
      {
        moduleId: 2,
        moduleName: "Gaya dan Gerak",
        pretest: 72,
        quiz: 80,
      },
      {
        moduleId: 3,
        moduleName: "Energi",
        pretest: 75,
        quiz: 82,
      },
    ],

    taskScores: [
      {
        taskId: 1,
        taskTitle: "Observasi Makhluk Hidup",
        score: 78,
      },
      {
        taskId: 2,
        taskTitle: "Laporan Pengamatan",
        score: 82,
      },
      {
        taskId: 3,
        taskTitle: "Microteaching",
        score: 80,
      },
      {
        taskId: 4,
        taskTitle: "Praktik Mengajar",
        score: null,
      },
    ],
  },

  {
    id: 4,
    name: "Deni Kurniawan",
    nim: "20230004",

    moduleScores: [
      {
        moduleId: 1,
        moduleName: "Makhluk Hidup",
        pretest: 88,
        quiz: 92,
      },
      {
        moduleId: 2,
        moduleName: "Gaya dan Gerak",
        pretest: 85,
        quiz: 90,
      },
      {
        moduleId: 3,
        moduleName: "Energi",
        pretest: 90,
        quiz: 94,
      },
    ],

    taskScores: [
      {
        taskId: 1,
        taskTitle: "Observasi Makhluk Hidup",
        score: 90,
      },
      {
        taskId: 2,
        taskTitle: "Laporan Pengamatan",
        score: 94,
      },
      {
        taskId: 3,
        taskTitle: "Microteaching",
        score: 92,
      },
      {
        taskId: 4,
        taskTitle: "Praktik Mengajar",
        score: 95,
      },
    ],
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function DosenNilai() {
  const [students] = useState(initialStudents);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);

  /* =======================================================
     FILTER MAHASISWA
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    if (!keyword) {
      return students;
    }

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(keyword) ||
        student.nim.toLowerCase().includes(keyword)
    );
  }, [students, searchTerm]);

  /* =======================================================
     HITUNG STATISTIK
  ======================================================= */

  const totalStudents = students.length;

  const totalModules = students.reduce(
    (total, student) =>
      total + student.moduleScores.length,
    0
  );

  const totalTasks = students.reduce(
    (total, student) =>
      total + student.taskScores.length,
    0
  );

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

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="dosen-nilai-header">
        <div className="dosen-nilai-title">
          <div className="dosen-nilai-title-icon">
            <FaGraduationCap />
          </div>

          <div>
            <h1>Nilai Mahasiswa</h1>

            <p>
              Rekap hasil penilaian mahasiswa
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================
          STATISTICS
      =================================================== */}

      <div className="dosen-nilai-stats">

        <div className="dosen-nilai-stat-card">
          <div className="dosen-nilai-stat-icon blue">
            <FaUserGraduate />
          </div>

          <div>
            <span>Total Mahasiswa</span>
            <strong>{totalStudents}</strong>
          </div>
        </div>

        <div className="dosen-nilai-stat-card">
          <div className="dosen-nilai-stat-icon green">
            <FaBookOpen />
          </div>

          <div>
            <span>Rekap Module</span>
            <strong>{totalModules}</strong>
          </div>
        </div>

        <div className="dosen-nilai-stat-card">
          <div className="dosen-nilai-stat-icon orange">
            <FaTasks />
          </div>

          <div>
            <span>Rekap Tugas</span>
            <strong>{totalTasks}</strong>
          </div>
        </div>

      </div>

      {/* ===================================================
          SEARCH
      =================================================== */}

      <div className="dosen-nilai-toolbar">

        <div className="dosen-nilai-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Cari nama atau NIM mahasiswa..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
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

      {/* ===================================================
          STUDENT LIST
      =================================================== */}

      <div className="dosen-nilai-content">

        <div className="dosen-nilai-list-header">
          <div>
            <h2>Daftar Mahasiswa</h2>

            <p>
              Pilih mahasiswa untuk melihat detail nilai
            </p>
          </div>
        </div>

        {filteredStudents.length > 0 ? (

          <div className="dosen-nilai-student-list">

            {filteredStudents.map((student) => {

              const completedTasks =
                student.taskScores.filter(
                  (task) => task.score !== null
                ).length;

              const totalTasksStudent =
                student.taskScores.length;

              return (
                <div
                  className="dosen-nilai-student-card"
                  key={student.id}
                >

                  {/* MAHASISWA */}

                  <div className="dosen-nilai-student-info">

                    <div className="dosen-nilai-avatar">
                      {student.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h3>{student.name}</h3>

                      <span>
                        NIM: {student.nim}
                      </span>
                    </div>

                  </div>

                  {/* RINGKASAN */}

                  <div className="dosen-nilai-student-summary">

                    <div>
                      <span>Module</span>

                      <strong>
                        {student.moduleScores.length}
                      </strong>
                    </div>

                    <div>
                      <span>Tugas Dinilai</span>

                      <strong>
                        {completedTasks}/{totalTasksStudent}
                      </strong>
                    </div>

                  </div>

                  {/* BUTTON */}

                  <button
                    type="button"
                    className="dosen-nilai-view-button"
                    onClick={() =>
                      handleViewStudent(student)
                    }
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
              Tidak ada mahasiswa yang sesuai dengan
              pencarian "{searchTerm}".
            </p>

            <button
              type="button"
              onClick={() => setSearchTerm("")}
            >
              Tampilkan Semua
            </button>

          </div>

        )}

      </div>

      {/* ===================================================
          DETAIL NILAI
      =================================================== */}

      {selectedStudent && (

        <div
          className="dosen-nilai-modal-overlay"
          onClick={handleCloseDetail}
        >

          <div
            className="dosen-nilai-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="dosen-nilai-modal-header">

              <div className="dosen-nilai-modal-student">

                <div className="dosen-nilai-avatar large">
                  {selectedStudent.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <span>DETAIL NILAI MAHASISWA</span>

                  <h2>
                    {selectedStudent.name}
                  </h2>

                  <p>
                    NIM: {selectedStudent.nim}
                  </p>
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

            {/* MODAL CONTENT */}

            <div className="dosen-nilai-modal-body">

              {/* =========================================
                  NILAI MODULE
              ========================================= */}

              <section className="dosen-nilai-section">

                <div className="dosen-nilai-section-title">

                  <div className="dosen-nilai-section-icon blue">
                    <FaBookOpen />
                  </div>

                  <div>
                    <h3>Nilai Module</h3>

                    <p>
                      Nilai pretest dan quiz setiap module
                    </p>
                  </div>

                </div>

                <div className="dosen-nilai-module-list">

                  {selectedStudent.moduleScores.map(
                    (module) => (
                      <div
                        className="dosen-nilai-module-card"
                        key={module.moduleId}
                      >

                        <div className="dosen-nilai-module-name">
                          <strong>
                            {module.moduleName}
                          </strong>

                          <span>
                            Module {module.moduleId}
                          </span>
                        </div>

                        <div className="dosen-nilai-module-scores">

                          <div>
                            <span>Pretest</span>

                            <strong>
                              {module.pretest}
                            </strong>
                          </div>

                          <div>
                            <span>Quiz</span>

                            <strong>
                              {module.quiz}
                            </strong>
                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </section>

              {/* =========================================
                  NILAI TUGAS
              ========================================= */}

              <section className="dosen-nilai-section">

                <div className="dosen-nilai-section-title">

                  <div className="dosen-nilai-section-icon orange">
                    <FaClipboardList />
                  </div>

                  <div>
                    <h3>Nilai Tugas</h3>

                    <p>
                      Nilai tugas yang telah dinilai dosen
                    </p>
                  </div>

                </div>

                <div className="dosen-nilai-task-list">

                  {selectedStudent.taskScores.map(
                    (task) => (
                      <div
                        className="dosen-nilai-task-card"
                        key={task.taskId}
                      >

                        <div className="dosen-nilai-task-number">
                          {task.taskId}
                        </div>

                        <div className="dosen-nilai-task-name">
                          <strong>
                            {task.taskTitle}
                          </strong>

                          <span>
                            Tugas {task.taskId}
                          </span>
                        </div>

                        <div className="dosen-nilai-task-score">

                          {task.score !== null ? (
                            <>
                              <strong>
                                {task.score}
                              </strong>

                              <span>Nilai</span>
                            </>
                          ) : (
                            <span className="not-graded">
                              Belum Dinilai
                            </span>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>

              </section>

            </div>

            {/* MODAL FOOTER */}

            <div className="dosen-nilai-modal-footer">

              <div>
                <FaTrophy />

                <span>
                  Rekap nilai ditampilkan berdasarkan
                  hasil penilaian yang tersedia.
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
              >
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