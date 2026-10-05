import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";

import {
  FaBookOpen,
  FaArrowRight,
  FaPlay,
  FaClipboardCheck,
  FaStar,
  FaChevronRight,
} from "react-icons/fa";

import { getModules } from "../service/moduleService";
import "../css/Module.css";

/* =========================================================
   MODULE PAGE
========================================================= */

function Module() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     AMBIL DATA MODULE
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchModules = async () => {
      try {
        const data = await getModules();

        if (!isMounted) return;

        const publishedModules = data
          .filter((item) => item.status === "publik")
          .sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));

        setModules(publishedModules);
        setError("");
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Gagal memuat daftar module.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchModules();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     COBA MUAT ULANG
  ======================================================= */

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getModules();

      const publishedModules = data
        .filter((item) => item.status === "publik")
        .sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));

      setModules(publishedModules);
    } catch (err) {
      setError(err.message || "Gagal memuat daftar module.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     SCROLL KE DAFTAR MODULE
  ======================================================= */

  const handleViewModules = () => {
    document.getElementById("module-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="module-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="module-header">
        <Container>
          <Row className="align-items-center">
            {/* =================================================
                HEADER CONTENT
            ================================================= */}

            <Col lg={7}>
              <div className="module-header-content">
                <span className="module-header-badge">📚 PEMBELAJARAN IPA</span>

                <h1>
                  Yuk,
                  <span> Mulai Belajar!</span>
                </h1>

                <p>
                  Jelajahi berbagai module pembelajaran IPA yang dirancang agar
                  kamu dapat belajar dengan cara yang menyenangkan, bertahap,
                  dan mudah dipahami.
                </p>

                {/* =============================================
                    HEADER INFORMATION
                ============================================= */}

                <div className="module-header-info">
                  {/* JUMLAH MODULE */}

                  <div className="module-info-item">
                    <div className="module-info-icon">
                      <FaBookOpen />
                    </div>

                    <div>
                      <strong>{modules.length}</strong>
                      <span>Module</span>
                    </div>
                  </div>

                  <div className="module-info-divider"></div>

                  {/* PRETEST */}

                  <div className="module-info-item">
                    <div className="module-info-icon">
                      <FaClipboardCheck />
                    </div>

                    <div>
                      <strong>Pretest</strong>
                      <span>Awal belajar</span>
                    </div>
                  </div>

                  <div className="module-info-divider"></div>

                  {/* KUIS */}

                  <div className="module-info-item">
                    <div className="module-info-icon">
                      <FaStar />
                    </div>

                    <div>
                      <strong>Kuis</strong>
                      <span>Uji pemahaman</span>
                    </div>
                  </div>
                </div>

                {/* =============================================
                    HEADER ACTION
                ============================================= */}

                <div className="module-header-actions">
                  <Button
                    type="button"
                    className="module-header-button"
                    onClick={handleViewModules}
                  >
                    <FaPlay />
                    Lihat Module
                    <FaArrowRight />
                  </Button>
                </div>
              </div>
            </Col>

            {/* =================================================
                HEADER ILLUSTRATION
            ================================================= */}

            <Col lg={5}>
              <div className="module-header-illustration">
                <div className="header-circle">
                  <div className="header-book">📖</div>
                </div>

                <div className="header-floating header-float-one">🌱</div>

                <div className="header-floating header-float-two">🔬</div>

                <div className="header-floating header-float-three">⭐</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* =====================================================
          LEARNING FLOW
      ===================================================== */}

      <section className="learning-flow-section">
        <Container>
          <div className="flow-heading">
            <span>🧭 CARA BELAJAR</span>

            <h2>Alur Pembelajaran</h2>

            <p>
              Setiap module memiliki perjalanan belajar yang akan membantumu
              memahami materi.
            </p>
          </div>

          <div className="learning-flow">
            {/* STEP 1 */}

            <div className="flow-item">
              <div className="flow-number">01</div>

              <div className="flow-icon">
                <FaClipboardCheck />
              </div>

              <h4>Pretest</h4>

              <p>Kerjakan beberapa pertanyaan sebelum mulai belajar.</p>
            </div>

            <div className="flow-arrow">
              <FaChevronRight />
            </div>

            {/* STEP 2 */}

            <div className="flow-item">
              <div className="flow-number">02</div>

              <div className="flow-icon">
                <FaBookOpen />
              </div>

              <h4>Pelajari Materi</h4>

              <p>Baca dan pahami materi pembelajaran dengan baik.</p>
            </div>

            <div className="flow-arrow">
              <FaChevronRight />
            </div>

            {/* STEP 3 */}

            <div className="flow-item">
              <div className="flow-number">03</div>

              <div className="flow-icon">
                <FaStar />
              </div>

              <h4>Kuis</h4>

              <p>Uji pemahamanmu dan kumpulkan bintang.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          MODULE LIST
      ===================================================== */}

      <section className="modules-section" id="module-list">
        <Container>
          <div className="modules-heading">
            <div>
              <h2>📚 PILIH MODULE</h2>
            </div>

            <div className="module-count">
              <FaBookOpen />

              <span>{modules.length} Module</span>
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />

              <p className="mt-3">Memuat daftar module...</p>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <Alert variant="danger">
              <p className="mb-2">{error}</p>

              <Button variant="outline-danger" size="sm" onClick={handleRetry}>
                Coba Lagi
              </Button>
            </Alert>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading && !error && modules.length === 0 && (
            <div className="text-center py-5">
              <FaBookOpen size={40} className="mb-3 text-secondary" />

              <h4>Belum Ada Module</h4>

              <p>Module pembelajaran yang tersedia akan muncul di sini.</p>
            </div>
          )}

          {/* =================================================
              MODULE CARDS
          ================================================= */}

          {!loading && !error && modules.length > 0 && (
            <Row className="g-4">
              {modules.map((module, index) => (
                <Col key={module.id} md={6} xl={4}>
                  <ModuleCard module={module} index={index} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
    </div>
  );
}

/* =========================================================
   MODULE CARD COMPONENT
========================================================= */

function ModuleCard({ module, index }) {
  const moduleNumber = String(index + 1).padStart(2, "0");

  return (
    <Card className="module-learning-card">
      {/* CARD IMAGE */}

      <div className="module-card-image">
        {module.image_url ? (
          <img
            src={module.image_url}
            alt={module.title}
            className="module-image"
          />
        ) : (
          <div className="module-image-placeholder">
            <FaBookOpen size={42} />

            <span>Materi PAPASCI</span>
          </div>
        )}

        <div className="module-card-number">MODULE {moduleNumber}</div>
      </div>

      {/* CARD BODY */}

      <Card.Body>
        <Card.Title>{module.title}</Card.Title>

        <Card.Text>
          {module.description || "Belum ada deskripsi module."}
        </Card.Text>

        <Button href={`/pretest/${module.id}`} className="module-card-button">
          <FaPlay />
          Mulai Belajar
          <FaArrowRight />
        </Button>
      </Card.Body>
    </Card>
  );
}

export default Module;
