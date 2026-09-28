import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

import {
  FaHome,
  FaBookOpen,
  FaFlask,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import logoPapascI from "../assets/logo-papasci.png";

import "../css/SideBar.css";

function Sidebar({ showMobileSidebar, closeMobileSidebar }) {
  const navigate = useNavigate();
  return (
    <aside
      className={`sidebar ${showMobileSidebar ? "sidebar-mobile-show" : ""}`}
    >
      {/* =========================
          LOGO PAPASCI
      ========================= */}

      <div className="sidebar-logo">
        <img
          src={logoPapascI}
          alt="PAPASCI - Papua Adaptive Science Learning"
          className="sidebar-logo-image"
        />
      </div>

      {/* =========================
          NAVIGATION
      ========================= */}

      <div className="sidebar-menu">
        {/* MENU UTAMA */}
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

        {/* =========================
            KOMPETENSI PEDAGOGIK
        ========================= */}

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

      {/* =========================
          ACCOUNT
      ========================= */}

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
          onClick={() => logout(navigate)}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
