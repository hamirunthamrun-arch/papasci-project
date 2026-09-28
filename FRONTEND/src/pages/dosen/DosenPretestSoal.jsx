import { useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaEdit,
  FaFileImage,
  FaPlus,
  FaQuestionCircle,
  FaSave,
  FaTrash,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import "../../css/dosen/DosenPretestSoal.css";

/* =========================================================
   DATA PRETEST
========================================================= */

const pretestData = [
  {
    id: 1,
    title: "Pretest Makhluk Hidup",
    module: "Makhluk Hidup",
    duration: 30,
  },
  {
    id: 2,
    title: "Pretest Gaya dan Gerak",
    module: "Gaya dan Gerak",
    duration: 30,
  },
  {
    id: 3,
    title: "Pretest Energi",
    module: "Energi",
    duration: 20,
  },
];

/* =========================================================
   DATA SOAL DUMMY
========================================================= */

const initialQuestions = [
  {
    id: 1,
    pretestId: 1,
    question: "Manakah yang termasuk makhluk hidup?",
    questionImage: "",
    optionA: "Batu",
    optionB: "Kucing",
    optionC: "Meja",
    optionD: "Buku",
    correctAnswer: "B",
    points: 10,
  },
  {
    id: 2,
    pretestId: 1,
    question: "Salah satu ciri makhluk hidup adalah...",
    questionImage: "",
    optionA: "Tidak membutuhkan makanan",
    optionB: "Tidak dapat tumbuh",
    optionC: "Dapat berkembang biak",
    optionD: "Tidak dapat bergerak",
    correctAnswer: "C",
    points: 10,
  },
  {
    id: 3,
    pretestId: 1,
    question: "Perhatikan gambar berikut. Apa yang sedang dilakukan tumbuhan?",
    questionImage:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80",
    optionA: "Tumbuh",
    optionB: "Bergerak",
    optionC: "Berkembang biak",
    optionD: "Tidur",
    correctAnswer: "A",
    points: 10,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function DosenPretestSoal() {
  const navigate = useNavigate();
  const { id } = useParams();

  const pretestId = Number(id);

  const currentPretest =
    pretestData.find((pretest) => pretest.id === pretestId) || pretestData[0];

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
     FILTER SOAL
  ======================================================= */

  const currentQuestions = useMemo(() => {
    return questions.filter(
      (question) => question.pretestId === currentPretest.id,
    );
  }, [questions, currentPretest.id]);

  /* =======================================================
     TOTAL NILAI
  ======================================================= */

  const totalPoints = currentQuestions.reduce(
    (total, question) => total + Number(question.points || 0),
    0,
  );

  /* =======================================================
     TAMBAH SOAL
  ======================================================= */

  const handleAdd = () => {
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
     EDIT SOAL
  ======================================================= */

  const handleEdit = (question) => {
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
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     UPLOAD GAMBAR
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

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Ukuran gambar maksimal 5 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setFormData((previous) => ({
      ...previous,
      questionImage: imageUrl,
    }));
  };

  /* =========================================================
   HAPUS GAMBAR
========================================================= */

  const handleRemoveImage = () => {
    setFormData((previous) => ({
      ...previous,
      questionImage: "",
    }));
  };

  /* =======================================================
     SIMPAN SOAL
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.question.trim()) {
      alert("Pertanyaan wajib diisi.");
      return;
    }

    if (!formData.optionA.trim()) {
      alert("Pilihan A wajib diisi.");
      return;
    }

    if (!formData.optionB.trim()) {
      alert("Pilihan B wajib diisi.");
      return;
    }

    if (!formData.optionC.trim()) {
      alert("Pilihan C wajib diisi.");
      return;
    }

    if (!formData.optionD.trim()) {
      alert("Pilihan D wajib diisi.");
      return;
    }

    if (!formData.points) {
      alert("Bobot soal wajib diisi.");
      return;
    }

    if (editingQuestion) {
      setQuestions((previous) =>
        previous.map((question) =>
          question.id === editingQuestion.id
            ? {
                ...question,
                question: formData.question.trim(),
                questionImage: formData.questionImage,
                optionA: formData.optionA.trim(),
                optionB: formData.optionB.trim(),
                optionC: formData.optionC.trim(),
                optionD: formData.optionD.trim(),
                correctAnswer: formData.correctAnswer,
                points: Number(formData.points),
              }
            : question,
        ),
      );
    } else {
      const newId =
        questions.length > 0
          ? Math.max(...questions.map((question) => question.id)) + 1
          : 1;

      const newQuestion = {
        id: newId,
        pretestId: currentPretest.id,
        question: formData.question.trim(),
        questionImage: formData.questionImage,
        optionA: formData.optionA.trim(),
        optionB: formData.optionB.trim(),
        optionC: formData.optionC.trim(),
        optionD: formData.optionD.trim(),
        correctAnswer: formData.correctAnswer,
        points: Number(formData.points),
      };

      setQuestions((previous) => [...previous, newQuestion]);
    }

    closeModal();
  };

  /* =======================================================
     HAPUS SOAL
  ======================================================= */

  const handleDelete = (questionId) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus soal ini?",
    );

    if (!confirmed) {
      return;
    }

    setQuestions((previous) =>
      previous.filter((question) => question.id !== questionId),
    );
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setShowModal(false);
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
  };

  /* =======================================================
     KEMBALI
  ======================================================= */

  const handleBack = () => {
    navigate("/dosen/pretest");
  };

  return (
    <div className="dosen-pretest-soal-page">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="dosen-pretest-soal-header">
        <div>
          <button
            type="button"
            className="dosen-pretest-soal-back-btn"
            onClick={handleBack}
          >
            <FaArrowLeft />
            Kembali ke Pretest
          </button>

          <span className="dosen-pretest-soal-eyebrow">
            <FaQuestionCircle />
            KELOLA SOAL
          </span>

          <h1>{currentPretest.title}</h1>

          <p>
            {currentPretest.module} • {currentPretest.duration} menit
          </p>
        </div>

        <button
          type="button"
          className="dosen-pretest-soal-add-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Tambah Soal
        </button>
      </div>

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="dosen-pretest-soal-summary">
        <div className="dosen-pretest-soal-summary-item">
          <span>Total Soal</span>
          <strong>{currentQuestions.length}</strong>
        </div>

        <div className="dosen-pretest-soal-summary-item">
          <span>Total Nilai</span>
          <strong>{totalPoints}</strong>
        </div>

        <div className="dosen-pretest-soal-summary-item">
          <span>Durasi</span>
          <strong>{currentPretest.duration} Menit</strong>
        </div>

        <div className="dosen-pretest-soal-summary-note">
          <FaFileImage />

          <span>Gambar soal bersifat opsional.</span>
        </div>
      </div>

      {/* ===================================================
          LIST SOAL
      =================================================== */}

      <div className="dosen-pretest-soal-list">
        {currentQuestions.length > 0 ? (
          currentQuestions.map((question, index) => (
            <article className="dosen-pretest-soal-card" key={question.id}>
              {/* CARD HEADER */}

              <div className="dosen-pretest-soal-card-header">
                <div className="dosen-pretest-soal-number">
                  SOAL {String(index + 1).padStart(2, "0")}
                </div>

                <div className="dosen-pretest-soal-card-actions">
                  <button
                    type="button"
                    className="dosen-pretest-soal-edit-btn"
                    onClick={() => handleEdit(question)}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="dosen-pretest-soal-delete-btn"
                    onClick={() => handleDelete(question.id)}
                  >
                    <FaTrash />
                    Hapus
                  </button>
                </div>
              </div>

              {/* QUESTION */}

              <div className="dosen-pretest-soal-question">
                <h3>{question.question}</h3>

                {question.questionImage && (
                  <div className="dosen-pretest-soal-image">
                    <img
                      src={question.questionImage}
                      alt={`Soal ${index + 1}`}
                    />
                  </div>
                )}
              </div>

              {/* OPTIONS */}

              <div className="dosen-pretest-soal-options">
                {[
                  {
                    key: "A",
                    value: question.optionA,
                  },
                  {
                    key: "B",
                    value: question.optionB,
                  },
                  {
                    key: "C",
                    value: question.optionC,
                  },
                  {
                    key: "D",
                    value: question.optionD,
                  },
                ].map((option) => {
                  const isCorrect = option.key === question.correctAnswer;

                  return (
                    <div
                      key={option.key}
                      className={`dosen-pretest-soal-option ${
                        isCorrect ? "correct" : ""
                      }`}
                    >
                      <span className="dosen-pretest-soal-option-letter">
                        {option.key}
                      </span>

                      <span className="dosen-pretest-soal-option-text">
                        {option.value}
                      </span>

                      {isCorrect && (
                        <span className="dosen-pretest-soal-correct">
                          <FaCheck />
                          Jawaban benar
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* FOOTER */}

              <div className="dosen-pretest-soal-card-footer">
                <span>
                  Bobot: <strong>{question.points}</strong> poin
                </span>

                {question.questionImage ? (
                  <span className="dosen-pretest-soal-image-badge">
                    <FaFileImage />
                    Menggunakan gambar
                  </span>
                ) : (
                  <span className="dosen-pretest-soal-no-image">
                    Tanpa gambar
                  </span>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="dosen-pretest-soal-empty">
            <FaQuestionCircle />

            <h3>Belum ada soal</h3>

            <p>Tambahkan soal pertama untuk pretest ini.</p>

            <button type="button" onClick={handleAdd}>
              <FaPlus />
              Tambah Soal
            </button>
          </div>
        )}
      </div>

      {/* ===================================================
          MODAL
      =================================================== */}

      {showModal && (
        <div
          className="dosen-pretest-soal-modal-overlay"
          onMouseDown={closeModal}
        >
          <div
            className="dosen-pretest-soal-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="dosen-pretest-soal-modal-header">
              <div>
                <span>{editingQuestion ? "EDIT SOAL" : "SOAL BARU"}</span>

                <h2>{editingQuestion ? "Edit Soal" : "Tambah Soal"}</h2>
              </div>

              <button
                type="button"
                className="dosen-pretest-soal-modal-close"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              {/* QUESTION */}

              <div className="dosen-pretest-soal-field">
                <label htmlFor="question">Pertanyaan</label>

                <textarea
                  id="question"
                  name="question"
                  rows="4"
                  placeholder="Tuliskan pertanyaan soal..."
                  value={formData.question}
                  onChange={handleChange}
                />
              </div>

              {/* IMAGE */}

              <div className="dosen-pretest-soal-image-field">
                <div className="dosen-pretest-soal-image-field-header">
                  <div>
                    <label>Gambar Soal</label>

                    <small>Opsional • JPG, PNG, WEBP • Maks. 5 MB</small>
                  </div>

                  {formData.questionImage && (
                    <button
                      type="button"
                      className="dosen-pretest-soal-remove-image"
                      onClick={handleRemoveImage}
                    >
                      <FaTrash />
                      Hapus gambar
                    </button>
                  )}
                </div>

                {formData.questionImage ? (
                  <div className="dosen-pretest-soal-image-preview">
                    <img
                      src={formData.questionImage}
                      alt="Preview gambar soal"
                    />

                    <div className="dosen-pretest-soal-image-overlay">
                      <span>Preview Gambar Soal</span>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="questionImage"
                    className="dosen-pretest-soal-upload-box"
                  >
                    <FaUpload />

                    <strong>Pilih gambar soal</strong>

                    <span>Klik untuk memilih gambar</span>

                    <input
                      id="questionImage"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                    />
                  </label>
                )}

                {formData.questionImage && (
                  <label
                    htmlFor="questionImage"
                    className="dosen-pretest-soal-change-image"
                  >
                    <FaUpload />
                    Ganti gambar
                    <input
                      id="questionImage"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* OPTIONS */}

              <div className="dosen-pretest-soal-options-form">
                <div className="dosen-pretest-soal-field">
                  <label htmlFor="optionA">Pilihan A</label>

                  <input
                    id="optionA"
                    name="optionA"
                    type="text"
                    placeholder="Masukkan pilihan A"
                    value={formData.optionA}
                    onChange={handleChange}
                  />
                </div>

                <div className="dosen-pretest-soal-field">
                  <label htmlFor="optionB">Pilihan B</label>

                  <input
                    id="optionB"
                    name="optionB"
                    type="text"
                    placeholder="Masukkan pilihan B"
                    value={formData.optionB}
                    onChange={handleChange}
                  />
                </div>

                <div className="dosen-pretest-soal-field">
                  <label htmlFor="optionC">Pilihan C</label>

                  <input
                    id="optionC"
                    name="optionC"
                    type="text"
                    placeholder="Masukkan pilihan C"
                    value={formData.optionC}
                    onChange={handleChange}
                  />
                </div>

                <div className="dosen-pretest-soal-field">
                  <label htmlFor="optionD">Pilihan D</label>

                  <input
                    id="optionD"
                    name="optionD"
                    type="text"
                    placeholder="Masukkan pilihan D"
                    value={formData.optionD}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ANSWER + POINTS */}

              <div className="dosen-pretest-soal-form-row">
                <div className="dosen-pretest-soal-field">
                  <label htmlFor="correctAnswer">Jawaban Benar</label>

                  <select
                    id="correctAnswer"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleChange}
                  >
                    <option value="A">A</option>

                    <option value="B">B</option>

                    <option value="C">C</option>

                    <option value="D">D</option>
                  </select>
                </div>

                <div className="dosen-pretest-soal-field">
                  <label htmlFor="points">Bobot Soal</label>

                  <input
                    id="points"
                    name="points"
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* NOTE */}

              <div className="dosen-pretest-soal-note">
                <FaFileImage />

                <p>
                  Gambar bersifat opsional. Jika soal tidak membutuhkan gambar,
                  langsung isi pertanyaan dan pilihan jawaban.
                </p>
              </div>

              {/* ACTION */}

              <div className="dosen-pretest-soal-modal-actions">
                <button
                  type="button"
                  className="dosen-pretest-soal-cancel-btn"
                  onClick={closeModal}
                >
                  Batal
                </button>

                <button type="submit" className="dosen-pretest-soal-save-btn">
                  <FaSave />

                  {editingQuestion ? "Simpan Perubahan" : "Simpan Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenPretestSoal;
