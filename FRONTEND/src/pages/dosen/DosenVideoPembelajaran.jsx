import { useEffect, useMemo, useState } from "react";
import {
  FaChalkboardTeacher,
  FaEdit,
  FaPlus,
  FaSearch,
  FaSave,
  FaTimes,
  FaTrash,
  FaYoutube,
} from "react-icons/fa";

import {
  getVideoPembelajaran,
  createVideoPembelajaran,
  updateVideoPembelajaran,
  deleteVideoPembelajaran,
} from "../../service/videoPembelajaranService";

import "../../css/dosen/DosenVideoPembelajaran.css";

/* =========================================================
   AMBIL YOUTUBE ID
========================================================= */

const getYoutubeId = (url) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v") || "";
      }

      const match = parsedUrl.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/);

      return match ? match[1] : "";
    }

    return "";
  } catch {
    return "";
  }
};

/* =========================================================
   THUMBNAIL YOUTUBE
========================================================= */

const getYoutubeThumbnail = (url) => {
  const youtubeId = getYoutubeId(url);

  if (!youtubeId) {
    return "https://placehold.co/800x450/eaf4ff/1769aa?text=Video+Pembelajaran";
  }

  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
};

/* =========================================================
   VALIDASI URL
========================================================= */

const isValidYoutubeUrl = (url) => {
  return Boolean(getYoutubeId(url));
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenVideoPembelajaran() {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
  });

  /* =======================================================
     AMBIL DATA
  ======================================================= */

  const loadVideos = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      setPageError("");

      const data = await getVideoPembelajaran();

      const formattedVideos = (Array.isArray(data) ? data : []).map(
        (video) => ({
          id: video.id,
          title: video.judul || "",
          description: video.deskripsi || "",
          youtubeUrl: video.link || "",
        }),
      );

      setVideos(formattedVideos);
    } catch (error) {
      setPageError(
        error.message || "Gagal mengambil daftar video pembelajaran.",
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await getVideoPembelajaran();

        if (isMounted) {
          const formattedVideos = (Array.isArray(data) ? data : []).map(
            (video) => ({
              id: video.id,
              title: video.judul || "",
              description: video.deskripsi || "",
              youtubeUrl: video.link || "",
            }),
          );

          setVideos(formattedVideos);
        }
      } catch (error) {
        if (isMounted) {
          setPageError(
            error.message || "Gagal mengambil daftar video pembelajaran.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     FILTER VIDEO
  ======================================================= */

  const filteredVideos = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    if (!keyword) return videos;

    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(keyword) ||
        video.description.toLowerCase().includes(keyword),
    );
  }, [videos, searchTerm]);

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      youtubeUrl: "",
    });

    setEditingVideo(null);
    setFormError("");
  };

  /* =======================================================
     TAMBAH
  ======================================================= */

  const handleAdd = () => {
    resetForm();
    setSuccessMessage("");
    setShowModal(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (video) => {
    setEditingVideo(video);

    setFormData({
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
    });

    setFormError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  /* =======================================================
     INPUT
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     SIMPAN
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();
    const youtubeUrl = formData.youtubeUrl.trim();

    if (!title) {
      setFormError("Judul video harus diisi.");
      return;
    }

    if (!description) {
      setFormError("Deskripsi video harus diisi.");
      return;
    }

    if (!youtubeUrl) {
      setFormError("URL YouTube harus diisi.");
      return;
    }

    if (!isValidYoutubeUrl(youtubeUrl)) {
      setFormError("Masukkan URL YouTube yang valid.");
      return;
    }

    const videoData = {
      judul: title,
      deskripsi: description,
      link: youtubeUrl,
    };

    setSaving(true);
    setFormError("");
    setSuccessMessage("");

    try {
      if (editingVideo) {
        await updateVideoPembelajaran(editingVideo.id, videoData);
        setSuccessMessage("Video berhasil diperbarui.");
      } else {
        await createVideoPembelajaran(videoData);
        setSuccessMessage("Video berhasil ditambahkan.");
      }

      setShowModal(false);
      resetForm();

      await loadVideos();
    } catch (error) {
      setFormError(error.message || "Gagal menyimpan video pembelajaran.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     HAPUS
  ======================================================= */

  const handleDelete = async (id) => {
    const video = videos.find((item) => item.id === id);

    if (!video) return;

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus video "${video.title}"?`,
    );

    if (!confirmed) return;

    setDeletingId(id);
    setPageError("");
    setSuccessMessage("");

    try {
      await deleteVideoPembelajaran(id);

      setSuccessMessage("Video berhasil dihapus.");

      await loadVideos();
    } catch (error) {
      setPageError(error.message || "Gagal menghapus video pembelajaran.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-video-page">
      {/* HEADER */}

      <div className="dosen-video-header">
        <div className="dosen-video-title">
          <div className="dosen-video-title-icon">
            <FaChalkboardTeacher />
          </div>

          <div>
            <h1>Video Pembelajaran</h1>

            <p>Kelola video pembelajaran dan video mengajar untuk mahasiswa.</p>
          </div>
        </div>

        <button
          type="button"
          className="dosen-video-add-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Tambah Video
        </button>
      </div>

      {/* PESAN */}

      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      )}

      {pageError && (
        <div className="alert alert-danger" role="alert">
          {pageError}

          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={() => loadVideos(true)}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* TOOLBAR */}

      <div className="dosen-video-toolbar">
        <div className="dosen-video-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari video pembelajaran..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="dosen-video-search-clear"
              onClick={() => setSearchTerm("")}
              aria-label="Hapus pencarian"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <span className="dosen-video-total">{filteredVideos.length} Video</span>
      </div>

      {/* VIDEO GRID */}

      {loading ? (
        <div className="dosen-video-empty">
          <FaYoutube />
          <h3>Memuat video pembelajaran...</h3>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="dosen-video-empty">
          <FaYoutube />

          <h3>
            {searchTerm
              ? "Video tidak ditemukan"
              : "Belum ada video pembelajaran"}
          </h3>

          <p>
            {searchTerm
              ? "Coba gunakan kata pencarian yang berbeda."
              : "Klik Tambah Video untuk membuat data baru."}
          </p>
        </div>
      ) : (
        <div className="dosen-video-grid">
          {filteredVideos.map((video) => (
            <div className="dosen-video-card" key={video.id}>
              {/* IMAGE */}

              <div className="dosen-video-card-image">
                <img
                  src={getYoutubeThumbnail(video.youtubeUrl)}
                  alt={video.title}
                />

                <div className="dosen-video-youtube-icon">
                  <FaYoutube />
                </div>
              </div>

              {/* CONTENT */}

              <div className="dosen-video-card-content">
                <h3>{video.title}</h3>

                <p>{video.description}</p>

                <div className="dosen-video-url">
                  <FaYoutube />

                  <span title={video.youtubeUrl}>{video.youtubeUrl}</span>
                </div>

                {/* ACTION */}

                <div className="dosen-video-card-actions">
                  <button
                    type="button"
                    className="dosen-video-edit-btn"
                    onClick={() => handleEdit(video)}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="dosen-video-delete-btn"
                    onClick={() => handleDelete(video.id)}
                    disabled={deletingId === video.id}
                  >
                    <FaTrash />
                    {deletingId === video.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TAMBAH / EDIT */}

      {showModal && (
        <div
          className="dosen-video-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="dosen-video-modal">
            {/* HEADER MODAL */}

            <div className="dosen-video-modal-header">
              <div>
                <span>
                  {editingVideo ? "EDIT VIDEO" : "VIDEO PEMBELAJARAN"}
                </span>

                <h2>{editingVideo ? "Edit Video" : "Tambah Video Baru"}</h2>
              </div>

              <button
                type="button"
                className="dosen-video-close-btn"
                onClick={handleCloseModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            {/* FORM */}

            <form className="dosen-video-form" onSubmit={handleSubmit}>
              {formError && (
                <div className="alert alert-danger" role="alert">
                  {formError}
                </div>
              )}

              {/* JUDUL */}

              <div className="dosen-video-form-group">
                <label htmlFor="video-title">
                  Judul Video
                  <span>*</span>
                </label>

                <input
                  id="video-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Mengenal Makhluk Hidup"
                  disabled={saving}
                  required
                />
              </div>

              {/* DESKRIPSI */}

              <div className="dosen-video-form-group">
                <label htmlFor="video-description">
                  Deskripsi
                  <span>*</span>
                </label>

                <textarea
                  id="video-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Masukkan deskripsi video..."
                  rows="4"
                  disabled={saving}
                  required
                />
              </div>

              {/* URL YOUTUBE */}

              <div className="dosen-video-form-group">
                <label htmlFor="video-youtube-url">
                  URL YouTube
                  <span>*</span>
                </label>

                <div className="dosen-video-input-icon">
                  <FaYoutube />

                  <input
                    id="video-youtube-url"
                    type="url"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={saving}
                    required
                  />
                </div>

                <small>
                  Masukkan link video YouTube yang akan ditampilkan kepada
                  mahasiswa.
                </small>
              </div>

              {/* PREVIEW THUMBNAIL */}

              {formData.youtubeUrl && getYoutubeId(formData.youtubeUrl) && (
                <div className="dosen-video-thumbnail-preview">
                  <span>Preview Thumbnail</span>

                  <img
                    src={getYoutubeThumbnail(formData.youtubeUrl)}
                    alt="Preview thumbnail"
                  />
                </div>
              )}

              {/* FOOTER */}

              <div className="dosen-video-modal-footer">
                <button
                  type="button"
                  className="dosen-video-cancel-btn"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  <FaTimes />
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-video-save-btn"
                  disabled={saving}
                >
                  <FaSave />

                  {saving
                    ? "Menyimpan..."
                    : editingVideo
                      ? "Simpan Perubahan"
                      : "Simpan Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenVideoPembelajaran;
