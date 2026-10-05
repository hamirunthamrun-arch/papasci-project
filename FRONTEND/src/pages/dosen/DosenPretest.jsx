
import { useCallback, useEffect, useState } from "react";
import {
  FaBookOpen,
  FaEdit,
  FaFileAlt,
  FaPlus,
  FaQuestionCircle,
  FaSave,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import {
  getPretests,
  createPretest,
  updatePretest,
  deletePretest,
} from "../../service/pretestService";
import { getModules } from "../../service/moduleService";
import "../../css/dosen/DosenPretest.css";

const initialForm = {
  module_id: "",
  title: "",
  description: "",
  question_count: 10,
  status: "draf",
};

function DosenPretest() {
  const navigate = useNavigate();

  const [pretests, setPretests] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPretest, setEditingPretest] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  /* =========================================================
     MEMUAT ULANG DATA
  ========================================================= */

  const loadData = useCallback(async () => {
    try {
      setError("");

      const [pretestData, moduleData] = await Promise.all([
        getPretests(),
        getModules(),
      ]);

      setPretests(Array.isArray(pretestData) ? pretestData : []);
      setModules(Array.isArray(moduleData) ? moduleData : []);
    } catch (err) {
      console.error("Gagal memuat data:", err);
      setError(err.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     PEMUATAN AWAL
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [pretestData, moduleData] = await Promise.all([
          getPretests(),
          getModules(),
        ]);

        if (!isMounted) return;

        setPretests(Array.isArray(pretestData) ? pretestData : []);
        setModules(Array.isArray(moduleData) ? moduleData : []);
        setError("");
      } catch (err) {
        if (!isMounted) return;

        console.error("Gagal memuat data:", err);
        setError(err.message || "Gagal memuat data.");
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

  /* =========================================================
     CEK APAKAH MODUL SUDAH MEMILIKI PRETEST
  ========================================================= */

  const moduleHasPretest = (moduleId) => {
    return pretests.some(
      (pretest) =>
        String(pretest.module_id) === String(moduleId) &&
        pretest.id !== editingPretest?.id
    );
  };

  /* =========================================================
     TAMBAH PRETEST
  ========================================================= */

  const handleAdd = () => {
    setEditingPretest(null);
    setFormData({ ...initialForm });
    setShowModal(true);
  };

  /* =========================================================
     EDIT PRETEST
  ========================================================= */

  const handleEdit = (pretest) => {
    setEditingPretest(pretest);

    setFormData({
      module_id: pretest.module_id || "",
      title: pretest.title || "",
      description: pretest.description || "",
      question_count: pretest.question_count || 10,
      status: pretest.status || "draf",
    });

    setShowModal(true);
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     TUTUP MODAL
  ========================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingPretest(null);
    setFormData({ ...initialForm });
  };

  /* =========================================================
     SIMPAN PRETEST
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.module_id) {
      alert("Module wajib dipilih.");
      return;
    }

    if (moduleHasPretest(formData.module_id)) {
      alert("Module ini sudah memiliki pretest. Satu module hanya boleh memiliki satu pretest.");
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

    if (
      !formData.question_count ||
      Number(formData.question_count) < 1
    ) {
      alert("Jumlah soal minimal 1.");
      return;
    }

    const payload = {
      module_id: formData.module_id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      question_count: Number(formData.question_count),
      status: formData.status,
    };

    try {
      setSaving(true);
      setError("");

      if (editingPretest) {
        await updatePretest(editingPretest.id, payload);
      } else {
        await createPretest(payload);
      }

      await loadData();

      setShowModal(false);
      setEditingPretest(null);
      setFormData({ ...initialForm });
    } catch (err) {
      console.error("Gagal menyimpan pretest:", err);
      alert(err.message || "Gagal menyimpan pretest.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     HAPUS PRETEST
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus pretest ini?"
    );

    if (!confirmed) return;

    try {
      await deletePretest(id);
      await loadData();
    } catch (err) {
      console.error("Gagal menghapus pretest:", err);
      alert(err.message || "Gagal menghapus pretest.");
    }
  };

  /* =========================================================
     KELOLA SOAL
  ========================================================= */

  const handleQuestions = (id) => {
    navigate(`/dosen/pretest/${id}/soal`);
  };

  /* =========================================================
     GET MODULE
  ========================================================= */

  const getModuleTitle = (moduleId) => {
    const module = modules.find(
      (item) => String(item.id) === String(moduleId)
    );

    return module?.title || "Module tidak ditemukan";
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dosen-pretest-page">
      {/* HEADER */}

      <div className="dosen-pretest-header">
        <div className="dosen-pretest-header-info">
          <span className="dosen-pretest-eyebrow">
            <FaFileAlt />
            PEMBELAJARAN
          </span>

          <h1>Pretest</h1>

          <p>
            Kelola pretest untuk mengukur pengetahuan awal mahasiswa
            sebelum mempelajari module.
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

      {/* INFO */}

      <div className="dosen-pretest-info">
        <div className="dosen-pretest-info-icon">
          <FaQuestionCircle />
        </div>

        <div>
          <strong>Tentang Pretest</strong>

          <p>
            Setiap module hanya memiliki satu pretest.
            Pretest digunakan untuk mengetahui pengetahuan awal
            mahasiswa sebelum memulai pembelajaran. Gambar dapat
            ditambahkan secara opsional pada masing-masing soal.
          </p>
        </div>
      </div>

      {/* TOTAL */}

      <div className="dosen-pretest-toolbar">
        <div className="dosen-pretest-total">
          <strong>{pretests.length}</strong>
          <span>Pretest</span>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="dosen-pretest-error">
          {error}
          <button type="button" onClick={loadData}>
            Coba Lagi
          </button>
        </div>
      )}

      {/* GRID */}

      <div className="dosen-pretest-grid">
        {loading ? (
          <div className="dosen-pretest-empty">
            <p>Memuat data pretest...</p>
          </div>
        ) : pretests.length > 0 ? (
          pretests.map((pretest, index) => (
            <article
              className="dosen-pretest-card"
              key={pretest.id}
            >
              <div className="dosen-pretest-card-header">
                <div className="dosen-pretest-number">
                  PRETEST {String(index + 1).padStart(2, "0")}
                </div>

                <span
                  className={`dosen-pretest-status ${
                    pretest.status === "publik"
                      ? "published"
                      : "draft"
                  }`}
                >
                  {pretest.status === "publik"
                    ? "Publik"
                    : "Draf"}
                </span>
              </div>

              <div className="dosen-pretest-card-icon">
                <FaFileAlt />
              </div>

              <div className="dosen-pretest-card-content">
                <span className="dosen-pretest-module">
                  <FaBookOpen />
                  {getModuleTitle(pretest.module_id)}
                </span>

                <h3>{pretest.title}</h3>

                <p>{pretest.description}</p>

                <div className="dosen-pretest-meta">
                  <div>
                    <FaQuestionCircle />
                    <span>
                      {pretest.question_count} Soal
                    </span>
                  </div>
                </div>
              </div>

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
                    onClick={() => handleEdit(pretest)}
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

            <h3>Belum ada pretest</h3>

            <p>
              Tambahkan pretest untuk mulai mengelola soal
              pembelajaran.
            </p>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT */}

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
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* MODULE */}

              <div className="dosen-pretest-field">
                <label htmlFor="module_id">
                  Module
                </label>

                <select
                  id="module_id"
                  name="module_id"
                  value={formData.module_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Pilih Module
                  </option>

                  {modules.map((module) => {
                    const alreadyHasPretest =
                      moduleHasPretest(module.id);

                    return (
                      <option
                        key={module.id}
                        value={module.id}
                        disabled={alreadyHasPretest}
                      >
                        {module.title}
                        {alreadyHasPretest
                          ? " (Sudah memiliki pretest)"
                          : ""}
                      </option>
                    );
                  })}
                </select>

                <small>
                  Modul yang sudah memiliki pretest tidak
                  dapat dipilih untuk pretest baru.
                </small>
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
                  required
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
                  required
                />
              </div>

              {/* JUMLAH SOAL */}

              <div className="dosen-pretest-field">
                <label htmlFor="question_count">
                  Jumlah Soal
                </label>

                <input
                  id="question_count"
                  name="question_count"
                  type="number"
                  min="1"
                  value={formData.question_count}
                  onChange={handleChange}
                  required
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
                  <option value="draf">Draf</option>
                  <option value="publik">Publik</option>
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
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-pretest-save-btn"
                  disabled={saving}
                >
                  <FaSave />
                  {saving
                    ? "Menyimpan..."
                    : editingPretest
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