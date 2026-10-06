import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

import "../css/Login.css";

import logoPapascI from "../assets/logo-papasci.png";
import logoKemendikdasmen from "../assets/logo-kemendikdasmen.jpg";
import logoUnipa from "../assets/logo-unipa.png";
import logoKemdiktisaintek from "../assets/logo-kemdiktisaintek.png";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /* =========================================
     HANDLE INPUT
  ========================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Hapus pesan lama ketika pengguna mulai memperbaiki input.
    if (message) {
      setMessage(null);
    }
  };

  /* =========================================
     TAMPILKAN PESAN
  ========================================== */

  const showError = (text) => {
    setMessage({
      type: "error",
      text,
    });
  };

  /* =========================================
     NORMALISASI PESAN LOGIN
  ========================================== */

  const getLoginErrorMessage = (status, backendMessage = "") => {
    const errorText = String(backendMessage).toLowerCase();

    // Informasi akun belum diverifikasi.
    if (
      errorText.includes("email not confirmed") ||
      errorText.includes("email belum diverifikasi") ||
      errorText.includes("email belum terverifikasi")
    ) {
      return "Email kamu belum diverifikasi. Silakan periksa email terlebih dahulu.";
    }

    // Pesan autentikasi yang tidak boleh membingungkan pengguna.
    if (
      status === 401 ||
      status === 400 ||
      errorText.includes("invalid login credentials") ||
      errorText.includes("invalid credentials") ||
      errorText.includes("invalid password") ||
      errorText.includes("wrong password") ||
      errorText.includes("incorrect password") ||
      errorText.includes("email atau password") ||
      errorText.includes("password salah") ||
      errorText.includes("unauthorized")
    ) {
      return "Email atau password salah. Periksa kembali data yang kamu masukkan.";
    }

    if (status >= 500) {
      return "Server sedang mengalami gangguan. Silakan coba beberapa saat lagi.";
    }

    return "Login belum berhasil. Periksa kembali data kamu dan coba lagi.";
  };

  /* =========================================
     LOGIN
  ========================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setMessage(null);

    const email = formData.email.trim();
    const password = formData.password;

    /* =========================================
       VALIDASI INPUT
    ========================================== */

    if (!email && !password) {
      showError("Email dan password wajib diisi.");
      return;
    }

    if (!email) {
      showError("Email wajib diisi.");
      return;
    }

    if (!password) {
      showError("Password wajib diisi.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showError("Format email belum benar. Contoh: nama@email.com.");
      return;
    }

    setLoading(true);

    try {
      /* =========================================
         REQUEST KE BACKEND
      ========================================== */

      let response;

      try {
        response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
      } catch (fetchError) {
        // Fetch gagal sebelum mendapatkan respons HTTP.
        console.error("Fetch login gagal:", fetchError);

        showError(
          "Tidak dapat terhubung ke server. Pastikan backend berjalan dan koneksi tersedia, lalu coba lagi.",
        );

        return;
      }

      /* =========================================
         BACA RESPONSE
      ========================================== */

      let result;

      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Respons login tidak valid:", parseError);

        showError(
          "Server memberikan respons yang tidak dapat dibaca. Silakan coba lagi.",
        );

        return;
      }

      /* =========================================
         CEK STATUS LOGIN
      ========================================== */

      if (!response.ok || !result?.success) {
        showError(getLoginErrorMessage(response.status, result?.message));

        return;
      }

      /* =========================================
         CEK DATA SESSION
      ========================================== */

      if (
        !result.session?.access_token ||
        !result.session?.refresh_token ||
        !result.user
      ) {
        showError(
          "Login berhasil diproses, tetapi data sesi tidak lengkap. Silakan coba lagi.",
        );

        return;
      }

      /* =========================================
         CEK ROLE PENGGUNA
      ========================================== */

      const role = result.user.role;

      let destination;

      if (role === "admin") {
        destination = "/admin";
      } else if (role === "dosen") {
        destination = "/dosen";
      } else if (role === "mahasiswa") {
        destination = "/";
      } else {
        showError("Role akun tidak dikenali. Silakan hubungi administrator.");

        return;
      }

      /* =========================================
         SIMPAN SESSION
      ========================================== */

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("access_token", result.session.access_token);
      storage.setItem("refresh_token", result.session.refresh_token);
      storage.setItem("user", JSON.stringify(result.user));

      /* =========================================
         REDIRECT
      ========================================== */

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      showError(
        "Terjadi kesalahan saat memproses login. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     RENDER
  ========================================== */

  return (
    <div className="auth-page">
      {/* =========================================
          LEFT BRANDING
      ========================================== */}

      <section className="auth-brand">
        <div className="auth-brand-content">
          <div className="papasci-brand">
            <img
              src={logoPapascI}
              alt="PAPASCI - Papua Adaptive Science Learning"
              className="papasci-brand-logo"
            />
          </div>

          <div className="auth-hero">
            <span className="auth-badge">MEDIA PEMBELAJARAN IPA</span>

            <h2>
              Jelajahi Dunia
              <span> Sains </span>
              dengan Cara yang Menyenangkan!
            </h2>

            <p>
              Belajar IPA menjadi lebih menarik melalui materi interaktif,
              simulasi, kuis, dan aktivitas pembelajaran.
            </p>
          </div>

          <div className="science-illustration">
            <div className="science-circle circle-one">⚛</div>
            <div className="science-circle circle-two">🌱</div>
            <div className="science-circle circle-three">🔬</div>
            <div className="science-main-icon">🧪</div>
          </div>

          <div className="institution-section">
            <p>DIDUKUNG OLEH</p>

            <div className="institution-logos">
              <div className="institution-logo">
                <img
                  src={logoKemendikdasmen}
                  alt="Logo Kementerian Pendidikan"
                />
                <small>
                  Kementerian
                  <br />
                  Pendidikan
                </small>
              </div>

              <div className="institution-logo">
                <img src={logoUnipa} alt="Logo Universitas Papua" />
                <small>
                  Universitas
                  <br />
                  Papua
                </small>
              </div>

              <div className="institution-logo">
                <img
                  src={logoKemdiktisaintek}
                  alt="Logo Kementerian Diktisaintek"
                />
                <small>
                  Kementerian
                  <br />
                  Diktisaintek
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          RIGHT FORM
      ========================================== */}

      <section className="auth-form-section">
        <div className="auth-form-container">
          {/* MOBILE BRAND */}

          <div className="mobile-brand">
            <img
              src={logoPapascI}
              alt="PAPASCI - Papua Adaptive Science Learning"
              className="mobile-brand-logo"
            />
          </div>

          {/* FORM HEADER */}

          <div className="auth-form-header">
            <span className="auth-form-label">SELAMAT DATANG</span>

            <h2>Masuk ke PAPASCI</h2>

            <p>Silakan masuk untuk melanjutkan perjalanan belajar sainsmu.</p>
          </div>

          {/* =========================================
              MESSAGE
          ========================================== */}

          {message && (
            <div
              className={`auth-message auth-message-${message.type}`}
              role={message.type === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              <span className="auth-message-icon" aria-hidden="true">
                {message.type === "error" ? (
                  <FaExclamationCircle />
                ) : (
                  <FaInfoCircle />
                )}
              </span>

              <p>{message.text}</p>
            </div>
          )}

          {/* =========================================
              LOGIN FORM
          ========================================== */}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="email">Email</label>

              <div
                className={`input-wrapper ${
                  message?.type === "error" ? "input-has-message" : ""
                }`}
              >
                <FaEnvelope aria-hidden="true" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email kamu"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  disabled={loading}
                  aria-label="Email"
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password">Password</label>
              </div>

              <div className="input-wrapper">
                <FaLock aria-hidden="true" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                  aria-label="Password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* REMEMBER */}

            <div className="remember-row">
              <label className="remember-check">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />

                <span>Ingat saya</span>
              </label>
            </div>

            {/* BUTTON */}

            <button type="submit" className="auth-submit" disabled={loading}>
              <span>{loading ? "Memproses..." : "Masuk"}</span>

              {!loading && <FaArrowRight aria-hidden="true" />}
            </button>
          </form>

          {/* REGISTER */}

          <div className="auth-switch">
            <span>Belum punya akun?</span>
            <Link to="/register">Daftar sekarang</Link>
          </div>

          {/* FOOTER */}

          <div className="auth-footer">
            <p>© 2026 PAPASCI</p>
            <span>Papua Adaptive Science Learning</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
