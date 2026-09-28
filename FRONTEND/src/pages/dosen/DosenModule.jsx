import { useMemo, useRef, useState } from "react";
import {
  FaBookOpen,
  FaEdit,
  FaImage,
  FaPlus,
  FaSave,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import "../../css/dosen/DosenModule.css";

const initialModules = [
  {
    id: 1,
    title: "Makhluk Hidup",
    description:
      "Mengenal ciri-ciri, kebutuhan, pertumbuhan, dan perkembangbiakan makhluk hidup.",
    image_url:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=80",
    order: 1,
    status: "Publik",
  },
  {
    id: 2,
    title: "Gaya dan Gerak",
    description:
      "Mempelajari hubungan antara gaya, gerak, dan perubahan gerak benda.",
    image_url:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    order: 2,
    status: "Publik",
  },
  {
    id: 3,
    title: "Energi",
    description:
      "Mengenal berbagai bentuk energi dan perubahan energi dalam kehidupan sehari-hari.",
    image_url:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
    order: 3,
    status: "Draft",
  },
  {
    id: 4,
    title: "Air dan Perubahannya",
    description:
      "Mempelajari sifat air serta perubahan wujud air dalam kehidupan sehari-hari.",
    image_url:
      "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1200&q=80",
    order: 4,
    status: "Publik",
  },
];

function DosenModule() {
  const [modules, setModules] = useState(initialModules);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    order: "",
    status: "Draft",
  });

  const fileInputRef = useRef(null);

  /* =========================================================
     FILTER MODULE
  ========================================================= */

  const filteredModules = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return modules;
    }

    return modules.filter(
      (module) =>
        module.title.toLowerCase().includes(keyword) ||
        module.description.toLowerCase().includes(keyword),
    );
  }, [modules, search]);

  /* =========================================================
     TAMBAH MODULE
  ========================================================= */

  const handleAdd = () => {
    setEditingModule(null);

    setFormData({
      title: "",
      description: "",
      image_url: "",
      order: "",
      status: "Draft",
    });

    setShowModal(true);
  };

  /* =========================================================
     EDIT MODULE
  ========================================================= */

  const handleEdit = (module) => {
    setEditingModule(module);

    setFormData({
      title: module.title,
      description: module.description,
      image_url: module.image_url || "",
      order: module.order,
      status: module.status,
    });

    setShowModal(true);
  };

  /* =========================================================
     INPUT FORM
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     UPLOAD GAMBAR
  ========================================================= */

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

  /* =========================================================
     SIMPAN MODULE
  ========================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Judul module wajib diisi.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Deskripsi module wajib diisi.");
      return;
    }

    if (!formData.order) {
      alert("Urutan module wajib diisi.");
      return;
    }

    /* =======================================================
       EDIT MODULE
    ======================================================= */

    if (editingModule) {
      setModules((previous) =>
        previous.map((module) =>
          module.id === editingModule.id
            ? {
                ...module,
                title: formData.title.trim(),
                description: formData.description.trim(),
                image_url: formData.image_url,
                order: Number(formData.order),
                status: formData.status,
              }
            : module,
        ),
      );
    } else {
      /* =======================================================
       TAMBAH MODULE BARU
    ======================================================= */
      const newModule = {
        id:
          modules.length > 0
            ? Math.max(...modules.map((module) => module.id)) + 1
            : 1,

        title: formData.title.trim(),

        description: formData.description.trim(),

        image_url: formData.image_url,

        order: Number(formData.order),

        status: formData.status,
      };

      setModules((previous) => [...previous, newModule]);
    }

    closeModal();
  };

  /* =========================================================
     HAPUS MODULE
  ========================================================= */

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus module ini?",
    );

    if (!confirmed) return;

    setModules((previous) => previous.filter((module) => module.id !== id));
  };

  /* =========================================================
     KELOLA MATERI
  ========================================================= */

  const handleManageMaterial = (module) => {
    /*
      Untuk sementara kita arahkan ke halaman materi.
      Route DosenMateri akan kita buat pada langkah berikutnya.
    */

    window.location.href = `/dosen/module/${module.id}/materi`;
  };

  /* =========================================================
     TUTUP MODAL
  ========================================================= */

  const closeModal = () => {
    setShowModal(false);

    setEditingModule(null);

    setFormData({
      title: "",
      description: "",
      image_url: "",
      order: "",
      status: "Draft",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="dosen-module-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dosen-module-header">
        <div className="dosen-module-header-info">
          <span className="dosen-module-eyebrow">
            <FaBookOpen />
            PEMBELAJARAN
          </span>

          <h1>Module</h1>

          <p>Kelola module pembelajaran IPA yang akan digunakan mahasiswa.</p>
        </div>

        <button
          type="button"
          className="dosen-module-add-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Tambah Module
        </button>
      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="dosen-module-toolbar">
        <div className="dosen-module-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari module..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="dosen-module-total">
          <strong>{filteredModules.length}</strong>

          <span>Module</span>
        </div>
      </div>

      {/* =====================================================
          MODULE LIST
      ===================================================== */}

      <div className="dosen-module-list">
        {filteredModules.length > 0 ? (
          filteredModules.map((module) => (
            <article className="dosen-module-card" key={module.id}>
              {/* GAMBAR MODULE */}
              <div className="dosen-module-card-image">
                {module.image_url ? (
                  <img src={module.image_url} alt={module.title} />
                ) : (
                  <div className="dosen-module-image-placeholder">
                    <FaImage />
                    <span>Belum ada gambar</span>
                  </div>
                )}

                <span
                  className={`dosen-module-status ${
                    module.status === "Publik" ? "published" : "draft"
                  }`}
                >
                  {module.status}
                </span>

                <div className="dosen-module-number">
                  MODULE {String(module.order).padStart(2, "0")}
                </div>
              </div>

              {/* INFORMASI MODULE */}
              <div className="dosen-module-card-content">
                <h3>{module.title}</h3>

                <p>{module.description}</p>

                {/* AKSI */}
                <div className="dosen-module-card-actions">
                  <button
                    type="button"
                    className="dosen-module-manage-btn"
                    onClick={() => handleManageMaterial(module)}
                  >
                    <FaBookOpen />
                    Kelola Materi
                  </button>

                  <button
                    type="button"
                    className="dosen-module-edit-btn"
                    onClick={() => handleEdit(module)}
                    title="Edit module"
                  >
                    <FaEdit />
                  </button>

                  <button
                    type="button"
                    className="dosen-module-delete-btn"
                    onClick={() => handleDelete(module.id)}
                    title="Hapus module"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="dosen-module-empty">
            <FaBookOpen />
            <h3>Module tidak ditemukan</h3>
            <p>Tidak ada module yang sesuai dengan pencarian.</p>
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL TAMBAH / EDIT MODULE
      ===================================================== */}

      {showModal && (
        <div className="dosen-module-modal-overlay" onMouseDown={closeModal}>
          <div
            className="dosen-module-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="dosen-module-modal-header">
              <div>
                <span>{editingModule ? "EDIT MODULE" : "MODULE BARU"}</span>

                <h2>{editingModule ? "Edit Module" : "Tambah Module"}</h2>
              </div>

              <button
                type="button"
                className="dosen-module-modal-close"
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
                  GAMBAR MODULE
              ================================================= */}

              <div className="dosen-module-field">
                <label>Gambar Module</label>

                <div className="dosen-module-image-upload">
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Gambar module" />
                  ) : (
                    <div className="dosen-module-upload-placeholder">
                      <FaImage />

                      <span>Pilih gambar cover module</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  className="dosen-module-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChange}
                />

                <button
                  type="button"
                  className="dosen-module-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaImage />

                  {formData.image_url ? "Ganti Gambar" : "Pilih Gambar"}
                </button>

                <small>Gunakan JPG, JPEG, PNG, atau WEBP.</small>
              </div>

              {/* =================================================
                  JUDUL
              ================================================= */}

              <div className="dosen-module-field">
                <label htmlFor="title">Judul Module</label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Contoh: Makhluk Hidup"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* =================================================
                  DESKRIPSI
              ================================================= */}

              <div className="dosen-module-field">
                <label htmlFor="description">Deskripsi</label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Tuliskan deskripsi singkat module..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* =================================================
                  ORDER + STATUS
              ================================================= */}

              <div className="dosen-module-form-row">
                <div className="dosen-module-field">
                  <label htmlFor="order">Urutan Module</label>

                  <input
                    id="order"
                    name="order"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.order}
                    onChange={handleChange}
                  />
                </div>

                <div className="dosen-module-field">
                  <label htmlFor="status">Status</label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Draft">Draft</option>

                    <option value="Publik">Publik</option>
                  </select>
                </div>
              </div>

              {/* =================================================
                  MODAL ACTION
              ================================================= */}

              <div className="dosen-module-modal-actions">
                <button
                  type="button"
                  className="dosen-module-cancel-btn"
                  onClick={closeModal}
                >
                  Batal
                </button>

                <button type="submit" className="dosen-module-save-btn">
                  <FaSave />

                  {editingModule ? "Simpan Perubahan" : "Simpan Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenModule;
