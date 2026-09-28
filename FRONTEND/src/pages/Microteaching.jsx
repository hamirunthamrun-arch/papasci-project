import { useState } from "react";
import { Container, Button } from "react-bootstrap";
import {
  FaGraduationCap,
  FaFilePdf,
  FaCalendarAlt,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaStar,
  FaBookOpen,
  FaClipboardCheck,
  FaPlay,
  FaYoutube,
} from "react-icons/fa";

import "../css/Microteaching.css";

/* =========================================================
   DATA TUGAS
   Sementara menggunakan data dummy
========================================================= */

const tugasList = [
  {
    id: 1,

    title: "Buatlah Video Pembelajaran IPA SD, Konteks Lokal Papua",


    description:
      "Amatilah tumbuhan yang ada di sekitar rumahmu dan temukan bagian-bagian serta fungsi dari tumbuhan tersebut.",

    deadline: "10 September 2026",

    status: "belum",

    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80",

    color: "green",

    pdf: "/pdf/tugas-tumbuhan.pdf",
  },

  {
    id: 2,

    title: "Problem Based Learning (PBL)",

    description:
      "Temukan contoh gaya yang terjadi dalam kehidupan sehari-hari dan jelaskan pengaruh gaya tersebut terhadap benda.",

    deadline: "15 September 2026",

    status: "dikumpulkan",

    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",

    color: "blue",

    pdf: "/pdf/tugas-gaya.pdf",
  },

  {
    id: 3,

    title: "Focus Group Discussion (FGD)",

    description:
      "Lakukan eksperimen sederhana tentang perubahan energi kemudian dokumentasikan hasil percobaanmu.",

    deadline: "20 September 2026",

    status: "dinilai",

    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80",

    color: "yellow",

    pdf: "/pdf/tugas-energi.pdf",

    score: 90,
  },
];

/* =========================================================
   DATA VIDEO MENGAJAR DOSEN
   Sementara menggunakan data dummy YouTube
========================================================= */

const videoDosenList = [
  {
    id: 1,

    title: "Praktik Mengajar IPA SD - Bagian dan Fungsi Tumbuhan",

    lecturer: "Dosen PGSD",

    description:
      "Contoh praktik pembelajaran IPA tentang bagian dan fungsi tumbuhan dengan pendekatan kontekstual.",

    youtubeId: "VIDEO_ID_1",

    duration: "12:45",
  },

  {
    id: 2,

    title: "Pembelajaran IPA SD - Gaya dan Gerak",

    lecturer: "Dosen PGSD",

    description:
      "Video pembelajaran yang menunjukkan bagaimana konsep gaya dan gerak dapat dijelaskan melalui contoh kehidupan sehari-hari.",

    youtubeId: "VIDEO_ID_2",

    duration: "15:20",
  },
];

/* =========================================================
   STATUS
========================================================= */

const statusConfig = {
  belum: {
    label: "Belum Dikerjakan",
    icon: <FaClock />,
  },

  dikumpulkan: {
    label: "Sudah Dikumpulkan",
    icon: <FaCheckCircle />,
  },

  dinilai: {
    label: "Sudah Dinilai",
    icon: <FaStar />,
  },
};

/* =========================================================
   COMPONENT
========================================================= */

