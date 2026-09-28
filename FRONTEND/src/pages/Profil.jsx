import { Container, Row, Col } from "react-bootstrap";
import {
  FaUser,
  FaIdCard,
  FaChartLine,
  FaBookOpen,
  FaClipboardCheck,
  FaTasks,
  FaTrophy,
} from "react-icons/fa";

import "../css/Profil.css";

function Profil() {
  // =========================================================
  // DATA MAHASISWA
  // Nantinya data ini bisa diganti dengan data dari backend
  // =========================================================

  const mahasiswa = {
    nama: "Hamirun",
    nim: "20230001",

    nilai: {
      pretest: 80,
      kuis: 85,
      tugas: 90,
    },
  };

  // =========================================================
  // RATA-RATA
  // =========================================================

  const rataRata = Math.round(
    (mahasiswa.nilai.pretest + mahasiswa.nilai.kuis + mahasiswa.nilai.tugas) /
      3,
  );

  return (
    <div className="profil-page">
      <Container fluid className="profil-container">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="profil-header">
          <div>
            <span className="profil-label">PROFIL MAHASISWA</span>

            <h1>Profil & Hasil Belajar</h1>

            <p>
              Lihat informasi diri dan perkembangan hasil belajar kamu selama
              mengikuti pembelajaran di PAPASCI.
            </p>
          </div>
        </div>

        {/* =====================================================
            PROFILE + SCORE
        ===================================================== */}

        <Row className="g-4">
          {/* ===================================================
              DATA MAHASISWA
          =================================================== */}

          <Col lg={5}>
            <div className="profile-card">
              {/* PROFILE TOP */}

              <div className="profile-card-top">
                <div className="profile-avatar">
                  <FaUser />
                </div>

                <div className="profile-introduction">
                  <span>MAHASISWA</span>

                  <h2>{mahasiswa.nama}</h2>

                  <p>Mahasiswa PGSD</p>
                </div>
              </div>

              {/* PROFILE INFORMATION */}

              <div className="profile-information">
                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <FaUser />
                  </div>

                  <div>
                    <span>Nama Lengkap</span>
                    <strong>{mahasiswa.nama}</strong>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <FaIdCard />
                  </div>

                  <div>
                    <span>NIM</span>
                    <strong>{mahasiswa.nim}</strong>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* ===================================================
              HASIL BELAJAR
          =================================================== */}

          <Col lg={7}>
            <div className="learning-score-card">
              {/* SCORE HEADER */}

              <div className="score-card-header">
                <div>
                  <span className="score-label">HASIL BELAJAR</span>

                  <h2>Ringkasan Nilai</h2>
                </div>

                <div className="score-header-icon">
                  <FaChartLine />
                </div>
              </div>

              {/* SCORE LIST */}

              <div className="score-list">
                {/* PRETEST */}

                <div className="score-item">
                  <div className="score-item-left">
                    <div className="score-icon pretest">
                      <FaClipboardCheck />
                    </div>

                    <div>
                      <strong>Nilai Pretest</strong>

                      <span>Tes awal pembelajaran</span>
                    </div>
                  </div>

                  <div className="score-value">{mahasiswa.nilai.pretest}</div>
                </div>

                {/* KUIS */}

                <div className="score-item">
                  <div className="score-item-left">
                    <div className="score-icon kuis">
                      <FaBookOpen />
                    </div>

                    <div>
                      <strong>Nilai Kuis</strong>

                      <span>Hasil evaluasi pembelajaran</span>
                    </div>
                  </div>

                  <div className="score-value">{mahasiswa.nilai.kuis}</div>
                </div>

                {/* TUGAS */}

                <div className="score-item">
                  <div className="score-item-left">
                    <div className="score-icon tugas">
                      <FaTasks />
                    </div>

                    <div>
                      <strong>Nilai Tugas</strong>

                      <span>Hasil pengerjaan tugas</span>
                    </div>
                  </div>

                  <div className="score-value">{mahasiswa.nilai.tugas}</div>
                </div>
              </div>

              {/* AVERAGE */}

              <div className="average-score">
                <div className="average-left">
                  <div className="average-icon">
                    <FaTrophy />
                  </div>

                  <div>
                    <span>RATA-RATA HASIL BELAJAR</span>

                    <strong>Performa pembelajaran kamu</strong>
                  </div>
                </div>

                <div className="average-value">{rataRata}</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* =====================================================
            SCORE INFORMATION
        ===================================================== */}

        <div className="profile-note">
          <div className="profile-note-icon">
            <FaChartLine />
          </div>

          <div>
            <strong>Terus tingkatkan hasil belajarmu</strong>

            <p>
              Nilai pada halaman ini akan diperbarui sesuai hasil pretest, kuis,
              dan tugas yang telah kamu kerjakan di PAPASCI.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Profil;
