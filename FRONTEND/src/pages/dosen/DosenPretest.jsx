import { useMemo, useState } from "react";
import {
  FaBookOpen,
  FaEdit,
  FaFileAlt,
  FaPlus,
  FaQuestionCircle,
  FaSave,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "../../css/dosen/DosenPretest.css";

/* =========================================================
   DATA PRETEST
========================================================= */

const initialPretests = [
  {
    id: 1,
    moduleId: 1,
    title: "Pretest Makhluk Hidup",
    description:
      "Mengukur pengetahuan awal mahasiswa mengenai konsep dasar makhluk hidup.",
    questions: 10,
    status: "Publik",
  },
  {
    id: 2,
    moduleId: 2,
    title: "Pretest Gaya dan Gerak",
    description:
      "Mengukur pemahaman awal mahasiswa tentang gaya, gerak, dan perubahan gerak.",
    questions: 10,
    status: "Publik",
  },
  {
    id: 3,
    moduleId: 3,
    title: "Pretest Energi",
    description:
      "Mengukur pengetahuan awal mahasiswa mengenai berbagai bentuk energi.",
    questions: 8,
    status: "Draft",
  },
];

/* =========================================================
   DATA MODULE
========================================================= */

const modules = [
  {
    id: 1,
    title: "Makhluk Hidup",
  },
  {
    id: 2,
    title: "Gaya dan Gerak",
  },
  {
    id: 3,
    title: "Energi",
  },
  {
    id: 4,
    title: "Air dan Perubahannya",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function DosenPretest() {
  const navigate = useNavigate();

  const [pretests, setPretests] = useState(initialPretests);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPretest, setEditingPretest] = useState(null);

  const [formData, setFormData] = useState({
    moduleId: "",
    title: "",
    description: "",
    questions: 10,
    status: "Draft",
  });

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredPretests = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return pretests;
    }

    return pretests.filter((pretest) => {
      const module = modules.find(
        (item) => item.id === pretest.moduleId
      );

      const moduleTitle = module?.title || "";

      return (
        pretest.title.toLowerCase().includes(keyword) ||
        pretest.description.toLowerCase().includes(keyword) ||
        moduleTitle.toLowerCase().includes(keyword)
      );
    });
  }, [pretests, search]);

  /* =======================================================
     TAMBAH PRETEST
  ======================================================= */

  const handleAdd = () => {
    setEditingPretest(null);

    setFormData({
      moduleId: "",
      title: "",
      description: "",
      questions: 10,
      status: "Draft",
    });

    setShowModal(true);
  };

  /* =======================================================
     EDIT PRETEST
  ======================================================= */

  const handleEdit = (pretest) => {
    setEditingPretest(pretest);

    setFormData({
      moduleId: pretest.moduleId,
      title: pretest.title,
      description: pretest.description,
      questions: pretest.questions,
      status: pretest.status,
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
     SIMPAN
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.moduleId) {
      alert("Module wajib dipilih.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Judul pretest wajib diisi.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Deskripsi pretest wajib diisi.");
      return;
    }

    if (!formData.questions || Number(formData.questions) < 1) {
      alert("Jumlah soal minimal 1.");
      return;
    }

    if (editingPretest) {
      setPretests((previous) =>
        previous.map((pretest) =>
          pretest.id === editingPretest.id
            ? {
                ...pretest,
                moduleId: Number(formData.moduleId),
                title: formData.title.trim(),
                description: formData.description.trim(),
                questions: Number(formData.questions),
                status: formData.status,
              }
            : pretest
        )
      );
    } else {
      const newId =
        pretests.length > 0
          ? Math.max(...pretests.map((pretest) => pretest.id)) + 1
          : 1;

      const newPretest = {
        id: newId,
        moduleId: Number(formData.moduleId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        questions: Number(formData.questions),
        status: formData.status,
      };

      setPretests((previous) => [...previous, newPretest]);
    }

    closeModal();
  };

  /* =======================================================
     HAPUS
  ======================================================= */

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus pretest ini?"
    );

    if (!confirmed) {
      return;
    }

    setPretests((previous) =>
      previous.filter((pretest) => pretest.id !== id)
    );
  };

  /* =======================================================
     KELOLA SOAL
  ======================================================= */

  const handleQuestions = (id) => {
    navigate(`/dosen/pretest/${id}/soal`);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setShowModal(false);
    setEditingPretest(null);

    setFormData({
      moduleId: "",
      title: "",
      description: "",
      questions: 10,
      status: "Draft",
    });
  };

  /* =======================================================
     GET MODULE
  ======================================================= */

  const getModuleTitle = (moduleId) => {
    const module = modules.find(
      (item) => item.id === moduleId
    );

    return module?.title || "Module tidak ditemukan";
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dosen-pretest-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dosen-pretest-header">
        <div className="dosen-pretest-header-info">
          <span className="dosen-pretest-eyebrow">
            <FaFileAlt />
            PEMBELAJARAN
          </span>

          <h1>Pretest</h1>

          <p>
            Kelola pretest untuk mengukur pengetahuan awal
            mahasiswa sebelum mempelajari module.
          </p>
        </div>

        <button
          type="button"
          className="dosen-pretest-add-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Tambah Pretest
        </button>
      </div>

      {/* =====================================================
          INFO
      ===================================================== */}

      <div className="dosen-pretest-info">
        <div className="dosen-pretest-info-icon">
          <FaQuestionCircle />
        </div>

        <div>
          <strong>Tentang Pretest</strong>

          <p>
            Pretest digunakan untuk mengetahui pengetahuan
            awal mahasiswa sebelum memulai pembelajaran.
            Gambar tidak diperlukan pada data pretest.
            Jika diperlukan, gambar dapat ditambahkan
            secara opsional pada masing-masing soal.
          </p>
        </div>
      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="dosen-pretest-toolbar">
        <div className="dosen-pretest-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari pretest atau module..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="dosen-pretest-total">
          <strong>{filteredPretests.length}</strong>
          <span>Pretest</span>
        </div>
      </div>

      {/* =====================================================
          GRID
      ===================================================== */}

      <div className="dosen-pretest-grid">
        {filteredPretests.length > 0 ? (
          filteredPretests.map((pretest, index) => (
            <article
              className="dosen-pretest-card"
              key={pretest.id}
            >

              {/* CARD HEADER */}

              <div className="dosen-pretest-card-header">
                <div className="dosen-pretest-number">
                  PRETEST{" "}
                  {String(index + 1).padStart(2, "0")}
                </div>

                <span
                  className={`dosen-pretest-status ${
                    pretest.status === "Publik"
                      ? "published"
                      : "draft"
                  }`}
                >
                  {pretest.status}
                </span>
              </div>

              {/* ICON */}

              <div className="dosen-pretest-card-icon">
                <FaFileAlt />
              </div>

              {/* CONTENT */}

              <div className="dosen-pretest-card-content">
                <span className="dosen-pretest-module">
                  <FaBookOpen />
                  {getModuleTitle(pretest.moduleId)}
                </span>

                <h3>{pretest.title}</h3>

                <p>{pretest.description}</p>

                <div className="dosen-pretest-meta">
                  <div>
                    <FaQuestionCircle />

                    <span>
                      {pretest.questions} Soal
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION */}

              <div className="dosen-pretest-card-footer">
                <button
                  type="button"
                  className="dosen-pretest-question-btn"
                  onClick={() =>
                    handleQuestions(pretest.id)
                  }
                >
                  <FaQuestionCircle />
                  Kelola Soal
                </button>

                <div className="dosen-pretest-actions">
                  <button
                    type="button"
                    className="dosen-pretest-edit-btn"
                    onClick={() =>
                      handleEdit(pretest)
                    }
                    title="Edit pretest"
                  >
                    <FaEdit />
                  </button>

                  <button
                    type="button"
                    className="dosen-pretest-delete-btn"
                    onClick={() =>
                      handleDelete(pretest.id)
                    }
                    title="Hapus pretest"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="dosen-pretest-empty">
            <FaFileAlt />

            <h3>Pretest tidak ditemukan</h3>

            <p>
              Tidak ada pretest yang sesuai dengan
              pencarian.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL TAMBAH / EDIT
      ===================================================== */}

      {showModal && (
        <div
          className="dosen-pretest-modal-overlay"
          onMouseDown={closeModal}
        >
          <div
            className="dosen-pretest-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="dosen-pretest-modal-header">
              <div>
                <span>
                  {editingPretest
                    ? "EDIT PRETEST"
                    : "PRETEST BARU"}
                </span>

                <h2>
                  {editingPretest
                    ? "Edit Pretest"
                    : "Tambah Pretest"}
                </h2>
              </div>

              <button
                type="button"
                className="dosen-pretest-modal-close"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* MODULE */}

              <div className="dosen-pretest-field">
                <label htmlFor="moduleId">
                  Module
                </label>

                <select
                  id="moduleId"
                  name="moduleId"
                  value={formData.moduleId}
                  onChange={handleChange}
                >
                  <option value="">
                    Pilih Module
                  </option>

                  {modules.map((module) => (
                    <option
                      key={module.id}
                      value={module.id}
                    >
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* TITLE */}

              <div className="dosen-pretest-field">
                <label htmlFor="title">
                  Judul Pretest
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Contoh: Pretest Makhluk Hidup"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* DESCRIPTION */}

              <div className="dosen-pretest-field">
                <label htmlFor="description">
                  Deskripsi
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Tuliskan deskripsi pretest..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* JUMLAH SOAL */}

              <div className="dosen-pretest-field">
                <label htmlFor="questions">
                  Jumlah Soal
                </label>

                <input
                  id="questions"
                  name="questions"
                  type="number"
                  min="1"
                  value={formData.questions}
                  onChange={handleChange}
                />
              </div>

              {/* STATUS */}

              <div className="dosen-pretest-field">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Publik">
                    Publik
                  </option>

                  <option value="Draft">
                    Draft
                  </option>
                </select>
              </div>

              {/* NOTE */}

              <div className="dosen-pretest-form-note">
                <FaQuestionCircle />

                <p>
                  Pretest tidak menggunakan waktu atau
                  durasi. Gambar dapat ditambahkan secara
                  opsional pada masing-masing soal.
                </p>
              </div>

              {/* ACTION */}

              <div className="dosen-pretest-modal-actions">
                <button
                  type="button"
                  className="dosen-pretest-cancel-btn"
                  onClick={closeModal}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-pretest-save-btn"
                >
                  <FaSave />

                  {editingPretest
                    ? "Simpan Perubahan"
                    : "Simpan Pretest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DosenPretest;