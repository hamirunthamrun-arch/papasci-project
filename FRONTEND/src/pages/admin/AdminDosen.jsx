import { useState } from "react";
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

const AdminDosen = () => {
  const [dosen, setDosen] = useState([
    {
      id: 1,
      nama: "Dr. Maria Natalia",
      nidn: "0012345678",
      email: "maria@papasci.ac.id",
      status: "Aktif",
    },
    {
      id: 2,
      nama: "Dr. Andi Saputra",
      nidn: "0023456789",
      email: "andi@papasci.ac.id",
      status: "Aktif",
    },
    {
      id: 3,
      nama: "Siti Wulandari, M.Pd.",
      nidn: "0034567890",
      email: "siti@papasci.ac.id",
      status: "Aktif",
    },
    {
      id: 4,
      nama: "Budi Pratama, M.Pd.",
      nidn: "0045678901",
      email: "budi@papasci.ac.id",
      status: "Nonaktif",
    },
  ]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDosen, setEditingDosen] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    nidn: "",
    email: "",
    status: "Aktif",
  });

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredDosen = dosen.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.nidn.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    );
  });

  /* =====================================================
     BUKA TAMBAH
  ===================================================== */

  const handleAdd = () => {
    setEditingDosen(null);

    setFormData({
      nama: "",
      nidn: "",
      email: "",
      status: "Aktif",
    });

    setShowModal(true);
  };

  /* =====================================================
     BUKA EDIT
  ===================================================== */

  const handleEdit = (item) => {
    setEditingDosen(item);

    setFormData({
      nama: item.nama,
      nidn: item.nidn,
      email: item.email,
      status: item.status,
    });

    setShowModal(true);
  };

  /* =====================================================
     SIMPAN
  ===================================================== */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.nidn || !formData.email) {
      alert("Mohon lengkapi semua data.");
      return;
    }

    if (editingDosen) {
      setDosen((prev) =>
        prev.map((item) =>
          item.id === editingDosen.id
            ? {
                ...item,
                ...formData,
              }
            : item,
        ),
      );
    } else {
      const newDosen = {
        id: Date.now(),
        ...formData,
      };

      setDosen((prev) => [...prev, newDosen]);
    }

    setShowModal(false);
  };

  /* =====================================================
     HAPUS
  ===================================================== */

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus data dosen ini?",
    );

    if (!confirmed) return;

    setDosen((prev) => prev.filter((item) => item.id !== id));
  };

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
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredDosen.length > 0 ? (
                filteredDosen.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>
                      <div className="admin-dosen-name">
                        <div className="admin-dosen-avatar">
                          <FaChalkboardTeacher />
                        </div>

                        <span>{item.nama}</span>
                      </div>
                    </td>

                    <td>{item.nidn}</td>

                    <td>{item.email}</td>

                    <td>
                      <span
                        className={`admin-dosen-status ${
                          item.status === "Aktif" ? "active" : "inactive"
                        }`}
                      >
                        {item.status}
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
                ))
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

      {/* =================================================
          MODAL TAMBAH / EDIT
      ================================================= */}

      {showModal && (
        <div className="admin-dosen-modal-overlay">
          <div className="admin-dosen-modal">
            {/* Modal Header */}

            <div className="admin-dosen-modal-header">
              <div>
                <h2>{editingDosen ? "Edit Data Dosen" : "Tambah Dosen"}</h2>

                <p>
                  {editingDosen
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

            {/* Form */}

            <form className="admin-dosen-form" onSubmit={handleSubmit}>
              <div className="admin-dosen-form-group">
                <label>Nama Dosen</label>

                <input
                  type="text"
                  placeholder="Masukkan nama dosen"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nama: e.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-dosen-form-group">
                <label>NIDN</label>

                <input
                  type="text"
                  placeholder="Masukkan NIDN"
                  value={formData.nidn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nidn: e.target.value,
                    })
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
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-dosen-form-group">
                <label>Status</label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              {/* Modal Footer */}

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

                  {editingDosen ? "Simpan Perubahan" : "Simpan Dosen"}
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
