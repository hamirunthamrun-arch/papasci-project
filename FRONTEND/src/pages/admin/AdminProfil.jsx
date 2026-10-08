import { useState, useEffect } from "react";
import {
  FaUserShield,
  FaUser,
  FaEnvelope,
  FaIdBadge,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import "../../css/admin/AdminProfil.css";

const API_URL = "http://localhost:5000/api";

// ======================================================
// COMPONENT
// ======================================================
function AdminProfil() {
  const [isEditing, setIsEditing] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Administrator");

  // ======================================================
  // AMBIL DATA PROFIL ADMIN
  // Fungsi ini hanya mengambil data dan mengembalikannya.
  // Tidak melakukan setState.
  // ======================================================
  const fetchAdminProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data profil admin.");
      }

      if (result.success && Array.isArray(result.data)) {
        const adminData =
          result.data.find(
            (user) => user.role === "admin" || user.role === "Administrator",
          ) || result.data[0];

        return adminData || null;
      }

      return null;
    } catch (error) {
      console.error("Gagal memuat profil admin:", error);

      return null;
    }
  };

  // ======================================================
  // ISI DATA KE STATE
  // ======================================================
  const applyAdminProfile = (adminData) => {
    if (!adminData) {
      return;
    }

    setAdminId(adminData.id);

    setNama(
      adminData.nama_lengkap || adminData.nama || "Administrator PAPASCI",
    );

    setEmail(adminData.email || "admin@papasci.id");

    setRole(
      adminData.role
        ? adminData.role.charAt(0).toUpperCase() + adminData.role.slice(1)
        : "Administrator",
    );
  };

  // ======================================================
  // LOAD PROFIL PERTAMA KALI
  // ======================================================
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const adminData = await fetchAdminProfile();

      if (!isMounted || !adminData) {
        return;
      }

      applyAdminProfile(adminData);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // ======================================================
  // SIMPAN PERUBAHAN PROFIL
  // ======================================================
  const handleSave = async (event) => {
    event.preventDefault();

    if (!adminId) {
      alert("ID Admin tidak ditemukan.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${adminId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: nama,
          email: email,
          role: "admin",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbarui profil");
      }

      alert("Profil admin berhasil diperbarui.");

      setIsEditing(false);

      // Ambil ulang data terbaru
      const adminData = await fetchAdminProfile();

      applyAdminProfile(adminData);
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    }
  };

  // ======================================================
  // BATAL EDIT
  // ======================================================
  const handleCancel = async () => {
    setIsEditing(false);

    // Kembalikan data dari server
    const adminData = await fetchAdminProfile();

    applyAdminProfile(adminData);
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="admin-profile-page">
      {/* =================================================
          HEADER
      ================================================= */}
      <div className="admin-profile-header">
        <div>
          <span className="admin-profile-eyebrow">
            <FaUserShield />
            AKUN ADMIN
          </span>

          <h1>Profil Admin</h1>

          <p>Kelola informasi akun administrator PAPASCI.</p>
        </div>
      </div>

      {/* =================================================
          PROFILE CARD
      ================================================= */}
      <div className="admin-profile-card">
        <div className="admin-profile-top">
          <div className="admin-profile-avatar">
            <FaUserShield />
          </div>

          <div className="admin-profile-name">
            <h2>{nama}</h2>

            <span>
              <FaUserShield />
              {role}
            </span>
          </div>

          {!isEditing && (
            <button
              type="button"
              className="admin-profile-edit-btn"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit />
              Edit Profil
            </button>
          )}
        </div>

        {/* =================================================
            INFORMATION
        ================================================= */}
        {!isEditing ? (
          <div className="admin-profile-information">
            {/* Nama */}
            <div className="admin-profile-info-item">
              <div className="admin-profile-info-icon">
                <FaUser />
              </div>

              <div>
                <span>Nama</span>
                <strong>{nama}</strong>
              </div>
            </div>

            {/* Email */}
            <div className="admin-profile-info-item">
              <div className="admin-profile-info-icon">
                <FaEnvelope />
              </div>

              <div>
                <span>Email</span>
                <strong>{email}</strong>
              </div>
            </div>

            {/* Role */}
            <div className="admin-profile-info-item">
              <div className="admin-profile-info-icon">
                <FaIdBadge />
              </div>

              <div>
                <span>Role</span>
                <strong>{role}</strong>
              </div>
            </div>
          </div>
        ) : (
          <form className="admin-profile-form" onSubmit={handleSave}>
            {/* NAMA */}
            <div className="admin-profile-field">
              <label htmlFor="adminName">Nama Admin</label>

              <div className="admin-profile-input">
                <FaUser />

                <input
                  id="adminName"
                  type="text"
                  value={nama}
                  onChange={(event) => setNama(event.target.value)}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="admin-profile-field">
              <label htmlFor="adminEmail">Email</label>

              <div className="admin-profile-input">
                <FaEnvelope />

                <input
                  id="adminEmail"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            {/* ROLE */}
            <div className="admin-profile-field">
              <label>Role</label>

              <div className="admin-profile-readonly">
                <FaUserShield />
                <span>{role}</span>
              </div>

              <small>
                Role administrator tidak dapat diubah dari halaman ini.
              </small>
            </div>

            {/* BUTTON */}
            <div className="admin-profile-form-actions">
              <button
                type="button"
                className="admin-profile-cancel-btn"
                onClick={handleCancel}
              >
                <FaTimes />
                Batal
              </button>

              <button type="submit" className="admin-profile-save-btn">
                <FaSave />
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminProfil;
