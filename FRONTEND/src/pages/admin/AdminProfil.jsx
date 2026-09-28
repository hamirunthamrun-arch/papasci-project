import { useState } from "react";
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

function AdminProfil() {
  const [isEditing, setIsEditing] = useState(false);

  const [nama, setNama] = useState("Administrator PAPASCI");
  const [email, setEmail] = useState("admin@papasci.id");

  const role = "Administrator";

  const handleSave = (event) => {
    event.preventDefault();

    setIsEditing(false);

    alert("Profil berhasil diperbarui.");
  };

  const handleCancel = () => {
    setIsEditing(false);

    setNama("Administrator PAPASCI");
    setEmail("admin@papasci.id");
  };

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

          <p>
            Kelola informasi akun administrator PAPASCI.
          </p>
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
          <form
            className="admin-profile-form"
            onSubmit={handleSave}
          >

            {/* NAMA */}

            <div className="admin-profile-field">

              <label htmlFor="adminName">
                Nama Admin
              </label>

              <div className="admin-profile-input">

                <FaUser />

                <input
                  id="adminName"
                  type="text"
                  value={nama}
                  onChange={(event) =>
                    setNama(event.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="admin-profile-field">

              <label htmlFor="adminEmail">
                Email
              </label>

              <div className="admin-profile-input">

                <FaEnvelope />

                <input
                  id="adminEmail"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
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
                Role administrator tidak dapat diubah
                dari halaman ini.
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

              <button
                type="submit"
                className="admin-profile-save-btn"
              >
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