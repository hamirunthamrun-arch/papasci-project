import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa";

import "../css/Login.css";

import logoPapascI from "../assets/logo-papasci.png";
import logoKemendikdasmen from "../assets/logo-kemendikdasmen.jpg";
import logoUnipa from "../assets/logo-unipa.png";
import logoKemdiktisaintek from "../assets/logo-kemdiktisaintek.png";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  /* =========================================
     FORM DATA
  ========================================== */

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /* =========================================
     STATUS
  ========================================== */

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  /* =========================================
     HANDLE INPUT
  ========================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
  };

  /* =========================================
     LOGIN
  ========================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    const { email, password } = formData;

    /* =========================================
       VALIDASI
    ========================================== */

    if (!email || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      /* =========================================
         REQUEST KE BACKEND
      ========================================== */

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      /* =========================================
         CEK RESPONSE
      ========================================== */

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login gagal.");
      }

      /* =========================================
         SIMPAN SESSION
      ========================================== */

      const storage = rememberMe ? localStorage : sessionStorage;

      /* Simpan access token */
      storage.setItem("access_token", result.session.access_token);

      /* Simpan refresh token */
      storage.setItem("refresh_token", result.session.refresh_token);

      /* Simpan data user + role */
      storage.setItem("user", JSON.stringify(result.user));

      /* =========================================
         REDIRECT BERDASARKAN ROLE
      ========================================== */

      if (result.user.role === "admin") {
        navigate("/admin");
      } else if (result.user.role === "dosen") {
        navigate("/dosen");
      } else if (result.user.role === "mahasiswa") {
        navigate("/");
      } else {
        throw new Error("Role pengguna tidak dikenali.");
      }
    } catch (error) {
      console.error("Login error:", error);

      setErrorMessage(error.message || "Email atau password tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* =========================================
          LEFT BRANDING
      ========================================== */}

      <section className="auth-brand">
        <div className="auth-brand-content">
          {/* BRAND */}

          <div className="papasci-brand">
            <img
              src={logoPapascI}
              alt="PAPASCI - Papua Adaptive Science Learning"
              className="papasci-brand-logo"
            />
          </div>

          {/* HERO TEXT */}

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

          {/* SCIENCE DECORATION */}

          <div className="science-illustration">
            <div className="science-circle circle-one">⚛</div>

            <div className="science-circle circle-two">🌱</div>

            <div className="science-circle circle-three">🔬</div>

            <div className="science-main-icon">🧪</div>
          </div>

          {/* LOGOS */}

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
              ERROR MESSAGE
          ========================================== */}

          {errorMessage && (
            <div className="auth-message auth-error">{errorMessage}</div>
          )}

          {/* =========================================
              LOGIN FORM
          ========================================== */}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="email">Email</label>

              <div className="input-wrapper">
                <FaEnvelope />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email kamu"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password">Password</label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setErrorMessage(
                      "Fitur lupa password akan kita buat pada tahap berikutnya.",
                    )
                  }
                >
                  Lupa password?
                </button>
              </div>

              <div className="input-wrapper">
                <FaLock />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  onClick={() => setShowPassword(!showPassword)}
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
                />

                <span>Ingat saya</span>
              </label>
            </div>

            {/* BUTTON */}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}

              {!loading && <FaArrowRight />}
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
