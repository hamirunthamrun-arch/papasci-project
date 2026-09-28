import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaArrowRight,
} from "react-icons/fa";

import "../../css/admin/AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard-header">
        <div>
          <h1>Dashboard Admin</h1>
          <p>Kelola data dan akun pengguna PAPASCI.</p>
        </div>
      </div>

      {/* Statistik */}
      <div className="admin-stat-grid">
        {/* Total Mahasiswa */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FaUserGraduate />
          </div>

          <div>
            <span>Total Mahasiswa</span>
            <h2>120</h2>
          </div>
        </div>

        {/* Total Dosen */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FaChalkboardTeacher />
          </div>

          <div>
            <span>Total Dosen</span>
            <h2>8</h2>
          </div>
        </div>
      </div>

      {/* Manajemen Akun */}
      <section className="admin-management-section">
        <div className="admin-section-title">
          <h2>Manajemen Akun</h2>
          <p>Kelola data dan akun pengguna yang terdaftar di PAPASCI.</p>
        </div>

        <div className="admin-management-grid">
          {/* Mahasiswa */}
          <div className="admin-management-card">
            <div className="admin-management-icon">
              <FaUserGraduate />
            </div>

            <div className="admin-management-content">
              <h3>Data Mahasiswa</h3>

              <p>Kelola data dan akun mahasiswa yang terdaftar di PAPASCI.</p>

              <a href="/admin/mahasiswa">
                Kelola Data
                <FaArrowRight />
              </a>
            </div>
          </div>

          {/* Dosen */}
          <div className="admin-management-card">
            <div className="admin-management-icon">
              <FaChalkboardTeacher />
            </div>

            <div className="admin-management-content">
              <h3>Data Dosen</h3>

              <p>Kelola data dan akun dosen yang terdaftar di PAPASCI.</p>

              <a href="/admin/dosen">
                Kelola Data
                <FaArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
