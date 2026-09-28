import {
  FaUserGraduate,
  FaBookOpen,
  FaClipboardCheck,
  FaTasks,
  FaChartLine,
} from "react-icons/fa";

import "../../css/dosen/DosenDashboard.css";

function DosenDashboard() {
  const statistik = [
    {
      title: "Mahasiswa",
      value: "120",
      description: "Mahasiswa terdaftar",
      icon: <FaUserGraduate />,
      className: "students",
    },
    {
      title: "Module",
      value: "12",
      description: "Materi pembelajaran",
      icon: <FaBookOpen />,
      className: "modules",
    },
    {
      title: "Pretest & Quiz",
      value: "24",
      description: "Evaluasi pembelajaran",
      icon: <FaClipboardCheck />,
      className: "quiz",
    },
    {
      title: "Tugas",
      value: "8",
      description: "Tugas microteaching",
      icon: <FaTasks />,
      className: "tasks",
    },
  ];

  return (
    <div className="dosen-dashboard">
      {/* =========================================
          HEADER
      ========================================= */}

      <div className="dosen-dashboard-header">
        <div>
          <span className="dosen-dashboard-eyebrow">
            <FaChartLine />
            DASHBOARD DOSEN
          </span>

          <h1>Selamat Datang, Dosen 👋</h1>

          <p>
            Kelola materi pembelajaran, evaluasi, laboratorium simulasi,
            microteaching, dan penilaian mahasiswa melalui PAPASCI.
          </p>
        </div>
      </div>

      {/* =========================================
          STATISTIK
      ========================================= */}

      <div className="dosen-statistik-grid">
        {statistik.map((item) => (
          <div
            className={`dosen-statistik-card ${item.className}`}
            key={item.title}
          >
            <div className="dosen-statistik-icon">{item.icon}</div>

            <div className="dosen-statistik-content">
              <span>{item.title}</span>

              <strong>{item.value}</strong>

              <small>{item.description}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DosenDashboard;
