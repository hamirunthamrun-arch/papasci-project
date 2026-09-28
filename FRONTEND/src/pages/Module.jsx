import { Container, Row, Col, Card, Button } from "react-bootstrap";

import {
  FaBookOpen,
  FaArrowRight,
  FaPlay,
  FaClipboardCheck,
  FaStar,
  FaChevronRight,
} from "react-icons/fa";

import "../css/Module.css";

/* =========================================================
   DATA MODULE
========================================================= */

const modules = [
  {
    id: 1,
    number: "MODULE 01",
    title: "Literasi Digital IPA",
    description:
      "Pelajari pemanfaatan teknologi dan sumber digital untuk mendukung pembelajaran IPA secara efektif.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 2,
    number: "MODULE 02",
    title: "IPA dalam Kehidupan",
    description:
      "Pelajari berbagai konsep IPA yang berkaitan dengan kehidupan sehari-hari dan lingkungan di sekitar kita.",
    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 3,
    number: "MODULE 03",
    title: "Eksplorasi Fauna dan Flora di Papua",
    description:
      "Kenali kekayaan flora dan fauna Papua serta keanekaragaman hayati yang menjadi bagian penting dari lingkungan.",
    image:
      "https://birdingindonesia.com/wp-content/uploads/2023/12/image-1.png",
  },

  {
    id: 4,
    number: "MODULE 04",
    title: "Energi",
    description:
      "Pelajari berbagai bentuk dan sumber energi serta pemanfaatannya dalam kehidupan sehari-hari.",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 5,
    number: "MODULE 05",
    title: "Tubuh Kita",
    description:
      "Kenali struktur dan fungsi tubuh manusia serta berbagai sistem yang memungkinkan tubuh bekerja dengan baik.",
    image:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=80",
  },

  {
    id: 6,
    number: "MODULE 06",
    title: "Benda dan Perubahannya",
    description:
      "Pelajari berbagai jenis benda, sifat-sifatnya, serta perubahan yang dapat terjadi pada benda.",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",
  },
];

/* =========================================================
   MODULE PAGE
========================================================= */

function Module() {
  return (
    <div className="module-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="module-header">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <div className="module-header-content">
                <span className="module-header-badge">📚 PEMBELAJARAN</span>

                <h1>
                  Yuk,
                  <span> Mulai Belajar!</span>
                </h1>

                <p>
                  Pilih module yang ingin kamu pelajari. Setiap perjalanan
                  dimulai dengan sebuah langkah kecil.
                </p>
              </div>
            </Col>

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

      <section className="modules-section">
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

          {/* Module cards */}

          <Row className="g-4">
            {modules.map((module) => (
              <Col key={module.id} md={6} xl={4}>
                <ModuleCard module={module} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
}

/* =========================================================
   MODULE CARD COMPONENT
========================================================= */

function ModuleCard({ module }) {
  return (
    <Card className="module-learning-card">
      {/* =====================================================
          CARD IMAGE
      ===================================================== */}

      <div className="module-card-image">
        <img src={module.image} alt={module.title} className="module-image" />

        {/* Module Number */}

        <div className="module-card-number">{module.number}</div>
      </div>

      {/* =====================================================
          CARD BODY
      ===================================================== */}

      <Card.Body>
        {/* Title */}

        <Card.Title>{module.title}</Card.Title>

        {/* Description */}

        <Card.Text>{module.description}</Card.Text>

        {/* Button */}

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
