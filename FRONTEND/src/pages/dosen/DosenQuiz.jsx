import { useCallback, useEffect, useState } from "react";
import {
  FaBookOpen,
  FaEdit,
  FaPlus,
  FaQuestionCircle,
  FaSave,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "../../service/quizService";

import { getModules } from "../../service/moduleService";
import "../../css/dosen/DosenQuiz.css";

/* =========================================================
   FORM AWAL
========================================================= */

const initialForm = {
  module_id: "",
  title: "",
  description: "",
  question_count: 10,
  max_attempts: 3,
  status: "draft",
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenQuiz() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [modules, setModules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({ ...initialForm });

  /* =========================================================
     MEMUAT ULANG DATA
  ========================================================= */

  const loadData = useCallback(async () => {
    try {
      setError("");

      const [quizData, moduleData] = await Promise.all([
        getQuizzes(),
        getModules(),
      ]);

      setQuizzes(Array.isArray(quizData) ? quizData : []);
      setModules(Array.isArray(moduleData) ? moduleData : []);
    } catch (err) {
      console.error("Gagal memuat data:", err);
      setError(err.message || "Gagal memuat data kuis.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     PEMUATAN AWAL
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [quizData, moduleData] = await Promise.all([
          getQuizzes(),
          getModules(),
        ]);

        if (!isMounted) return;

        setQuizzes(Array.isArray(quizData) ? quizData : []);
        setModules(Array.isArray(moduleData) ? moduleData : []);
        setError("");
      } catch (err) {
        if (!isMounted) return;

        console.error("Gagal memuat data:", err);
        setError(err.message || "Gagal memuat data kuis.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     CEK APAKAH MODUL SUDAH MEMILIKI KUIS
  ========================================================= */

  const moduleHasQuiz = (moduleId) => {
    return quizzes.some(
      (quiz) =>
        String(quiz.module_id) === String(moduleId) &&
        quiz.id !== editingQuiz?.id,
    );
  };

  /* =========================================================
     TAMBAH KUIS
  ========================================================= */

  const handleAdd = () => {
    setEditingQuiz(null);
    setFormData({ ...initialForm });
    setError("");
    setShowModal(true);
  };

  /* =========================================================
     EDIT KUIS
  ========================================================= */

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);

    setFormData({
      module_id: quiz.module_id || "",
      title: quiz.title || "",
      description: quiz.description || "",
      question_count: quiz.question_count || 10,
      max_attempts: quiz.max_attempts || 3,
      status: quiz.status || "draft",
    });

    setError("");
    setShowModal(true);
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     TUTUP MODAL
  ========================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingQuiz(null);
    setFormData({ ...initialForm });
    setError("");
  };

  /* =========================================================
     SIMPAN KUIS
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.module_id) {
      alert("Module wajib dipilih.");
      return;
    }

    if (moduleHasQuiz(formData.module_id)) {
      alert(
        "Module ini sudah memiliki kuis. Satu module hanya boleh memiliki satu kuis.",
      );
      return;
    }

    if (!formData.title.trim()) {
      alert("Judul kuis wajib diisi.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Deskripsi kuis wajib diisi.");
      return;
    }

    if (!formData.question_count || Number(formData.question_count) < 1) {
      alert("Jumlah soal minimal 1.");
      return;
    }

    const payload = {
      module_id: formData.module_id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      question_count: Number(formData.question_count),
      max_attempts: Number(formData.max_attempts),
      status: formData.status,
    };

    try {
      setSaving(true);
      setError("");

      if (editingQuiz) {
        await updateQuiz(editingQuiz.id, payload);
      } else {
        await createQuiz(payload);
      }

      await loadData();

      setShowModal(false);
      setEditingQuiz(null);
      setFormData({ ...initialForm });
    } catch (err) {
      console.error("Gagal menyimpan kuis:", err);
      alert(err.message || "Gagal menyimpan kuis.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     HAPUS KUIS
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus kuis ini?",
    );

    if (!confirmed) return;

    try {
      await deleteQuiz(id);
      await loadData();
    } catch (err) {
      console.error("Gagal menghapus kuis:", err);
      alert(err.message || "Gagal menghapus kuis.");
    }
  };

  /* =========================================================
     KELOLA SOAL
  ========================================================= */

  const handleQuestions = (id) => {
    navigate(`/dosen/quiz/${id}/soal`);
  };

  /* =========================================================
     GET MODULE
  ========================================================= */

  const getModuleTitle = (moduleId) => {
    const module = modules.find((item) => String(item.id) === String(moduleId));

    return module?.title || "Module tidak ditemukan";
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dosen-quiz-page">
      {/* HEADER */}

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

      {/* INFO */}

      <div className="dosen-quiz-info">
        <div className="dosen-quiz-info-icon">
          <FaQuestionCircle />
        </div>

        <div>
          <strong>Tentang Kuis</strong>

          <p>
            Setiap module hanya memiliki satu kuis. Kuis digunakan untuk
            mengevaluasi pemahaman mahasiswa setelah mempelajari materi.
          </p>
        </div>
      </div>

      {/* TOTAL */}

      <div className="dosen-quiz-toolbar">
        <div className="dosen-quiz-total">
          <strong>{quizzes.length}</strong>
          <span>Quiz</span>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="dosen-quiz-error">
          {error}

          <button type="button" onClick={loadData}>
            Coba Lagi
          </button>
        </div>
      )}

      {/* GRID */}

      <div className="dosen-quiz-list">
        {loading ? (
          <div className="dosen-quiz-empty">
            <p>Memuat data kuis...</p>
          </div>
        ) : quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <article className="dosen-quiz-card" key={quiz.id}>
              {/* TOP */}

              <div className="dosen-quiz-card-top">
                <div className="dosen-quiz-icon">
                  <FaQuestionCircle />
                </div>

                <span
                  className={`dosen-quiz-status ${
                    quiz.status === "publik" ? "published" : "draft"
                  }`}
                >
                  {quiz.status === "publik" ? "Publik" : "Draft"}
                </span>
              </div>

              {/* CONTENT */}

              <div className="dosen-quiz-card-content">
                <span className="dosen-quiz-module">
                  <FaBookOpen />
                  {getModuleTitle(quiz.module_id)}
                </span>

                <h3>{quiz.title}</h3>

                <p>{quiz.description}</p>
              </div>

              {/* INFO */}

              <div className="dosen-quiz-info">
                <div>
                  <FaQuestionCircle />
                  <span>{quiz.question_count} Soal</span>
                </div>

                <div>
                  <span className="attempt-icon">↻</span>
                  <span>Maksimal {quiz.max_attempts} Percobaan</span>
                </div>
              </div>

              {/* ACTION */}

              <div className="dosen-quiz-card-actions">
                <button
                  type="button"
                  className="dosen-quiz-question-btn"
                  onClick={() => handleQuestions(quiz.id)}
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
            </article>
          ))
        ) : (
          <div className="dosen-quiz-empty">
            <FaQuestionCircle />

            <h3>Belum ada kuis</h3>

            <p>Tambahkan kuis untuk mulai mengelola evaluasi pembelajaran.</p>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT */}

      {showModal && (
        <div
          className="dosen-quiz-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
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
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* MODULE */}

              <div className="dosen-quiz-field">
                <label htmlFor="module_id">Module</label>

                <select
                  id="module_id"
                  name="module_id"
                  value={formData.module_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Module</option>

                  {modules.map((module) => {
                    const alreadyHasQuiz = moduleHasQuiz(module.id);

                    return (
                      <option
                        key={module.id}
                        value={module.id}
                        disabled={alreadyHasQuiz}
                      >
                        {module.title}
                        {alreadyHasQuiz ? " (Sudah memiliki kuis)" : ""}
                      </option>
                    );
                  })}
                </select>

                <small>Satu module hanya dapat memiliki satu kuis.</small>
              </div>

              {/* JUDUL */}

              <div className="dosen-quiz-field">
                <label htmlFor="title">Judul Quiz</label>

                <input
                  id="title"
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
                <label htmlFor="description">Deskripsi</label>

                <textarea
                  id="description"
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
                <label htmlFor="question_count">Jumlah Soal</label>

                <input
                  id="question_count"
                  name="question_count"
                  type="number"
                  min="1"
                  value={formData.question_count}
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
                <label htmlFor="max_attempts">
                  Maksimal Percobaan Mahasiswa
                </label>

                <select
                  id="max_attempts"
                  name="max_attempts"
                  value={formData.max_attempts}
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
                <label htmlFor="status">Status</label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="publik">Publik</option>
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
                  onClick={closeModal}
                  disabled={saving}
                >
                  <FaTimes />
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-quiz-save-btn"
                  disabled={saving}
                >
                  <FaSave />
                  {saving
                    ? "Menyimpan..."
                    : editingQuiz
                      ? "Simpan Perubahan"
                      : "Simpan Quiz"}
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
