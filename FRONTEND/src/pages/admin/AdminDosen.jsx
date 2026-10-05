import { useState, useEffect } from "react";
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

const API_URL = "http://localhost:5000/api"; // Alamat base URL backend Express Anda

const AdminDosen = () => {
  const [dosen, setDosen] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    nidn: "",
    email: "",
    password: "", // Untuk pembuatan akun auth baru
    status: "Aktif",
  });

  // 1. AMBIL DATA DOSEN DARI BACKEND MENGGUNAKAN FETCH
  const fetchDosen = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const result = await response.json();

      if (result.success) {
        // Filter hanya yang rolenya dosen
        const dataDosen = result.data.filter(
          (user) => user.role === "dosen"
        );
        setDosen(dataDosen);
      }
    } catch (error) {
      console.error("Gagal memuat data dosen:", error);
    }
  };

  useEffect(() => {
    fetchDosen();
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */
  const filteredDosen = dosen.filter((item) => {
    const keyword = search.toLowerCase();
    const nama = item.nama_lengkap || item.nama || "";
    const nidn = item.nidn || "";
    const email = item.email || "";

    return (
      nama.toLowerCase().includes(keyword) ||
      nidn.toLowerCase().includes(keyword) ||
      email.toLowerCase().includes(keyword)
    );
  });

  /* =====================================================
     BUKA TAMBAH
  ===================================================== */
  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      nama: "",
      nidn: "",
      email: "",
      password: "",
      status: "Aktif",
    });
    setShowModal(true);
  };

  /* =====================================================
     BUKA EDIT
  ===================================================== */
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama_lengkap || item.nama || "",
      nidn: item.nidn || "",
      email: item.email || "",
      status: item.status || "Aktif",
    });
    setShowModal(true);
  };

  /* =====================================================
     SIMPAN (TAMBAH / EDIT) MENGGUNAKAN FETCH
  ===================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.email) {
      alert("Nama dan Email dosen wajib diisi.");
      return;
    }

    try {
      let response;
      if (editingId) {
        // Method PUT untuk Edit Data Dosen
        response = await fetch(`${API_URL}/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: formData.nama,
            nidn: formData.nidn,
            email: formData.email,
            status: formData.status,
            role: "dosen",
          }),
        });
      } else {
        // Method POST untuk Tambah Dosen Baru (Otomatis Buat Akun Auth)
        response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: formData.nama,
            nidn: formData.nidn,
            email: formData.email,
            password: formData.password || "dosen123",
            role: "dosen",
            status: formData.status,
          }),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Terjadi kesalahan pada server");
      }

      alert(editingId ? "Data dosen berhasil diperbarui!" : "Dosen baru berhasil ditambahkan!");
      setShowModal(false);
      fetchDosen(); // Refresh tabel
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    }
  };

  /* =====================================================
     HAPUS MENGGUNAKAN FETCH
  ===================================================== */
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Apakah kamu yakin ingin menghapus data dosen ini?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus data");
      }

      fetchDosen(); // Refresh tabel
    } catch (error) {
      alert("Gagal menghapus: " + error.message);
    }
  };

  return (
    <div className="admin-dosen-page">
      {/* HEADER */}
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

      {/* TOOLBAR */}
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

      {/* TABLE */}
      <div className="admin-dosen-table-card">
        <div className="admin-dosen-table-wrapper">
          <table className="admin-dosen-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Dosen</th>
                <th>NIDN</th>
                <th>Email</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredDosen.length > 0 ? (
                filteredDosen.map((item, index) => {
                  const displayName = item.nama_lengkap || item.nama || "Tanpa Nama";
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

                      <td>{item.nidn || "-"}</td>

                      <td>{item.email}</td>

                      <td>
                        <span
                          className={`admin-dosen-status ${
                            item.status === "Aktif" ? "active" : "inactive"
                          }`}
                        >
                          {item.status || "Aktif"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-dosen-actions">
                          <button
                            type="button"
                            className="admin-dosen-edit-btn"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>

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
                  <td colSpan="6" className="admin-dosen-empty">
                    Data dosen tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT */}
      {showModal && (
        <div className="admin-dosen-modal-overlay">
          <div className="admin-dosen-modal">
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
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form className="admin-dosen-form" onSubmit={handleSubmit}>
              <div className="admin-dosen-form-group">
                <label>Nama Dosen</label>
                <input
                  type="text"
                  placeholder="Masukkan nama dosen"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  required
                />
              </div>

              <div className="admin-dosen-form-group">
                <label>NIDN</label>
                <input
                  type="text"
                  placeholder="Masukkan NIDN"
                  value={formData.nidn}
                  onChange={(e) =>
                    setFormData({ ...formData, nidn: e.target.value })
                  }
                />
              </div>

              <div className="admin-dosen-form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              {!editingId && (
                <div className="admin-dosen-form-group">
                  <label>Password Akun</label>
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="admin-dosen-form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="admin-dosen-modal-footer">
                <button
                  type="button"
                  className="admin-dosen-cancel-btn"
                  onClick={() => setShowModal(false)}
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