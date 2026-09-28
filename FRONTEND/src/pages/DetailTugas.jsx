import { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaFilePdf,
  FaCalendarAlt,
  FaBookOpen,
  FaLink,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";

import "../css/DetailTugas.css";

/* =========================================================
   DATA TUGAS SEMENTARA
   Nanti data ini akan berasal dari database
========================================================= */

const tugasList = [
  {
    id: 1,
    title: "Pengamatan Tumbuhan di Sekitar Kita",
    subject: "IPA",
    material: "Bagian dan Fungsi Tumbuhan",
    description:
      "Amatilah tumbuhan yang ada di sekitar rumahmu dan temukan bagian-bagian serta fungsi dari tumbuhan tersebut.",
    deadline: "10 September 2026",
    icon: "🌱",
    pdf: "/pdf/tugas-tumbuhan.pdf",
  },

  {
    id: 2,
    title: "Mengenal Gaya di Sekitar Kita",
    subject: "IPA",
    material: "Gaya dan Gerak",
    description:
      "Temukan contoh gaya yang terjadi dalam kehidupan sehari-hari dan jelaskan pengaruh gaya tersebut terhadap benda.",
    deadline: "15 September 2026",
    icon: "⚙️",
    pdf: "/pdf/tugas-gaya.pdf",
  },

  {
    id: 3,
    title: "Eksperimen Sederhana Energi",
    subject: "IPA",
    material: "Energi dan Perubahannya",
    description:
      "Lakukan eksperimen sederhana tentang perubahan energi kemudian dokumentasikan hasil percobaanmu.",
    deadline: "20 September 2026",
    icon: "⚡",
    pdf: "/pdf/tugas-energi.pdf",
  },

  {
    id: 4,
    title: "Mengamati Perubahan Wujud Air",
    subject: "IPA",
    material: "Perubahan Wujud Benda",
    description:
      "Amati perubahan wujud air yang terjadi dalam kehidupan sehari-hari dan jelaskan prosesnya.",
    deadline: "25 September 2026",
    icon: "💧",
    pdf: "/pdf/tugas-air.pdf",
  },

  {
    id: 5,
    title: "Mengenal Sumber Energi",
    subject: "IPA",
    material: "Sumber Energi",
    description:
      "Carilah berbagai sumber energi yang kamu temukan di lingkungan sekitar dan jelaskan kegunaannya.",
    deadline: "30 September 2026",
    icon: "☀️",
    pdf: "/pdf/tugas-energi.pdf",
  },

  {
    id: 6,
    title: "Hewan dan Lingkungannya",
    subject: "IPA",
    material: "Makhluk Hidup dan Lingkungan",
    description:
      "Amati salah satu hewan di sekitarmu dan ceritakan bagaimana hewan tersebut beradaptasi dengan lingkungannya.",
    deadline: "5 Oktober 2026",
    icon: "🦋",
    pdf: "/pdf/tugas-hewan.pdf",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function DetailTugas() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [link, setLink] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     CARI TUGAS
  ======================================================= */

  const tugas = tugasList.find((item) => item.id === Number(id));

  /* =======================================================
     AMBIL LINK YANG PERNAH DISIMPAN
  ======================================================= */

  useEffect(() => {
    if (!tugas) return;

    const savedLink = localStorage.getItem(`microteaching_link_${tugas.id}`);

    if (savedLink) {
      setLink(savedLink);
      setSubmitted(true);
    }
  }, [tugas]);

  /* =======================================================
     JIKA TUGAS TIDAK DITEMUKAN
  ======================================================= */

  if (!tugas) {
    return (
      <div className="detail-task-page">
        <Container>
          <div className="task-not-found">
            <div className="not-found-icon">🔎</div>

            <h2>Tugas tidak ditemukan</h2>

            <p>Maaf, tugas yang kamu cari belum tersedia.</p>

            <Button
              className="back-button"
              onClick={() => navigate("/microteaching")}
            >
              <FaArrowLeft />
              Kembali ke Microteaching
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  /* =======================================================
     SUBMIT LINK
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!link.trim()) {
      setError("Silakan masukkan link hasil pekerjaanmu.");
      return;
    }

    /* Validasi sederhana */
    try {
      new URL(link);
    } catch {
      setError(
        "Link yang kamu masukkan belum valid. Pastikan diawali dengan https://",
      );

      return;
    }

    /* Simpan sementara ke localStorage */
    localStorage.setItem(`microteaching_link_${tugas.id}`, link);

    setSubmitted(true);
  };

  /* =======================================================
     EDIT LINK
  ======================================================= */

  const handleEdit = () => {
    setSubmitted(false);
    setError("");
  };

  return (
    <div className="detail-task-page">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="detail-task-header">
        <Container>
          <button
            className="detail-back"
            onClick={() => navigate("/microteaching")}
          >
            <FaArrowLeft />
            Kembali ke Microteaching
          </button>

          <div className="detail-heading">
            <div className="detail-heading-icon">{tugas.icon}</div>

            <div>
              <span className="detail-label">TUGAS MICROTEACHING</span>

              <h1>{tugas.title}</h1>

              <p>Kerjakan tugas sesuai petunjuk yang terdapat pada file PDF.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="detail-task-content">
        <Container>
          <div className="detail-layout">
            {/* =================================================
                PDF AREA
            ================================================= */}

            <div className="pdf-section">
              <div className="pdf-header">
                <div>
                  <div className="pdf-title">
                    <FaFilePdf />

                    <div>
                      <h2>File Tugas</h2>

                      <span>Baca petunjuk tugas berikut</span>
                    </div>
                  </div>
                </div>

                <a
                  href={tugas.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="open-pdf"
                >
                  Buka PDF
                  <FaExternalLinkAlt />
                </a>
              </div>

              {/* PDF VIEWER */}

              <div className="pdf-viewer">
                <iframe src={tugas.pdf} title={tugas.title} />
              </div>

              <div className="pdf-note">
                <FaFilePdf />

                <span>
                  Jika PDF tidak muncul, tekan
                  <strong> "Buka PDF"</strong> untuk melihatnya di tab baru.
                </span>
              </div>
            </div>

            {/* =================================================
                SIDE INFORMATION
            ================================================= */}

            <aside className="task-information">
              {/* TASK INFO */}

              <div className="info-card">
                <div className="info-card-title">
                  <FaBookOpen />
                  Informasi Tugas
                </div>

                <div className="info-item">
                  <span>Mata Pelajaran</span>

                  <strong>{tugas.subject}</strong>
                </div>

                <div className="info-item">
                  <span>Materi</span>

                  <strong>{tugas.material}</strong>
                </div>

                <div className="info-item">
                  <span>Batas Pengumpulan</span>

                  <strong className="deadline">
                    <FaCalendarAlt />

                    {tugas.deadline}
                  </strong>
                </div>
              </div>

              {/* SUBMISSION */}

              <div className="submission-card">
                {!submitted ? (
                  <>
                    <div className="submission-heading">
                      <div className="submission-icon">🔗</div>

                      <div>
                        <h2>Kumpulkan Tugas</h2>

                        <p>Masukkan link hasil pekerjaanmu di bawah.</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="submission-form">
                      <label htmlFor="task-link">Link Hasil Pekerjaan</label>

                      <div
                        className={`link-input ${error ? "input-error" : ""}`}
                      >
                        <FaLink />

                        <input
                          id="task-link"
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={link}
                          onChange={(event) => setLink(event.target.value)}
                        />
                      </div>

                      {error && (
                        <div className="form-error">
                          <FaExclamationCircle />

                          {error}
                        </div>
                      )}

                      <p className="link-hint">
                        💡 Kamu bisa menggunakan Google Drive, YouTube, Canva,
                        atau platform lain sesuai petunjuk tugas.
                      </p>

                      <button type="submit" className="submit-task-button">
                        <FaPaperPlane />
                        Kumpulkan Tugas
                      </button>
                    </form>
                  </>
                ) : (
                  /* =========================================
                     SUCCESS
                  ========================================= */

                  <div className="submission-success">
                    <div className="success-icon">
                      <FaCheckCircle />
                    </div>

                    <h2>Tugas Berhasil Dikumpulkan! 🎉</h2>

                    <p>Link pekerjaanmu sudah tersimpan.</p>

                    <div className="submitted-link">
                      <FaLink />

                      <span>{link}</span>
                    </div>

                    <div className="success-status">
                      <FaCheckCircle />
                      Menunggu penilaian guru
                    </div>

                    <div className="success-actions">
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="view-link-button"
                      >
                        Lihat Hasil
                        <FaExternalLinkAlt />
                      </a>

                      <button className="edit-link-button" onClick={handleEdit}>
                        Edit Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default DetailTugas;
