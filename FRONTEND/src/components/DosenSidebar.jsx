import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

import {
  FaHome,
  FaBookOpen,
  FaClipboardCheck,
  FaQuestionCircle,
  FaFlask,
  FaChalkboardTeacher,
  FaTasks,
  FaUpload,
  FaStar,
  FaUserCircle,
  FaUserTie,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

import "../css/dosen/DosenSidebar.css";

import logoPAPASCI from "../assets/logo-papasci.png";

function DosenSidebar({ showMobileSidebar, closeMobileSidebar }) {
  const navigate = useNavigate();

  return (
    <>
      {/* =================================================
          OVERLAY MOBILE
      ================================================= */}

      {showMobileSidebar && (
        <div
          className="dosen-sidebar-overlay"
          onClick={closeMobileSidebar}
        ></div>
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`dosen-sidebar ${
          showMobileSidebar ? "dosen-sidebar-show" : ""
        }`}
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <div className="dosen-sidebar-logo">
          <img src={logoPAPASCI} alt="PAPASCI" />

          <button
            type="button"
            className="dosen-sidebar-close"
            onClick={closeMobileSidebar}
            aria-label="Tutup menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* =================================================
            ROLE
        ================================================= */}

        <div className="dosen-sidebar-role">
          <span>DOSEN PAPASCI</span>
          <small>Pengelola Pembelajaran</small>
        </div>

        {/* =================================================
            MENU
        ================================================= */}

        <nav className="dosen-sidebar-menu">
          {/* =================================================
              DASHBOARD
          ================================================= */}

          <NavLink
            to="/dosen"
            end
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaHome />
            <span>Dashboard</span>
          </NavLink>

          {/* =================================================
              PEMBELAJARAN
          ================================================= */}

          <div className="dosen-menu-title">PEMBELAJARAN</div>

          {/* MODULE */}

          <NavLink
            to="/dosen/module"
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaBookOpen />
            <span>Module</span>
          </NavLink>

          {/* PRETEST */}

          <NavLink
            to="/dosen/pretest"
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaClipboardCheck />
            <span>Pretest</span>
          </NavLink>

          {/* QUIZ */}

          <NavLink
            to="/dosen/quiz"
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaQuestionCircle />
            <span>Quiz</span>
          </NavLink>

          {/* LAB SIMULASI */}

          <NavLink
            to="/dosen/labsimulasi"
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaFlask />
            <span>Lab Simulasi</span>
          </NavLink>

          {/* =================================================
              MICROTEACHING
          ================================================= */}

          <div className="dosen-menu-title">MICROTEACHING</div>

          {/* VIDEO PEMBELAJARAN */}

          <NavLink
            to="/dosen/video-pembelajaran"
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaChalkboardTeacher />
            <span>Video Pembelajaran</span>
          </NavLink>

          {/* TUGAS */}

          <NavLink
            to="/dosen/tugas"
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaTasks />
            <span>Tugas</span>
          </NavLink>

          {/* PENGUMPULAN */}

          <NavLink
            to="/dosen/pengumpulan"
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaUpload />
            <span>Pengumpulan</span>
          </NavLink>

          {/* =================================================
              KOMPETENSI PEDAGOGIK
          ================================================= */}

          <div className="dosen-menu-title">KOMPETENSI PEDAGOGIK</div>

          <NavLink
            to="/dosen/kompetensi-pedagogik"
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaUserTie />
            <span>Kompetensi Pedagogik</span>
          </NavLink>

          {/* =================================================
              PENILAIAN
          ================================================= */}

          <div className="dosen-menu-title">PENILAIAN</div>

          {/* NILAI MAHASISWA */}

          <NavLink
            to="/dosen/nilai"
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaStar />
            <span>Nilai Mahasiswa</span>
          </NavLink>
        </nav>

        {/* =================================================
            BOTTOM MENU
        ================================================= */}

        <div className="dosen-sidebar-bottom">
          {/* PROFIL */}

          <NavLink
            to="/dosen/profil"
            className={({ isActive }) =>
              `dosen-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileSidebar}
          >
            <FaUserCircle />
            <span>Profil</span>
          </NavLink>

          {/* LOGOUT */}

          <button
            type="button"
            className="dosen-logout-btn"
            onClick={() => logout(navigate)}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default DosenSidebar;
