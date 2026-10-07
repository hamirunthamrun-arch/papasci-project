import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes } from "react-icons/fa";

import "../../css/admin/AdminMahasiswa.css";

const API_URL = "http://localhost:5000/api";

const AdminMahasiswa = () => {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    email: "",
    password: "",
  });

  /* =====================================================
     AMBIL DATA MAHASISWA
  ===================================================== */

  const fetchMahasiswa = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data mahasiswa.");
      }

      if (result.success) {
        // Ambil hanya user dengan role mahasiswa
        // User tanpa role tetap dianggap mahasiswa
        const dataMahasiswa = result.data.filter(
          (user) => user.role === "mahasiswa" || !user.role,
        );

        setMahasiswa(dataMahasiswa);
      } else {
        console.error("Gagal mengambil data mahasiswa:", result.message);
      }
    } catch (error) {
      console.error("Gagal memuat data mahasiswa:", error);
    }
  }, []);

  /* =====================================================
     LOAD DATA SAAT HALAMAN DIBUKA
  ===================================================== */

  useEffect(() => {
    fetchMahasiswa();
  }, [fetchMahasiswa]);

  /* =====================================================
     FILTER / SEARCH
  ===================================================== */

  const filteredMahasiswa = mahasiswa.filter((item) => {
    const keyword = search.toLowerCase();

    const nama = item.nama_lengkap || item.nama || "";
    const nim = item.nim || "";
    const email = item.email || "";

    return (
      nama.toLowerCase().includes(keyword) ||
      nim.toLowerCase().includes(keyword) ||
      email.toLowerCase().includes(keyword)
    );
  });

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
     TAMBAH MAHASISWA
  ===================================================== */

  const handleAdd = () => {
    setEditingId(null);

    setFormData({
      nama: "",
      nim: "",
      email: "",
      password: "",
    });

    setShowModal(true);
  };

  /* =====================================================
     EDIT MAHASISWA
  ===================================================== */

  const handleEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      nama: item.nama_lengkap || item.nama || "",
      nim: item.nim || "",
      email: item.email || "",
      password: "",
    });

    setShowModal(true);
  };

  /* =====================================================
     TUTUP MODAL
  ===================================================== */

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);

    setFormData({
      nama: "",
      nim: "",
      email: "",
      password: "",
    });
  };

  /* =====================================================
     SIMPAN TAMBAH / EDIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.email) {
      alert("Nama dan Email wajib diisi.");
      return;
    }

    try {
      let response;

      /* =================================================
         EDIT MAHASISWA
      ================================================= */

      if (editingId) {
        response = await fetch(`${API_URL}/users/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: formData.nama,
            nim: formData.nim,
            email: formData.email,
            role: "mahasiswa",
          }),
        });
      } else {
        /* ===============================================
           TAMBAH MAHASISWA
        =============================================== */

        response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: formData.nama,
            nim: formData.nim,
            email: formData.email,
            password: formData.password || "mahasiswa123",
            role: "mahasiswa",
          }),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Terjadi kesalahan pada server.");
      }

      if (editingId) {
        alert("Data mahasiswa berhasil diperbarui!");
      } else {
        alert("Mahasiswa baru berhasil ditambahkan!");
      }

      handleCloseModal();

      // Refresh data tabel
      fetchMahasiswa();
    } catch (error) {
      console.error("Error menyimpan data mahasiswa:", error);

      alert("Terjadi kesalahan: " + error.message);
    }
  };

  /* =====================================================
     HAPUS MAHASISWA
  ===================================================== */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus mahasiswa ini?",
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

      alert("Data mahasiswa berhasil dihapus!");

      // Refresh data tabel
      fetchMahasiswa();
    } catch (error) {
      console.error("Error menghapus mahasiswa:", error);

      alert("Gagal menghapus: " + error.message);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="admin-mahasiswa">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-page-header">
        <div>
          <h1>Data Mahasiswa</h1>

          <p>Kelola data mahasiswa yang terdaftar di PAPASCI.</p>
        </div>

        <button type="button" className="admin-primary-btn" onClick={handleAdd}>
          <FaPlus />
          Tambah Mahasiswa
        </button>
      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="admin-mahasiswa-toolbar">
        <div className="admin-search-box">
          <FaSearch />

          <input
            type="text"
            placeholder="Cari nama, NIM, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-total-data">
          Total: <strong>{filteredMahasiswa.length}</strong>
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-mahasiswa-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIM</th>
                <th>Email</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredMahasiswa.length > 0 ? (
                filteredMahasiswa.map((item, index) => {
                  const displayName =
                    item.nama_lengkap || item.nama || "Tanpa Nama";

                  return (
                    <tr key={item.id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="student-name">
                          <div className="student-avatar">
                            {displayName.charAt(0).toUpperCase()}
                          </div>

                          <span>{displayName}</span>
                        </div>
                      </td>

                      <td>{item.nim || "-"}</td>

                      <td>{item.email || "-"}</td>

                      <td>
                        <div className="student-actions">
                          <button
                            type="button"
                            className="action-edit"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="action-delete"
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
                  <td colSpan="5" className="empty-table">
                    Data mahasiswa tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            {/* HEADER MODAL */}

            <div className="admin-modal-header">
              <div>
                <h2>{editingId ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</h2>

                <p>
                  {editingId
                    ? "Perbarui informasi mahasiswa."
                    : "Masukkan informasi mahasiswa."}
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={handleCloseModal}
              >
                <FaTimes />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              {/* NAMA */}

              <div className="admin-form-group">
                <label>Nama Lengkap</label>

                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              {/* NIM */}

              <div className="admin-form-group">
                <label>NIM</label>

                <input
                  type="text"
                  name="nim"
                  value={formData.nim}
                  onChange={handleChange}
                  placeholder="Masukkan NIM"
                />
              </div>

              {/* EMAIL */}

              <div className="admin-form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan email"
                  required
                />
              </div>

              {/* PASSWORD */}

              {!editingId && (
                <div className="admin-form-group">
                  <label>Password Akun</label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                  />
                </div>
              )}

              {/* FOOTER */}

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={handleCloseModal}
                >
                  Batal
                </button>

                <button type="submit" className="admin-primary-btn">
                  {editingId ? "Simpan Perubahan" : "Tambah Mahasiswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMahasiswa;
