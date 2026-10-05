import { useEffect, useState } from "react";
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

import { fetchWithAuth, getAccessToken } from "../../service/authService";

import {
  getQuestionsByPretest,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../service/pretestQuestionService";

import "../../css/dosen/DosenPretestSoal.css";

/* =========================================================
   KONFIGURASI API DAN STORAGE
========================================================= */

const API_URL = "http://localhost:5000/api";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_BUCKET = "media-storage";
const STORAGE_FOLDER = "modules/pretest-questions";

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
  pretestId: item.pretest_id,
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

const uploadPretestImage = async (file) => {
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
   AMBIL DETAIL PRETEST
========================================================= */

const getPretestDetail = async (id) => {
  const response = await fetchWithAuth(
    `${API_URL}/pretests/${encodeURIComponent(id)}`,
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Gagal mengambil data pretest.");
  }

  return result?.data ?? null;
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenPretestSoal() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentPretest, setCurrentPretest] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({ ...emptyForm });
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const totalPoints = questions.reduce(
    (total, question) => total + Number(question.points || 0),
    0,
  );

  /* =======================================================
     MEMUAT SOAL
  ======================================================= */

  const loadQuestions = async (pretestId) => {
    const data = await getQuestionsByPretest(pretestId);

    const mapped = Array.isArray(data)
      ? data.map(mapQuestion).sort((a, b) => a.orderNumber - b.orderNumber)
      : [];

    setQuestions(mapped);
    return mapped;
  };

  /* =======================================================
     MEMUAT DATA PRETEST DAN SOAL
  ======================================================= */

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!id) {
        setCurrentPretest(null);
        setQuestions([]);
        setError("ID pretest tidak ditemukan.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setCurrentPretest(null);
      setQuestions([]);

      try {
        const pretest = await getPretestDetail(id);

        if (ignore) return;

        if (!pretest) {
          throw new Error("Data pretest tidak ditemukan.");
        }

        setCurrentPretest(pretest);

        const questionData = await getQuestionsByPretest(id);

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
        setCurrentPretest(null);
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

  const handleAdd = () => {
    resetForm();
    setError("");
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

    const previewUrl = URL.createObjectURL(file);

    setFormData((previous) => ({
      ...previous,
      questionImage: previewUrl,
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
    pretest_id: id,
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

      /*
       * Jika gambar lama masih berupa URL,
       * pertahankan URL tersebut.
       *
       * Jika gambar sengaja dihapus,
       * imageUrl akan menjadi null.
       */
      let imageUrl = formData.questionImage.startsWith("http")
        ? formData.questionImage
        : null;

      /* Upload gambar baru */
      if (selectedImageFile) {
        uploadedImage = await uploadPretestImage(selectedImageFile);
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

  const handleDelete = async (question) => {
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
    navigate("/dosen/pretest");
  };

  /* =======================================================
     TANPA ID
  ======================================================= */

  if (!id) {
    return (
      <div className="dosen-pretest-soal-page">
        <button
          type="button"
          className="dosen-pretest-soal-back-btn"
          onClick={handleBack}
        >
          <FaArrowLeft />
          Kembali ke Pretest
        </button>

        <p role="alert">ID pretest tidak ditemukan.</p>
      </div>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="dosen-pretest-soal-page">
        <p>Memuat data pretest dan soal...</p>
      </div>
    );
  }

  /* =======================================================
     PRETEST TIDAK DITEMUKAN
  ======================================================= */

  if (!currentPretest) {
    return (
      <div className="dosen-pretest-soal-page">
        <button
          type="button"
          className="dosen-pretest-soal-back-btn"
          onClick={handleBack}
        >
          <FaArrowLeft />
          Kembali ke Pretest
        </button>

        <p role="alert">{error || "Data pretest tidak ditemukan."}</p>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-pretest-soal-page">
      {/* HEADER */}

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
          <p>{currentPretest.module || "Pretest"}</p>
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

      {error && (
        <div role="alert" className="dosen-pretest-soal-error">
          {error}
        </div>
      )}

      {/* RINGKASAN */}

      <div className="dosen-pretest-soal-summary">
        <div className="dosen-pretest-soal-summary-item">
          <span>Total Soal</span>
          <strong>{questions.length}</strong>
        </div>

        <div className="dosen-pretest-soal-summary-item">
          <span>Total Nilai</span>
          <strong>{totalPoints}</strong>
        </div>

        <div className="dosen-pretest-soal-summary-note">
          <FaFileImage />
          <span>Gambar soal bersifat opsional.</span>
        </div>
      </div>

      {/* DAFTAR SOAL */}

      <div className="dosen-pretest-soal-list">
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <article className="dosen-pretest-soal-card" key={question.id}>
              <div className="dosen-pretest-soal-card-header">
                <div className="dosen-pretest-soal-number">
                  SOAL{" "}
                  {String(question.orderNumber || index + 1).padStart(2, "0")}
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
                    onClick={() => handleDelete(question)}
                    disabled={deletingId === question.id}
                  >
                    <FaTrash />
                    {deletingId === question.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>

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

              <div className="dosen-pretest-soal-options">
                {[
                  { key: "A", value: question.optionA },
                  { key: "B", value: question.optionB },
                  { key: "C", value: question.optionC },
                  { key: "D", value: question.optionD },
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

      {/* MODAL TAMBAH / EDIT */}

      {showModal && (
        <div
          className="dosen-pretest-soal-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeModal();
            }
          }}
        >
          <div className="dosen-pretest-soal-modal">
            {/* HEADER MODAL */}

            <div className="dosen-pretest-soal-modal-header">
              <div>
                <span>{editingQuestion ? "EDIT SOAL" : "SOAL BARU"}</span>

                <h2>{editingQuestion ? "Edit Soal" : "Tambah Soal"}</h2>
              </div>

              <button
                type="button"
                className="dosen-pretest-soal-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              <div className="dosen-pretest-soal-field">
                <label htmlFor="question">Pertanyaan</label>

                <textarea
                  id="question"
                  name="question"
                  rows="4"
                  placeholder="Tuliskan pertanyaan soal..."
                  value={formData.question}
                  onChange={handleChange}
                  disabled={saving}
                  required
                />
              </div>

              {/* GAMBAR */}

              <div className="dosen-pretest-soal-image-field">
                <div className="dosen-pretest-soal-image-field-header">
                  <div>
                    <label>Gambar Soal</label>
                    <small>Opsional • JPG, PNG, WEBP • Maks. 2 MB</small>
                  </div>

                  {formData.questionImage && (
                    <button
                      type="button"
                      className="dosen-pretest-soal-remove-image"
                      onClick={handleRemoveImage}
                      disabled={saving}
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
                      disabled={saving}
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
                      disabled={saving}
                    />
                  </label>
                )}
              </div>

              {/* PILIHAN JAWABAN */}

              <div className="dosen-pretest-soal-options-form">
                {["A", "B", "C", "D"].map((letter) => (
                  <div className="dosen-pretest-soal-field" key={letter}>
                    <label htmlFor={`option${letter}`}>Pilihan {letter}</label>

                    <input
                      id={`option${letter}`}
                      name={`option${letter}`}
                      type="text"
                      placeholder={`Masukkan pilihan ${letter}`}
                      value={formData[`option${letter}`]}
                      onChange={handleChange}
                      disabled={saving}
                      required
                    />
                  </div>
                ))}
              </div>

              {/* JAWABAN DAN BOBOT */}

              <div className="dosen-pretest-soal-form-row">
                <div className="dosen-pretest-soal-field">
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

                <div className="dosen-pretest-soal-field">
                  <label htmlFor="points">Bobot Soal</label>

                  <input
                    id="points"
                    name="points"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.points}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>
              </div>

              {/* CATATAN */}

              <div className="dosen-pretest-soal-note">
                <FaFileImage />
                <p>
                  Gambar bersifat opsional. Jika soal tidak membutuhkan gambar,
                  langsung isi pertanyaan dan pilihan jawaban.
                </p>
              </div>

              {/* AKSI MODAL */}

              <div className="dosen-pretest-soal-modal-actions">
                <button
                  type="button"
                  className="dosen-pretest-soal-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-pretest-soal-save-btn"
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

export default DosenPretestSoal;
