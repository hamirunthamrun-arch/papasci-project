import { useState } from "react";
import {
  FaBars,
  FaChalkboardTeacher,
} from "react-icons/fa";

import DosenSidebar from "../components/DosenSidebar";

import "../layouts/DosenLayout.css";

function DosenLayout({ children }) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const openSidebar = () => {
    setShowMobileSidebar(true);
  };

  const closeSidebar = () => {
    setShowMobileSidebar(false);
  };

  return (
    <div className="dosen-layout">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <DosenSidebar
        showMobileSidebar={showMobileSidebar}
        closeMobileSidebar={closeSidebar}
      />

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="dosen-main-content">

        {/* =======================================
            MOBILE HEADER
        ======================================= */}

        <header className="dosen-mobile-header">

          <button
            type="button"
            className="dosen-mobile-menu-btn"
            onClick={openSidebar}
            aria-label="Buka menu"
          >
            <FaBars />
          </button>

          <div className="dosen-mobile-title">
            <FaChalkboardTeacher />

            <div>
              <strong>DOSEN PAPASCI</strong>
              <small>Pengelola Pembelajaran</small>
            </div>
          </div>

        </header>

        {/* =======================================
            PAGE CONTENT
        ======================================= */}

        <div className="dosen-content-wrapper">
          {children}
        </div>

      </main>
    </div>
  );
}

export default DosenLayout;