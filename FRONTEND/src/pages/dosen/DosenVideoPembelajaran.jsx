import { useState } from "react";
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

import "../../css/dosen/DosenVideoPembelajaran.css";

/* =========================================================
   DATA DUMMY VIDEO
========================================================= */

const initialVideos = [
  {
    id: 1,
    title: "Mengenal Makhluk Hidup",
    description:
      "Video pembelajaran mengenai pengertian dan ciri-ciri makhluk hidup untuk mahasiswa PGSD.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },

  {
    id: 2,
    title: "Gaya dan Gerak",
    description:
      "Video pembelajaran yang membahas konsep gaya dan gerak serta contoh penerapannya dalam kehidupan sehari-hari.",
    youtubeUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
  },

  {
    id: 3,
    title: "Pembelajaran Energi untuk Anak SD",
    description:
      "Contoh penyampaian materi energi yang dapat digunakan sebagai referensi pembelajaran IPA di sekolah dasar.",
    youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
  },

  {
    id: 4,
    title: "Eksperimen Sederhana Perubahan Wujud Air",
    description:
      "Contoh kegiatan eksperimen sederhana mengenai perubahan wujud air yang dapat diterapkan dalam pembelajaran.",
    youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  },
];

/* =========================================================
   AMBIL YOUTUBE ID
========================================================= */

const getYoutubeId = (url) => {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.replace("/", "");
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v") || "";
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
   COMPONENT
========================================================= */

function DosenVideoPembelajaran() {
  const [videos, setVideos] = useState(initialVideos);

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingVideo, setEditingVideo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
  });

  /* =======================================================
     FILTER VIDEO
  ======================================================= */

  const filteredVideos = videos.filter((video) => {
    const keyword = searchTerm.toLowerCase();

    return (
      video.title.toLowerCase().includes(keyword) ||
      video.description.toLowerCase().includes(keyword)
    );
  });

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
  };

  /* =======================================================
     BUKA TAMBAH
  ======================================================= */

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  /* =======================================================
     BUKA EDIT
  ======================================================= */

  const handleEdit = (video) => {
    setEditingVideo(video);

    setFormData({
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
    });

    setShowModal(true);
  };

  /* =======================================================
     INPUT FORM
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     SIMPAN VIDEO
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.youtubeUrl.trim()
    ) {
      alert("Judul, deskripsi, dan URL YouTube wajib diisi.");
      return;
    }

    const youtubeId = getYoutubeId(formData.youtubeUrl);

    if (!youtubeId) {
      alert("URL YouTube tidak valid.");
      return;
    }

    if (editingVideo) {
      setVideos((previous) =>
        previous.map((video) =>
          video.id === editingVideo.id
            ? {
                ...video,
                ...formData,
              }
            : video,
        ),
      );

      alert("Video berhasil diperbarui.");
    } else {
      const newVideo = {
        id: Date.now(),
        ...formData,
      };

      setVideos((previous) => [
        newVideo,
        ...previous,
      ]);

      alert("Video berhasil ditambahkan.");
    }

    setShowModal(false);
    resetForm();
  };

  /* =======================================================
     HAPUS VIDEO
  ======================================================= */

  const handleDelete = (id) => {
    const video = videos.find(
      (item) => item.id === id,
    );

    if (!video) {
      return;
    }

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus video "${video.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    setVideos((previous) =>
      previous.filter(
        (item) => item.id !== id,
      ),
    );
  };

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-video-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="dosen-video-header">

        <div className="dosen-video-title">

          <div className="dosen-video-title-icon">
            <FaChalkboardTeacher />
          </div>

          <div>

            <h1>Video Pembelajaran</h1>

            <p>
              Kelola video pembelajaran dan video
              mengajar untuk mahasiswa.
            </p>

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

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <div className="dosen-video-toolbar">

        <div className="dosen-video-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Cari video pembelajaran..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
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

        <span className="dosen-video-total">
          {filteredVideos.length} Video
        </span>

      </div>

      {/* ===================================================
          VIDEO GRID
      =================================================== */}

      <div className="dosen-video-grid">

        {filteredVideos.length > 0 ? (

          filteredVideos.map((video) => {

            const thumbnail =
              getYoutubeThumbnail(
                video.youtubeUrl,
              );

            return (
              <div
                className="dosen-video-card"
                key={video.id}
              >

                {/* IMAGE */}

                <div className="dosen-video-card-image">

                  <img
                    src={thumbnail}
                    alt={video.title}
                  />

                  <div className="dosen-video-youtube-icon">
                    <FaYoutube />
                  </div>

                </div>

                {/* CONTENT */}

                <div className="dosen-video-card-content">

                  <h3>{video.title}</h3>

                  <p>
                    {video.description}
                  </p>

                  <div className="dosen-video-url">

                    <FaYoutube />

                    <span>
                      {video.youtubeUrl}
                    </span>

                  </div>

                  {/* ACTION */}

                  <div className="dosen-video-card-actions">

                    <button
                      type="button"
                      className="dosen-video-edit-btn"
                      onClick={() =>
                        handleEdit(video)
                      }
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="dosen-video-delete-btn"
                      onClick={() =>
                        handleDelete(video.id)
                      }
                      aria-label={`Hapus ${video.title}`}
                    >
                      <FaTrash />
                      Hapus
                    </button>

                  </div>

                </div>

              </div>
            );
          })

        ) : (

          <div className="dosen-video-empty">

            <FaYoutube />

            <h3>
              Video tidak ditemukan
            </h3>

            <p>
              Tidak ada video yang sesuai
              dengan pencarian "{searchTerm}".
            </p>

          </div>

        )}

      </div>

      {/* ===================================================
          MODAL TAMBAH / EDIT
      =================================================== */}

      {showModal && (

        <div
          className="dosen-video-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="dosen-video-modal">

            {/* MODAL HEADER */}

            <div className="dosen-video-modal-header">

              <div>

                <span>
                  {editingVideo
                    ? "EDIT VIDEO"
                    : "VIDEO PEMBELAJARAN"}
                </span>

                <h2>
                  {editingVideo
                    ? "Edit Video"
                    : "Tambah Video Baru"}
                </h2>

              </div>

              <button
                type="button"
                className="dosen-video-close-btn"
                onClick={closeModal}
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

            <form
              className="dosen-video-form"
              onSubmit={handleSubmit}
            >

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
                />

              </div>

              {/* YOUTUBE URL */}

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
                  />

                </div>

                <small>
                  Masukkan link video YouTube yang
                  akan ditampilkan kepada mahasiswa.
                </small>

              </div>

              {/* THUMBNAIL PREVIEW */}

              {formData.youtubeUrl &&
                getYoutubeId(
                  formData.youtubeUrl,
                ) && (

                  <div className="dosen-video-thumbnail-preview">

                    <span>
                      Preview Thumbnail
                    </span>

                    <img
                      src={getYoutubeThumbnail(
                        formData.youtubeUrl,
                      )}
                      alt="Preview thumbnail"
                    />

                  </div>

                )}

              {/* FOOTER */}

              <div className="dosen-video-modal-footer">

                <button
                  type="button"
                  className="dosen-video-cancel-btn"
                  onClick={closeModal}
                >
                  <FaTimes />
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-video-save-btn"
                >
                  <FaSave />

                  {editingVideo
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