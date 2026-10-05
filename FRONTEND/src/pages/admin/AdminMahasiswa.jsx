import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import "../../css/admin/AdminMahasiswa.css";

const API_URL = "http://localhost:5000/api"; // Alamat base URL backend Express Anda

const AdminMahasiswa = () => {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    email: "",
    password: "", // Untuk pembuatan akun auth baru
    status: "Aktif",
  });

  // 1. AMBIL DATA DARI BACKEND MENGGUNAKAN FETCH
  const fetchMahasiswa = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const result = await response.json();
      
      if (result.success) {
        // Filter hanya yang rolenya mahasiswa (jika tercampur dengan dosen/admin)
        const dataMahasiswa = result.data.filter(
          (user) => user.role === "mahasiswa" || !user.role
        );
        setMahasiswa(dataMahasiswa);
      }
    } catch (error) {
      console.error("Gagal memuat data mahasiswa:", error);
    }
  };

  useEffect(() => {
    fetchMahasiswa();
  }, []);

  const filteredMahasiswa = mahasiswa.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      item.nama_lengkap?.toLowerCase().includes(keyword) ||
      item.nim?.toLowerCase().includes(keyword) ||
      item.email?.toLowerCase().includes(keyword)
    );
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ nama: "", nim: "", email: "", password: "", status: "Aktif" });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama_lengkap || item.nama || "",
      nim: item.nim || "",
      email: item.email || "",
      status: item.status || "Aktif",
    });
    setShowModal(true);
  };

  // 2. SIMPAN DATA (TAMBAH / EDIT) MENGGUNAKAN FETCH
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.email) {
      alert("Nama dan Email wajib diisi.");
      return;
    }

    try {
      let response;
      if (editingId) {
        // Method PUT untuk Edit Data
        response = await fetch(`${API_URL}/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: formData.nama,
            nim: formData.nim,
            email: formData.email,
            status: formData.status,
            role: "mahasiswa",
          }),
        });
      } else {
        // Method POST untuk Tambah Data Baru
        response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: formData.nama,
            nim: formData.nim,
            email: formData.email,
            password: formData.password || "mahasiswa123",
            role: "mahasiswa",
            status: formData.status,
          }),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Terjadi kesalahan pada server");
      }

      alert(editingId ? "Data mahasiswa berhasil diperbarui!" : "Mahasiswa baru berhasil ditambahkan!");
      setShowModal(false);
      fetchMahasiswa(); // Refresh data tabel
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    }
  };

  // 3. HAPUS DATA MENGGUNAKAN FETCH
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus mahasiswa ini?")) return;

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus data");
      }

      fetchMahasiswa(); // Refresh data tabel
    } catch (error) {
      alert("Gagal menghapus: " + error.message);
    }
  };

  return (
    <div className="admin-mahasiswa">
      <div className="admin-page-header">
        <div>
          <h1>Data Mahasiswa</h1>
          <p>Kelola data mahasiswa yang terdaftar di PAPASCI.</p>
        </div>
        <button className="admin-primary-btn" onClick={handleAdd}>
          <FaPlus /> Tambah Mahasiswa
        </button>
      </div>

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
                filteredMahasiswa.map((item, index) => {
                  const displayName = item.nama_lengkap || item.nama || "Tanpa Nama";
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
                      <td>{item.email}</td>
                      <td>
                        <span
                          className={`student-status ${
                            item.status === "Aktif" ? "active" : "inactive"
                          }`}
                        >
                          {item.status || "Aktif"}
                        </span>
                      </td>
                      <td>
                        <div className="student-actions">
                          <button className="action-edit" onClick={() => handleEdit(item)}>
                            <FaEdit />
                          </button>
                          <button className="action-delete" onClick={() => handleDelete(item.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
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
                  required
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
                  required
                />
              </div>

              {!editingId && (
                <div className="admin-form-group">
                  <label>Password Akun</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter"
                    required
                  />
                </div>
              )}

              <div className="admin-form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
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