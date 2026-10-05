import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBookOpen,
  FaCheck,
  FaLightbulb,
  FaLeaf,
  FaSeedling,
  FaSearch,
  FaTrophy,
  FaImage,
} from "react-icons/fa";

import { getMaterialsByModule } from "../service/moduleMaterialService";
import { getModuleById } from "../service/moduleService";

import "./ModuleDetail.css";

/* =========================================================
   NORMALISASI DATA
========================================================= */

const normalizeMaterial = (item) => ({
  ...item,
  order: Number(item.order_number ?? item.order ?? 1),
});

/* =========================================================
   COMPONENT
========================================================= */

function ModuleDetail() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [currentModule, setCurrentModule] = useState(null);
  const [materi, setMateri] = useState([]);
  const [currentMateri, setCurrentMateri] = useState(0);
  const [completedMateri, setCompletedMateri] = useState([]);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  /* =======================================================
     LOAD DATA DARI BACKEND
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!moduleId) {
        if (isMounted) {
          setPageError("ID module tidak ditemukan.");
          setLoading(false);
        }

        return;
      }

      if (isMounted) {
        setLoading(true);
        setPageError("");
      }

      try {
        const [moduleData, materialData] = await Promise.all([
          getModuleById(moduleId),
          getMaterialsByModule(moduleId),
        ]);

        if (!isMounted) {
          return;
        }

        const sortedMaterials = (materialData || [])
          .map(normalizeMaterial)
          .sort((a, b) => a.order - b.order);

        setCurrentModule(moduleData);
        setMateri(sortedMaterials);
        setCurrentMateri(0);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Gagal memuat materi:", error);

        setPageError(error.message || "Gagal memuat materi pembelajaran.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [moduleId]);

  /* =======================================================
     DATA MATERI AKTIF
  ======================================================= */

  const current = materi[currentMateri];
  const totalMateri = materi.length;
  const currentNumber = currentMateri + 1;

  /* =======================================================
     MENANDAI MATERI SELESAI
  ======================================================= */

  const markAsCompleted = (materialId) => {
    setCompletedMateri((previous) =>
      previous.includes(materialId) ? previous : [...previous, materialId],
    );
  };

  /* =======================================================
     NAVIGASI
  ======================================================= */

  const handleNext = () => {
    if (!current) {
      return;
    }

    markAsCompleted(current.id);

    if (currentMateri < totalMateri - 1) {
      setCurrentMateri((previous) => previous + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handlePrevious = () => {
    if (currentMateri > 0) {
      setCurrentMateri((previous) => previous - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleSelectMateri = (index) => {
    setCurrentMateri(index);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     SELESAI MODULE
  ======================================================= */

  const finishModule = () => {
    if (!current) {
      return;
    }

    markAsCompleted(current.id);

    navigate(`/quiz/${moduleId}`);
  };

  /* =======================================================
     KEMBALI
  ======================================================= */

  const handleBack = () => {
    navigate("/module");
  };

  /* =======================================================
     IKON MATERI
  ======================================================= */

  const renderMateriIcon = (index) => {
    const icons = [FaLeaf, FaSearch, FaSeedling];

    const IconComponent = icons[index % icons.length];

    return <IconComponent />;
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="module-detail-page">
      <Container fluid>
        {/* HEADER */}

        <div className="module-detail-header">
          <div className="module-header-left">
            <button
              type="button"
              className="back-module-link"
              onClick={handleBack}
            >
              <FaArrowLeft />
              <span>Kembali ke Module</span>
            </button>
          </div>

          <div className="module-header-center">
            <div className="module-label">
              <FaBookOpen />
              MODULE
            </div>

            <h1>{currentModule?.title || "Materi Pembelajaran"}</h1>
          </div>

          <div className="module-header-right">
            <span>Materi</span>

            <strong>
              {totalMateri > 0 ? `${currentNumber}/${totalMateri}` : "0/0"}
            </strong>
          </div>
        </div>

        {/* PESAN ERROR */}

        {pageError && (
          <div className="dosen-materi-alert error">
            {pageError}

            <button type="button" onClick={() => window.location.reload()}>
              Coba Lagi
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="dosen-materi-empty">
            <p>Memuat materi pembelajaran...</p>
          </div>
        ) : !pageError && materi.length === 0 ? (
          /* MATERI KOSONG */

          <div className="dosen-materi-empty">
            <FaBookOpen />

            <h3>Belum ada materi pembelajaran</h3>

            <p>Dosen belum menambahkan materi untuk module ini.</p>

            <Button onClick={handleBack}>
              <FaArrowLeft />
              Kembali ke Module
            </Button>
          </div>
        ) : !pageError && current ? (
          <div className="module-content-container">
            {/* GAMBAR MATERI */}

            <div className="materi-hero">
              {current.image_url ? (
                <img src={current.image_url} alt={current.title} />
              ) : (
                <div className="materi-image-placeholder">
                  <FaImage />
                  <span>Materi tanpa gambar</span>
                </div>
              )}

              <div className="materi-hero-overlay">
                <span>MATERI {String(currentNumber).padStart(2, "0")}</span>

                <h2>{current.title}</h2>

                <p>{current.subtitle}</p>
              </div>
            </div>

            {/* KONTEN UTAMA */}

            <div className="materi-main-grid">
              {/* ARTIKEL */}

              <article className="materi-article">
                <div className="materi-icon">
                  {renderMateriIcon(currentMateri)}
                </div>

                <h3>Yuk, Kita Pelajari!</h3>

                <div className="materi-text">
                  {current.content
                    ?.split(/\n+/)
                    .filter((paragraph) => paragraph.trim())
                    .map((paragraph, index) => (
                      <p key={`${current.id}-${index}`}>{paragraph}</p>
                    ))}
                </div>
              </article>

              {/* SIDEBAR DAFTAR MATERI */}

              <aside className="materi-navigation">
                <div className="navigation-card">
                  <div className="navigation-title">
                    <FaBookOpen />
                    <span>Daftar Materi</span>
                  </div>

                  <div className="materi-list-navigation">
                    {materi.map((item, index) => {
                      const isActive = index === currentMateri;

                      const isCompleted = completedMateri.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`materi-nav-item ${
                            isActive ? "active" : ""
                          }`}
                          onClick={() => handleSelectMateri(index)}
                        >
                          <span className="nav-number">
                            {isCompleted ? (
                              <FaCheck />
                            ) : (
                              String(item.order).padStart(2, "0")
                            )}
                          </span>

                          <span className="nav-title">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="navigation-tip">
                    <FaLightbulb />

                    <p>Baca setiap materi dengan teliti sebelum melanjutkan.</p>
                  </div>
                </div>
              </aside>
            </div>

            {/* NAVIGASI MATERI */}

            <div className="materi-footer-navigation">
              <Button
                className="materi-prev-button"
                onClick={handlePrevious}
                disabled={currentMateri === 0}
              >
                <FaArrowLeft />
                Sebelumnya
              </Button>

              <div className="materi-dots">
                {materi.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Buka materi ${index + 1}`}
                    className={`materi-dot ${
                      index === currentMateri ? "active" : ""
                    } ${completedMateri.includes(item.id) ? "completed" : ""}`}
                    onClick={() => handleSelectMateri(index)}
                  />
                ))}
              </div>

              {currentMateri < totalMateri - 1 ? (
                <Button className="materi-next-button" onClick={handleNext}>
                  Materi Berikutnya
                  <FaArrowRight />
                </Button>
              ) : (
                <Button
                  className="materi-next-button finish-button"
                  onClick={finishModule}
                >
                  Selesai & Kerjakan Kuis
                  <FaTrophy />
                </Button>
              )}
            </div>

            {/* PESAN SELESAI */}

            {currentMateri === totalMateri - 1 && (
              <div className="finish-module-card">
                <div className="finish-module-icon">🎉</div>

                <div>
                  <h3>Hebat! Kamu sudah sampai di akhir materi.</h3>

                  <p>
                    Setelah memahami semua materi, sekarang saatnya menguji
                    pengetahuanmu melalui kuis.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Container>
    </div>
  );
}

export default ModuleDetail;
