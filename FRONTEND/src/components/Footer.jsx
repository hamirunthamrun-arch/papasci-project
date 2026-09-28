import { Container, Row, Col } from "react-bootstrap";
import { FaFacebookF, FaInstagram, FaYoutube, FaArrowUp } from "react-icons/fa";

import logoPapascI from "../assets/logo-papasci.png";
import logoKementerian from "../assets/logo-kemendikdasmen.jpg";
import logoUniversitas from "../assets/logo-unipa.png";
import logoKemdikti from "../assets/logo-kemdiktisaintek.png";

import "../css/Footer.css";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer">
      <Container>
        {/* FOOTER UTAMA */}
        <Row className="footer-main">
          {/* BRAND PAPASCI */}
          <Col lg={6} md={12} className="footer-brand">
            <img
              src={logoPapascI}
              alt="Logo PAPASCI"
              className="footer-papasci-logo"
            />

            <p className="footer-description">
              Media pembelajaran IPA yang dirancang untuk mendukung mahasiswa
              PGSD dalam memahami, mengeksplorasi, dan mengembangkan
              pembelajaran IPA yang kontekstual dan inovatif.
            </p>

            <div className="footer-social">
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>

              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>

              <a href="#" aria-label="Youtube">
                <FaYoutube />
              </a>
            </div>
          </Col>

          {/* NAVIGASI */}
          <Col lg={3} md={6} className="footer-column">
            <h5>Navigasi</h5>

            <a href="/">Beranda</a>
            <a href="/module">Module</a>
            <a href="/lab-simulasi">Lab Simulasi</a>
            <a href="/microteaching">Microteaching</a>
          </Col>

          {/* INFORMASI */}
          <Col lg={3} md={6} className="footer-column">
            <h5>PAPASCI</h5>

            <p>
              Platform pembelajaran IPA untuk mahasiswa Pendidikan Guru Sekolah
              Dasar.
            </p>

            <p>
              Belajar, bereksperimen, dan mengembangkan kemampuan mengajar
              melalui pembelajaran digital.
            </p>
          </Col>
        </Row>

        {/* LOGO INSTITUSI */}
        <div className="footer-partners">
          <div className="partner-title">
            <span>INSTITUSI PENDUKUNG</span>
            <h4>Didukung oleh</h4>
          </div>

          <div className="partner-logos">
            <div className="partner-logo">
              <img src={logoKementerian} alt="Logo Kementerian Pendidikan" />
            </div>

            <div className="partner-logo">
              <img src={logoUniversitas} alt="Logo Universitas" />
            </div>

            <div className="partner-logo">
              <img src={logoKemdikti} alt="Logo Kemendikti" />
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">
          <p>
            © 2026 <strong>PAPASCI</strong>. All rights reserved.
          </p>

          <button
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Kembali ke atas"
          >
            <FaArrowUp />
          </button>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
