import { Container, Row, Col, Button } from "react-bootstrap";
import {
  FaArrowRight,
  FaBookOpen,
  FaFlask,
  FaSearch,
  FaBrain,
  FaLightbulb,
  FaChalkboardTeacher,
} from "react-icons/fa";

import Footer from "../components/Footer";

import "../css/Beranda.css";

// Ganti dengan lokasi gambar Papua kamu
import heroPapua from "../assets/gambarhero.png";

function Beranda() {
  return (
    <div className="home-page">
      {/* =====================================================
    HERO SECTION
===================================================== */}

      <section
        className="home-hero"
        style={{
          backgroundImage: `url(${heroPapua})`,
        }}
      >
        <div className="hero-overlay"></div>

        <Container className="hero-container">
          <Row className="hero-row align-items-center">
            <Col lg={8} xl={7}>
              <div className="hero-content">
                {/* BADGE */}
                <div className="hero-badge">
                  <span className="hero-badge-icon">🌿</span>
                  <span>PAPASCI</span>
                  <span className="hero-badge-line"></span>
                  <span>PEMBELAJARAN IPA</span>
                </div>

                {/* TITLE */}
                <h1>
                  Papua Adaptive
                  <span>Science Learning</span>
                </h1>

                {/* DESCRIPTION */}
                <p>
                  Platform pembelajaran IPA bagi mahasiswa PGSD untuk memahami
                  konsep sains, mengeksplorasi fenomena, melakukan simulasi,
                  serta mengembangkan keterampilan dalam merancang pembelajaran
                  IPA SD.
                </p>

                {/* ACTION */}
                <div className="hero-actions">
                  <Button href="/module" className="hero-button">
                    <FaBookOpen />
                    <span>Ayo Belajar</span>
                    <FaArrowRight />
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        {/* DECORATIVE ELEMENT */}
        <div className="hero-bottom-info">
          <span>🌱 Eksplorasi</span>
          <span>•</span>
          <span>🔬 Eksperimen</span>
          <span>•</span>
          <span>📚 Pembelajaran</span>
        </div>
      </section>

      {/* =====================================================
          TUJUAN PEMBELAJARAN
      ===================================================== */}

      <section className="objective-section">
        <Container>
          <div className="section-heading">
            <span>🎯 TUJUAN PEMBELAJARAN</span>

            <h2>Apa yang Akan Kamu Pelajari?</h2>

            <p>
              Dalam perjalanan belajar IPA, kamu akan diajak untuk mengamati,
              memahami, mencoba, dan menemukan.
            </p>
          </div>

          <Row className="g-4">
            {/* TUJUAN 1 */}
            <Col sm={6} lg={3}>
              <div className="objective-card">
                <div className="objective-icon">
                  <FaSearch />
                </div>

                <h4>Memahami Hakikat IPA</h4>

                <p>
                  Memahami konsep dasar IPA dan penerapannya dalam kehidupan.
                </p>
              </div>
            </Col>

            {/* TUJUAN 2 */}
            <Col sm={6} lg={3}>
              <div className="objective-card">
                <div className="objective-icon">
                  <FaBrain />
                </div>

                <h4>Mengembangkan Literasi Digital</h4>

                <p>
                  Mengakses dan mengevaluasi informasi digital secara kritis dan
                  etis.
                </p>
              </div>
            </Col>

            {/* TUJUAN 3 */}
            <Col sm={6} lg={3}>
              <div className="objective-card">
                <div className="objective-icon">
                  <FaFlask />
                </div>

                <h4>Menganalisis Fenomena IPA</h4>

                <p>
                  Menganalisis fenomena alam serta keanekaragaman flora dan
                  fauna Papua.
                </p>
              </div>
            </Col>

            {/* TUJUAN 4 */}
            <Col sm={6} lg={3}>
              <div className="objective-card">
                <div className="objective-icon">
                  <FaLightbulb />
                </div>

                <h4>Merancang Pembelajaran IPA SD</h4>

                <p>
                  Merancang pembelajaran IPA yang kontekstual, inovatif, dan
                  berbasis lingkungan.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* =====================================================
          JELAJAHI PAPASCI
      ===================================================== */}

      {/* =====================================================
    JELAJAHI PAPASCI
===================================================== */}

      <section className="explore-section">
        <Container>
          <div className="section-heading explore-heading">
            <span>🧭 JELAJAHI PAPASCI</span>

            <h2>Temukan Cara Belajar yang Sesuai</h2>

            <p>
              Jelajahi berbagai fasilitas PAPASCI untuk memperdalam pemahaman,
              melakukan eksperimen, dan mengembangkan keterampilan mengajar IPA.
            </p>
          </div>

          <div className="explore-grid">
            {/* MODULE */}
            <article className="explore-card explore-module">
              <div className="explore-card-top">
                <span className="explore-number">01</span>

                <div className="explore-icon">
                  <FaBookOpen />
                </div>
              </div>

              <div className="explore-content">
                <span className="explore-label">PEMBELAJARAN</span>

                <h3>Module</h3>

                <p>
                  Pelajari konsep-konsep IPA melalui materi pembelajaran yang
                  terstruktur, kontekstual, dan mudah dipahami.
                </p>

                <Button href="/module" className="explore-button">
                  <span>Mulai Belajar</span>
                  <FaArrowRight />
                </Button>
              </div>

              <div className="explore-decoration"></div>
            </article>

            {/* LAB SIMULASI */}
            <article className="explore-card explore-lab">
              <div className="explore-card-top">
                <span className="explore-number">02</span>

                <div className="explore-icon">
                  <FaFlask />
                </div>
              </div>

              <div className="explore-content">
                <span className="explore-label">EKSPERIMEN</span>

                <h3>Lab Simulasi</h3>

                <p>
                  Eksplorasi berbagai fenomena IPA melalui simulasi interaktif
                  dan amati bagaimana konsep sains bekerja.
                </p>

                <Button href="/labsimulasi" className="explore-button">
                  <span>Coba Simulasi</span>
                  <FaArrowRight />
                </Button>
              </div>

              <div className="explore-decoration"></div>
            </article>

            {/* MICROTEACHING */}
            <article className="explore-card explore-micro">
              <div className="explore-card-top">
                <span className="explore-number">03</span>

                <div className="explore-icon">
                  <FaChalkboardTeacher />
                </div>
              </div>

              <div className="explore-content">
                <span className="explore-label">PRAKTIK MENGAJAR</span>

                <h3>Microteaching</h3>

                <p>
                  Kembangkan kemampuan mengajar IPA melalui tugas, contoh
                  praktik dosen, dan pengalaman pembelajaran.
                </p>

                <Button href="/microteaching" className="explore-button">
                  <span>Lihat Tugas</span>
                  <FaArrowRight />
                </Button>
              </div>

              <div className="explore-decoration"></div>
            </article>
          </div>
        </Container>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />
    </div>
  );
}

export default Beranda;
