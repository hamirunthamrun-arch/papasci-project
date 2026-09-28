import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaEdit,
  FaImage,
  FaPlus,
  FaSave,
  FaSearch,
  FaSeedling,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import "../../css/dosen/DosenMateri.css";

/* =========================================================
   DATA MODULE
========================================================= */

const moduleData = {
  1: {
    title: "Makhluk Hidup",
    description:
      "Mengenal ciri-ciri, kebutuhan, pertumbuhan, dan perkembangbiakan makhluk hidup.",
  },

  2: {
    title: "Gaya dan Gerak",
    description:
      "Mempelajari hubungan antara gaya, gerak, dan perubahan gerak benda.",
  },

  3: {
    title: "Energi",
    description:
      "Mengenal berbagai bentuk energi dan perubahan energi dalam kehidupan sehari-hari.",
  },

  4: {
    title: "Air dan Perubahannya",
    description:
      "Mempelajari sifat air serta perubahan wujud air dalam kehidupan sehari-hari.",
  },
};

/* =========================================================
   DATA DUMMY MATERI
========================================================= */

const initialMateri = [
  {
    id: 1,
    module_id: 1,
    title: "Apa Itu Makhluk Hidup?",
    subtitle: "Mari mengenal dunia makhluk hidup",
    image_url:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=80",
    content:
      "Pernahkah kamu melihat kucing bermain, burung terbang, atau tanaman tumbuh di halaman rumah? Kucing, burung, dan tanaman merupakan contoh makhluk hidup. Makhluk hidup adalah sesuatu yang memiliki ciri-ciri kehidupan. Makhluk hidup dapat tumbuh, bernapas, membutuhkan makanan, bergerak, berkembang biak, dan melakukan berbagai aktivitas lainnya.",
    order: 1,
  },

  {
    id: 2,
    module_id: 1,
    title: "Ciri-Ciri Makhluk Hidup",
    subtitle: "Apa yang membuat sesuatu disebut hidup?",
    image_url:
      "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80",
    content:
      "Setiap makhluk hidup memiliki beberapa ciri yang membedakannya dari benda mati. Beberapa ciri makhluk hidup antara lain bernapas, membutuhkan makanan dan air, dapat bergerak, dapat tumbuh, dapat berkembang biak, dan peka terhadap rangsangan. Walaupun bentuk manusia, hewan, dan tumbuhan berbeda, semuanya memiliki ciri-ciri kehidupan.",
    order: 2,
  },

  {
    id: 3,
    module_id: 1,
    title: "Kebutuhan Makhluk Hidup",
    subtitle: "Apa saja yang dibutuhkan makhluk hidup?",
    image_url:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
    content:
      "Agar dapat hidup dan tumbuh dengan baik, makhluk hidup membutuhkan berbagai hal. Manusia membutuhkan makanan, air, udara, dan tempat tinggal. Hewan juga membutuhkan makanan, air, dan udara. Tumbuhan membutuhkan air, udara, cahaya matahari, dan unsur hara dari tanah.",
    order: 3,
  },

  {
    id: 4,
    module_id: 1,
    title: "Pertumbuhan Makhluk Hidup",
    subtitle: "Makhluk hidup dapat tumbuh",
    image_url:
      "https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1200&q=80",
    content:
      "Salah satu ciri makhluk hidup adalah dapat mengalami pertumbuhan. Pertumbuhan adalah proses bertambahnya ukuran, tinggi, berat, atau bagian tubuh makhluk hidup. Contohnya, manusia yang awalnya bayi akan tumbuh menjadi anak-anak kemudian menjadi orang dewasa. Tumbuhan juga mengalami pertumbuhan. Biji dapat tumbuh menjadi tanaman kecil dan kemudian menjadi tanaman yang lebih besar.",
    order: 4,
  },

  {
    id: 5,
    module_id: 1,
    title: "Perkembangbiakan",
    subtitle:
      "Bagaimana makhluk hidup menghasilkan keturunan?",
    image_url:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
    content:
      "Makhluk hidup juga dapat berkembang biak. Berkembang biak berarti menghasilkan keturunan baru. Dengan berkembang biak, jumlah makhluk hidup dapat terus bertambah. Contohnya, ayam menghasilkan telur yang kemudian dapat menetas menjadi anak ayam. Tumbuhan juga dapat berkembang biak melalui biji, tunas, atau bagian tubuh tertentu.",
    order: 5,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function DosenMateri() {
  const { moduleId } = useParams();

  const currentModuleId = Number(moduleId) || 1;

  const currentModule =
    moduleData[currentModuleId] || moduleData[1];

  /* =======================================================
     STATE
  ======================================================= */

  const [materi, setMateri] = useState(
    initialMateri.filter(
      (item) => item.module_id === currentModuleId,
    ),
  );

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingMateri, setEditingMateri] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    content: "",
    order: "",
  });

  /* =======================================================
     FILTER MATERI
  ======================================================= */

  const filteredMateri = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    const result = keyword
      ? materi.filter(
          (item) =>
            item.title.toLowerCase().includes(keyword) ||
            item.subtitle.toLowerCase().includes(keyword) ||
            item.content.toLowerCase().includes(keyword),
        )
      : [...materi];

    return result.sort((a, b) => a.order - b.order);
  }, [materi, search]);

  /* =======================================================
     TAMBAH MATERI
  ======================================================= */

  const handleAdd = () => {
    setEditingMateri(null);

    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      content: "",
      order:
        materi.length > 0
          ? Math.max(...materi.map((item) => item.order)) + 1
          : 1,
    });

    setShowModal(true);
  };

  /* =======================================================
     EDIT MATERI
  ======================================================= */

  const handleEdit = (item) => {
    setEditingMateri(item);

    setFormData({
      title: item.title,
      subtitle: item.subtitle,
      image_url: item.image_url || "",
      content: item.content,
      order: item.order,
    });

    setShowModal(true);
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     IMAGE CHANGE
  ======================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File yang dipilih harus berupa gambar.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setFormData((previous) => ({
      ...previous,
      image_url: imageUrl,
    }));
  };

  /* =======================================================
     SIMPAN MATERI
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Judul materi wajib diisi.");
      return;
    }

    if (!formData.subtitle.trim()) {
      alert("Subjudul materi wajib diisi.");
      return;
    }

    if (!formData.content.trim()) {
      alert("Isi materi wajib diisi.");
      return;
    }

    if (!formData.order) {
      alert("Urutan materi wajib diisi.");
      return;
    }

    if (editingMateri) {
      setMateri((previous) =>
        previous.map((item) =>
          item.id === editingMateri.id
            ? {
                ...item,
                title: formData.title.trim(),
                subtitle: formData.subtitle.trim(),
                image_url: formData.image_url,
                content: formData.content.trim(),
                order: Number(formData.order),
              }
            : item,
        ),
      );
    } else {
      const newMateri = {
        id:
          materi.length > 0
            ? Math.max(...materi.map((item) => item.id)) + 1
            : 1,

        module_id: currentModuleId,

        title: formData.title.trim(),

        subtitle: formData.subtitle.trim(),

        image_url: formData.image_url,

        content: formData.content.trim(),

        order: Number(formData.order),
      };

      setMateri((previous) => [
        ...previous,
        newMateri,
      ]);
    }

    closeModal();
  };

  /* =======================================================
     HAPUS MATERI
  ======================================================= */

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus materi ini?",
    );

    if (!confirmed) return;

    setMateri((previous) =>
      previous.filter((item) => item.id !== id),
    );
  };

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const closeModal = () => {
    setShowModal(false);

    setEditingMateri(null);

    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      content: "",
      order: "",
    });
  };

  /* =======================================================
     KEMBALI
  ======================================================= */

  const handleBack = () => {
    window.location.href = "/dosen/module";
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-materi-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dosen-materi-header">
        <div className="dosen-materi-header-info">
          <button
            type="button"
            className="dosen-materi-back-btn"
            onClick={handleBack}
          >
            <FaArrowLeft />
            Kembali ke Module
          </button>

          <span className="dosen-materi-eyebrow">
            <FaBookOpen />

            MODULE{" "}
            {String(currentModuleId).padStart(2, "0")}{" "}
            • {currentModule.title.toUpperCase()}
          </span>

          <h1>Materi Pembelajaran</h1>

          <p>
            Kelola materi pembelajaran yang akan dipelajari
            mahasiswa pada module ini.
          </p>
        </div>

        <button
          type="button"
          className="dosen-materi-add-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Tambah Materi
        </button>
      </div>

      {/* =====================================================
          MODULE INFO
      ===================================================== */}

      <div className="dosen-materi-module-info">
        <div className="dosen-materi-module-icon">
          <FaSeedling />
        </div>

        <div className="dosen-materi-module-detail">
          <span>
            MODULE{" "}
            {String(currentModuleId).padStart(2, "0")}
          </span>

          <h2>{currentModule.title}</h2>

          <p>{currentModule.description}</p>
        </div>

        <div className="dosen-materi-module-total">
          <strong>{materi.length}</strong>
          <span>Materi</span>
        </div>
      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="dosen-materi-toolbar">
        <div className="dosen-materi-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari materi..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="dosen-materi-order-info">
          Materi ditampilkan berdasarkan urutan pembelajaran
        </div>
      </div>

      {/* =====================================================
          MATERI LIST
      ===================================================== */}

      <div className="dosen-materi-list">
        {filteredMateri.length > 0 ? (
          filteredMateri.map((item) => (
            <article
              className="dosen-materi-card"
              key={item.id}
            >
              {/* =================================================
                  IMAGE
              ================================================= */}

              <div className="dosen-materi-card-image">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                  />
                ) : (
                  <div className="dosen-materi-image-placeholder">
                    <FaImage />

                    <span>
                      Belum ada gambar
                    </span>
                  </div>
                )}

                <span className="dosen-materi-number">
                  MATERI{" "}
                  {String(item.order).padStart(2, "0")}
                </span>
              </div>

              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="dosen-materi-card-content">
                <h3>{item.title}</h3>

                <p className="dosen-materi-subtitle">
                  {item.subtitle}
                </p>

                <p className="dosen-materi-description">
                  {item.content}
                </p>

                {/* =================================================
                    ACTION
                ================================================= */}

                <div className="dosen-materi-card-footer">
                  <button
                    type="button"
                    className="dosen-materi-edit-btn"
                    onClick={() =>
                      handleEdit(item)
                    }
                  >
                    <FaEdit />
                    Edit Materi
                  </button>

                  <button
                    type="button"
                    className="dosen-materi-delete-btn"
                    onClick={() =>
                      handleDelete(item.id)
                    }
                    title="Hapus materi"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="dosen-materi-empty">
            <FaBookOpen />

            <h3>
              {search
                ? "Materi tidak ditemukan"
                : "Belum ada materi"}
            </h3>

            <p>
              {search
                ? "Tidak ada materi yang sesuai dengan pencarian."
                : "Tambahkan materi pertama untuk module ini."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={handleAdd}
              >
                <FaPlus />
                Tambah Materi
              </button>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="dosen-materi-modal-overlay"
          onMouseDown={closeModal}
        >
          <div
            className="dosen-materi-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="dosen-materi-modal-header">
              <div>
                <span>
                  {editingMateri
                    ? "EDIT MATERI"
                    : "MATERI BARU"}
                </span>

                <h2>
                  {editingMateri
                    ? "Edit Materi"
                    : "Tambah Materi"}
                </h2>
              </div>

              <button
                type="button"
                className="dosen-materi-modal-close"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>
              {/* =================================================
                  GAMBAR
              ================================================= */}

              <div className="dosen-materi-field">
                <label>Gambar Materi</label>

                <div className="dosen-materi-image-upload">
                  {formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="Preview materi"
                    />
                  ) : (
                    <div className="dosen-materi-upload-placeholder">
                      <FaImage />

                      <span>
                        Pilih gambar untuk materi
                      </span>
                    </div>
                  )}
                </div>

                <input
                  className="dosen-materi-file-input"
                  id="materi-image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChange}
                />

                <label
                  htmlFor="materi-image"
                  className="dosen-materi-upload-btn"
                >
                  <FaImage />

                  {formData.image_url
                    ? "Ganti Gambar"
                    : "Pilih Gambar"}
                </label>

                <small>
                  Gunakan JPG, JPEG, PNG, atau WEBP.
                </small>
              </div>

              {/* =================================================
                  JUDUL
              ================================================= */}

              <div className="dosen-materi-field">
                <label htmlFor="materi-title">
                  Judul Materi
                </label>

                <input
                  id="materi-title"
                  name="title"
                  type="text"
                  placeholder="Contoh: Apa Itu Makhluk Hidup?"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* =================================================
                  SUBJUDUL
              ================================================= */}

              <div className="dosen-materi-field">
                <label htmlFor="materi-subtitle">
                  Subjudul
                </label>

                <input
                  id="materi-subtitle"
                  name="subtitle"
                  type="text"
                  placeholder="Contoh: Mari mengenal dunia makhluk hidup"
                  value={formData.subtitle}
                  onChange={handleChange}
                />
              </div>

              {/* =================================================
                  ISI MATERI
              ================================================= */}

              <div className="dosen-materi-field">
                <label htmlFor="materi-content">
                  Isi Materi
                </label>

                <textarea
                  id="materi-content"
                  name="content"
                  rows="9"
                  placeholder="Tuliskan isi materi pembelajaran..."
                  value={formData.content}
                  onChange={handleChange}
                />

                <small>
                  Tuliskan materi pembelajaran secara lengkap
                  dan mudah dipahami mahasiswa.
                </small>
              </div>

              {/* =================================================
                  URUTAN
              ================================================= */}

              <div className="dosen-materi-field">
                <label htmlFor="materi-order">
                  Urutan Materi
                </label>

                <input
                  id="materi-order"
                  name="order"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.order}
                  onChange={handleChange}
                />

                <small>
                  Urutan menentukan posisi materi saat
                  dipelajari mahasiswa.
                </small>
              </div>

              {/* =================================================
                  ACTION
              ================================================= */}

              <div className="dosen-materi-modal-actions">
                <button
                  type="button"
                  className="dosen-materi-cancel-btn"
                  onClick={closeModal}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-materi-save-btn"
                >
                  <FaSave />

                  {editingMateri
                    ? "Simpan Perubahan"
                    : "Simpan Materi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenMateri;