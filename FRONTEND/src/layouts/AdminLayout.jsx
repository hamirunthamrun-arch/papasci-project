import { useState } from "react";
import { FaBars } from "react-icons/fa";

import AdminSidebar from "../components/AdminSidebar.jsx";

import "../layouts/AdminLayout.css";

const AdminLayout = ({ children }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const openSidebar = () => {
    setShowMobileSidebar(true);
  };

  const closeSidebar = () => {
    setShowMobileSidebar(false);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar
        showMobileSidebar={showMobileSidebar}
        closeMobileSidebar={closeSidebar}
      />

      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <button
          className="admin-mobile-menu-btn"
          onClick={openSidebar}
          aria-label="Buka menu"
        >
          <FaBars />
        </button>

        <strong>Admin PAPASCI</strong>
      </header>

      {/* Main Content */}
      <main className="admin-content">{children}</main>
    </div>
  );
};

export default AdminLayout;
