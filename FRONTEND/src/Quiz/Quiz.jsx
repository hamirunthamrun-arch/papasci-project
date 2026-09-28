import { useState } from "react";
import { Button, Container } from "react-bootstrap";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaTrophy,
  FaRedo,
  FaBookOpen,
  FaStar,
  FaLightbulb,
  FaLock,
} from "react-icons/fa";

import "./Quiz.css";

/* =========================================================
   DATA SOAL QUIZ MODULE 01
========================================================= */

const questions = [
  {
    id: 1,
    question: "Manakah yang termasuk makhluk hidup?",
    options: ["Batu", "Kucing", "Meja", "Pensil"],
    answer: "Kucing",
  },

  {
    id: 2,
    question: "Salah satu ciri makhluk hidup adalah dapat ...",
    options: ["Tumbuh", "Berkarat", "Pecah", "Mencair"],
    answer: "Tumbuh",
  },

  {
    id: 3,
    question: "Manusia bernapas menggunakan ...",
    options: ["Jantung", "Paru-paru", "Lambung", "Ginjal"],
    answer: "Paru-paru",
  },

  {
    id: 4,
    question:
      "Bagian tumbuhan yang berfungsi menyerap air dari tanah adalah ...",
    options: ["Bunga", "Daun", "Akar", "Buah"],
    answer: "Akar",
  },

  {
    id: 5,
    question: "Tumbuhan membutuhkan cahaya matahari untuk melakukan ...",
    options: ["Fotosintesis", "Tidur", "Berjalan", "Bermain"],
    answer: "Fotosintesis",
  },

  {
    id: 6,
    question: "Hewan membutuhkan makanan untuk mendapatkan ...",
    options: ["Warna", "Energi", "Suara", "Bentuk"],
    answer: "Energi",
  },

  {
    id: 7,
    question: "Contoh hewan yang berkembang biak dengan bertelur adalah ...",
    options: ["Kucing", "Ayam", "Sapi", "Kambing"],
    answer: "Ayam",
  },

  {
    id: 8,
    question:
      "Biji dapat tumbuh menjadi tanaman. Hal ini menunjukkan bahwa tumbuhan dapat ...",
    options: ["Berjalan", "Tumbuh", "Berbicara", "Berenang"],
    answer: "Tumbuh",
  },

  {
    id: 9,
    question: "Makhluk hidup berkembang biak untuk ...",
    options: [
      "Menghasilkan keturunan",
      "Mendapatkan warna",
      "Membuat suara",
      "Mengubah bentuk",
    ],
    answer: "Menghasilkan keturunan",
  },

  {
    id: 10,
    question: "Manakah yang merupakan kebutuhan manusia untuk hidup?",
    options: [
      "Makanan dan air",
      "Mainan dan televisi",
      "Sepeda dan bola",
      "Buku dan pensil",
    ],
    answer: "Makanan dan air",
  },
];