function Microteaching() {
  const [activeFilter, setActiveFilter] = useState("semua");

  const [search] = useState("");

  /* =======================================================
     FILTER TUGAS
  ======================================================= */

  const filteredTugas = tugasList.filter((tugas) => {
    const matchFilter =
      activeFilter === "semua" || tugas.status === activeFilter;

    const matchSearch =
      tugas.title.toLowerCase().includes(search.toLowerCase()) ||
      tugas.material.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  /* =======================================================
     NAVIGATE DETAIL
  ======================================================= */

  const lihatTugas = (id) => {
    window.location.href = `/microteaching/tugas/${id}`;
  };

  return (
    <div className="micro-page">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="micro-hero">
        <Container>
          <div className="micro-hero-content">
            {/* TEXT */}

            <div className="micro-hero-text">
              <div className="micro-eyebrow">
                <FaGraduationCap />
                MICROTEACHING IPA
              </div>

              <h1>
                Saatnya
                <span>Unjuk Aksi! 🚀</span>
              </h1>

              <p>
                Kerjakan tugas IPA dengan menyenangkan. Baca tugas, lakukan
                aktivitasnya, lalu kumpulkan hasil pekerjaanmu melalui link.
              </p>

            </div>

            {/* ILLUSTRATION */}

            <div className="micro-hero-visual">
              <div className="micro-circle circle-one" />

              <div className="micro-circle circle-two" />

              <div className="micro-student">🧑‍🔬</div>

              <div className="micro-floating float-one">📄</div>

              <div className="micro-floating float-two">🔬</div>

              <div className="micro-floating float-three">⭐</div>

              <div className="micro-floating float-four">✏️</div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===================================================
          VIDEO MENGAJAR DOSEN
      =================================================== */}

      <section className="micro-lecturer-video">
        <Container>
          {/* HEADER */}

          <div className="video-section-header">
            <div>
              <span className="video-section-label">
                VIDEO PEMBELAJARAN DOSEN
              </span>

              <h2>Lihat Contoh Mengajar dari Dosen 🎥</h2>

              <p>
                Amati bagaimana dosen menyampaikan materi IPA, mengelola
                pembelajaran, dan membangun interaksi dengan peserta didik.
              </p>
            </div>

            <div className="video-header-icon">
              <FaPlay />
            </div>
          </div>

          {/* VIDEO GRID */}

          <div className="lecturer-video-grid">
            {videoDosenList.map((video) => (
              <article className="lecturer-video-card" key={video.id}>
                {/* VIDEO */}

                <div className="lecturer-video-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />

                  {/* DURASI */}

                  <span className="video-duration">{video.duration}</span>

                  {/* YOUTUBE */}

                  <div className="youtube-badge">
                    <FaYoutube />
                  </div>
                </div>

                {/* CONTENT */}

                <div className="lecturer-video-content">
                  {/* TITLE */}

                  <h3>{video.title}</h3>

                  {/* DESCRIPTION */}

                  <p>{video.description}</p>

                  {/* LECTURER */}

                  <div className="video-lecturer">
                    <div className="lecturer-avatar">
                      <FaGraduationCap />
                    </div>

                    <div>
                      <span>Pengajar</span>

                      <strong>{video.lecturer}</strong>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ===================================================
          INSTRUCTION
      =================================================== */}

      <section className="micro-instruction">
        <Container>
          <div className="instruction-card">
            <div className="instruction-icon">📚</div>

            <div className="instruction-content">
              <h3>Bagaimana cara mengerjakan tugas?</h3>

              <div className="instruction-steps">
                <div className="instruction-step">
                  <span>1</span>

                  <p>Pilih tugas yang ingin kamu kerjakan.</p>
                </div>

                <div className="instruction-step">
                  <span>2</span>

                  <p>Buka dan baca file PDF tugas.</p>
                </div>

                <div className="instruction-step">
                  <span>3</span>

                  <p>Kerjakan tugas sesuai petunjuk.</p>
                </div>

                <div className="instruction-step">
                  <span>4</span>

                  <p>Masukkan link hasil pekerjaanmu.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===================================================
          TASK SECTION
      =================================================== */}

      <section className="micro-tasks">
        <Container>
          {/* HEADER */}

          <div className="micro-section-header">
            <div>
              <span>DAFTAR TUGAS</span>

              <h2>Tugas Microteaching 📚</h2>

              <p>Yuk selesaikan tugas-tugas IPA kamu!</p>
            </div>
          </div>

          {/* FILTER */}

          <div className="micro-filter">
            <button
              type="button"
              className={activeFilter === "semua" ? "active" : ""}
              onClick={() => setActiveFilter("semua")}
            >
              Semua
            </button>

            <button
              type="button"
              className={activeFilter === "belum" ? "active" : ""}
              onClick={() => setActiveFilter("belum")}
            >
              Belum Dikerjakan
            </button>

            <button
              type="button"
              className={activeFilter === "dikumpulkan" ? "active" : ""}
              onClick={() => setActiveFilter("dikumpulkan")}
            >
              Sudah Dikumpulkan
            </button>

            <button
              type="button"
              className={activeFilter === "dinilai" ? "active" : ""}
              onClick={() => setActiveFilter("dinilai")}
            >
              Sudah Dinilai
            </button>
          </div>

          {/* TASK GRID */}

          <div className="micro-task-grid">
            {filteredTugas.map((tugas) => (
              <article className="micro-task-card" key={tugas.id}>
                {/* VISUAL */}

                <div className="task-visual">
                  <img
                    src={tugas.image}
                    alt={tugas.title}
                    className="task-image"
                  />

                  <div className="task-image-overlay"></div>

                  <div className="task-pdf">
                    <FaFilePdf />
                  </div>

                </div>

                {/* BODY */}

                <div className="task-body">
                  {/* STATUS */}

                  <div className="task-status">
                    <span className={`status-${tugas.status}`}>
                      {statusConfig[tugas.status].icon}

                      {statusConfig[tugas.status].label}
                    </span>

                    {tugas.score && (
                      <span className="task-score">⭐ {tugas.score}</span>
                    )}
                  </div>

                  {/* TITLE */}

                  <h3>{tugas.title}</h3>
                  

                  {/* DESCRIPTION */}

                  <p>{tugas.description}</p>

                  {/* DEADLINE */}

                  <div className="task-deadline">
                    <FaCalendarAlt />

                    <span>Batas pengumpulan</span>

                    <strong>{tugas.deadline}</strong>
                  </div>

                  {/* BUTTON */}

                  <Button
                    className="task-button"
                    onClick={() => lihatTugas(tugas.id)}
                  >
                    Lihat Tugas
                    <FaArrowRight />
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* EMPTY */}

          {filteredTugas.length === 0 && (
            <div className="micro-empty">
              <div>🔎</div>

              <h3>Tugas tidak ditemukan</h3>

              <p>Coba gunakan kata pencarian atau filter yang berbeda.</p>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}

export default Microteaching;
