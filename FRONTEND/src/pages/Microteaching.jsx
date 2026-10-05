import { useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaFilePdf,
  FaCalendarAlt,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaStar,
  FaBookOpen,
  FaPlay,
  FaYoutube,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";

import { getAssignments } from "../service/assignmentService";
import { getVideoPembelajaran } from "../service/videoPembelajaranService";
import { getSubmissionByStudent } from "../service/assignmentSubmissionService";

import "../css/Microteaching.css";

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
   HELPER - MENDAPATKAN USER YANG SEDANG LOGIN
========================================================= */

const getCurrentUser = () => {
  let userData = null;

  /*
   * Prioritaskan localStorage
   * jika pasangan token lengkap tersedia.
   */

  if (
    localStorage.getItem("access_token") &&
    localStorage.getItem("refresh_token")
  ) {
    userData = localStorage.getItem("user");
  }

  /*
   * Jika tidak ada, gunakan sessionStorage.
   */

  if (!userData) {
    userData = sessionStorage.getItem("user");
  }

  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error("Gagal membaca data user:", error);
    return null;
  }
};

/* =========================================================
   HELPER - FORMAT TANGGAL
========================================================= */

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/* =========================================================
   HELPER - AMBIL YOUTUBE ID
========================================================= */

const getYoutubeId = (url) => {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);

    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    /* -----------------------------------------------------
       https://youtu.be/VIDEO_ID
    ----------------------------------------------------- */

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] || "";
    }

    /* -----------------------------------------------------
       youtube.com
    ----------------------------------------------------- */

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      /* -----------------------------------------------
         https://www.youtube.com/watch?v=VIDEO_ID
      ----------------------------------------------- */

      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v") || "";
      }

      /* -----------------------------------------------
         https://www.youtube.com/embed/VIDEO_ID
         https://www.youtube.com/shorts/VIDEO_ID
      ----------------------------------------------- */

      const match = parsedUrl.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/);

      return match ? match[1] : "";
    }

    return "";
  } catch {
    return "";
  }
};

/* =========================================================
   HELPER - THUMBNAIL YOUTUBE
========================================================= */

const getYoutubeThumbnail = (url) => {
  const youtubeId = getYoutubeId(url);

  /*
   * Jika link YouTube tidak valid
   */

  if (!youtubeId) {
    return "https://placehold.co/800x450/eaf4ff/1769aa?text=Video+Pembelajaran";
  }

  /*
   * Gunakan HQ Default
   */

  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
};

/* =========================================================
   HELPER - BUKA YOUTUBE
========================================================= */

