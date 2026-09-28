import { useState } from "react";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

import "../../css/admin/AdminMahasiswa.css";

const AdminMahasiswa = () => {
  const [mahasiswa, setMahasiswa] = useState([
    {
      id: 1,
      nama: "Andi Saputra",
      nim: "20240001",
      email: "andi@gmail.com",
      status: "Aktif",
    },
    {
      id: 2,
      nama: "Budi Pratama",
      nim: "20240002",
      email: "budi@gmail.com",
      status: "Aktif",
    },
    {
      id: 3,
      nama: "Citra Lestari",
      nim: "20240003",
      email: "citra@gmail.com",
      status: "Aktif",
    },
    {
      id: 4,
      nama: "Dina Wulandari",
      nim: "20240004",
      email: "dina@gmail.com",
      status: "Nonaktif",
    },
  ]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    email: "",
    status: "Aktif",
  });

  /* =========================
     SEARCH
  ========================= */

  const filteredMahasiswa = mahasiswa.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.nim.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    );
  });

  /* =========================
     FORM
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /* =========================
     TAMBAH
  ========================= */

  const handleAdd = () => {
    setEditingId(null);

    setFormData({
      nama: "",
      nim: "",
      email: "",
      status: "Aktif",
    });

    setShowModal(true);
  };

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      nama: item.nama,
      nim: item.nim,
      email: item.email,
      status: item.status,
    });

    setShowModal(true);
  };

  /* =========================
     SIMPAN
  ========================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.nim || !formData.email) {
      alert("Semua data harus diisi.");
      return;
    }

    if (editingId) {
      setMahasiswa((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...formData,
              }
            : item,
        ),
      );
    } else {
      const newMahasiswa = {
        id: Date.now(),
        ...formData,
      };

      setMahasiswa((prev) => [...prev, newMahasiswa]);
    }

    setShowModal(false);
  };

  /* =========================
     HAPUS
  ========================= */

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus mahasiswa ini?",
    );

    if (!confirmDelete) return;

    setMahasiswa((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="admin-mahasiswa">
      {/* HEADER */}
      <div className="admin-page-header">
        <div>
          <h1>Data Mahasiswa</h1>

          <p>Kelola data mahasiswa yang terdaftar di PAPASCI.</p>
        </div>

        <button className="admin-primary-btn" onClick={handleAdd}>
          <FaPlus />
          Tambah Mahasiswa
        </button>
      </div>

      {/* TOOLBAR */}
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

      {/* TABLE */}
      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-mahasiswa-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIM</th>
                <th>Email</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredMahasiswa.length > 0 ? (
                filteredMahasiswa.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>
                      <div className="student-name">
                        <div className="student-avatar">
                          {item.nama.charAt(0).toUpperCase()}
                        </div>

                        <span>{item.nama}</span>
                      </div>
                    </td>

                    <td>{item.nim}</td>

                    <td>{item.email}</td>

                    <td>
                      <span
                        className={`student-status ${
                          item.status === "Aktif" ? "active" : "inactive"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="student-actions">
                        <button
                          className="action-edit"
                          title="Edit"
                          onClick={() => handleEdit(item)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="action-delete"
                          title="Hapus"
                          onClick={() => handleDelete(item.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-table">
                    Data mahasiswa tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <h2>{editingId ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</h2>

                <p>Masukkan informasi mahasiswa.</p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Nama Lengkap</label>

                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

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

              <div className="admin-form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan email"
                />
              </div>

              <div className="admin-form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Aktif">Aktif</option>

                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setShowModal(false)}
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
