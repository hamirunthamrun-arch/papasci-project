import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Button,
  ProgressBar,
  Spinner,
  Alert,
} from "react-bootstrap";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaBookOpen,
  FaTrophy,
  FaLightbulb,
  FaExclamationCircle,
} from "react-icons/fa";

import { getPublishedPretestByModule } from "../service/pretestService";
import { getStudentQuestions } from "../service/pretestQuestionService";
import {
  evaluatePretest,
  submitPretestResult,
  getMyPretestResults,
} from "../service/pretestResultService";

import "../css/Pretest.css";

function Pretest() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  // DATA
  const [pretest, setPretest] = useState(null);
  const [questions, setQuestions] = useState([]);

  // NAVIGASI SOAL
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  // STATUS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);

  // HASIL PRETEST
  const [result, setResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // STATUS NILAI RESMI
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // MEMUAT PRETEST, SOAL, DAN RIWAYAT NILAI
  useEffect(() => {
    let ignore = false;

    const loadPretest = async () => {
      try {
        setLoading(true);
        setError("");

        const pretestData = await getPublishedPretestByModule(moduleId);

        if (!pretestData) {
          throw new Error("Pretest untuk modul ini belum tersedia.");
        }

        const [questionData, resultData] = await Promise.all([
          getStudentQuestions(pretestData.id),
          getMyPretestResults(),
        ]);

        if (ignore) return;

        setPretest(pretestData);
        setQuestions(
          [...questionData].sort((a, b) => a.order_number - b.order_number),
        );

        const previousResult = Array.isArray(resultData)
          ? resultData.find(
              (item) => String(item.pretest_id) === String(pretestData.id),
            )
          : null;

        setAlreadySubmitted(Boolean(previousResult));
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Gagal memuat data pretest.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (moduleId) {
      loadPretest();
    }

    return () => {
      ignore = true;
    };
  }, [moduleId]);

  // DATA SOAL SAAT INI
  const question = questions[currentQuestion];
  const totalQuestions = questions.length;
  const questionNumber = currentQuestion + 1;

  const progress =
    totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0;

  // PILIHAN JAWABAN
  const options = question
    ? [
        { key: "A", value: question.option_a },
        { key: "B", value: question.option_b },
        { key: "C", value: question.option_c },
        { key: "D", value: question.option_d },
      ].filter(
        (option) =>
          option.value !== null &&
          option.value !== undefined &&
          String(option.value).trim() !== "",
      )
    : [];

  const selectedAnswer = question ? answers[question.id] || "" : "";

  // MEMILIH JAWABAN
  const handleAnswer = (answer) => {
    if (!question || finished || evaluating) return;

    setAnswers((prev) => ({
      ...prev,
      [question.id]: answer,
    }));

    setActionError("");
    setActionSuccess("");
  };

  // SOAL SEBELUMNYA
  const handlePrevious = () => {
    if (currentQuestion <= 0) return;

    setCurrentQuestion((prev) => prev - 1);
  };

  // SOAL BERIKUTNYA
  const handleNext = () => {
    if (!selectedAnswer) return;

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // MENYELESAIKAN DAN MENGEVALUASI PRETEST
  const finishPretest = async () => {
    if (!pretest || evaluating || finished) return;

    const answeredCount = questions.filter((item) => answers[item.id]).length;

    if (answeredCount < totalQuestions) {
      const unansweredIndex = questions.findIndex((item) => !answers[item.id]);

      if (unansweredIndex !== -1) {
        setCurrentQuestion(unansweredIndex);
      }

      setActionError("Silakan jawab semua soal sebelum menyelesaikan pretest.");
      return;
    }

    try {
      setEvaluating(true);
      setActionError("");
      setActionSuccess("");

      // Evaluasi hanya untuk menampilkan nilai sementara
      const evaluation = await evaluatePretest(pretest.id, answers);

      setResult(evaluation);
      setFinished(true);
    } catch (err) {
      setActionError(err.message || "Gagal mengevaluasi pretest.");
    } finally {
      setEvaluating(false);
    }
  };

  // SUBMIT NILAI
  const handleSubmitScore = async () => {
    if (!pretest || !result || saving) return;

    setActionError("");
    setActionSuccess("");

    // Jika sudah pernah submit, jangan simpan ulang
    if (alreadySubmitted) {
      setActionSuccess(
        "Kamu sudah mengerjakan pretest ini sebelumnya dan nilai resmimu sudah tersimpan. Kamu tetap bisa membuka modul.",
      );
      return;
    }

    try {
      setSaving(true);

      await submitPretestResult(pretest.id, answers);

      setAlreadySubmitted(true);

      setActionSuccess(
        "Nilai pretest berhasil disimpan. Kamu dapat melanjutkan ke modul.",
      );
    } catch (err) {
      // Menangani kemungkinan submit ganda
      if (
        err.code === "23505" ||
        err.message?.includes("unique_student_pretest")
      ) {
        setAlreadySubmitted(true);

        setActionSuccess(
          "Kamu sudah mengerjakan pretest ini sebelumnya dan nilai resmimu sudah tersimpan. Kamu tetap bisa membuka modul.",
        );
      } else {
        setActionError(
          err.message || "Gagal menyimpan nilai pretest. Silakan coba lagi.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // AKSES MODUL SELALU AKTIF
  const handleStartModule = () => {
    navigate(`/module/${moduleId}`);
  };

  // ID MODUL TIDAK DITEMUKAN
  if (!moduleId) {
    return (
      <div className="pretest-page">
        <Container>
          <div className="pretest-error py-5">
            <Alert variant="danger">
              <strong>ID module tidak ditemukan.</strong>

              <div className="mt-3">
                <Button variant="secondary" onClick={() => navigate("/module")}>
                  Kembali ke Module
                </Button>
              </div>
            </Alert>
          </div>
        </Container>
      </div>
    );
  }

  // LOADING
  if (loading) {
    return (
      <div className="pretest-page">
        <Container>
          <div className="pretest-loading text-center">
            <Spinner animation="border" variant="primary" />

            <h4 className="mt-3">Memuat Pretest...</h4>

            <p>Mohon tunggu, soal sedang disiapkan.</p>
          </div>
        </Container>
      </div>
    );
  }
  // ERROR
  if (error) {
    return (
      <div className="pretest-page">
        <Container>
          <div className="pretest-error py-5">
            <Alert variant="danger">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaExclamationCircle />
                <strong>Pretest tidak dapat dimuat</strong>
              </div>

              <p className="mb-3">{error}</p>

              <Button
                variant="outline-danger"
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>

              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => navigate("/module")}
              >
                Kembali ke Module
              </Button>
            </Alert>
          </div>
        </Container>
      </div>
    );
  }

  // BELUM ADA SOAL
  if (!pretest || totalQuestions === 0) {
    return (
      <div className="pretest-page">
        <Container>
          <div className="pretest-empty text-center py-5">
            <FaBookOpen size={42} />

            <h3 className="mt-3">Soal Belum Tersedia</h3>

            <p>Pretest ini belum memiliki soal yang dapat dikerjakan.</p>

            <Button
              onClick={() => navigate("/module")}
              className="result-primary-button"
            >
              <FaArrowLeft />
              Kembali ke Module
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // HALAMAN HASIL PRETEST
  if (finished && result) {
    const score = Number(result.score ?? 0);
    const correctCount = Number(result.correct_count ?? 0);
    const resultTotal = Number(result.total_questions ?? totalQuestions);

    return (
      <div className="pretest-page">
        <Container>
          <div className="pretest-result">
            <div className="result-trophy">
              <FaTrophy />
            </div>

            <span className="result-badge">PRETEST SELESAI</span>

            <h1>
              Hebat!
              <span>Kamu sudah menjawab semua pertanyaan.</span>
            </h1>

            <p className="result-description">
              Berikut nilai dari hasil pengerjaan pretest kamu.
            </p>

            <div className="score-card">
              <div className="score-circle">
                <strong>{score}</strong>
                <span>Nilai</span>
              </div>

              <div className="score-message">
                <FaCheck />
                <strong>Pretest berhasil dikerjakan!</strong>

                <p>
                  Kamu menjawab {correctCount} dari {resultTotal} soal dengan
                  benar.
                </p>
              </div>
            </div>

            {alreadySubmitted && (
              <Alert variant="info" className="mt-3">
                Nilai resmi untuk pretest ini sudah tersimpan sebelumnya. Nilai
                yang ditampilkan sekarang merupakan hasil pengerjaan terbaru dan
                tidak mengubah nilai resmi.
              </Alert>
            )}

            {actionError && (
              <Alert variant="danger" className="mt-3">
                {actionError}
              </Alert>
            )}

            {actionSuccess && (
              <Alert variant="success" className="mt-3">
                {actionSuccess}
              </Alert>
            )}

            {/* DUA TOMBOL AKSI */}
            <div className="result-actions">
              <Button
                className="result-primary-button"
                onClick={handleSubmitScore}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    Menyimpan Nilai...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Submit Nilai
                  </>
                )}
              </Button>

              <Button
                className="result-primary-button"
                onClick={handleStartModule}
              >
                <FaBookOpen />
                Ayo Mulai Melihat Modul
                <FaArrowRight />
              </Button>
            </div>

            <p className="result-note">
              <FaLightbulb />
              {alreadySubmitted
                ? "Nilai resmi hanya disimpan satu kali untuk setiap pretest. Kamu tetap dapat mengerjakan soal dan membuka modul."
                : "Tekan Submit Nilai untuk menyimpan hasil resmi. Kamu juga dapat membuka modul tanpa harus submit nilai terlebih dahulu."}
            </p>
          </div>
        </Container>
      </div>
    );
  }

  // HALAMAN PENGERJAAN PRETEST
  return (
    <div className="pretest-page">
      {/* HEADER */}
      <section className="pretest-top">
        <Container>
          <div className="pretest-top-content">
            <Button
              onClick={() => navigate("/module")}
              className="back-module-button"
            >
              <FaArrowLeft />
              Kembali ke Module
            </Button>

            <div className="pretest-title">
              <span>PRETEST</span>
              <h1>{pretest.title}</h1>

              <p>
                {pretest.description ||
                  "Uji pengetahuan awalmu sebelum belajar."}
              </p>
            </div>

            <div className="question-counter">
              <strong>{questionNumber}</strong>
              <span>/ {totalQuestions}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* PROGRESS */}
      <div className="pretest-progress-wrapper">
        <div className="pretest-progress">
          <ProgressBar now={progress} />
        </div>
      </div>

      {/* QUESTION */}
      <section className="question-section">
        <Container>
          <div className="question-wrapper">
            <div className="question-card">
              <div className="question-card-header">
                <span className="question-number">
                  Pertanyaan {questionNumber}
                </span>

                <span className="question-type">Pilihan Ganda</span>
              </div>

              <h2>{question.question_text}</h2>

              {/* GAMBAR SOAL */}
              {question.image_url && (
                <div className="question-image-wrapper">
                  <img
                    src={question.image_url}
                    alt={`Gambar untuk soal ${questionNumber}`}
                    className="question-image"
                  />
                </div>
              )}

              {/* OPTIONS */}
              <div className="options-list">
                {options.map((option) => {
                  const isSelected = selectedAnswer === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      className={`answer-option ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleAnswer(option.key)}
                    >
                      <span className="option-letter">{option.key}</span>

                      <span className="option-text">{option.value}</span>

                      {isSelected && (
                        <span className="option-check">
                          <FaCheck />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* FOOTER */}
              <div className="question-footer">
                <Button
                  className="previous-button"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  <FaArrowLeft />
                  Sebelumnya
                </Button>

                <span className="answer-hint">
                  {selectedAnswer
                    ? "Jawaban dipilih ✓"
                    : "Pilih salah satu jawaban"}
                </span>

                {currentQuestion < totalQuestions - 1 ? (
                  <Button
                    className="next-button"
                    onClick={handleNext}
                    disabled={!selectedAnswer}
                  >
                    Berikutnya
                    <FaArrowRight />
                  </Button>
                ) : (
                  <Button
                    className="next-button"
                    onClick={finishPretest}
                    disabled={evaluating}
                  >
                    {evaluating ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Memeriksa...
                      </>
                    ) : (
                      <>
                        Selesai
                        <FaCheck />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {actionError && (
                <Alert variant="warning" className="mt-3">
                  {actionError}
                </Alert>
              )}
            </div>

            {/* INFORMATION */}
            <div className="pretest-information">
              <FaLightbulb />

              <p>
                <strong>Tips:</strong> Bacalah pertanyaan dengan teliti sebelum
                memilih jawaban. Tidak perlu terburu-buru, ya!
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default Pretest;
