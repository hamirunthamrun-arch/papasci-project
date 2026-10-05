
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
  FaRedo,
  FaTrophy,
  FaLightbulb,
  FaExclamationCircle,
} from "react-icons/fa";

import { getPublishedQuizByModule } from "../service/quizService";
import { getStudentQuestions } from "../service/quizQuestionService";
import {
  evaluateQuizAttempt,
  submitQuizResult,
} from "../service/quizResultService";

import "./Quiz.css";

function Quiz() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  // DATA KUIS
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  // NAVIGASI SOAL
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  // STATUS HALAMAN
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // STATUS PENILAIAN
  const [finished, setFinished] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // HASIL
  const [result, setResult] = useState(null);
  const [officialResult, setOfficialResult] = useState(null);

  // MEMUAT KUIS DAN SOAL DARI BACKEND
  useEffect(() => {
    let ignore = false;

    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError("");
        setActionError("");

        setQuiz(null);
        setQuestions([]);
        setAnswers({});
        setCurrentQuestion(0);

        setFinished(false);
        setEvaluating(false);
        setSubmitting(false);

        setResult(null);
        setOfficialResult(null);

        if (!moduleId) {
          throw new Error("ID module tidak ditemukan.");
        }

        const quizData = await getPublishedQuizByModule(moduleId);
        const questionData = await getStudentQuestions(quizData.id);

        if (ignore) return;

        setQuiz(quizData);

        setQuestions(
          [...questionData].sort(
            (a, b) => a.order_number - b.order_number,
          ),
        );
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Gagal memuat data kuis.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadQuiz();

    return () => {
      ignore = true;
    };
  }, [moduleId]);

  // DATA SOAL SAAT INI
  const question = questions[currentQuestion];
  const totalQuestions = questions.length;
  const questionNumber = currentQuestion + 1;

  const progress =
    totalQuestions > 0
      ? (questionNumber / totalQuestions) * 100
      : 0;

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

  const selectedAnswer = question
    ? answers[question.id] || ""
    : "";

  // MEMILIH JAWABAN
  const handleAnswer = (answer) => {
    if (!question || finished || evaluating) return;

    setAnswers((prev) => ({
      ...prev,
      [question.id]: answer,
    }));
  };

  // SOAL SEBELUMNYA
  const handlePrevious = () => {
    if (currentQuestion <= 0 || evaluating) return;

    setCurrentQuestion((prev) => prev - 1);
  };

  // SOAL BERIKUTNYA
  const handleNext = () => {
    if (!selectedAnswer || evaluating) return;

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // MENYELESAIKAN DAN MENILAI PERCOBAAN
  const finishQuiz = async () => {
    const unansweredIndex = questions.findIndex(
      (item) => !answers[item.id],
    );

    if (unansweredIndex !== -1) {
      setCurrentQuestion(unansweredIndex);
      return;
    }

    if (evaluating || finished) return;

    try {
      setEvaluating(true);
      setActionError("");

      const data = await evaluateQuizAttempt(quiz.id, answers);

      setResult(data);
      setFinished(true);
    } catch (err) {
      setActionError(
        err.message || "Gagal menilai percobaan kuis.",
      );
    } finally {
      setEvaluating(false);
    }
  };

  // MENGULANG PERCOBAAN
  const handleRetry = () => {
    if (
      !result ||
      result.attempts_used >= result.max_attempts ||
      officialResult
    ) {
      return;
    }

    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setFinished(false);
    setActionError("");
  };

  // MENGIRIM HASIL RESMI
  const handleSubmitResult = async () => {
    if (!result || submitting || officialResult) return;

    try {
      setSubmitting(true);
      setActionError("");

      const data = await submitQuizResult(quiz.id, answers);

      setOfficialResult(data);
    } catch (err) {
      setActionError(
        err.message || "Gagal mengirim hasil resmi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="quiz-page">
        <Container>
          <div className="quiz-loading text-center py-5">
            <Spinner animation="border" variant="primary" />

            <h4 className="mt-3">Memuat Kuis...</h4>

            <p>Mohon tunggu, soal sedang disiapkan.</p>
          </div>
        </Container>
      </div>
    );
  }

  // ERROR MEMUAT KUIS
  if (error) {
    return (
      <div className="quiz-page">
        <Container>
          <div className="quiz-error py-5">
            <Alert variant="danger">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaExclamationCircle />
                <strong>Kuis tidak dapat dimuat</strong>
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
  if (!quiz || totalQuestions === 0) {
    return (
      <div className="quiz-page">
        <Container>
          <div className="quiz-empty text-center py-5">
            <FaBookOpen size={42} />

            <h3 className="mt-3">Soal Belum Tersedia</h3>

            <p>
              Kuis ini belum memiliki soal yang dapat dikerjakan.
            </p>

            <Button
              onClick={() => navigate(`/module/${moduleId}`)}
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

  // HALAMAN HASIL
  if (finished) {
    const isOfficial = Boolean(officialResult);
    const displayedResult = officialResult || result;

    const attemptsUsed =
      displayedResult?.attempts_used ?? 0;

    const maxAttempts =
      displayedResult?.max_attempts ?? 3;

    const canRetry =
      !isOfficial && attemptsUsed < maxAttempts;

    return (
      <div className="quiz-page">
        <Container>
          <div className="quiz-result">
            <div className="result-trophy">
              <FaTrophy />
            </div>

            <span className="result-badge">
              {isOfficial ? "HASIL RESMI" : "NILAI SEMENTARA"}
            </span>

            <h1>
              {isOfficial ? "Selamat!" : "Hebat!"}

              <span>
                {isOfficial
                  ? "Hasil kuis berhasil disimpan."
                  : "Kamu sudah menyelesaikan percobaan."}
              </span>
            </h1>

            <p className="result-description">
              {isOfficial
                ? "Nilai kuis ini sudah ditetapkan sebagai hasil resmi."
                : "Periksa nilai sementara dan tentukan apakah ingin mencoba lagi atau mengirim hasil."}
            </p>

            {/* NILAI */}
            <div className="score-card">
              <div className="score-circle">
                <strong>
                  {displayedResult?.score ?? 0}
                </strong>

                <span>Nilai</span>
              </div>

              <div className="score-message">
                <FaCheck />

                <strong>
                  {displayedResult?.correct_count ?? 0} dari{" "}
                  {displayedResult?.total_questions ??
                    totalQuestions}{" "}
                  soal benar
                </strong>

                <p>
                  Percobaan ke-
                  {displayedResult?.attempt_number ?? 0} dari{" "}
                  {maxAttempts}
                </p>

                <p>
                  Kesempatan terpakai: {attemptsUsed}/
                  {maxAttempts}
                </p>
              </div>
            </div>

            {/* PESAN ERROR */}
            {actionError && (
              <Alert variant="danger" className="mt-3">
                {actionError}
              </Alert>
            )}

            {/* TOMBOL */}
            <div className="result-actions">
              <Button
                className="result-primary-button"
                onClick={() =>
                  navigate(`/module/${moduleId}`)
                }
              >
                <FaBookOpen />
                Kembali Belajar
                <FaArrowRight />
              </Button>

              {!isOfficial && (
                <>
                  {canRetry && (
                    <Button
                      className="result-secondary-button"
                      onClick={handleRetry}
                      disabled={submitting}
                    >
                      <FaRedo />
                      Coba Lagi
                    </Button>
                  )}

                  <Button
                    className="result-primary-button"
                    onClick={handleSubmitResult}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          size="sm"
                          animation="border"
                        />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        Kirim Hasil
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* INFORMASI */}
            <p className="result-note">
              <FaLightbulb />

              {isOfficial
                ? "Hasil resmi telah dikirim. Kamu tidak dapat mengirim hasil lagi untuk kuis ini."
                : canRetry
                  ? "Nilai masih sementara. Kamu dapat mencoba lagi atau mengirim hasil percobaan ini."
                  : "Kesempatan percobaan telah habis. Kirim hasil ini untuk menyimpan nilai resmi."}
            </p>
          </div>
        </Container>
      </div>
    );
  }

  // HALAMAN PENGERJAAN KUIS
  return (
    <div className="quiz-page">
      {/* HEADER */}
      <section className="quiz-top">
        <Container>
          <div className="quiz-top-content">
            <Button
              onClick={() => navigate("/module")}
              className="back-module-button"
            >
              <FaArrowLeft />
              Kembali ke Module
            </Button>

            <div className="quiz-title">
              <span>QUIZ</span>

              <h1>{quiz.title}</h1>

              <p>
                {quiz.description ||
                  "Uji pemahamanmu setelah mempelajari materi."}
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
      <div className="quiz-progress-wrapper">
        <div className="quiz-progress">
          <ProgressBar now={progress} />
        </div>
      </div>

      {/* QUESTION */}
      <section className="question-section">
        <Container>
          <div className="question-wrapper">
            <div className="question-card">
              {/* HEADER SOAL */}
              <div className="question-card-header">
                <span className="question-number">
                  Pertanyaan {questionNumber}
                </span>

                <span className="question-type">
                  Pilihan Ganda
                </span>
              </div>

              {/* PERTANYAAN */}
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

              {/* PILIHAN JAWABAN */}
              <div className="options-list">
                {options.map((option) => {
                  const isSelected =
                    selectedAnswer === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      className={`answer-option ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() =>
                        handleAnswer(option.key)
                      }
                      disabled={evaluating}
                    >
                      <span className="option-letter">
                        {option.key}
                      </span>

                      <span className="option-text">
                        {option.value}
                      </span>

                      {isSelected && (
                        <span className="option-check">
                          <FaCheck />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ERROR AKSI */}
              {actionError && (
                <Alert variant="danger" className="mt-3">
                  {actionError}
                </Alert>
              )}

              {/* FOOTER */}
              <div className="question-footer">
                <Button
                  className="previous-button"
                  onClick={handlePrevious}
                  disabled={
                    currentQuestion === 0 || evaluating
                  }
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
                    disabled={!selectedAnswer || evaluating}
                  >
                    Berikutnya
                    <FaArrowRight />
                  </Button>
                ) : (
                  <Button
                    className="next-button"
                    onClick={finishQuiz}
                    disabled={!selectedAnswer || evaluating}
                  >
                    {evaluating ? (
                      <>
                        <Spinner
                          size="sm"
                          animation="border"
                        />
                        Menilai...
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
            </div>

            {/* INFORMASI */}
            <div className="quiz-information">
              <FaLightbulb />

              <p>
                <strong>Tips:</strong> Bacalah pertanyaan
                dengan teliti sebelum memilih jawaban.
                Tidak perlu terburu-buru, ya!
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default Quiz;