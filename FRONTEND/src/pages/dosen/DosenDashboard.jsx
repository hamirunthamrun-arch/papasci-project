import { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaBookOpen,
  FaClipboardCheck,
  FaTasks,
  FaChartLine,
} from "react-icons/fa";

import "../../css/dosen/DosenDashboard.css";

const API_URL = "http://localhost:5000/api";

function DosenDashboard() {
  const [stats, setStats] = useState({
    mahasiswa: 0,
    modules: 0,
    evaluasi: 0,
    tugas: 0,
  });

  const fetchDashboardStats = async () => {
    try {
      // Ambil token dari localStorage atau sessionStorage berdasarkan key yang benar ("access_token")
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [userRes, moduleRes, pretestRes, quizRes, assignmentRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers }).then((res) => res.json()).catch(() => null),
        fetch(`${API_URL}/modules`, { headers }).then((res) => res.json()).catch(() => null),
        fetch(`${API_URL}/pretests`, { headers }).then((res) => res.json()).catch(() => null),
        fetch(`${API_URL}/quiz`, { headers }).then((res) => res.json()).catch(() => null),
        fetch(`${API_URL}/assignments`, { headers }).then((res) => res.json()).catch(() => null),
      ]);

      const getLength = (res) => {
        if (!res) return 0;
        if (Array.isArray(res)) return res.length;
        if (Array.isArray(res.data)) return res.data.length;
        return 0;
      };

      let totalMahasiswa = 0;
      if (userRes) {
        const users = Array.isArray(userRes) ? userRes : (userRes.data || []);
        totalMahasiswa = users.filter(
          (user) => user.role === "mahasiswa" || !user.role
        ).length;
      }

      setStats({
        mahasiswa: totalMahasiswa,
        modules: getLength(moduleRes),
        evaluasi: getLength(pretestRes) + getLength(quizRes),
        tugas: getLength(assignmentRes),
      });
    } catch (error) {
      console.error("Gagal memuat statistik dashboard dosen:", error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const statistik = [
    {
      title: "Mahasiswa",
      value: stats.mahasiswa,
      description: "Mahasiswa terdaftar",
      icon: <FaUserGraduate />,
      className: "students",
    },
    {
      title: "Module",
      value: stats.modules,
      description: "Materi pembelajaran",
      icon: <FaBookOpen />,
      className: "modules",
    },
    {
      title: "Pretest & Quiz",
      value: stats.evaluasi,
      description: "Evaluasi pembelajaran",
      icon: <FaClipboardCheck />,
      className: "quiz",
    },
    {
      title: "Tugas",
      value: stats.tugas,
      description: "Tugas microteaching",
      icon: <FaTasks />,
      className: "tasks",
    },
  ];

  return (
    <div className="dosen-dashboard">
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