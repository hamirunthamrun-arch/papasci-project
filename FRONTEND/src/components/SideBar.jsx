import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

import {
  FaHome,
  FaBookOpen,
  FaFlask,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserCircle,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

import logoPapascI from "../assets/logo-papasci.png";

import "../css/SideBar.css";

function Sidebar({ showMobileSidebar, closeMobileSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    closeMobileSidebar?.();
    logout(navigate);
  };

  return (
    <>
      {/* OVERLAY MOBILE */}
      <div
        className={`sidebar-overlay ${
          showMobileSidebar ? "sidebar-overlay-show" : ""
        }`}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      <aside
        id="student-sidebar"
        className={`sidebar ${showMobileSidebar ? "sidebar-mobile-show" : ""}`}
        aria-label="Navigasi mahasiswa"
        aria-hidden={!showMobileSidebar && window.innerWidth <= 991}
      >
        {/* HEADER SIDEBAR */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img
              src={logoPapascI}
              alt="PAPASCI - Papua Adaptive Science Learning"
              className="sidebar-logo-image"
            />
          </div>

          {/* TOMBOL CLOSE KHUSUS MOBILE */}
          <button
            type="button"
            className="sidebar-close-button"
            onClick={closeMobileSidebar}
            aria-label="Tutup menu navigasi"
            title="Tutup menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="sidebar-menu">
          <p className="menu-title">MENU UTAMA</p>

          <NavLink to="/" className="sidebar-link" onClick={closeMobileSidebar}>
            <FaHome />
            <span>Beranda</span>
          </NavLink>

          <NavLink
            to="/module"
            className="sidebar-link"
            onClick={closeMobileSidebar}
          >
            <FaBookOpen />
            <span>Module</span>
          </NavLink>

          <NavLink
            to="/labsimulasi"
            className="sidebar-link"
            onClick={closeMobileSidebar}
          >
            <FaFlask />
            <span>Lab Simulasi</span>
          </NavLink>

          <NavLink
            to="/microteaching"
            className="sidebar-link"
            onClick={closeMobileSidebar}
          >
            <FaChalkboardTeacher />
            <span>Microteaching</span>
          </NavLink>

          {/* KOMPETENSI PEDAGOGIK */}
          <p className="menu-title pedagogik-title">KOMPETENSI PEDAGOGIK</p>

          <NavLink
            to="/kompetensi-pedagogik"
            className="sidebar-link"
            onClick={closeMobileSidebar}
          >
            <FaUserGraduate />
            <span>Kompetensi Pedagogik</span>
          </NavLink>
        </div>

        {/* ACCOUNT */}
        <div className="sidebar-account">
          <NavLink
            to="/profil"
            className="sidebar-account-link"
            onClick={closeMobileSidebar}
          >
            <FaUserCircle />
            <span>Profil</span>
          </NavLink>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
