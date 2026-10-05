
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaUserGraduate,
  FaIdCard,
  FaBookOpen,
  FaClipboardCheck,
  FaChartLine,
  FaGraduationCap,
  FaInfoCircle,
  FaCalendarAlt,
  FaLayerGroup,
} from "react-icons/fa";

import { fetchWithAuth } from "../service/authService";
import "../css/Profil.css";

const API_URL = "http://localhost:5000/api";

/* =========================================================
   DATA PROFIL SEMENTARA
========================================================= */

const mahasiswa = {
  nama: "Hamirun",
  nim: "20230001",
  programStudi: "PGSD",
};

/* =========================================================
   KOMPONEN PROFIL
========================================================= */

function Profil() {
  const [pretestResults, setPretestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     AMBIL DATA NILAI PRETEST DARI BACKEND
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const loadPretestResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchWithAuth(
          `${API_URL}/pretest-results/my`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal mengambil nilai Pretest."
          );
        }

        if (isMounted) {
          setPretestResults(result.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || "Terjadi kesalahan saat mengambil nilai."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPretestResults();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     RINGKASAN NILAI PRETEST
  ======================================================= */

  const ringkasanPretest = useMemo(() => {
    const jumlah = pretestResults.length;

    const totalNilai = pretestResults.reduce(
      (total, item) => total + Number(item.score || 0),
      0
    );

    const rataRata =
      jumlah > 0 ? totalNilai / jumlah : null;

    return {
      jumlah,
      rataRata,
    };
  }, [pretestResults]);

  /* =======================================================
     FORMAT TANGGAL
  ======================================================= */

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="profil-page">
      <Container fluid className="profil-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="profil-header">
          <span className="profil-label">
            PROFIL MAHASISWA
          </span>

          <h1>Profil dan Hasil Belajar</h1>

          <p>
            Lihat informasi akun dan hasil Pretest selama
            mengikuti pembelajaran PAPASCI.
          </p>
        </div>

        {/* =================================================
            PROFILE + SUMMARY
        ================================================= */}

        <Row className="g-4 profil-top-grid">
          {/* ===============================================
              PROFILE CARD
          =============================================== */}

          <Col lg={4}>
            <div className="profile-card">
              <div className="profile-card-top">
                <div className="profile-avatar">
                  <FaUserGraduate />
                </div>

                <div className="profile-introduction">
                  <span>MAHASISWA PAPASCI</span>
                  <h2>{mahasiswa.nama}</h2>
                  <p>{mahasiswa.programStudi}</p>
                </div>
              </div>

              <div className="profile-information">
                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <FaIdCard />
                  </div>

                  <div>
                    <span>Nomor Induk Mahasiswa</span>
                    <strong>{mahasiswa.nim}</strong>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <FaGraduationCap />
                  </div>

                  <div>
                    <span>Program Studi</span>
                    <strong>{mahasiswa.programStudi}</strong>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* ===============================================
              PRETEST SUMMARY
          =============================================== */}

          <Col lg={8}>
            <div className="learning-score-card">
              <div className="score-card-header">
                <div>
                  <span className="score-label">
                    RINGKASAN AKADEMIK
                  </span>

                  <h2>Nilai Pretest</h2>
                </div>

                <div className="score-header-icon">
                  <FaChartLine />
                </div>
              </div>

              {loading ? (
                <div className="profil-loading">
                  Memuat ringkasan nilai Pretest...
                </div>
              ) : error ? (
                <div className="profil-error">
                  {error}
                </div>
              ) : (
                <>
                  <div className="score-summary-grid">
                    <div className="score-summary-item">
                      <div className="summary-icon pretest">
                        <FaBookOpen />
                      </div>

                      <div className="summary-content">
                        <span>Rata-rata Pretest</span>

                        <strong>
                          {ringkasanPretest.rataRata === null
                            ? "—"
                            : ringkasanPretest.rataRata.toFixed(1)}
                        </strong>

                        <small>
                          Dari seluruh Pretest yang selesai
                        </small>
                      </div>
                    </div>

                    <div className="score-summary-item">
                      <div className="summary-icon quiz">
                        <FaClipboardCheck />
                      </div>

                      <div className="summary-content">
                        <span>Pretest Dikerjakan</span>

                        <strong>
                          {ringkasanPretest.jumlah}
                        </strong>

                        <small>
                          Total hasil Pretest
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="average-score">
                    <div className="average-left">
                      <div className="average-icon">
                        <FaGraduationCap />
                      </div>

                      <div>
                        <span>RATA-RATA NILAI PRETEST</span>
                        <strong>
                          Berdasarkan hasil yang tersimpan
                        </strong>
                      </div>
                    </div>

                    <div className="average-value">
                      {ringkasanPretest.rataRata === null
                        ? "—"
                        : ringkasanPretest.rataRata.toFixed(1)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>

        {/* =================================================
            PRETEST HISTORY
        ================================================= */}

        <section className="assessment-history">
          <div className="history-header">
            <div>
              <span className="score-label">
                DETAIL HASIL BELAJAR
              </span>

              <h2>Riwayat Nilai Pretest</h2>

              <p>
                Daftar hasil Pretest yang sudah dikerjakan.
              </p>
            </div>

            <div className="history-total">
              <FaClipboardCheck />
              <span>
                {pretestResults.length} hasil
              </span>
            </div>
          </div>

          {/* ===============================================
              LOADING / ERROR / EMPTY / TABLE
          =============================================== */}

          {loading ? (
            <div className="history-state">
              Memuat riwayat Pretest...
            </div>
          ) : error ? (
            <div className="history-state error">
              Riwayat Pretest tidak dapat dimuat.
            </div>
          ) : pretestResults.length === 0 ? (
            <div className="history-empty">
              <FaBookOpen />
              <strong>Belum ada hasil Pretest</strong>
              <p>
                Hasil Pretest akan muncul di sini setelah kamu
                menyelesaikan Pretest.
              </p>
            </div>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Pretest</th>
                    <th>Module</th>
                    <th>Nilai</th>
                    <th>Jawaban Benar</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>

                <tbody>
                  {pretestResults.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="history-activity">
                          <div className="history-activity-icon pretest">
                            <FaBookOpen />
                          </div>

                          <strong>
                            {item.pretests?.title ||
                              "Pretest"}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <span className="module-label-cell">
                          <FaLayerGroup />
                          {item.pretests?.module_id
                            ? "Module"
                            : "-"}
                        </span>
                      </td>

                      <td>
                        <strong className="history-score">
                          {item.score}
                        </strong>
                      </td>

                      <td>
                        <span className="correct-answer-count">
                          {item.correct_count}/
                          {item.total_questions}
                        </span>
                      </td>

                      <td>
                        <span className="history-date">
                          <FaCalendarAlt />
                          {formatTanggal(item.submitted_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =================================================
            NOTE
        ================================================= */}

        <div className="profile-note">
          <div className="profile-note-icon">
            <FaInfoCircle />
          </div>

          <div>
            <strong>Informasi Nilai</strong>

            <p>
              Data nilai Pretest ditampilkan berdasarkan hasil
              yang tersimpan di sistem PAPASCI. Nilai Quiz dan
              Tugas akan ditambahkan setelah fitur penilaiannya
              selesai dibuat.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Profil;