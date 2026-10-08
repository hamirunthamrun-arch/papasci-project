import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap";

import {
  FaClipboardCheck,
  FaEdit,
  FaPlus,
  FaSave,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

import {
  getPedagogicCompetencies,
  createPedagogicCompetency,
  updatePedagogicCompetency,
  deletePedagogicCompetency,
} from "../../service/pedagogicCompetencyService";

import "../../css/dosen/DosenKompetensiPedagogik.css";

/* =========================================================
   FORM KOSONG
========================================================= */

const emptyForm = {
  title: "",
  pemahaman: "",
  indikator: "",
  bukti: "",
  teknik: "",
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenKompetensiPedagogik() {
  /* =======================================================
     KOMPETENSI
  ======================================================= */

  const [kompetensiData, setKompetensiData] = useState([]);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     PESAN HALAMAN
  ======================================================= */

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* =======================================================
     MODAL CRUD
  ======================================================= */

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  /* =======================================================
     MODAL DELETE
  ======================================================= */

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedDelete, setSelectedDelete] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  /* =========================================================
     AMBIL DATA KOMPETENSI
  ========================================================= */

  const loadKompetensi = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setPageError("");

      const data = await getPedagogicCompetencies();

      setKompetensiData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil kompetensi pedagogik:", error);

      setPageError(
        error.message || "Gagal mengambil daftar kompetensi pedagogik.",
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  /* =========================================================
     LOAD AWAL
  ========================================================= */

  useEffect(() => {
    const fetchKompetensi = async () => {
      try {
        const data = await getPedagogicCompetencies();

        setKompetensiData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Gagal mengambil kompetensi pedagogik:", error);

        setPageError(
          error.message || "Gagal mengambil daftar kompetensi pedagogik.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchKompetensi();
  }, []);

  /* =========================================================
     BUKA TAMBAH
  ========================================================= */

  const handleAdd = () => {
    setEditingId(null);

    setFormData({
      ...emptyForm,
    });

    setFormError("");
    setSuccessMessage("");

    setShowModal(true);
  };

  /* =========================================================
     BUKA EDIT
  ========================================================= */

  const handleEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      title: item.title || "",
      pemahaman: item.pemahaman || "",
      indikator: item.indicator || "",
      bukti: item.bukti || "",
      teknik: item.teknik || "",
    });

    setFormError("");
    setSuccessMessage("");

    setShowModal(true);
  };

  /* =========================================================
     INPUT FORM
  ========================================================= */

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     TUTUP MODAL
  ========================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setEditingId(null);

    setFormData({
      ...emptyForm,
    });

    setFormError("");
  };

  /* =========================================================
     SIMPAN KOMPETENSI
  ========================================================= */

  const handleSave = async (e) => {
    e.preventDefault();

    /* -------------------------------------------------------
       VALIDASI
    ------------------------------------------------------- */

    if (!formData.title.trim()) {
      setFormError("Cakupan kompetensi wajib diisi.");
      return;
    }

    if (!formData.pemahaman.trim()) {
      setFormError("Pemahaman wajib diisi.");
      return;
    }

    if (!formData.indikator.trim()) {
      setFormError("Indikator wajib diisi.");
      return;
    }

    if (!formData.bukti.trim()) {
      setFormError("Bukti fisik wajib diisi.");
      return;
    }

    if (!formData.teknik.trim()) {
      setFormError("Teknik ukur wajib diisi.");
      return;
    }

    setSaving(true);
    setFormError("");
    setPageError("");
    setSuccessMessage("");

    try {
      /* -----------------------------------------------------
         EDIT
      ----------------------------------------------------- */

      if (editingId) {
        const currentItem = kompetensiData.find(
          (item) => item.id === editingId,
        );

        if (!currentItem) {
          throw new Error("Data kompetensi yang ingin diedit tidak ditemukan.");
        }

        const payload = {
          nomor: Number(currentItem.nomor),
          title: formData.title.trim(),
          pemahaman: formData.pemahaman.trim(),
          indicator: formData.indikator.trim(),
          bukti: formData.bukti.trim(),
          teknik: formData.teknik.trim(),
        };

        await updatePedagogicCompetency(editingId, payload);

        setSuccessMessage("Kompetensi pedagogik berhasil diperbarui.");
      } else {

      /* -----------------------------------------------------
         TAMBAH
      ----------------------------------------------------- */
        const nextNomor =
          kompetensiData.length > 0
            ? Math.max(
                ...kompetensiData.map((item) => Number(item.nomor) || 0),
              ) + 1
            : 1;

        const payload = {
          nomor: nextNomor,
          title: formData.title.trim(),
          pemahaman: formData.pemahaman.trim(),
          indicator: formData.indikator.trim(),
          bukti: formData.bukti.trim(),
          teknik: formData.teknik.trim(),
        };

        await createPedagogicCompetency(payload);

        setSuccessMessage("Kompetensi pedagogik berhasil ditambahkan.");
      }

      /* -----------------------------------------------------
         RESET
      ----------------------------------------------------- */

      setShowModal(false);

      setEditingId(null);

      setFormData({
        ...emptyForm,
      });

      await loadKompetensi();
    } catch (error) {
      console.error("Gagal menyimpan kompetensi pedagogik:", error);

      setFormError(error.message || "Gagal menyimpan kompetensi pedagogik.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     KONFIRMASI DELETE
  ========================================================= */

  const handleDeleteConfirm = (item) => {
    setSelectedDelete(item);

    setShowDeleteModal(true);

    setPageError("");
    setSuccessMessage("");
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async () => {
    if (!selectedDelete) return;

    setDeletingId(selectedDelete.id);

    setPageError("");
    setSuccessMessage("");

    try {
      await deletePedagogicCompetency(selectedDelete.id);

      setSuccessMessage("Kompetensi pedagogik berhasil dihapus.");

      setSelectedDelete(null);

      setShowDeleteModal(false);

      await loadKompetensi();
    } catch (error) {
      console.error("Gagal menghapus kompetensi pedagogik:", error);

      setPageError(error.message || "Gagal menghapus kompetensi pedagogik.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="pedagogik-page">
      <Container fluid className="pedagogik-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="pedagogik-header">
          <div className="pedagogik-header-content">
            <span className="pedagogik-label">KERANGKA PENGUKURAN</span>

            <h1>Kompetensi Pedagogik</h1>

            <p>
              Kelola cakupan kompetensi pedagogik dan lakukan penilaian terhadap
              mahasiswa berdasarkan indikator yang telah ditentukan.
            </p>
          </div>
        </div>

        {/* =================================================
            PESAN
        ================================================= */}

        {successMessage && (
          <div className="alert alert-success" role="status">
            {successMessage}
          </div>
        )}

        {pageError && (
          <div className="alert alert-danger" role="alert">
            {pageError}
          </div>
        )}

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="pedagogik-toolbar">
          <div>
            <h2>Daftar Kompetensi</h2>

            <p>Kelola isi cakupan, indikator, bukti fisik, dan teknik ukur.</p>
          </div>

          <Button
            className="btn-add-competency"
            onClick={handleAdd}
            disabled={loading}
          >
            <FaPlus />
            Tambah Kompetensi
          </Button>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="competency-table-wrapper">
          <div className="competency-table">
            {/* HEADER */}

            <div className="competency-table-head">
              <div className="col-no">NO</div>

              <div className="col-cakupan">CAKUPAN & PEMAHAMAN</div>

              <div className="col-indikator">INDIKATOR YANG BISA DIUKUR</div>

              <div className="col-bukti">BUKTI FISIK</div>

              <div className="col-teknik">TEKNIK UKUR</div>

              <div className="col-action">AKSI</div>
            </div>

            {/* BODY */}

            {loading ? (
              <div className="empty-competency">
                <FaClipboardCheck />

                <h3>Memuat data kompetensi...</h3>

                <p>Sedang mengambil data dari server.</p>
              </div>
            ) : kompetensiData.length === 0 ? (
              <div className="empty-competency">
                <FaClipboardCheck />

                <h3>Belum ada kompetensi</h3>

                <p>Tambahkan kompetensi pedagogik pertama.</p>

                <Button onClick={handleAdd}>
                  <FaPlus />
                  Tambah Kompetensi
                </Button>
              </div>
            ) : (
              kompetensiData.map((item) => (
                <div className="competency-row" key={item.id}>
                  {/* NO */}

                  <div className="col-no">
                    <span className="competency-number">
                      {String(item.nomor).padStart(2, "0")}
                    </span>
                  </div>

                  {/* CAKUPAN */}

                  <div className="col-cakupan">
                    <h3>{item.title}</h3>

                    <p className="understanding">
                      <strong>Pemahaman:</strong> {item.pemahaman}
                    </p>
                  </div>

                  {/* INDIKATOR */}

                  <div className="col-indikator">
                    <p>{item.indicator}</p>
                  </div>

                  {/* BUKTI */}

                  <div className="col-bukti">
                    <p>{item.bukti}</p>
                  </div>

                  {/* TEKNIK */}

                  <div className="col-teknik">
                    <span className="technique-badge">{item.teknik}</span>
                  </div>

                  {/* ACTION */}

                  <div className="col-action">
                    <button
                      type="button"
                      className="action-button edit"
                      onClick={() => handleEdit(item)}
                      title="Edit kompetensi"
                    >
                      <FaEdit />
                    </button>

                    <button
                      type="button"
                      className="action-button delete"
                      onClick={() => handleDeleteConfirm(item)}
                      title="Hapus kompetensi"
                      disabled={deletingId === item.id}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Container>

      {/* =====================================================
          MODAL TAMBAH / EDIT
      ===================================================== */}

      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton={!saving}>
            <Modal.Title>
              {editingId
                ? "Edit Kompetensi Pedagogik"
                : "Tambah Kompetensi Pedagogik"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {/* ERROR FORM */}

            {formError && (
              <div className="alert alert-danger" role="alert">
                {formError}
              </div>
            )}

            <div className="crud-form-intro">
              <FaClipboardCheck />

              <div>
                <strong>Data Kompetensi</strong>

                <p>
                  Isi informasi kompetensi yang akan digunakan sebagai dasar
                  pengukuran mahasiswa.
                </p>
              </div>
            </div>

            {/* CAKUPAN */}

            <Form.Group className="mb-3">
              <Form.Label>Cakupan Kompetensi</Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Masukkan cakupan kompetensi..."
                disabled={saving}
              />
            </Form.Group>

            {/* PEMAHAMAN + INDIKATOR */}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cakupan & Pemahaman</Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="pemahaman"
                    value={formData.pemahaman}
                    onChange={handleFormChange}
                    placeholder="Masukkan pemahaman..."
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Indikator yang Bisa Diukur</Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="indikator"
                    value={formData.indikator}
                    onChange={handleFormChange}
                    placeholder="Masukkan indikator..."
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* BUKTI + TEKNIK */}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bukti Fisik</Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="bukti"
                    value={formData.bukti}
                    onChange={handleFormChange}
                    placeholder="Masukkan bukti fisik..."
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teknik Ukur</Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="teknik"
                    value={formData.teknik}
                    onChange={handleFormChange}
                    placeholder="Contoh: Observasi kelas, telaah dokumen"
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              <FaTimes />
              Batal
            </Button>

            <Button
              className="btn-save-competency"
              type="submit"
              disabled={saving}
            >
              <FaSave />

              {saving
                ? "Menyimpan..."
                : editingId
                  ? "Simpan Perubahan"
                  : "Tambah Kompetensi"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* =====================================================
          MODAL DELETE
      ===================================================== */}

      <Modal
        show={showDeleteModal}
        onHide={() => {
          if (!deletingId) {
            setShowDeleteModal(false);
          }
        }}
        centered
      >
        <Modal.Header closeButton={!deletingId}>
          <Modal.Title>Hapus Kompetensi</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="delete-confirm">
            <div className="delete-icon">
              <FaTrash />
            </div>

            <h3>Hapus kompetensi ini?</h3>

            <p>
              Data kompetensi
              <strong>
                {" "}
                {selectedDelete
                  ? String(selectedDelete.nomor).padStart(2, "0")
                  : ""}
              </strong>{" "}
              akan dihapus dari daftar.
            </p>

            <span>Tindakan ini tidak dapat dibatalkan.</span>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={Boolean(deletingId)}
          >
            Batal
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={Boolean(deletingId)}
          >
            <FaTrash />

            {deletingId ? "Menghapus..." : "Hapus"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DosenKompetensiPedagogik;
