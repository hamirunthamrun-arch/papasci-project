import { useState } from "react";
import { Container, Button, ProgressBar } from "react-bootstrap";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaBookOpen,
  FaRedo,
  FaTrophy,
  FaLightbulb,
} from "react-icons/fa";

import "../css/Pretest.css";

/* =========================================================
   DATA SOAL PRETEST
========================================================= */

const questions = [
  {
    id: 1,
    question: "Manakah yang termasuk ke dalam makhluk hidup?",
    options: ["Batu", "Kucing", "Meja", "Air"],
    answer: "Kucing",
  },

  {
    id: 2,
    question: "Salah satu ciri makhluk hidup adalah dapat ...",
    options: ["Berkarat", "Tumbuh", "Mencair", "Pecah"],
    answer: "Tumbuh",
  },

  {
    id: 3,
    question: "Tumbuhan membutuhkan cahaya matahari untuk membantu proses ...",
    options: ["Fotosintesis", "Pernapasan", "Tidur", "Berjalan"],
    answer: "Fotosintesis",
  },

  {
    id: 4,
    question: "Hewan membutuhkan makanan untuk memperoleh ...",
    options: ["Warna", "Energi", "Suara", "Bentuk"],
    answer: "Energi",
  },

  {
    id: 5,
    question: "Manusia bernapas menggunakan ...",
    options: ["Jantung", "Paru-paru", "Lambung", "Tulang"],
    answer: "Paru-paru",
  },

  {
    id: 6,
    question:
      "Contoh makhluk hidup yang dapat membuat makanannya sendiri adalah ...",
    options: ["Kucing", "Ikan", "Tumbuhan", "Ayam"],
    answer: "Tumbuhan",
  },

  {
    id: 7,
    question: "Manusia mengalami pertumbuhan dari bayi menjadi ...",
    options: ["Batu", "Dewasa", "Tumbuhan", "Air"],
    answer: "Dewasa",
  },

  {
    id: 8,
    question: "Hewan yang berkembang biak dengan cara bertelur adalah ...",
    options: ["Kucing", "Ayam", "Sapi", "Kambing"],
    answer: "Ayam",
  },

  {
    id: 9,
    question:
      "Tumbuhan biasanya memiliki bagian yang berfungsi menyerap air dari tanah, yaitu ...",
    options: ["Bunga", "Daun", "Akar", "Buah"],
    answer: "Akar",
  },

  {
    id: 10,
    question: "Manakah yang merupakan kebutuhan makhluk hidup?",
    options: ["Makanan", "Mainan", "Televisi", "Sepeda"],
    answer: "Makanan",
  },
];

/* =========================================================
   PRETEST COMPONENT
========================================================= */

function Pretest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [answers, setAnswers] = useState({});

  const [finished, setFinished] = useState(false);

  const [score, setScore] = useState(0);

  const question = questions[currentQuestion];

  const totalQuestions = questions.length;

  const questionNumber = currentQuestion + 1;

  const progress = (questionNumber / totalQuestions) * 100;

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
     NEXT QUESTION
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
      finishPretest();
    }
  };

  /* =======================================================
     PREVIOUS QUESTION
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
     HITUNG NILAI
  ======================================================= */

  const finishPretest = () => {
    let correctAnswers = 0;

    questions.forEach((item) => {
      if (answers[item.id] === item.answer) {
        correctAnswers++;
      }
    });

    /*
      Karena jawaban soal terakhir baru saja dipilih,
      kita tambahkan jawaban terakhir secara manual.
    */

    if (selectedAnswer === question.answer) {
      correctAnswers++;
    }

    const finalScore = Math.round((correctAnswers / totalQuestions) * 100);

    setScore(finalScore);

    setFinished(true);

    /* Simpan status sementara */

    localStorage.setItem(
      "pretest_module_1",
      JSON.stringify({
        completed: true,
        score: finalScore,
        correct: correctAnswers,
        total: totalQuestions,
      }),
    );
  };

  /* =======================================================
     ULANGI PRETEST
  ======================================================= */

  const handleRetry = () => {
    setCurrentQuestion(0);

    setSelectedAnswer("");

    setAnswers({});

    setFinished(false);

    setScore(0);
  };

  /* =======================================================
     HASIL PRETEST
  ======================================================= */

  if (finished) {
    return (
      <div className="pretest-page">
        <Container>
          <div className="pretest-result">
            {/* Trophy */}

            <div className="result-trophy">
              <FaTrophy />
            </div>

            <span className="result-badge">🎉 PRETEST SELESAI</span>

            <h1>
              Hebat!
              <span>Kamu sudah menyelesaikannya.</span>
            </h1>

            <p className="result-description">
              Kamu sudah menyelesaikan Pretest Module 01: Makhluk Hidup. Yuk
              lihat hasilnya!
            </p>

            {/* Score */}

            <div className="score-card">
              <div className="score-circle">
                <strong>{score}</strong>

                <span>Nilai</span>
              </div>

              <div className="score-message">
                {score >= 80 ? (
                  <>
                    <FaCheck />
                    <strong>Wah, kamu sudah hebat!</strong>
                    <p>
                      Pengetahuan awalmu tentang makhluk hidup sangat bagus.
                    </p>
                  </>
                ) : score >= 60 ? (
                  <>
                    <FaLightbulb />
                    <strong>Bagus, terus belajar ya!</strong>
                    <p>Kamu sudah memiliki pengetahuan dasar yang cukup.</p>
                  </>
                ) : (
                  <>
                    <FaLightbulb />
                    <strong>Tidak apa-apa!</strong>
                    <p>Sekarang waktunya belajar dan menemukan hal-hal baru.</p>
                  </>
                )}
              </div>
            </div>

            {/* Action */}

            <div className="result-actions">
              <Button className="result-primary-button" href="/module/1">
                <FaBookOpen />
                Mulai Belajar
                <FaArrowRight />
              </Button>

              <Button className="result-secondary-button" onClick={handleRetry}>
                <FaRedo />
                Ulangi Pretest
              </Button>
            </div>

            <p className="result-note">
              💡 Jangan khawatir dengan nilai pretest. Pretest hanya digunakan
              untuk mengetahui pengetahuan awalmu.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  /* =======================================================
     PRETEST PAGE
  ======================================================= */

  return (
    <div className="pretest-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="pretest-top">
        <Container>
          <div className="pretest-top-content">
            <Button href="/module" className="back-module-button">
              <FaArrowLeft />
              Kembali ke Module
            </Button>

            <div className="pretest-title">
              <span>📋 PRETEST</span>

              <h1>Module 01</h1>

              <p>Makhluk Hidup</p>
            </div>

            <div className="question-counter">
              <strong>{questionNumber}</strong>

              <span>/ {totalQuestions}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      <div className="pretest-progress-wrapper">
        <div className="pretest-progress">
          <ProgressBar now={progress} />
        </div>
      </div>

      {/* =====================================================
          QUESTION
      ===================================================== */}

      <section className="question-section">
        <Container>
          <div className="question-wrapper">
            {/* Question Card */}

            <div className="question-card">
              <div className="question-card-header">
                <span className="question-number">
                  Pertanyaan {questionNumber}
                </span>

                <span className="question-type">Pilihan Ganda</span>
              </div>

              <h2>{question.question}</h2>

              <div className="options-list">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      className={`answer-option ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleAnswer(option)}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>

                      <span className="option-text">{option}</span>

                      {isSelected && (
                        <span className="option-check">
                          <FaCheck />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Question Footer */}

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

                <Button
                  className="next-button"
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

            {/* Information */}

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
