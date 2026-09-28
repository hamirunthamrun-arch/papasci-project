import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FaBars } from "react-icons/fa";

import logoPapascI from "../assets/logo-papasci.png";

import Sidebar from "../components/SideBar";

import "./MainLayout.css";

function MainLayout() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const openSidebar = () => {
    setShowMobileSidebar(true);
  };

  const closeSidebar = () => {
    setShowMobileSidebar(false);
  };

  return (
    <div className="main-layout">
      {/* SIDEBAR */}

      <Sidebar
        showMobileSidebar={showMobileSidebar}
        closeMobileSidebar={closeSidebar}
      />

      {/* OVERLAY */}

      {showMobileSidebar && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* MAIN */}

      <main className="main-content">
   {/* MOBILE HEADER */}

<div className="mobile-header">

  <button
    type="button"
    className="mobile-menu-button"
    onClick={openSidebar}
    aria-label="Buka menu"
  >
    <FaBars />
  </button>

  <div className="mobile-header-logo">
    <img
      src={logoPapascI}
      alt="PAPASCI - Papua Adaptive Science Learning"
    />
  </div>

</div>
        {/* PAGE */}

        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
