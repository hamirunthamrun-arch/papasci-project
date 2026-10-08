import { useEffect, useState, useCallback } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import {
  FaClipboardCheck,
  FaVideo,
  FaPaperPlane,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaClock,
  FaStar,
  FaExclamationCircle,
  FaSyncAlt,
} from "react-icons/fa";

import { getPedagogicCompetencies } from "../service/pedagogicCompetencyService";

import {
  getPedagogicScores,
  createPedagogicScore,
} from "../service/pedagogicScoreService";

import "../css/KompetensiPedagogik.css";

function KompetensiPedagogik() {
  // =====================================================
  // STATE KOMPETENSI
  // =====================================================

  const [kompetensiData, setKompetensiData] = useState([]);
  const [loadingKompetensi, setLoadingKompetensi] = useState(true);
  const [kompetensiError, setKompetensiError] = useState("");

  // =====================================================
  // STATE VIDEO / NILAI
  // =====================================================

  const [videoUrl, setVideoUrl] = useState("");
  const [scoreData, setScoreData] = useState(null);

  const [loadingScore, setLoadingScore] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // AMBIL DATA KOMPETENSI
  // =====================================================

  const loadKompetensi = useCallback(async () => {
    try {
      setLoadingKompetensi(true);
      setKompetensiError("");

      const data = await getPedagogicCompetencies();

      setKompetensiData(data || []);
    } catch (error) {
      console.error("Gagal mengambil data kompetensi:", error);

      setKompetensiError(
        error.message || "Gagal mengambil data kompetensi pedagogik.",
      );
    } finally {
      setLoadingKompetensi(false);
    }
  }, []);

  // =====================================================
  // AMBIL DATA VIDEO / NILAI MAHASISWA
  // =====================================================

  const loadScore = useCallback(async () => {
    try {
      setLoadingScore(true);
      setSubmitError("");

      const data = await getPedagogicScores();

      // Backend student mengembalikan array
      let studentScore = null;

      if (Array.isArray(data)) {
        studentScore = data.length > 0 ? data[0] : null;
      } else {
        studentScore = data;
      }

      setScoreData(studentScore);

      // Jika sudah pernah mengirim video,
      // tampilkan link dari database
      if (studentScore?.vidio_url) {
        setVideoUrl(studentScore.vidio_url);
      }
    } catch (error) {
      console.error("Gagal mengambil data video:", error);

      setSubmitError(
        error.message || "Gagal mengambil data pengumpulan video.",
      );
    } finally {
      setLoadingScore(false);
    }
  }, []);

  // =====================================================
  // LOAD DATA SAAT HALAMAN DIBUKA
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadKompetensi();
      loadScore();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadKompetensi, loadScore]);

  // =====================================================
  // SUBMIT / PERBARUI VIDEO
  // =====================================================

  const handleSubmitVideo = async (e) => {
    e.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    const trimmedUrl = videoUrl.trim();

    // ===================================================
    // VALIDASI KOSONG
    // ===================================================

    if (!trimmedUrl) {
      setSubmitError("Silakan masukkan link video terlebih dahulu.");
      return;
    }

    // ===================================================
    // VALIDASI URL
    // ===================================================

    try {
      new URL(trimmedUrl);
    } catch {
      setSubmitError(
        "Link video tidak valid. Pastikan menggunakan URL yang benar.",
      );
      return;
    }

    // ===================================================
    // SIMPAN KONDISI SEBELUM SUBMIT
    // ===================================================

    const isResubmission =
      scoreData?.status === "dinilai" ||
      (scoreData?.nilai !== null && scoreData?.nilai !== undefined);

    try {
      setSubmitting(true);

      // =================================================
      // KIRIM KE BACKEND
      // student_id TIDAK DIKIRIM
      // backend mengambil ID dari user login
      // =================================================

      await createPedagogicScore({
        vidio_url: trimmedUrl,
      });

      // =================================================
      // AMBIL ULANG DATA DARI DATABASE
      // =================================================

      await loadScore();

      // =================================================
      // PESAN BERDASARKAN KONDISI SEBELUM SUBMIT
      // =================================================

      if (isResubmission) {
        setSuccessMessage(
          "Video berhasil diperbarui. Video baru akan dinilai ulang oleh dosen.",
        );
      } else {
        setSuccessMessage("Link video berhasil dikirim.");
      }
    } catch (error) {
      console.error("Gagal mengirim video:", error);

      setSubmitError(error.message || "Gagal mengirim link video.");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // STATUS VIDEO
  // =====================================================

  const status = scoreData?.status;

  const isDinilai = status === "dinilai";

  const isPerluDinilaiUlang = status === "perlu_dinilai_ulang";

  const isDikumpulkan = status === "dikumpulkan";

  // =====================================================
  // LABEL TOMBOL
  // =====================================================

  const submitButtonLabel = scoreData
    ? isDinilai
      ? "Perbarui Video"
      : "Kirim Video Baru"
    : "Kirim Video";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="pedagogik-page">
      <Container fluid className="pedagogik-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="pedagogik-header">
          <div className="pedagogik-header-content">
            <span className="pedagogik-label">KOMPETENSI PEDAGOGIK</span>

            <h1>5 Cakupan Kompetensi Pedagogik</h1>

            <p>
              Pelajari setiap cakupan kompetensi pedagogik sebagai dasar dalam
              mengembangkan kemampuan mengajar dan melaksanakan pembelajaran
              IPA.
            </p>
          </div>
        </div>

        {/* =================================================
            ERROR KOMPETENSI
        ================================================= */}

        {kompetensiError && (
          <Alert variant="danger" className="pedagogik-alert">
            <FaExclamationCircle />

            <span>{kompetensiError}</span>
          </Alert>
        )}

        {/* =================================================
            TABLE KOMPETENSI
        ================================================= */}

        <div className="competency-section">
          {loadingKompetensi ? (
            <div className="pedagogik-loading">
              <Spinner animation="border" />

              <p>Memuat data kompetensi...</p>
            </div>
          ) : kompetensiData.length === 0 ? (
            <div className="empty-competency">
              <FaClipboardCheck />

              <h3>Belum ada kompetensi</h3>

              <p>Data kompetensi pedagogik belum tersedia.</p>
            </div>
          ) : (
            <div className="competency-table-wrapper">
              <div className="competency-table">
                {/* HEADER */}

                <div className="competency-table-head">
                  <div className="col-no">NO</div>

                  <div className="col-cakupan">CAKUPAN & PEMAHAMAN</div>

                  <div className="col-indikator">
                    INDIKATOR YANG BISA DIUKUR
                  </div>

                  <div className="col-bukti">BUKTI FISIK</div>

                  <div className="col-teknik">TEKNIK UKUR</div>
                </div>

                {/* BODY */}

                {kompetensiData.map((item) => (
                  <div className="competency-row" key={item.id}>
                    {/* NOMOR */}

                    <div className="col-no">
                      <span className="competency-number">
                        {String(item.nomor).padStart(2, "0")}
                      </span>
                    </div>

                    {/* CAKUPAN */}

                    <div className="col-cakupan">
                      <h3>{item.title}</h3>

                      <p className="understanding">
                        <strong>Pemahaman:</strong> {item.pemahaman || "-"}
                      </p>
                    </div>

                    {/* INDIKATOR */}

                    <div className="col-indikator">
                      <p>{item.indicator || "-"}</p>
                    </div>

                    {/* BUKTI */}

                    <div className="col-bukti">
                      <p>{item.bukti || "-"}</p>
                    </div>

                    {/* TEKNIK */}

                    <div className="col-teknik">
                      <span className="technique-badge">
                        {item.teknik || "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            MOBILE INFO
        ================================================= */}

        <div className="mobile-table-info">
          <div className="mobile-score-icon">
            <FaClipboardCheck />
          </div>

          <div>
            <strong>Informasi Kompetensi</strong>

            <p>
              Geser tabel ke kiri atau kanan untuk melihat seluruh informasi
              kompetensi.
            </p>
          </div>
        </div>

        {/* =================================================
            PENGUMPULAN VIDEO
        ================================================= */}

        <div className="video-submission-section">
          <div className="section-heading">
            <div className="section-heading-icon video-icon">
              <FaVideo />
            </div>

            <h2>Kumpulkan Video Mengajar</h2>
          </div>

          <div className="video-submission-card">
            <div className="submission-description">
              <div className="submission-icon">
                <FaVideo />
              </div>

              <div>
                <h3>Kirim Link Video Mengajar</h3>

                <p>
                  Masukkan link video mengajar yang sudah kamu upload, misalnya
                  melalui YouTube atau platform video lainnya.
                </p>
              </div>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmitVideo} className="video-form">
              <div className="video-input-label">
                <label htmlFor="videoUrl">Link Video</label>
              </div>

              <div className="video-input-group">
                <input
                  id="videoUrl"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={submitting}
                />

                <button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      {isDinilai ? <FaSyncAlt /> : <FaPaperPlane />}

                      {submitButtonLabel}
                    </>
                  )}
                </button>
              </div>

              <small>
                Pastikan link video dapat dibuka oleh dosen untuk proses
                penilaian.
              </small>
            </form>

            {/* =================================================
                ERROR
            ================================================= */}

            {submitError && (
              <div className="submission-message error">
                <FaExclamationCircle />

                <span>{submitError}</span>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (
              <div className="submission-message success">
                <FaCheckCircle />

                <span>{successMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            STATUS & NILAI
        ================================================= */}

        {!loadingScore && scoreData && (
          <div className="assessment-result-section">
            <div
              className={`assessment-result-card ${
                isPerluDinilaiUlang ? "result-card-resubmission" : ""
              }`}
            >
              {/* =================================================
                  STATUS
              ================================================= */}

              <div className="result-status">
                <div className="result-status-icon">
                  {isDinilai ? (
                    <FaCheckCircle />
                  ) : isPerluDinilaiUlang ? (
                    <FaSyncAlt />
                  ) : (
                    <FaClock />
                  )}
                </div>

                <div>
                  <span>STATUS PENGUMPULAN</span>

                  <strong
                    className={
                      isDinilai
                        ? "status-dinilai"
                        : isPerluDinilaiUlang
                          ? "status-perlu-dinilai-ulang"
                          : "status-menunggu"
                    }
                  >
                    {isDinilai
                      ? "Sudah Dinilai"
                      : isPerluDinilaiUlang
                        ? "Video Diperbarui"
                        : isDikumpulkan
                          ? "Menunggu Penilaian"
                          : "Menunggu Penilaian"}
                  </strong>

                  {/* PESAN TAMBAHAN */}

                  {isPerluDinilaiUlang && (
                    <small className="resubmission-status-message">
                      Video baru sudah dikirim dan menunggu penilaian ulang dari
                      dosen.
                    </small>
                  )}

                  {isDikumpulkan && (
                    <small className="waiting-status-message">
                      Video sudah dikumpulkan dan sedang menunggu penilaian
                      dosen.
                    </small>
                  )}

                  {isDinilai && (
                    <small className="graded-status-message">
                      Video telah dinilai oleh dosen.
                    </small>
                  )}
                </div>
              </div>

              {/* =================================================
                  VIDEO
              ================================================= */}

              <div className="result-video">
                <span>VIDEO YANG DIKUMPULKAN</span>

                {scoreData.vidio_url ? (
                  <a
                    href={scoreData.vidio_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaVideo />

                    <span>Buka Video</span>

                    <FaExternalLinkAlt />
                  </a>
                ) : (
                  <span>Belum ada video</span>
                )}
              </div>

              {/* =================================================
                  NILAI
              ================================================= */}

              <div className="result-score">
                <span>NILAI</span>

                <div className="score-value">
                  {isPerluDinilaiUlang ? (
                    <>
                      <FaSyncAlt />

                      <strong className="score-pending">Menunggu</strong>
                    </>
                  ) : (
                    <>
                      <FaStar />

                      <strong>
                        {scoreData.nilai !== null &&
                        scoreData.nilai !== undefined
                          ? scoreData.nilai
                          : "-"}
                      </strong>
                    </>
                  )}
                </div>

                {isPerluDinilaiUlang && (
                  <small>
                    Nilai baru akan diberikan setelah dosen menilai video
                    terbaru.
                  </small>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            LOADING SCORE
        ================================================= */}

        {loadingScore && (
          <div className="score-loading">
            <Spinner animation="border" size="sm" />

            <span>Memuat status pengumpulan...</span>
          </div>
        )}
      </Container>
    </div>
  );
}

export default KompetensiPedagogik;
