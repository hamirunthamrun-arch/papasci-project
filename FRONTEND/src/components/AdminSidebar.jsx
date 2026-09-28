import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

import "../css/AdminSidebar.css";
import logoPapascI from "../assets/logo-papasci.png";

const AdminSidebar = ({ showMobileSidebar, closeMobileSidebar }) => {
  return (
    <>
      {/* =================================================
          OVERLAY MOBILE
      ================================================= */}

      {showMobileSidebar && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeMobileSidebar}
        ></div>
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`admin-sidebar ${
          showMobileSidebar ? "admin-sidebar-show" : ""
        }`}
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <div className="admin-sidebar-logo">
          <img src={logoPapascI} alt="PAPASCI" />

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeMobileSidebar}
            aria-label="Tutup menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* =================================================
            IDENTITAS ADMIN
        ================================================= */}

        <div className="admin-sidebar-role">
          <span>ADMIN PAPASCI</span>
          <small>Pengelola Sistem</small>
        </div>

        {/* =================================================
            MENU
        ================================================= */}

        <nav className="admin-sidebar-menu">
          {/* =================================================
              DASHBOARD
          ================================================= */}

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaHome />
            <span>Dashboard</span>
          </NavLink>

          {/* =================================================
              MANAJEMEN AKUN
          ================================================= */}

          <div className="admin-menu-title">MANAJEMEN AKUN</div>

          {/* DATA MAHASISWA */}

          <NavLink
            to="/admin/mahasiswa"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaUserGraduate />
            <span>Data Mahasiswa</span>
          </NavLink>

          {/* DATA DOSEN */}

          <NavLink
            to="/admin/dosen"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaChalkboardTeacher />
            <span>Data Dosen</span>
          </NavLink>
        </nav>

        {/* =================================================
            BOTTOM MENU
        ================================================= */}

        <div className="admin-sidebar-bottom">
          {/* PROFIL */}

          <NavLink
            to="/admin/profil"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaUserCircle />
            <span>Profil</span>
          </NavLink>

          {/* LOGOUT */}

          <button type="button" className="admin-logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