const openYoutube = (url) => {
  if (!url) {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

/* =========================================================
   COMPONENT
========================================================= */

function Microteaching() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);

  const [videos, setVideos] = useState([]);

  const [activeFilter, setActiveFilter] = useState("semua");

  const [loadingAssignments, setLoadingAssignments] = useState(true);

  const [loadingVideos, setLoadingVideos] = useState(true);

  const [assignmentError, setAssignmentError] = useState("");

  const [videoError, setVideoError] = useState("");

  /* =======================================================
     AMBIL DATA TUGAS + STATUS SUBMISSION
  ======================================================= */

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoadingAssignments(true);
        setAssignmentError("");

        /* =================================================
           USER LOGIN
        ================================================= */

        const currentUser = getCurrentUser();

        if (!currentUser?.id) {
          throw new Error(
            "Data pengguna tidak ditemukan. Silakan login kembali.",
          );
        }

        /* =================================================
           AMBIL SEMUA ASSIGNMENT
        ================================================= */

        const assignmentData = await getAssignments();

        const assignmentList = Array.isArray(assignmentData)
          ? assignmentData
          : [];

        /* =================================================
           AMBIL SUBMISSION SETIAP TUGAS
        ================================================= */

        const submissionResults = await Promise.all(
          assignmentList.map(async (assignment) => {
            try {
              const submission = await getSubmissionByStudent(
                assignment.id,
                currentUser.id,
              );

              return {
                assignmentId: assignment.id,

                submission: submission || null,
              };
            } catch (error) {
              /*
               * Jika mahasiswa belum mengumpulkan
               * tugas, dianggap belum dikerjakan.
               */

              console.log(
                `Belum ada submission untuk tugas ${assignment.id}:`,
                error.message,
              );

              return {
                assignmentId: assignment.id,

                submission: null,
              };
            }
          }),
        );

        /* =================================================
           GABUNGKAN ASSIGNMENT + SUBMISSION
        ================================================= */

        const mergedAssignments = assignmentList.map((assignment) => {
          const submissionData = submissionResults.find(
            (item) => item.assignmentId === assignment.id,
          );

          const submission = submissionData?.submission;

          return {
            ...assignment,

            /*
             * STATUS DIAMBIL DARI
             * assignment_submissions.status
             *
             * Jika belum ada submission,
             * status = belum.
             */

            status: submission?.status || "belum",

            /*
             * NILAI DIAMBIL DARI
             * assignment_submissions.score
             */

            score:
              submission?.score !== null && submission?.score !== undefined
                ? submission.score
                : null,

            /*
             * Simpan ID submission
             * jika nantinya diperlukan.
             */

            submission_id: submission?.id || null,
          };
        });

        setAssignments(mergedAssignments);
      } catch (error) {
        console.error("Gagal mengambil tugas:", error);

        setAssignmentError(error.message || "Gagal mengambil daftar tugas.");
      } finally {
        setLoadingAssignments(false);
      }
    };

    loadAssignments();
  }, []);

  /* =======================================================
     AMBIL VIDEO DOSEN
  ======================================================= */

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoadingVideos(true);
        setVideoError("");

        const data = await getVideoPembelajaran();

        /*
         * -------------------------------------------------
         * DATA DARI API DOSEN
         *
         * API mengembalikan:
         * id
         * judul
         * deskripsi
         * link
         * -------------------------------------------------
         */

        const formattedVideos = (Array.isArray(data) ? data : []).map(
          (video) => ({
            id: video.id,

            title: video.judul || "",

            description: video.deskripsi || "",

            youtubeUrl: video.link || "",
          }),
        );

        setVideos(formattedVideos);
      } catch (error) {
        console.error("Gagal mengambil video pembelajaran:", error);

        setVideoError(error.message || "Gagal mengambil video pembelajaran.");
      } finally {
        setLoadingVideos(false);
      }
    };

    loadVideos();
  }, []);

  /* =======================================================
     FILTER TUGAS
  ======================================================= */

  const filteredTugas = useMemo(() => {
    return assignments.filter((tugas) => {
      /*
       * Status sudah berasal dari
       * assignment_submissions.
       */

      const status = tugas.status || "belum";

      const matchFilter = activeFilter === "semua" || status === activeFilter;

      return matchFilter;
    });
  }, [assignments, activeFilter]);

  /* =======================================================
     NAVIGATE DETAIL TUGAS
  ======================================================= */

  const lihatTugas = (id) => {
    navigate(`/microteaching/tugas/${id}`);
  };

  return (
    <div className="micro-page">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="micro-hero">
        <Container>
          <div className="micro-hero-content">
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
                Pelajari contoh pembelajaran dari dosen, kerjakan tugas
                Microteaching, dan tunjukkan kemampuanmu dalam mengajar IPA SD.
              </p>

              <div className="micro-hero-info">
                <div>
                  <FaBookOpen />

                  <span>Materi & Tugas</span>
                </div>

                <div>
                  <FaPlay />

                  <span>Video Pembelajaran</span>
                </div>
              </div>
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
          VIDEO PEMBELAJARAN DOSEN
      =================================================== */}

      <section className="micro-lecturer-video">
        <Container>
          {/* =================================================
              HEADER VIDEO
          ================================================= */}

          <div className="video-section-header">
            <div>
              <span className="video-section-label">
                VIDEO PEMBELAJARAN DOSEN
              </span>

              <h2>Lihat Contoh Mengajar dari Dosen 🎥</h2>

              <p>
                Amati bagaimana dosen menyampaikan pembelajaran IPA, menjelaskan
                materi, dan membangun interaksi dalam kegiatan belajar.
              </p>
            </div>

            <div className="video-header-icon">
              <FaPlay />
            </div>
          </div>

          {/* =================================================
              LOADING VIDEO
          ================================================= */}

          {loadingVideos && (
            <div className="micro-loading">
              <FaSpinner className="loading-spinner" />

              <span>Memuat video pembelajaran...</span>
            </div>
          )}

          {/* =================================================
              ERROR VIDEO
          ================================================= */}

          {!loadingVideos && videoError && (
            <div className="micro-error">
              <FaExclamationCircle />

              <div>
                <strong>Video belum dapat dimuat</strong>

                <p>{videoError}</p>
              </div>
            </div>
          )}

          {/* =================================================
              VIDEO LIST
          ================================================= */}

          {!loadingVideos && !videoError && videos.length > 0 && (
            <div className="lecturer-video-grid">
              {videos.map((video) => {
                const youtubeUrl = video.youtubeUrl || "";

                const thumbnail = getYoutubeThumbnail(youtubeUrl);

                const title = video.title || "Video Pembelajaran IPA";

                const description =
                  video.description ||
                  "Video pembelajaran IPA untuk membantu mahasiswa memahami praktik mengajar.";

                return (
                  <article
                    className={`lecturer-video-card ${
                      youtubeUrl ? "clickable" : ""
                    }`}
                    key={video.id}
                    onClick={() => openYoutube(youtubeUrl)}
                    role={youtubeUrl ? "button" : undefined}
                    tabIndex={youtubeUrl ? 0 : undefined}
                    onKeyDown={(event) => {
                      if (
                        youtubeUrl &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();

                        openYoutube(youtubeUrl);
                      }
                    }}
                  >
                    {/* ===================================
                          THUMBNAIL
                      =================================== */}

                    <div className="lecturer-video-wrapper">
                      {youtubeUrl ? (
                        <img
                          src={thumbnail}
                          alt={`Thumbnail ${title}`}
                          className="youtube-thumbnail"
                        />
                      ) : (
                        <div className="video-unavailable">
                          <FaYoutube />

                          <span>Video tidak tersedia</span>
                        </div>
                      )}

                      {/* DARK OVERLAY */}

                      {youtubeUrl && (
                        <div className="youtube-thumbnail-overlay" />
                      )}

                      {/* PLAY BUTTON */}

                      {youtubeUrl && (
                        <div className="youtube-play-button">
                          <FaPlay />
                        </div>
                      )}

                      {/* YOUTUBE BADGE */}

                      {youtubeUrl && (
                        <div className="youtube-badge">
                          <FaYoutube />
                        </div>
                      )}
                    </div>

                    {/* ===================================
                          CONTENT
                      =================================== */}

                    <div className="lecturer-video-content">
                      <h3>{title}</h3>

                      <p>{description}</p>

                      {/* WATCH LABEL */}

                      {youtubeUrl && (
                        <div className="watch-youtube">
                          <FaYoutube />

                          <span>Tonton di YouTube</span>

                          <FaArrowRight />
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* =================================================
              EMPTY VIDEO
          ================================================= */}

          {!loadingVideos && !videoError && videos.length === 0 && (
            <div className="micro-empty video-empty">
              <div>
                <FaYoutube />
              </div>

              <h3>Belum ada video pembelajaran</h3>

              <p>Video pembelajaran dari dosen akan muncul di sini.</p>
            </div>
          )}
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
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="micro-section-header">
            <div>
              <span>DAFTAR TUGAS</span>

              <h2>Tugas Microteaching 📚</h2>

              <p>Yuk selesaikan tugas-tugas Microteaching kamu!</p>
            </div>
          </div>

          {/* =================================================
              FILTER
          ================================================= */}

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

          {/* =================================================
              LOADING
          ================================================= */}

          {loadingAssignments && (
            <div className="micro-loading">
              <FaSpinner className="loading-spinner" />

              <span>Memuat daftar tugas...</span>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loadingAssignments && assignmentError && (
            <div className="micro-error">
              <FaExclamationCircle />

              <div>
                <strong>Tugas belum dapat dimuat</strong>

                <p>{assignmentError}</p>
              </div>
            </div>
          )}

          {/* =================================================
              TASK GRID
          ================================================= */}

          {!loadingAssignments &&
            !assignmentError &&
            filteredTugas.length > 0 && (
              <div className="micro-task-grid">
                {filteredTugas.map((tugas) => {
                  /*
                   * STATUS SUDAH BERASAL DARI
                   * assignment_submissions
                   */

                  const status = tugas.status || "belum";

                  const title =
                    tugas.title ||
                    tugas.name ||
                    tugas.judul ||
                    "Tugas Microteaching";

                  const description =
                    tugas.description ||
                    tugas.deskripsi ||
                    "Kerjakan tugas sesuai petunjuk yang diberikan.";

                  const deadline =
                    tugas.deadline || tugas.due_date || tugas.dueDate;

                  const image =
                    tugas.image ||
                    tugas.image_url ||
                    tugas.thumbnail ||
                    "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80";

                  return (
                    <article className="micro-task-card" key={tugas.id}>
                      {/* =================================
                            VISUAL
                        ================================= */}

                      <div className="task-visual">
                        <img src={image} alt={title} className="task-image" />

                        <div className="task-image-overlay" />

                        <div className="task-pdf">
                          <FaFilePdf />
                        </div>
                      </div>

                      {/* =================================
                            BODY
                        ================================= */}

                      <div className="task-body">
                        {/* STATUS */}

                        <div className="task-status">
                          <span className={`status-${status}`}>
                            {statusConfig[status]?.icon || <FaClock />}

                            {statusConfig[status]?.label || "Belum Dikerjakan"}
                          </span>

                          {/* NILAI */}

                          {tugas.score !== null &&
                            tugas.score !== undefined && (
                              <span className="task-score">
                                ⭐ {tugas.score}
                              </span>
                            )}
                        </div>

                        {/* TITLE */}

                        <h3>{title}</h3>

                        {/* DESCRIPTION */}

                        <p>{description}</p>

                        {/* DEADLINE */}

                        <div className="task-deadline">
                          <FaCalendarAlt />

                          <span>Batas pengumpulan</span>

                          <strong>{formatDate(deadline)}</strong>
                        </div>

                        {/* BUTTON */}

                        <button
                          type="button"
                          className="task-button"
                          onClick={() => lihatTugas(tugas.id)}
                        >
                          Lihat Tugas
                          <FaArrowRight />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loadingAssignments &&
            !assignmentError &&
            filteredTugas.length === 0 && (
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
