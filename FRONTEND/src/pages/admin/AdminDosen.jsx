import { useState, useEffect, useCallback } from "react";
import {
  FaChalkboardTeacher,
  FaEdit,
  FaPlus,
  FaSearch,
  FaTrash,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import "../../css/admin/AdminDosen.css";

const API_URL = "http://localhost:5000/api";

const AdminDosen = () => {
  const [dosen, setDosen] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    nidn: "",
    email: "",
    password: "",
  });

  /* =====================================================
     AMBIL DATA DOSEN
  ===================================================== */

  const fetchDosen = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data dosen.");
      }

      if (result.success) {
        const dataDosen = result.data.filter((user) => user.role === "dosen");

        setDosen(dataDosen);
      } else {
        console.error("Gagal mengambil data dosen:", result.message);
      }
    } catch (error) {
      console.error("Gagal memuat data dosen:", error);
    }
  }, []);

  /* =====================================================
     LOAD DATA SAAT HALAMAN DIBUKA
  ===================================================== */

  useEffect(() => {
    fetchDosen();
  }, [fetchDosen]);

  /* =====================================================
     SEARCH DOSEN
  ===================================================== */

  const filteredDosen = dosen.filter((item) => {
    const keyword = search.toLowerCase();

    const nama = item.nama_lengkap || item.nama || "";

    // NIDN disimpan pada kolom profiles.nim
    const nidn = item.nim || "";

    const email = item.email || "";

    return (
      nama.toLowerCase().includes(keyword) ||
      nidn.toLowerCase().includes(keyword) ||
      email.toLowerCase().includes(keyword)
    );
  });

  /* =====================================================
     TAMBAH DOSEN
  ===================================================== */

  const handleAdd = () => {
    setEditingId(null);

    setFormData({
      nama: "",
      nidn: "",
      email: "",
      password: "",
    });

    setShowModal(true);
  };

  /* =====================================================
     EDIT DOSEN
  ===================================================== */

  const handleEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      nama: item.nama_lengkap || item.nama || "",
      nidn: item.nim || "",
      email: item.email || "",
      password: "",
    });

    setShowModal(true);
  };

  /* =====================================================
     HANDLE PERUBAHAN FORM
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     TUTUP MODAL
  ===================================================== */

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);

    setFormData({
      nama: "",
      nidn: "",
      email: "",
      password: "",
    });
  };

  /* =====================================================
     SIMPAN TAMBAH / EDIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* ===================================================
       VALIDASI FORM
    =================================================== */

    if (
      !formData.nama.trim() ||
      !formData.nidn.trim() ||
      !formData.email.trim()
    ) {
      alert("Nama Dosen, NIDN, dan Email wajib diisi.");
      return;
    }

    /* ===================================================
       VALIDASI PASSWORD SAAT TAMBAH
    =================================================== */

    if (!editingId && (!formData.password || formData.password.length < 6)) {
      alert("Password wajib diisi minimal 6 karakter.");
      return;
    }

    try {
      let response;

      /* =================================================
         EDIT DOSEN
      ================================================= */

      if (editingId) {
        response = await fetch(`${API_URL}/users/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: formData.nama.trim(),

            // NIDN frontend → profiles.nim
            nim: formData.nidn.trim(),

            email: formData.email.trim(),

            role: "dosen",
          }),
        });
      } else {
        /* ===============================================
           TAMBAH DOSEN
        =============================================== */

        response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: formData.nama.trim(),

            // NIDN frontend → profiles.nim
            nim: formData.nidn.trim(),

            email: formData.email.trim(),

            password: formData.password,

            role: "dosen",
          }),
        });
      }

      /* =================================================
         RESPONSE
      ================================================= */

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Terjadi kesalahan pada server.");
      }

      /* =================================================
         BERHASIL
      ================================================= */

      if (editingId) {
        alert("Data dosen berhasil diperbarui!");
      } else {
        alert("Dosen baru berhasil ditambahkan!");
      }

      /* =================================================
         TUTUP MODAL
      ================================================= */

      handleCloseModal();

      /* =================================================
         REFRESH DATA TABEL
      ================================================= */

      fetchDosen();
    } catch (error) {
      console.error("Error menyimpan data dosen:", error);

      alert("Terjadi kesalahan: " + error.message);
    }
  };

  /* =====================================================
     HAPUS DOSEN
  ===================================================== */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus data dosen ini?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus data.");
      }

      alert("Data dosen berhasil dihapus!");

      /* =================================================
         REFRESH TABEL
      ================================================= */

      fetchDosen();
    } catch (error) {
      console.error("Error menghapus dosen:", error);

      alert("Gagal menghapus: " + error.message);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="admin-dosen-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-dosen-header">
        <div>
          <div className="admin-dosen-title">
            <FaChalkboardTeacher />

            <div>
              <h1>Data Dosen</h1>

              <p>Kelola akun dosen yang terdaftar di PAPASCI.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="admin-dosen-add-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Tambah Dosen
        </button>
      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="admin-dosen-toolbar">
        <div className="admin-dosen-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari nama, NIDN, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-dosen-total">
          Total Dosen: <strong>{filteredDosen.length}</strong>
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="admin-dosen-table-card">
        <div className="admin-dosen-table-wrapper">
          <table className="admin-dosen-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Dosen</th>
                <th>NIDN</th>
                <th>Email</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredDosen.length > 0 ? (
                filteredDosen.map((item, index) => {
                  const displayName =
                    item.nama_lengkap || item.nama || "Tanpa Nama";

                  return (
                    <tr key={item.id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="admin-dosen-name">
                          <div className="admin-dosen-avatar">
                            <FaChalkboardTeacher />
                          </div>

                          <span>{displayName}</span>
                        </div>
                      </td>

                      {/* 
                          profiles.nim digunakan
                          sebagai penyimpanan NIDN
                        */}

                      <td>{item.nim || "-"}</td>

                      <td>{item.email || "-"}</td>

                      <td>
                        <div className="admin-dosen-actions">
                          {/* EDIT */}

                          <button
                            type="button"
                            className="admin-dosen-edit-btn"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="admin-dosen-delete-btn"
                            onClick={() => handleDelete(item.id)}
                            title="Hapus"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="admin-dosen-empty">
                    Data dosen tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================
          MODAL TAMBAH / EDIT
      ================================================= */}

      {showModal && (
        <div className="admin-dosen-modal-overlay">
          <div className="admin-dosen-modal">
            {/* =================================================
                HEADER MODAL
            ================================================= */}

            <div className="admin-dosen-modal-header">
              <div>
                <h2>{editingId ? "Edit Data Dosen" : "Tambah Dosen"}</h2>

                <p>
                  {editingId
                    ? "Perbarui informasi akun dosen."
                    : "Tambahkan akun dosen baru ke PAPASCI."}
                </p>
              </div>

              <button
                type="button"
                className="admin-dosen-modal-close"
                onClick={handleCloseModal}
              >
                <FaTimes />
              </button>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form className="admin-dosen-form" onSubmit={handleSubmit}>
              {/* =================================================
                  NAMA DOSEN
              ================================================= */}

              <div className="admin-dosen-form-group">
                <label>Nama Dosen</label>

                <input
                  type="text"
                  name="nama"
                  placeholder="Masukkan nama dosen"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* =================================================
                  NIDN
              ================================================= */}

              <div className="admin-dosen-form-group">
                <label>NIDN</label>

                <input
                  type="text"
                  name="nidn"
                  placeholder="Masukkan NIDN"
                  value={formData.nidn}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* =================================================
                  EMAIL
              ================================================= */}

              <div className="admin-dosen-form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* =================================================
                  PASSWORD
              ================================================= */}

              {!editingId && (
                <div className="admin-dosen-form-group">
                  <label>Password Akun</label>

                  <input
                    type="password"
                    name="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                </div>
              )}

              {/* =================================================
                  FOOTER MODAL
              ================================================= */}

              <div className="admin-dosen-modal-footer">
                <button
                  type="button"
                  className="admin-dosen-cancel-btn"
                  onClick={handleCloseModal}
                >
                  Batal
                </button>

                <button type="submit" className="admin-dosen-save-btn">
                  <FaSave />

                  {editingId ? "Simpan Perubahan" : "Simpan Dosen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDosen;
