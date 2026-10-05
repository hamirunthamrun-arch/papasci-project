import { useEffect, useState } from "react";
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
import { useNavigate, useParams } from "react-router-dom";

import { fetchWithAuth, getAccessToken } from "../../service/authService";

import {
  getQuestionsByQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../service/quizQuestionService";

import "../../css/dosen/DosenQuizSoal.css";

/* =========================================================
   KONFIGURASI API DAN STORAGE
========================================================= */

const API_URL = "http://localhost:5000/api";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_BUCKET = "media-storage";
const STORAGE_FOLDER = "modules/quiz-questions";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* =========================================================
   FORM KOSONG
========================================================= */

const emptyForm = {
  question: "",
  questionImage: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  points: 10,
};

/* =========================================================
   NORMALISASI DATA SOAL
========================================================= */

const mapQuestion = (item) => ({
  id: item.id,
  quizId: item.quiz_id,
  orderNumber: Number(item.order_number || 1),
  question: item.question_text || "",
  questionImage: item.image_url || "",
  optionA: item.option_a || "",
  optionB: item.option_b || "",
  optionC: item.option_c || "",
  optionD: item.option_d || "",
  correctAnswer: (item.correct_answer || "A").toUpperCase(),
  points: Number(item.weight ?? 10),
});

/* =========================================================
   HELPER STORAGE
========================================================= */

const getPublicUrl = (path) => {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodedPath}`;
};

const getStoragePath = (imageUrl) => {
  if (!imageUrl || !SUPABASE_URL) return null;

  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
};

/* =========================================================
   UPLOAD GAMBAR
========================================================= */

const uploadQuizImage = async (file) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }

  if (!file) {
    throw new Error("File gambar belum dipilih.");
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Gunakan gambar JPG, PNG, atau WEBP.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ukuran gambar maksimal 2 MB.");
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error("Session tidak ditemukan. Silakan login kembali.");
  }

  const extension = file.name.split(".").pop().toLowerCase();
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const path = `${STORAGE_FOLDER}/${fileName}`;

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodedPath}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: file,
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || result.error || "Gagal mengunggah gambar.",
    );
  }

  return {
    path,
    url: getPublicUrl(path),
  };
};

/* =========================================================
   HAPUS GAMBAR STORAGE
========================================================= */

const deleteStorageImage = async (path) => {
  if (!path) return;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error("Session tidak ditemukan.");
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodedPath}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || result.error || "Gagal menghapus gambar.",
    );
  }
};

/* =========================================================
   AMBIL DETAIL KUIS
========================================================= */

const getQuizDetail = async (id) => {
  const response = await fetchWithAuth(
    `${API_URL}/quiz/${encodeURIComponent(id)}`,
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Gagal mengambil data kuis.");
  }

  return result?.data ?? null;
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenQuizSoal() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({ ...emptyForm });
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  /* =======================================================
     MEMUAT SOAL
  ======================================================= */

  const loadQuestions = async (quizId) => {
    const data = await getQuestionsByQuiz(quizId);

    const mapped = Array.isArray(data)
      ? data.map(mapQuestion).sort((a, b) => a.orderNumber - b.orderNumber)
      : [];

    setQuestions(mapped);
    return mapped;
  };

  /* =======================================================
     MEMUAT DATA KUIS DAN SOAL
  ======================================================= */

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!id) {
        setCurrentQuiz(null);
        setQuestions([]);
        setError("ID kuis tidak ditemukan.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setCurrentQuiz(null);
      setQuestions([]);

      try {
        const quiz = await getQuizDetail(id);

        if (ignore) return;

        if (!quiz) {
          throw new Error("Data kuis tidak ditemukan.");
        }

        setCurrentQuiz(quiz);

        const questionData = await getQuestionsByQuiz(id);

        if (ignore) return;

        const mapped = Array.isArray(questionData)
          ? questionData
              .map(mapQuestion)
              .sort((a, b) => a.orderNumber - b.orderNumber)
          : [];

        setQuestions(mapped);
      } catch (err) {
        if (ignore) return;

        setError(err.message || "Gagal memuat data.");
        setCurrentQuiz(null);
        setQuestions([]);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [id]);

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingQuestion(null);
    setSelectedImageFile(null);
  };

  /* =======================================================
     TAMBAH SOAL
  ======================================================= */

  const handleAddQuestion = () => {
    resetForm();
    setError("");
    setShowModal(true);
  };

  /* =======================================================
     EDIT SOAL
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
      correctAnswer: question.correctAnswer || "A",
      points: question.points || 10,
    });

    setSelectedImageFile(null);
    setError("");
    setShowModal(true);
  };

  /* =======================================================
     PERUBAHAN FORM
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     PILIH GAMBAR
  ======================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Gunakan gambar JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Ukuran gambar maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedImageFile(file);

    setFormData((previous) => ({
      ...previous,
      questionImage: URL.createObjectURL(file),
    }));
  };

  /* =======================================================
     HAPUS GAMBAR DARI FORM
  ======================================================= */

  const handleRemoveImage = () => {
    setFormData((previous) => ({
      ...previous,
      questionImage: "",
    }));

    setSelectedImageFile(null);

    const input = document.getElementById("questionImage");

    if (input) {
      input.value = "";
    }
  };

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  /* =======================================================
     MEMBUAT PAYLOAD
  ======================================================= */

  const buildPayload = (orderNumber, imageUrl) => ({
    quiz_id: id,
    question_text: formData.question.trim(),
    image_url: imageUrl,
    option_a: formData.optionA.trim(),
    option_b: formData.optionB.trim(),
    option_c: formData.optionC.trim(),
    option_d: formData.optionD.trim(),
    correct_answer: formData.correctAnswer.toUpperCase(),
    weight: Number(formData.points),
    order_number: orderNumber,
  });

  /* =======================================================
     VALIDASI FORM
  ======================================================= */

  const validateForm = () => {
    if (!formData.question.trim()) {
      return "Pertanyaan wajib diisi.";
    }

    const options = [
      formData.optionA,
      formData.optionB,
      formData.optionC,
      formData.optionD,
    ];

    if (options.some((option) => !option.trim())) {
      return "Semua pilihan jawaban wajib diisi.";
    }

    if (!["A", "B", "C", "D"].includes(formData.correctAnswer)) {
      return "Pilih jawaban benar yang valid.";
    }

    const points = Number(formData.points);

    if (!Number.isInteger(points) || points <= 0) {
      return "Bobot soal harus berupa bilangan bulat positif.";
    }

    if (
      selectedImageFile &&
      !ALLOWED_IMAGE_TYPES.includes(selectedImageFile.type)
    ) {
      return "Format gambar tidak didukung.";
    }

    if (selectedImageFile && selectedImageFile.size > MAX_IMAGE_SIZE) {
      return "Ukuran gambar maksimal 2 MB.";
    }

    return "";
  };

  /* =======================================================
     SIMPAN SOAL
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    let uploadedImage = null;
    let databaseSaved = false;

    try {
      let orderNumber;

      if (editingQuestion) {
        orderNumber = editingQuestion.orderNumber;
      } else {
        orderNumber =
          questions.length > 0
            ? Math.max(...questions.map((question) => question.orderNumber)) + 1
            : 1;
      }

      let imageUrl = formData.questionImage.startsWith("http")
        ? formData.questionImage
        : null;

      if (selectedImageFile) {
        uploadedImage = await uploadQuizImage(selectedImageFile);
        imageUrl = uploadedImage.url;
      }

      const payload = buildPayload(orderNumber, imageUrl);

      /* EDIT */
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, payload);
        databaseSaved = true;

        const oldPath = getStoragePath(editingQuestion.questionImage);

        const imageWasReplacedOrRemoved =
          Boolean(oldPath) && (Boolean(uploadedImage) || !imageUrl);

        if (
          imageWasReplacedOrRemoved &&
          oldPath.startsWith(`${STORAGE_FOLDER}/`)
        ) {
          try {
            await deleteStorageImage(oldPath);
          } catch (storageError) {
            console.warn(
              "Data soal berhasil diperbarui, tetapi gambar lama gagal dihapus:",
              storageError,
            );
          }
        }
      } else {
        /* TAMBAH */
        await createQuestion(payload);
        databaseSaved = true;
      }

      await loadQuestions(id);

      setShowModal(false);
      resetForm();
    } catch (err) {
      if (uploadedImage && !databaseSaved) {
        try {
          await deleteStorageImage(uploadedImage.path);
        } catch (cleanupError) {
          console.warn("File hasil upload gagal dibersihkan:", cleanupError);
        }
      }

      setError(err.message || "Gagal menyimpan soal.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     HAPUS SOAL
  ======================================================= */

  const handleDeleteQuestion = async (question) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus soal ini?",
    );

    if (!confirmed) return;

    setDeletingId(question.id);
    setError("");

    try {
      await deleteQuestion(question.id);

      const imagePath = getStoragePath(question.questionImage);

      if (imagePath && imagePath.startsWith(`${STORAGE_FOLDER}/`)) {
        try {
          await deleteStorageImage(imagePath);
        } catch (storageError) {
          console.warn(
            "Soal terhapus, tetapi gambar gagal dihapus:",
            storageError,
          );
        }
      }

      setQuestions((previous) =>
        previous.filter((item) => item.id !== question.id),
      );
    } catch (err) {
      setError(err.message || "Gagal menghapus soal.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     KEMBALI
  ======================================================= */

  const handleBack = () => {
    navigate("/dosen/quiz");
  };

  /* =======================================================
     TANPA ID
  ======================================================= */

  if (!id) {
    return (
      <div className="dosen-quiz-soal-page">
        <button
          type="button"
          className="dosen-quiz-soal-back-btn"
          onClick={handleBack}
        >
          <FaArrowLeft />
          Kembali ke Quiz
        </button>

        <p role="alert">ID kuis tidak ditemukan.</p>
      </div>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="dosen-quiz-soal-page">
        <p>Memuat data kuis dan soal...</p>
      </div>
    );
  }

  /* =======================================================
     KUIS TIDAK DITEMUKAN
  ======================================================= */

  if (!currentQuiz) {
    return (
      <div className="dosen-quiz-soal-page">
        <button
          type="button"
          className="dosen-quiz-soal-back-btn"
          onClick={handleBack}
        >
          <FaArrowLeft />
          Kembali ke Quiz
        </button>

        <p role="alert">{error || "Data kuis tidak ditemukan."}</p>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-quiz-soal-page">
      {/* HEADER */}

      <div className="dosen-quiz-soal-header">
        <div className="dosen-quiz-soal-header-left">
          <button
            type="button"
            className="dosen-quiz-soal-back-btn"
            onClick={handleBack}
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
                Kelola soal untuk quiz {currentQuiz.module || currentQuiz.title}
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

      {error && (
        <div role="alert" className="dosen-quiz-soal-error">
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <div className="dosen-quiz-soal-summary">
        <div className="quiz-summary-card">
          <span>Quiz</span>
          <strong>{currentQuiz.title}</strong>
        </div>

        <div className="quiz-summary-card">
          <span>Jumlah Soal</span>
          <strong>{questions.length}</strong>
        </div>
      </div>

      {/* INFO GAMBAR */}

      <div className="dosen-quiz-image-info">
        <div className="dosen-quiz-image-info-icon">
          <FaImage />
        </div>

        <div>
          <strong>Gambar pada soal bersifat opsional</strong>
          <p>
            Dosen dapat menambahkan gambar jika soal membutuhkan ilustrasi. Jika
            tidak diperlukan, soal dapat dibuat tanpa gambar.
          </p>
        </div>
      </div>

      {/* LIST SOAL */}

      <div className="dosen-quiz-question-list">
        {questions.length === 0 ? (
          <div className="dosen-quiz-empty">
            <FaQuestionCircle />
            <h3>Belum ada soal</h3>
            <p>Tambahkan soal untuk quiz ini.</p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div className="dosen-quiz-question-card" key={question.id}>
              <div className="dosen-quiz-question-header">
                <div className="question-number">
                  Soal{" "}
                  {String(question.orderNumber || index + 1).padStart(2, "0")}
                </div>

                <div className="question-header-actions">
                  <button
                    type="button"
                    className="question-edit-btn"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="question-delete-btn"
                    onClick={() => handleDeleteQuestion(question)}
                    disabled={deletingId === question.id}
                  >
                    <FaTrash />
                    {deletingId === question.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>

              <div className="dosen-quiz-question-content">
                <div className="question-text-section">
                  <h3>{question.question}</h3>

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

                <div className="question-options">
                  {[
                    { key: "A", value: question.optionA },
                    { key: "B", value: question.optionB },
                    { key: "C", value: question.optionC },
                    { key: "D", value: question.optionD },
                  ].map((option) => {
                    const isCorrect = question.correctAnswer === option.key;

                    return (
                      <div
                        key={option.key}
                        className={`question-option ${
                          isCorrect ? "correct" : ""
                        }`}
                      >
                        <span>{option.key}</span>
                        <p>{option.value}</p>

                        {isCorrect && <FaCheckCircle />}
                      </div>
                    );
                  })}
                </div>

                <div className="question-footer">
                  <span>
                    Jawaban benar: <strong>{question.correctAnswer}</strong>
                  </span>

                  <span>
                    Poin: <strong>{question.points}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL TAMBAH / EDIT */}

      {showModal && (
        <div
          className="dosen-quiz-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeModal();
            }
          }}
        >
          <div className="dosen-quiz-modal">
            {/* HEADER MODAL */}

            <div className="dosen-quiz-modal-header">
              <div>
                <h2>{editingQuestion ? "Edit Soal" : "Tambah Soal"}</h2>
                <p>{currentQuiz.title}</p>
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

            {/* FORM */}

            <form className="dosen-quiz-form" onSubmit={handleSubmit}>
              {/* PERTANYAAN */}

              <div className="quiz-form-group">
                <label htmlFor="question">
                  Pertanyaan <span>*</span>
                </label>

                <textarea
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="Tuliskan pertanyaan..."
                  rows="4"
                  disabled={saving}
                  required
                />
              </div>

              {/* GAMBAR SOAL */}

              <div className="quiz-form-group">
                <label>
                  Gambar Soal <small>Opsional</small>
                </label>

                {formData.questionImage ? (
                  <div className="quiz-image-preview">
                    <img src={formData.questionImage} alt="Preview soal" />

                    <div className="quiz-image-actions">
                      <label className="quiz-image-change-btn">
                        <FaUpload />
                        Ganti Gambar
                        <input
                          id="questionImage"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleImageChange}
                          disabled={saving}
                        />
                      </label>

                      <button
                        type="button"
                        className="quiz-image-remove-btn"
                        onClick={handleRemoveImage}
                        disabled={saving}
                      >
                        <FaTrash />
                        Hapus Gambar
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="quiz-image-upload">
                    <FaImage />
                    <strong>Tambahkan gambar soal</strong>
                    <span>JPG, PNG, WEBP — maksimal 2 MB</span>

                    <input
                      id="questionImage"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      disabled={saving}
                    />
                  </label>
                )}
              </div>

              {/* PILIHAN JAWABAN */}

              {["A", "B", "C", "D"].map((letter) => (
                <div className="quiz-form-group" key={letter}>
                  <label htmlFor={`option${letter}`}>
                    Pilihan {letter} <span>*</span>
                  </label>

                  <input
                    id={`option${letter}`}
                    type="text"
                    name={`option${letter}`}
                    value={formData[`option${letter}`]}
                    onChange={handleChange}
                    placeholder={`Masukkan pilihan ${letter}`}
                    disabled={saving}
                    required
                  />
                </div>
              ))}

              {/* JAWABAN DAN POIN */}

              <div className="quiz-form-row">
                <div className="quiz-form-group">
                  <label htmlFor="correctAnswer">Jawaban Benar</label>

                  <select
                    id="correctAnswer"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    {["A", "B", "C", "D"].map((letter) => (
                      <option key={letter} value={letter}>
                        {letter}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="quiz-form-group">
                  <label htmlFor="points">Poin</label>

                  <input
                    id="points"
                    type="number"
                    name="points"
                    value={formData.points}
                    min="1"
                    step="1"
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>
              </div>

              {/* CATATAN */}

              <div className="dosen-quiz-image-info">
                <FaImage />
                <p>
                  Gambar bersifat opsional. Jika soal tidak membutuhkan gambar,
                  langsung isi pertanyaan dan pilihan jawaban.
                </p>
              </div>

              {/* AKSI MODAL */}

              <div className="dosen-quiz-modal-footer">
                <button
                  type="button"
                  className="quiz-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  <FaTimes />
                  Batal
                </button>

                <button
                  type="submit"
                  className="quiz-save-btn"
                  disabled={saving}
                >
                  <FaSave />
                  {saving
                    ? "Mengunggah dan menyimpan..."
                    : editingQuestion
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
