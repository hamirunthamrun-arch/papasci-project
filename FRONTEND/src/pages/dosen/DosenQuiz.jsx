import { useState } from "react";
import {
  FaQuestionCircle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import "../../css/dosen/DosenQuiz.css";

/* =========================================================
   DATA DUMMY QUIZ
========================================================= */

const initialQuizzes = [
  {
    id: 1,
    moduleId: 1,
    moduleName: "Makhluk Hidup",
    title: "Quiz Makhluk Hidup",
    description:
      "Evaluasi pemahaman mahasiswa setelah mempelajari materi makhluk hidup.",
    questions: 10,
    maxAttempts: 3,
    status: "Publik",
  },
  {
    id: 2,
    moduleId: 2,
    moduleName: "Gaya dan Gerak",
    title: "Quiz Gaya dan Gerak",
    description: "Evaluasi pemahaman mahasiswa mengenai gaya dan gerak.",
    questions: 10,
    maxAttempts: 3,
    status: "Publik",
  },
  {
    id: 3,
    moduleId: 3,
    moduleName: "Energi",
    title: "Quiz Energi",
    description: "Evaluasi pemahaman mahasiswa mengenai energi.",
    questions: 8,
    maxAttempts: 3,
    status: "Draft",
  },
];

/* =========================================================
   DATA MODULE
========================================================= */

const modules = [
  {
    id: 1,
    title: "Makhluk Hidup",
  },
  {
    id: 2,
    title: "Gaya dan Gerak",
  },
  {
    id: 3,
    title: "Energi",
  },
  {
    id: 4,
    title: "Air dan Perubahannya",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function DosenQuiz() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState(initialQuizzes);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingQuiz, setEditingQuiz] = useState(null);

  const [formData, setFormData] = useState({
    moduleId: "",
    title: "",
    description: "",
    questions: 10,
    maxAttempts: 3,
    status: "Draft",
  });

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredQuizzes = quizzes.filter((quiz) => {
    const keyword = search.toLowerCase();

    return (
      quiz.title.toLowerCase().includes(keyword) ||
      quiz.moduleName.toLowerCase().includes(keyword)
    );
  });

  /* =======================================================
     TAMBAH
  ======================================================= */

  const handleAdd = () => {
    setEditingQuiz(null);

    setFormData({
      moduleId: "",
      title: "",
      description: "",
      questions: 10,
      maxAttempts: 3,
      status: "Draft",
    });

    setShowModal(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);

    setFormData({
      moduleId: quiz.moduleId,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      maxAttempts: quiz.maxAttempts,
      status: quiz.status,
    });

    setShowModal(true);
  };

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
  };

  /* =======================================================
     INPUT
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     SIMPAN
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    const selectedModule = modules.find(
      (module) => module.id === Number(formData.moduleId),
    );

    if (!selectedModule) {
      alert("Silakan pilih module.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Judul quiz wajib diisi.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Deskripsi quiz wajib diisi.");
      return;
    }

    if (editingQuiz) {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === editingQuiz.id
            ? {
                ...quiz,
                moduleId: selectedModule.id,
                moduleName: selectedModule.title,
                title: formData.title,
                description: formData.description,
                questions: Number(formData.questions),
                maxAttempts: Number(formData.maxAttempts),
                status: formData.status,
              }
            : quiz,
        ),
      );

      alert("Quiz berhasil diperbarui.");
    } else {
      const newQuiz = {
        id: Date.now(),
        moduleId: selectedModule.id,
        moduleName: selectedModule.title,
        title: formData.title,
        description: formData.description,
        questions: Number(formData.questions),
        maxAttempts: Number(formData.maxAttempts),
        status: formData.status,
      };

      setQuizzes((prev) => [...prev, newQuiz]);

      alert("Quiz berhasil ditambahkan.");
    }

    handleCloseModal();
  };

  /* =======================================================
     HAPUS
  ======================================================= */

  const handleDelete = (id) => {
    const quiz = quizzes.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus "${quiz?.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    setQuizzes((prev) => prev.filter((item) => item.id !== id));

    alert("Quiz berhasil dihapus.");
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="dosen-quiz-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dosen-quiz-header">
        <div>
          <span className="dosen-quiz-eyebrow">
            <FaQuestionCircle />
            PEMBELAJARAN
          </span>

          <h1>Quiz</h1>

          <p>
            Kelola evaluasi akhir untuk mengukur pemahaman mahasiswa setelah
            mempelajari module.
          </p>
        </div>

        <button
          type="button"
          className="dosen-quiz-add-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Tambah Quiz
        </button>
      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="dosen-quiz-toolbar">
        <div className="dosen-quiz-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari quiz atau module..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="dosen-quiz-total">
          <strong>{filteredQuizzes.length}</strong>
          <span>Quiz</span>
        </div>
      </div>

      {/* =================================================
          LIST
      ================================================= */}

      <div className="dosen-quiz-list">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div className="dosen-quiz-card" key={quiz.id}>
              {/* TOP */}

              <div className="dosen-quiz-card-top">
                <div className="dosen-quiz-icon">
                  <FaQuestionCircle />
                </div>

                <span
                  className={`dosen-quiz-status ${
                    quiz.status === "Publik" ? "published" : "draft"
                  }`}
                >
                  {quiz.status}
                </span>
              </div>

              {/* CONTENT */}

              <div className="dosen-quiz-card-content">
                <span className="dosen-quiz-module">
                  MODULE {String(quiz.moduleId).padStart(2, "0")}
                  {" • "}
                  {quiz.moduleName}
                </span>

                <h3>{quiz.title}</h3>

                <p>{quiz.description}</p>
              </div>

              {/* INFO */}

              <div className="dosen-quiz-info">
                <div>
                  <FaQuestionCircle />
                  <span>{quiz.questions} Soal</span>
                </div>

                <div>
                  <span className="attempt-icon">↻</span>

                  <span>Maksimal {quiz.maxAttempts} Percobaan</span>
                </div>
              </div>

              {/* ACTION */}

              <div className="dosen-quiz-card-actions">
                <button
                  type="button"
                  className="dosen-quiz-question-btn"
                  onClick={() => navigate(`/dosen/quiz/${quiz.id}/soal`)}
                >
                  <FaQuestionCircle />
                  Kelola Soal
                </button>

                <button
                  type="button"
                  className="dosen-quiz-edit-btn"
                  onClick={() => handleEdit(quiz)}
                  title="Edit quiz"
                >
                  <FaEdit />
                  Edit
                </button>

                <button
                  type="button"
                  className="dosen-quiz-delete-btn"
                  onClick={() => handleDelete(quiz.id)}
                  title="Hapus quiz"
                >
                  <FaTrash />
                  Hapus
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="dosen-quiz-empty">
            <FaQuestionCircle />

            <h3>Quiz tidak ditemukan</h3>

            <p>Tidak ada quiz yang sesuai dengan pencarian.</p>
          </div>
        )}
      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {showModal && (
        <div
          className="dosen-quiz-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="dosen-quiz-modal">
            <div className="dosen-quiz-modal-header">
              <div>
                <span>{editingQuiz ? "EDIT QUIZ" : "QUIZ BARU"}</span>

                <h2>{editingQuiz ? "Edit Quiz" : "Tambah Quiz"}</h2>
              </div>

              <button
                type="button"
                className="dosen-quiz-modal-close"
                onClick={handleCloseModal}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* MODULE */}

              <div className="dosen-quiz-field">
                <label htmlFor="quizModule">Module</label>

                <select
                  id="quizModule"
                  name="moduleId"
                  value={formData.moduleId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Module</option>

                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* JUDUL */}

              <div className="dosen-quiz-field">
                <label htmlFor="quizTitle">Judul Quiz</label>

                <input
                  id="quizTitle"
                  name="title"
                  type="text"
                  placeholder="Contoh: Quiz Makhluk Hidup"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* DESKRIPSI */}

              <div className="dosen-quiz-field">
                <label htmlFor="quizDescription">Deskripsi</label>

                <textarea
                  id="quizDescription"
                  name="description"
                  rows="4"
                  placeholder="Masukkan deskripsi quiz..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* JUMLAH SOAL */}

              <div className="dosen-quiz-field">
                <label htmlFor="quizQuestions">Jumlah Soal</label>

                <input
                  id="quizQuestions"
                  name="questions"
                  type="number"
                  min="1"
                  value={formData.questions}
                  onChange={handleChange}
                  required
                />

                <small>
                  Jumlah soal akan mengikuti soal yang dibuat pada menu Kelola
                  Soal.
                </small>
              </div>

              {/* MAKSIMAL PERCOBAAN */}

              <div className="dosen-quiz-field">
                <label htmlFor="quizAttempts">
                  Maksimal Percobaan Mahasiswa
                </label>

                <select
                  id="quizAttempts"
                  name="maxAttempts"
                  value={formData.maxAttempts}
                  onChange={handleChange}
                >
                  <option value="1">1 Kali</option>
                  <option value="2">2 Kali</option>
                  <option value="3">3 Kali</option>
                </select>

                <small>Maksimal percobaan dibatasi sampai 3 kali.</small>
              </div>

              {/* STATUS */}

              <div className="dosen-quiz-field">
                <label htmlFor="quizStatus">Status</label>

                <select
                  id="quizStatus"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Publik">Publik</option>
                  <option value="Draft">Draft</option>
                </select>

                <small>
                  Quiz Publik dapat digunakan mahasiswa, sedangkan Draft masih
                  dalam tahap persiapan.
                </small>
              </div>

              {/* ACTION */}

              <div className="dosen-quiz-modal-actions">
                <button
                  type="button"
                  className="dosen-quiz-cancel-btn"
                  onClick={handleCloseModal}
                >
                  <FaTimes />
                  Batal
                </button>

                <button type="submit" className="dosen-quiz-save-btn">
                  <FaSave />

                  {editingQuiz ? "Simpan Perubahan" : "Simpan Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenQuiz;
