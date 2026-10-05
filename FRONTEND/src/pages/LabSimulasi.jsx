
import { useEffect, useState } from "react";
import { Container, Button, Spinner, Alert } from "react-bootstrap";

import {
  FaFlask,
  FaSearch,
  FaExternalLinkAlt,
  FaArrowRight,
  FaLightbulb,
  FaPlay,
} from "react-icons/fa";

import { getSimulasi } from "../service/simulasiService";
import "../css/LabSimulasi.css";

/* =========================================================
   KONFIGURASI STORAGE
========================================================= */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const STORAGE_BUCKET = "media-storage";

/* =========================================================
   HELPER URL GAMBAR
========================================================= */

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  // Jika sudah berupa URL lengkap
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Jika database menyimpan path gambar
  const cleanPath = imagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${cleanPath}`;
};

/* =========================================================
   LAB SIMULASI
========================================================= */

function LabSimulasi() {
  const [simulations, setSimulations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     AMBIL DATA SIMULASI DARI BACKEND
  ======================================================= */

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSimulasi();

      // Pastikan respons berupa array
      const simulationData = Array.isArray(data)
        ? data
        : data?.data || [];

      // Mahasiswa hanya melihat simulasi publik
      const publishedSimulations = simulationData.filter(
        (item) => item.status === "public"
      );

      setSimulations(publishedSimulations);
    } catch (err) {
      setError(
        err.message || "Gagal memuat daftar simulasi."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD AWAL
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const loadSimulations = async () => {
      try {
        const data = await getSimulasi();

        if (!isMounted) return;

        const simulationData = Array.isArray(data)
          ? data
          : data?.data || [];

        const publishedSimulations = simulationData.filter(
          (item) => item.status === "public"
        );

        setSimulations(publishedSimulations);
        setError("");
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || "Gagal memuat daftar simulasi."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSimulations();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredSimulations = simulations.filter((simulation) => {
    const keyword = search.toLowerCase().trim();

    const title = simulation.judul || simulation.title || "";
    const description =
      simulation.deskripsi || simulation.description || "";

    return (
      title.toLowerCase().includes(keyword) ||
      description.toLowerCase().includes(keyword)
    );
  });

  /* =======================================================
     OPEN SIMULATION
  ======================================================= */

  const openSimulation = (url) => {
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="lab-page">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="lab-hero">
        <Container>
          <div className="lab-hero-content">
            <div className="lab-hero-text">
              <div className="lab-eyebrow">
                <FaFlask />
                LAB SIMULASI IPA
              </div>

              <h1>
                Yuk,
                <span>Eksplorasi</span>
              </h1>

              <p>
                Belajar IPA jadi lebih seru. Coba berbagai simulasi interaktif
                dan temukan bagaimana dunia di sekitar kita bekerja.
              </p>

              <div className="lab-hero-buttons">
                <Button
                  className="lab-explore-button"
                  onClick={() => {
                    document
                      .getElementById("simulation-list")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                >
                  <FaPlay />
                  Mulai Eksplorasi
                  <FaArrowRight />
                </Button>

                <span className="lab-hero-note">
                  ✨ Belajar sambil mencoba!
                </span>
              </div>
            </div>

            {/* HERO ILLUSTRATION */}

            <div className="lab-hero-visual">
              <div className="lab-orbit orbit-one" />
              <div className="lab-orbit orbit-two" />

              <div className="lab-flask">🧪</div>

              <div className="lab-floating-icon icon-one">⚛️</div>
              <div className="lab-floating-icon icon-two">🌍</div>
              <div className="lab-floating-icon icon-three">⚡</div>
              <div className="lab-floating-icon icon-four">🔬</div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===================================================
          INFO
      =================================================== */}

      <section className="lab-info">
        <Container>
          <div className="lab-info-card">
            <div className="lab-info-icon">
              <FaFlask />
            </div>

            <div className="lab-info-text">
              <h3>Apa itu Lab Simulasi?</h3>

              <p>
                Di sini kamu bisa mencoba simulasi IPA interaktif dari PhET.
                Kamu dapat mengubah berbagai kondisi, melakukan percobaan,
                dan melihat apa yang terjadi.
              </p>
            </div>

            <div className="lab-info-badge">
              <strong>PhET</strong>
              <span>Interactive Simulations</span>
            </div>
          </div>
        </Container>
      </section>

      {/* ===================================================
          SEARCH + SIMULATIONS
      =================================================== */}

      <section className="lab-simulations" id="simulation-list">
        <Container>
          <div className="lab-section-heading">
            <div>
              <span>PILIH SIMULASI</span>
              <h2>Mau mencoba apa hari ini? 🔬</h2>
            </div>

            {/* SEARCH */}

            <div className="lab-search">
              <FaSearch />

              <input
                type="text"
                placeholder="Cari simulasi..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">
                Memuat daftar simulasi...
              </p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <Alert variant="danger">
              <p className="mb-2">{error}</p>

              <Button
                variant="outline-danger"
                size="sm"
                onClick={fetchSimulations}
              >
                Coba Lagi
              </Button>
            </Alert>
          )}

          {/* SIMULATION CARDS */}

          {!loading && !error && filteredSimulations.length > 0 && (
            <div className="simulation-grid">
              {filteredSimulations.map((simulation) => (
                <SimulationCard
                  key={simulation.id}
                  simulation={simulation}
                  onOpen={openSimulation}
                />
              ))}
            </div>
          )}

          {/* EMPTY */}

          {!loading && !error && filteredSimulations.length === 0 && (
            <div className="lab-empty">
              <div>🔎</div>

              <h3>
                {simulations.length === 0
                  ? "Belum Ada Simulasi"
                  : "Simulasi tidak ditemukan"}
              </h3>

              <p>
                {simulations.length === 0
                  ? "Simulasi yang telah dipublikasikan dosen akan muncul di sini."
                  : "Coba gunakan kata pencarian lainnya."}
              </p>
            </div>
          )}

          {/* FOOTER NOTE */}

          <div className="lab-source-note">
            <FaLightbulb />

            <p>
              Simulasi dapat dibuka melalui tautan yang disediakan dosen.
              Pastikan perangkatmu terhubung ke internet.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}

/* =========================================================
   SIMULATION CARD
========================================================= */

function SimulationCard({ simulation, onOpen }) {
  const title = simulation.judul || simulation.title || "Simulasi IPA";
  const description =
    simulation.deskripsi ||
    simulation.description ||
    "Belum ada deskripsi simulasi.";

  const imagePath =
    simulation.image_path || simulation.image_url || simulation.image;

  const imageUrl = getImageUrl(imagePath);

  const simulationUrl =
    simulation.link_simulasi || simulation.url;

  return (
    <article className="simulation-card">
      {/* VISUAL */}

      <div className="simulation-visual">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="simulation-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="simulation-image-placeholder">
            <FaFlask />
            <span>Simulasi PAPASCI</span>
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="simulation-body">
        <h3>{title}</h3>

        <p>{description}</p>

        <Button
          className="simulation-button"
          onClick={() => onOpen(simulationUrl)}
          disabled={!simulationUrl}
        >
          <FaPlay />
          Mulai Simulasi
          <FaExternalLinkAlt />
        </Button>
      </div>
    </article>
  );
}

export default LabSimulasi;