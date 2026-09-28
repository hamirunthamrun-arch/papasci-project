import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEdit,
  FaImage,
  FaPlus,
  FaQuestionCircle,
  FaSave,
  FaTimes,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

import "../../css/dosen/DosenQuizSoal.css";

/* =========================================================
   DATA QUIZ
========================================================= */

const quizData = [
  {
    id: 1,
    title: "Quiz Makhluk Hidup",
    module: "Makhluk Hidup",
    duration: 30,
  },
  {
    id: 2,
    title: "Quiz Gaya dan Gerak",
    module: "Gaya dan Gerak",
    duration: 30,
  },
  {
    id: 3,
    title: "Quiz Energi",
    module: "Energi",
    duration: 20,
  },
];

/* =========================================================
   DATA SOAL AWAL
========================================================= */

const initialQuestions = [
  {
    id: 1,
    quizId: 1,
    question:
      "Manakah yang termasuk contoh makhluk hidup?",
    questionImage: "",
    optionA: "Batu",
    optionB: "Kucing",
    optionC: "Meja",
    optionD: "Pensil",
    correctAnswer: "B",
    points: 10,
  },

  {
    id: 2,
    quizId: 1,
    question:
      "Salah satu ciri makhluk hidup adalah dapat bernapas.",
    questionImage:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    optionA: "Benar",
    optionB: "Salah",
    optionC: "Tidak tahu",
    optionD: "Semua salah",
    correctAnswer: "A",
    points: 10,
  },

  {
    id: 3,
    quizId: 1,
    question:
      "Apa yang dibutuhkan tumbuhan agar dapat tumbuh dengan baik?",
    questionImage: "",
    optionA: "Air dan cahaya matahari",
    optionB: "Batu dan pasir",
    optionC: "Plastik dan besi",
    optionD: "Mainan dan buku",
    correctAnswer: "A",
    points: 10,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function DosenQuizSoal() {
  const navigate = useNavigate();
  const { id } = useParams();

  const quizId = Number(id);

  const currentQuiz =
    quizData.find((quiz) => quiz.id === quizId) || quizData[0];

  const [questions, setQuestions] = useState(initialQuestions);

  const [showModal, setShowModal] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({
    question: "",
    questionImage: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    points: 10,
  });

  /* =======================================================
     FILTER SOAL SESUAI QUIZ
  ======================================================= */

  const quizQuestions = questions.filter(
    (question) => question.quizId === quizId
  );

  const totalPoints = quizQuestions.reduce(
    (total, question) => total + Number(question.points || 0),
    0
  );

  /* =======================================================
     HANDLE INPUT
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     BUKA MODAL TAMBAH
  ======================================================= */

  const handleAddQuestion = () => {
    setEditingQuestion(null);

    setFormData({
      question: "",
      questionImage: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      points: 10,
    });

    setShowModal(true);
  };

  /* =======================================================
     BUKA MODAL EDIT
  ======================================================= */

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);

    setFormData({
      question: question.question,
      questionImage: question.questionImage || "",
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer,
      points: question.points,
    });

    setShowModal(true);
  };

  /* =======================================================
     UPLOAD GAMBAR SOAL
  ======================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File yang dipilih harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setFormData((previous) => ({
      ...previous,
      questionImage: imageUrl,
    }));
  };

  /* =======================================================
     HAPUS GAMBAR
  ======================================================= */

  const handleRemoveImage = () => {
    setFormData((previous) => ({
      ...previous,
      questionImage: "",
    }));
  };

  /* =======================================================
     SIMPAN SOAL
  ======================================================= */

  const handleSaveQuestion = (event) => {
    event.preventDefault();

    if (!formData.question.trim()) {
      alert("Pertanyaan harus diisi.");
      return;
    }

    if (!formData.optionA.trim()) {
      alert("Pilihan A harus diisi.");
      return;
    }

    if (!formData.optionB.trim()) {
      alert("Pilihan B harus diisi.");
      return;
    }

    if (!formData.optionC.trim()) {
      alert("Pilihan C harus diisi.");
      return;
    }

    if (!formData.optionD.trim()) {
      alert("Pilihan D harus diisi.");
      return;
    }

    if (editingQuestion) {
      setQuestions((previous) =>
        previous.map((question) =>
          question.id === editingQuestion.id
            ? {
                ...question,
                ...formData,
                points: Number(formData.points),
              }
            : question
        )
      );
    } else {
      const newQuestion = {
        id: Date.now(),
        quizId,
        ...formData,
        points: Number(formData.points),
      };

      setQuestions((previous) => [
        ...previous,
        newQuestion,
      ]);
    }

    setShowModal(false);
  };

  /* =======================================================
     HAPUS SOAL
  ======================================================= */

  const handleDeleteQuestion = (questionId) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus soal ini?"
    );

    if (!confirmed) {
      return;
    }

    setQuestions((previous) =>
      previous.filter(
        (question) => question.id !== questionId
      )
    );
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
  };

  return (
    <div className="dosen-quiz-soal-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dosen-quiz-soal-header">

        <div className="dosen-quiz-soal-header-left">
          <button
            type="button"
            className="dosen-quiz-soal-back-btn"
            onClick={() => navigate("/dosen/quiz")}
          >
            <FaArrowLeft />
            Kembali ke Quiz
          </button>

          <div className="dosen-quiz-soal-title-wrapper">
            <div className="dosen-quiz-soal-icon">
              <FaQuestionCircle />
            </div>

            <div>
              <h1>{currentQuiz.title}</h1>

              <p>
                Kelola soal untuk quiz {currentQuiz.module}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="dosen-quiz-soal-add-btn"
          onClick={handleAddQuestion}
        >
          <FaPlus />
          Tambah Soal
        </button>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="dosen-quiz-soal-summary">

        <div className="quiz-summary-card">
          <span>Quiz</span>
          <strong>{currentQuiz.title}</strong>
        </div>

        <div className="quiz-summary-card">
          <span>Module</span>
          <strong>{currentQuiz.module}</strong>
        </div>

        <div className="quiz-summary-card">
          <span>Jumlah Soal</span>
          <strong>{quizQuestions.length}</strong>
        </div>

        <div className="quiz-summary-card">
          <span>Total Poin</span>
          <strong>{totalPoints}</strong>
        </div>

        <div className="quiz-summary-card">
          <span>Durasi</span>
          <strong>{currentQuiz.duration} Menit</strong>
        </div>

      </div>

      {/* =================================================
          INFO GAMBAR
      ================================================= */}

      <div className="dosen-quiz-image-info">
        <div className="dosen-quiz-image-info-icon">
          <FaImage />
        </div>

        <div>
          <strong>Gambar pada soal bersifat opsional</strong>

          <p>
            Dosen dapat menambahkan gambar jika soal
            membutuhkan ilustrasi. Jika tidak diperlukan,
            soal dapat dibuat tanpa gambar.
          </p>
        </div>
      </div>

      {/* =================================================
          LIST SOAL
      ================================================= */}

      <div className="dosen-quiz-question-list">

        {quizQuestions.length === 0 ? (
          <div className="dosen-quiz-empty">
            <FaQuestionCircle />

            <h3>Belum ada soal</h3>

            <p>
              Tambahkan soal untuk quiz ini.
            </p>
            
          </div>
        ) : (
          quizQuestions.map((question, index) => (
            <div
              className="dosen-quiz-question-card"
              key={question.id}
            >

              {/* =========================================
                  QUESTION HEADER
              ========================================= */}

              <div className="dosen-quiz-question-header">

                <div className="question-number">
                  Soal {index + 1}
                </div>

                <div className="question-header-actions">

                  <button
                    type="button"
                    className="question-edit-btn"
                    onClick={() =>
                      handleEditQuestion(question)
                    }
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="question-delete-btn"
                    onClick={() =>
                      handleDeleteQuestion(question.id)
                    }
                  >
                    <FaTrash />
                    Hapus
                  </button>

                </div>

              </div>

              {/* =========================================
                  QUESTION CONTENT
              ========================================= */}

              <div className="dosen-quiz-question-content">

                <div className="question-text-section">

                  <h3>
                    {question.question}
                  </h3>

                  {question.questionImage ? (
                    <div className="question-image-wrapper">

                      <img
                        src={question.questionImage}
                        alt={`Ilustrasi soal ${index + 1}`}
                      />

                      <span>
                        <FaImage />
                        Menggunakan gambar
                      </span>

                    </div>
                  ) : (
                    <div className="question-no-image">
                      <FaImage />
                      <span>Tanpa gambar</span>
                    </div>
                  )}

                </div>

                {/* =======================================
                    OPTIONS
                ======================================= */}

                <div className="question-options">

                  <div
                    className={`question-option ${
                      question.correctAnswer === "A"
                        ? "correct"
                        : ""
                    }`}
                  >
                    <span>A</span>
                    <p>{question.optionA}</p>

                    {question.correctAnswer === "A" && (
                      <FaCheckCircle />
                    )}
                  </div>

                  <div
                    className={`question-option ${
                      question.correctAnswer === "B"
                        ? "correct"
                        : ""
                    }`}
                  >
                    <span>B</span>
                    <p>{question.optionB}</p>

                    {question.correctAnswer === "B" && (
                      <FaCheckCircle />
                    )}
                  </div>

                  <div
                    className={`question-option ${
                      question.correctAnswer === "C"
                        ? "correct"
                        : ""
                    }`}
                  >
                    <span>C</span>
                    <p>{question.optionC}</p>

                    {question.correctAnswer === "C" && (
                      <FaCheckCircle />
                    )}
                  </div>

                  <div
                    className={`question-option ${
                      question.correctAnswer === "D"
                        ? "correct"
                        : ""
                    }`}
                  >
                    <span>D</span>
                    <p>{question.optionD}</p>

                    {question.correctAnswer === "D" && (
                      <FaCheckCircle />
                    )}
                  </div>

                </div>

                {/* =======================================
                    QUESTION FOOTER
                ======================================= */}

                <div className="question-footer">

                  <span>
                    Jawaban benar:{" "}
                    <strong>
                      {question.correctAnswer}
                    </strong>
                  </span>

                  <span>
                    Poin:{" "}
                    <strong>
                      {question.points}
                    </strong>
                  </span>

                </div>

              </div>

            </div>
          ))
        )}

      </div>

      {/* =================================================
          MODAL TAMBAH / EDIT
      ================================================= */}

      {showModal && (
        <div className="dosen-quiz-modal-overlay">

          <div className="dosen-quiz-modal">

            {/* ===========================================
                MODAL HEADER
            =========================================== */}

            <div className="dosen-quiz-modal-header">

              <div>
                <h2>
                  {editingQuestion
                    ? "Edit Soal"
                    : "Tambah Soal"}
                </h2>

                <p>
                  {currentQuiz.title}
                </p>
              </div>

              <button
                type="button"
                className="dosen-quiz-modal-close"
                onClick={handleCloseModal}
              >
                <FaTimes />
              </button>

            </div>

            {/* ===========================================
                FORM
            =========================================== */}

            <form
              className="dosen-quiz-form"
              onSubmit={handleSaveQuestion}
            >

              {/* PERTANYAAN */}

              <div className="quiz-form-group">

                <label>
                  Pertanyaan
                  <span>*</span>
                </label>

                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="Tuliskan pertanyaan..."
                  rows="4"
                />

              </div>

              {/* =========================================
                  GAMBAR SOAL
              ========================================= */}

              <div className="quiz-form-group">

                <label>
                  Gambar Soal
                  <small>Opsional</small>
                </label>

                {formData.questionImage ? (
                  <div className="quiz-image-preview">

                    <img
                      src={formData.questionImage}
                      alt="Preview soal"
                    />

                    <div className="quiz-image-actions">

                      <label className="quiz-image-change-btn">
                        <FaUpload />
                        Ganti Gambar

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>

                      <button
                        type="button"
                        className="quiz-image-remove-btn"
                        onClick={handleRemoveImage}
                      >
                        <FaTrash />
                        Hapus Gambar
                      </button>

                    </div>

                  </div>
                ) : (
                  <label className="quiz-image-upload">

                    <FaImage />

                    <strong>
                      Tambahkan gambar soal
                    </strong>

                    <span>
                      JPG, PNG, WEBP — maksimal 5 MB
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />

                  </label>
                )}

              </div>

              {/* =========================================
                  PILIHAN A
              ========================================= */}

              <div className="quiz-form-group">

                <label>
                  Pilihan A
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="optionA"
                  value={formData.optionA}
                  onChange={handleChange}
                  placeholder="Masukkan pilihan A"
                />

              </div>

              {/* PILIHAN B */}

              <div className="quiz-form-group">

                <label>
                  Pilihan B
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="optionB"
                  value={formData.optionB}
                  onChange={handleChange}
                  placeholder="Masukkan pilihan B"
                />

              </div>

              {/* PILIHAN C */}

              <div className="quiz-form-group">

                <label>
                  Pilihan C
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="optionC"
                  value={formData.optionC}
                  onChange={handleChange}
                  placeholder="Masukkan pilihan C"
                />

              </div>

              {/* PILIHAN D */}

              <div className="quiz-form-group">

                <label>
                  Pilihan D
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="optionD"
                  value={formData.optionD}
                  onChange={handleChange}
                  placeholder="Masukkan pilihan D"
                />

              </div>

              {/* =========================================
                  JAWABAN & POIN
              ========================================= */}

              <div className="quiz-form-row">

                <div className="quiz-form-group">

                  <label>
                    Jawaban Benar
                  </label>

                  <select
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleChange}
                  >
                    <option value="A">
                      A
                    </option>

                    <option value="B">
                      B
                    </option>

                    <option value="C">
                      C
                    </option>

                    <option value="D">
                      D
                    </option>
                  </select>

                </div>

                <div className="quiz-form-group">

                  <label>
                    Poin
                  </label>

                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    min="1"
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* =========================================
                  MODAL FOOTER
              ========================================= */}

              <div className="dosen-quiz-modal-footer">

                <button
                  type="button"
                  className="quiz-cancel-btn"
                  onClick={handleCloseModal}
                >
                  <FaTimes />
                  Batal
                </button>

                <button
                  type="submit"
                  className="quiz-save-btn"
                >
                  <FaSave />
                  {editingQuestion
                    ? "Simpan Perubahan"
                    : "Simpan Soal"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default DosenQuizSoal;