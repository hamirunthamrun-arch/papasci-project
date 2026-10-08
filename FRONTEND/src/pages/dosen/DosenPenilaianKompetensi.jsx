import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FaExternalLinkAlt,
  FaStar,
  FaSearch,
  FaTimes,
  FaSave,
  FaUsers,
  FaVideo,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";

import {
  getPedagogicScores,
  updatePedagogicScore,
} from "../../service/pedagogicScoreService";

import "../../css/dosen/DosenPenilaianKompetensi.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const STORAGE_BUCKET = "media-storage";

// ======================================================
// HELPER PUBLIC URL AVATAR
// ======================================================
const getPublicUrl = (path) => {
  if (!path || !SUPABASE_URL) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodedPath}`;
};

// ======================================================
// COMPONENT
// ======================================================
function DosenPenilaianKompetensi() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [nilai, setNilai] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ======================================================
  // LOAD DATA MAHASISWA
  // ======================================================
  const loadMahasiswa = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setPageError("");

      const data = await getPedagogicScores();

      setMahasiswa(data || []);
    } catch (error) {
      console.error("Gagal mengambil data penilaian kompetensi:", error);

      setPageError(
        error.message || "Gagal mengambil data penilaian mahasiswa.",
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // ======================================================
  // LOAD PERTAMA KALI
  // ======================================================
  useEffect(() => {
    loadMahasiswa();
  }, [loadMahasiswa]);

  // ======================================================
  // HANYA MAHASISWA YANG SUDAH MENGUMPULKAN VIDEO
  // ======================================================
  const mahasiswaMengumpulkan = useMemo(() => {
    return mahasiswa.filter((item) => Boolean(item.vidio_url));
  }, [mahasiswa]);

  // ======================================================
  // FILTER SEARCH
  // ======================================================
  const filteredMahasiswa = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return mahasiswaMengumpulkan;
    }

    return mahasiswaMengumpulkan.filter((item) => {
      const nama = item.profiles?.nama_lengkap || "";
      const nim = item.profiles?.nim || "";

      return (
        nama.toLowerCase().includes(keyword) ||
        nim.toLowerCase().includes(keyword)
      );
    });
  }, [mahasiswaMengumpulkan, search]);

  // ======================================================
  // TOTAL MAHASISWA YANG SUDAH MENGUMPULKAN
  // ======================================================
  const totalMahasiswaMengumpulkan = mahasiswaMengumpulkan.length;

  // ======================================================
  // TOTAL VIDEO YANG PERLU DINILAI ULANG
  // ======================================================
  const totalPerluDinilaiUlang = mahasiswaMengumpulkan.filter(
    (item) => item.status === "perlu_dinilai_ulang",
  ).length;

  // ======================================================
  // TOTAL YANG BELUM DINILAI
  // ======================================================
  const totalBelumDinilai = mahasiswaMengumpulkan.filter(
    (item) =>
      item.status === "dikumpulkan" ||
      item.status === "perlu_dinilai_ulang" ||
      item.nilai === null ||
      item.nilai === undefined,
  ).length;

  // ======================================================
  // BUKA MODAL PENILAIAN
  // ======================================================
  const openPenilaian = (item) => {
    setSelectedMahasiswa(item);

    setNilai(item.nilai !== null && item.nilai !== undefined ? item.nilai : "");

    setFormError("");
    setSuccessMessage("");
  };

  // ======================================================
  // TUTUP MODAL
  // ======================================================
  const closePenilaian = () => {
    if (saving) {
      return;
    }

    setSelectedMahasiswa(null);
    setNilai("");
    setFormError("");
  };

  // ======================================================
  // SIMPAN NILAI
  // ======================================================
  const handleSaveNilai = async () => {
    const nilaiNumber = Number(nilai);

    setFormError("");
    setSuccessMessage("");

    if (
      nilai === "" ||
      Number.isNaN(nilaiNumber) ||
      nilaiNumber < 0 ||
      nilaiNumber > 100
    ) {
      setFormError("Nilai harus berada di antara 0 sampai 100.");

      return;
    }

    if (!selectedMahasiswa) {
      return;
    }

    try {
      setSaving(true);

      await updatePedagogicScore(selectedMahasiswa.id, {
        nilai: nilaiNumber,
        status: "dinilai",
      });

      await loadMahasiswa(false);

      setSuccessMessage(
        selectedMahasiswa.status === "perlu_dinilai_ulang"
          ? "Nilai ulang berhasil disimpan."
          : "Nilai berhasil disimpan.",
      );

      setSelectedMahasiswa(null);
      setNilai("");
    } catch (error) {
      console.error("Gagal menyimpan nilai:", error);

      setFormError(error.message || "Gagal menyimpan nilai mahasiswa.");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="penilaian-kompetensi-page">
      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="page-header">
        <div className="page-label">
          <FaUsers />
          <span>KOMPETENSI PEDAGOGIK</span>
        </div>

        <h1>Penilaian Mahasiswa</h1>

        <p>
          Tinjau video mengajar mahasiswa yang telah mengumpulkan tugas dan
          berikan nilai kompetensi pedagogik.
        </p>
      </div>

      {/* ==================================================
          SUCCESS MESSAGE
      ================================================== */}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {/* ==================================================
          ERROR MESSAGE
      ================================================== */}
      {pageError && (
        <div className="alert alert-danger">
          <div>{pageError}</div>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger mt-2"
            onClick={() => loadMahasiswa()}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* ==================================================
          SUMMARY
      ================================================== */}
      <div className="summary-grid">
        {/* Sudah Mengumpulkan */}
        <div className="summary-card">
          <div className="summary-icon summary-icon-blue">
            <FaUsers />
          </div>

          <div className="summary-content">
            <span>Sudah Mengumpulkan</span>

            <strong>{loading ? "..." : totalMahasiswaMengumpulkan}</strong>

            <small>mahasiswa</small>
          </div>
        </div>

        {/* Belum Dinilai */}
        <div className="summary-card">
          <div className="summary-icon summary-icon-yellow">
            <FaStar />
          </div>

          <div className="summary-content">
            <span>Belum Dinilai</span>

            <strong>{loading ? "..." : totalBelumDinilai}</strong>

            <small>dari {totalMahasiswaMengumpulkan} mahasiswa</small>
          </div>
        </div>

        {/* Perlu Dinilai Ulang */}
        <div className="summary-card resubmission-summary-card">
          <div className="summary-icon summary-icon-orange">
            <FaSyncAlt />
          </div>

          <div className="summary-content">
            <span>Perlu Dinilai Ulang</span>

            <strong>{loading ? "..." : totalPerluDinilaiUlang}</strong>

            <small>video diperbarui mahasiswa</small>
          </div>
        </div>
      </div>

      {/* ==================================================
          SEARCH
      ================================================== */}
      <div className="search-box">
        <FaSearch />

        <input
          type="text"
          placeholder="Cari nama atau NIM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            type="button"
            className="clear-search"
            onClick={() => setSearch("")}
            title="Hapus pencarian"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* ==================================================
          LIST MAHASISWA
      ================================================== */}
      <div className="mahasiswa-list">
        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaUsers />
            </div>

            <h3>Memuat data mahasiswa...</h3>

            <p>Sedang mengambil data pengumpulan video dari server.</p>
          </div>
        ) : filteredMahasiswa.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaUsers />
            </div>

            <h3>
              {search
                ? "Mahasiswa tidak ditemukan"
                : "Belum ada mahasiswa yang mengumpulkan"}
            </h3>

            <p>
              {search
                ? `Tidak ada mahasiswa yang sesuai dengan pencarian "${search}".`
                : "Mahasiswa akan muncul di halaman ini setelah mengirimkan link video tugas."}
            </p>

            {search && (
              <button
                type="button"
                className="empty-reset-button"
                onClick={() => setSearch("")}
              >
                Tampilkan Semua
              </button>
            )}
          </div>
        ) : (
          filteredMahasiswa.map((item) => {
            const hasVideo = Boolean(item.vidio_url);

            const hasNilai = item.nilai !== null && item.nilai !== undefined;

            const perluDinilaiUlang = item.status === "perlu_dinilai_ulang";

            const nama = item.profiles?.nama_lengkap || "Nama tidak tersedia";

            const nim = item.profiles?.nim || "-";

            const avatarUrl = getPublicUrl(item.profiles?.avatar_url);

            return (
              <div
                className={`mahasiswa-card ${
                  perluDinilaiUlang ? "mahasiswa-card-resubmission" : ""
                }`}
                key={item.id}
              >
                {/* ========================================
                    DATA MAHASISWA
                ======================================== */}
                <div className="student-section">
                  <div className="student-avatar">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`Foto ${nama}`}
                        className="student-avatar-image"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";

                          const fallback =
                            e.currentTarget.parentElement?.querySelector(
                              ".student-avatar-fallback",
                            );

                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}

                    <div
                      className="student-avatar-fallback"
                      style={{
                        display: avatarUrl ? "none" : "flex",
                      }}
                    >
                      {nama.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="student-info">
                    <h3>{nama}</h3>

                    <span>NIM {nim}</span>
                  </div>
                </div>

                {/* ========================================
                    STATUS PENGUMPULAN
                ======================================== */}
                <div className="submission-status-section">
                  {perluDinilaiUlang ? (
                    <div className="resubmission-notice">
                      <div className="resubmission-icon">
                        <FaSyncAlt />
                      </div>

                      <div className="resubmission-text">
                        <strong>Video Diperbarui</strong>

                        <span>
                          Mahasiswa mengirim video baru. Silakan berikan nilai
                          ulang.
                        </span>
                      </div>
                    </div>
                  ) : item.status === "dikumpulkan" ? (
                    <div className="waiting-notice">
                      <div className="waiting-icon">
                        <FaVideo />
                      </div>

                      <div className="waiting-text">
                        <strong>Menunggu Penilaian</strong>

                        <span>Video sudah dikumpulkan dan belum dinilai.</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* ========================================
                    NILAI
                ======================================== */}
                <div
                  className={`score-section ${
                    hasNilai ? "has-score" : "no-score"
                  }`}
                >
                  <div className="section-label">
                    <FaStar />
                    <span>NILAI</span>
                  </div>

                  {hasNilai ? (
                    <div className="score-display">
                      <strong>{item.nilai}</strong>
                      <span>/ 100</span>
                    </div>
                  ) : perluDinilaiUlang ? (
                    <div className="score-empty score-resubmission">
                      <span>Nilai ulang diperlukan</span>
                    </div>
                  ) : (
                    <div className="score-empty">
                      <span>Belum dinilai</span>
                    </div>
                  )}
                </div>

                {/* ========================================
                    ACTION
                ======================================== */}
                <div className="action-section">
                  {hasVideo ? (
                    <a
                      href={item.vidio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-video"
                      title="Lihat video mengajar"
                    >
                      <FaExternalLinkAlt />
                      <span>Lihat</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn-video disabled"
                      disabled
                    >
                      <FaExternalLinkAlt />
                      <span>Lihat</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className={`btn-nilai ${
                      perluDinilaiUlang ? "btn-nilai-ulang" : ""
                    }`}
                    disabled={!hasVideo}
                    onClick={() => openPenilaian(item)}
                  >
                    {perluDinilaiUlang ? <FaSyncAlt /> : <FaStar />}

                    <span>
                      {perluDinilaiUlang
                        ? "Nilai Ulang"
                        : hasNilai
                          ? "Ubah Nilai"
                          : "Beri Nilai"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ==================================================
          MODAL PENILAIAN
      ================================================== */}
      {selectedMahasiswa && (
        <div className="modal-overlay" onClick={closePenilaian}>
          <div className="penilaian-modal" onClick={(e) => e.stopPropagation()}>
            {/* ============================================
                MODAL HEADER
            ============================================ */}
            <div className="modal-header">
              <div className="modal-student">
                <div className="modal-avatar">
                  {getPublicUrl(selectedMahasiswa.profiles?.avatar_url) ? (
                    <img
                      src={getPublicUrl(selectedMahasiswa.profiles?.avatar_url)}
                      alt={`Foto ${
                        selectedMahasiswa.profiles?.nama_lengkap || "Mahasiswa"
                      }`}
                      className="modal-avatar-image"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";

                        const fallback =
                          e.currentTarget.parentElement?.querySelector(
                            ".modal-avatar-fallback",
                          );

                        if (fallback) {
                          fallback.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className="modal-avatar-fallback"
                    style={{
                      display: getPublicUrl(
                        selectedMahasiswa.profiles?.avatar_url,
                      )
                        ? "none"
                        : "flex",
                    }}
                  >
                    {(selectedMahasiswa.profiles?.nama_lengkap || "M")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                </div>

                <div>
                  <span className="modal-label">PENILAIAN KOMPETENSI</span>

                  <h2>
                    {selectedMahasiswa.profiles?.nama_lengkap ||
                      "Nama tidak tersedia"}
                  </h2>

                  <p>NIM {selectedMahasiswa.profiles?.nim || "-"}</p>
                </div>
              </div>

              <button
                type="button"
                className="btn-close-modal"
                onClick={closePenilaian}
                disabled={saving}
                title="Tutup"
              >
                <FaTimes />
              </button>
            </div>

            {/* ============================================
                MODAL BODY
            ============================================ */}
            <div className="modal-body">
              {/* PEMBERITAHUAN VIDEO BARU */}
              {selectedMahasiswa.status === "perlu_dinilai_ulang" && (
                <div className="modal-resubmission-notice">
                  <div className="modal-resubmission-icon">
                    <FaExclamationCircle />
                  </div>

                  <div>
                    <strong>Video telah diperbarui</strong>

                    <p>
                      Mahasiswa telah mengganti video mengajarnya. Nilai
                      sebelumnya sudah tidak berlaku untuk video ini. Silakan
                      menonton video baru dan memberikan nilai ulang.
                    </p>
                  </div>
                </div>
              )}

              {/* VIDEO */}
              <div className="modal-video-card">
                <div className="modal-video-icon">
                  <FaVideo />
                </div>

                <div className="modal-video-info">
                  <strong>Video Mengajar</strong>

                  <span>
                    Tonton video sebelum menentukan nilai kompetensi pedagogik
                    mahasiswa.
                  </span>
                </div>

                <a
                  href={selectedMahasiswa.vidio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-open-video"
                >
                  <FaExternalLinkAlt />
                  <span>Buka</span>
                </a>
              </div>

              {/* INPUT NILAI */}
              <div className="score-input-card">
                <div className="score-input-header">
                  <div>
                    <span className="score-input-label">
                      NILAI KOMPETENSI PEDAGOGIK
                    </span>

                    <p>
                      Masukkan nilai berdasarkan hasil penilaian video mengajar
                      mahasiswa.
                    </p>
                  </div>

                  <FaStar />
                </div>

                <div className="score-input-main">
                  <input
                    id="nilai"
                    type="number"
                    min="0"
                    max="100"
                    value={nilai}
                    onChange={(e) => setNilai(e.target.value)}
                    placeholder="0"
                    autoFocus
                    disabled={saving}
                  />

                  <div className="score-max">
                    <strong>/ 100</strong>
                    <span>Nilai akhir</span>
                  </div>
                </div>

                <div className="score-range">
                  <span>0</span>

                  <span>Nilai berada pada rentang 0–100</span>

                  <span>100</span>
                </div>

                {formError && (
                  <div className="alert alert-danger mt-3 mb-0">
                    {formError}
                  </div>
                )}
              </div>
            </div>

            {/* ============================================
                MODAL FOOTER
            ============================================ */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={closePenilaian}
                disabled={saving}
              >
                Batal
              </button>

              <button
                type="button"
                className="btn-save-nilai"
                onClick={handleSaveNilai}
                disabled={saving}
              >
                {selectedMahasiswa.status === "perlu_dinilai_ulang" ? (
                  <FaSyncAlt />
                ) : (
                  <FaSave />
                )}

                <span>
                  {saving
                    ? "Menyimpan..."
                    : selectedMahasiswa.status === "perlu_dinilai_ulang"
                      ? "Simpan Nilai Ulang"
                      : "Simpan Nilai"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenPenilaianKompetensi;