/* =========================================================
   QUIZ COMPONENT
========================================================= */

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [answers, setAnswers] = useState({});

  const [finished, setFinished] = useState(false);

  const [score, setScore] = useState(0);

  const [correctAnswers, setCorrectAnswers] = useState(0);

  const [attempt, setAttempt] = useState(1);

  const totalQuestions = questions.length;

  const question = questions[currentQuestion];

  const questionNumber = currentQuestion + 1;

  const progress = (questionNumber / totalQuestions) * 100;

  const MAX_ATTEMPTS = 3;

  const PASSING_SCORE = 70;

  /* =======================================================
     PILIH JAWABAN
  ======================================================= */

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);

    setAnswers((prev) => ({
      ...prev,
      [question.id]: answer,
    }));
  };

  /* =======================================================
     NEXT
  ======================================================= */

  const handleNext = () => {
    if (!selectedAnswer) {
      return;
    }

    if (currentQuestion < totalQuestions - 1) {
      const nextIndex = currentQuestion + 1;

      setCurrentQuestion(nextIndex);

      setSelectedAnswer(answers[questions[nextIndex].id] || "");
    } else {
      finishQuiz();
    }
  };

  /* =======================================================
     PREVIOUS
  ======================================================= */

  const handlePrevious = () => {
    if (currentQuestion === 0) {
      return;
    }

    const previousIndex = currentQuestion - 1;

    setCurrentQuestion(previousIndex);

    setSelectedAnswer(answers[questions[previousIndex].id] || "");
  };

  /* =======================================================
     FINISH QUIZ
  ======================================================= */

  const finishQuiz = () => {
    let correct = 0;

    questions.forEach((item) => {
      if (answers[item.id] === item.answer) {
        correct++;
      }
    });

    /*
      Jawaban terakhir belum tentu sudah
      masuk ke state answers ketika tombol
      selesai ditekan.
    */

    if (selectedAnswer === question.answer) {
      correct++;
    }

    const finalScore = Math.round((correct / totalQuestions) * 100);

    setCorrectAnswers(correct);

    setScore(finalScore);

    setFinished(true);

    /* Simpan hasil sementara */

    localStorage.setItem(
      "quiz_module_1",
      JSON.stringify({
        attempt,
        score: finalScore,
        correct,
        total: totalQuestions,
        passed: finalScore >= PASSING_SCORE,
      }),
    );
  };

  /* =======================================================
     ULANGI QUIZ
  ======================================================= */

  const retryQuiz = () => {
    if (attempt >= MAX_ATTEMPTS) {
      return;
    }

    setAttempt((prev) => prev + 1);

    setCurrentQuestion(0);

    setSelectedAnswer("");

    setAnswers({});

    setFinished(false);

    setScore(0);

    setCorrectAnswers(0);
  };

  /* =======================================================
     RESULT
  ======================================================= */

  if (finished) {
    const passed = score >= PASSING_SCORE;

    return (
      <div className="quiz-page">
        <Container>
          <div className="quiz-result">
            {/* Trophy */}

            <div className={`quiz-result-icon ${passed ? "passed" : "failed"}`}>
              {passed ? <FaTrophy /> : <FaRedo />}
            </div>

            {/* Badge */}

            <div
              className={`quiz-result-badge ${passed ? "passed" : "failed"}`}
            >
              {passed ? "🎉 QUIZ SELESAI!" : "💪 JANGAN MENYERAH!"}
            </div>

            {/* Title */}

            <h1>
              {passed ? (
                <>
                  Hebat!
                  <span>Kamu berhasil!</span>
                </>
              ) : (
                <>
                  Tetap Semangat!
                  <span>Ayo coba lagi!</span>
                </>
              )}
            </h1>

            <p className="quiz-result-description">
              {passed
                ? "Kamu sudah memahami materi Module 01 dengan sangat baik."
                : "Tidak apa-apa. Pelajari kembali materinya dan coba lagi ya!"}
            </p>

            {/* Score */}

            <div className="quiz-score-card">
              <div className="quiz-score-circle">
                <strong>{score}</strong>

                <span>Nilai</span>
              </div>

              <div className="quiz-score-info">
                <div className="score-stars">
                  {[1, 2, 3].map((star) => (
                    <FaStar
                      key={star}
                      className={score >= star * 30 ? "star-active" : ""}
                    />
                  ))}
                </div>

                <strong>
                  {correctAnswers} dari {totalQuestions} jawaban benar
                </strong>

                <p>
                  Percobaan {attempt} dari {MAX_ATTEMPTS}
                </p>
              </div>
            </div>

            {/* Result message */}

            {passed ? (
              <div className="passed-message">
                <FaCheck />

                <div>
                  <strong>Module berhasil diselesaikan!</strong>

                  <p>
                    Kamu sudah siap melanjutkan perjalanan belajar ke module
                    berikutnya.
                  </p>
                </div>
              </div>
            ) : (
              <div className="failed-message">
                <FaLightbulb />

                <div>
                  <strong>Jangan menyerah!</strong>

                  <p>
                    Kamu masih memiliki {MAX_ATTEMPTS - attempt} kesempatan
                    untuk mencoba lagi.
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}

            <div className="quiz-result-actions">
              {passed ? (
                <>
                  <Button className="quiz-primary-button" href="/module">
                    <FaBookOpen />
                    Kembali ke Module
                    <FaArrowRight />
                  </Button>
                </>
              ) : (
                <>
                  {attempt < MAX_ATTEMPTS && (
                    <Button className="quiz-primary-button" onClick={retryQuiz}>
                      <FaRedo />
                      Ulangi Quiz
                    </Button>
                  )}

                  <Button className="quiz-secondary-button" href="/module/1">
                    <FaBookOpen />
                    Pelajari Lagi
                  </Button>
                </>
              )}
            </div>

            {/* Attempts */}

            <div className="attempt-indicator">
              <span>Kesempatan</span>

              <div className="attempt-dots">
                {[1, 2, 3].map((number) => (
                  <div
                    key={number}
                    className={`attempt-dot ${
                      number <= attempt ? "used" : ""
                    } ${number > attempt ? "available" : ""}`}
                  >
                    {number <= attempt ? <FaCheck /> : <span>{number}</span>}
                  </div>
                ))}
              </div>

              {attempt >= MAX_ATTEMPTS && !passed && (
                <div className="attempt-limit">
                  <FaLock />
                  Kesempatan quiz telah habis.
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    );
  }

  /* =======================================================
     QUIZ SCREEN
  ======================================================= */

  return (
    <div className="quiz-page">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="quiz-top">
        <Container>
          <div className="quiz-top-content">
            <a href="/module/1" className="quiz-back-button">
              <FaArrowLeft />

              <span>Kembali ke Materi</span>
            </a>

            <div className="quiz-heading">
              <span>🧠 QUIZ MODULE 01</span>

              <h1>Tantangan Makhluk Hidup</h1>
            </div>

            <div className="quiz-attempt">
              <span>Percobaan</span>

              <strong>
                {attempt}/{MAX_ATTEMPTS}
              </strong>
            </div>
          </div>
        </Container>
      </section>

      {/* ===================================================
          PROGRESS
      =================================================== */}

      <div className="quiz-progress-wrapper">
        <div className="quiz-progress">
          <div
            className="quiz-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* ===================================================
          QUIZ CONTENT
      =================================================== */}

      <section className="quiz-content">
        <Container>
          <div className="quiz-container">
            {/* Question info */}

            <div className="quiz-question-info">
              <div>
                <span>PERTANYAAN</span>

                <strong>{questionNumber}</strong>

                <small>/ {totalQuestions}</small>
              </div>

              <span className="quiz-score-hint">⭐ Kumpulkan poinmu!</span>
            </div>

            {/* Question card */}

            <div className="quiz-question-card">
              <div className="quiz-question-icon">🧠</div>

              <h2>{question.question}</h2>

              <div className="quiz-options">
                {question.options.map((option, index) => {
                  const selected = selectedAnswer === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      className={`quiz-option ${selected ? "selected" : ""}`}
                      onClick={() => handleAnswer(option)}
                    >
                      <span className="quiz-option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>

                      <span className="quiz-option-text">{option}</span>

                      {selected && (
                        <span className="quiz-option-check">
                          <FaCheck />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}

              <div className="quiz-navigation">
                <Button
                  className="quiz-prev-button"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  <FaArrowLeft />
                  Sebelumnya
                </Button>

                <div className="quiz-question-dots">
                  {questions.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`quiz-question-dot ${
                        index === currentQuestion ? "active" : ""
                      } ${answers[item.id] ? "answered" : ""}`}
                      onClick={() => {
                        setCurrentQuestion(index);

                        setSelectedAnswer(answers[item.id] || "");
                      }}
                    />
                  ))}
                </div>

                <Button
                  className="quiz-next-button"
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                >
                  {currentQuestion === totalQuestions - 1
                    ? "Selesai"
                    : "Berikutnya"}

                  {currentQuestion === totalQuestions - 1 ? (
                    <FaCheck />
                  ) : (
                    <FaArrowRight />
                  )}
                </Button>
              </div>
            </div>

            {/* Tip */}

            <div className="quiz-tip">
              <FaLightbulb />

              <p>
                <strong>Tips:</strong> Baca pertanyaan dengan teliti dan pilih
                jawaban yang menurutmu paling tepat.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default Quiz;
