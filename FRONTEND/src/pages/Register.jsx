import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaIdCard,
  FaArrowRight,
} from "react-icons/fa";

import "../css/Register.css";

import logoPapascI from "../assets/logo-papasci.png";

import logoKemendikdasmen from "../assets/logo-kemendikdasmen.jpg";
import logoUnipa from "../assets/logo-unipa.png";
import logoKemdiktisaintek from "../assets/logo-kemdiktisaintek.png";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* =========================================
     FORM DATA
  ========================================== */

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nim: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /* =========================================
     STATUS
  ========================================== */

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [agreement, setAgreement] = useState(false);

  /* =========================================
     HANDLE INPUT
  ========================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Hilangkan pesan error ketika user mulai memperbaiki form
    setErrorMessage("");
  };

  /* =========================================
     SUBMIT REGISTER
  ========================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const {
      nama_lengkap,
      nim,
      email,
      password,
      confirmPassword,
    } = formData;

    /* =========================================
       VALIDASI
    ========================================== */

    if (
      !nama_lengkap ||
      !nim ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Semua data wajib diisi.");
      return;
    }

    if (!agreement) {
      setErrorMessage(
        "Silakan menyetujui ketentuan penggunaan dan kebijakan privasi."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak sama.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password minimal 6 karakter.");
      return;
    }

    /* =========================================
       KIRIM KE BACKEND
    ========================================== */

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            nama_lengkap,
            nim,
            email,
            password,
          }),
        }
      );

      const result = await response.json();

      /* =========================================
         CEK RESPONSE BACKEND
      ========================================== */

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Registrasi gagal."
        );
      }

      /* =========================================
         REGISTER BERHASIL
      ========================================== */

      setSuccessMessage(
        "Registrasi berhasil! Silakan login menggunakan akun yang telah dibuat."
      );

      setFormData({
        nama_lengkap: "",
        nim: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setAgreement(false);

      /* =========================================
         PINDAH KE LOGIN
      ========================================== */

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Register error:", error);

      setErrorMessage(
        error.message ||
          "Terjadi kesalahan saat melakukan registrasi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* =========================================
          LEFT BRANDING
      ========================================== */}

      <section className="register-brand">
        <div className="register-brand-content">
          {/* PAPASCI LOGO */}

          <div className="register-logo">
            <img
              src={logoPapascI}
              alt="PAPASCI - Papua Adaptive Science Learning"
              className="register-logo-image"
            />
          </div>

          {/* HERO */}

          <div className="register-hero">
            <span>BERGABUNG BERSAMA PAPASCI</span>

            <h2>
              Mulai Petualangan
              <strong> Sainsmu! </strong>
            </h2>

            <p>
              Buat akun dan nikmati pengalaman belajar IPA yang
              interaktif, menyenangkan, dan mudah dipahami.
            </p>
          </div>

          {/* SCIENCE DECORATION */}

          <div className="register-science">
            <div className="register-science-main">🔬</div>

            <div className="register-floating one">🌱</div>

            <div className="register-floating two">🧪</div>

            <div className="register-floating three">⚡</div>
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
                <img
                  src={logoUnipa}
                  alt="Logo Universitas Papua"
                />

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
          REGISTER FORM
      ========================================== */}

      <section className="register-form-section">
        <div className="register-form-container">
          {/* MOBILE BRAND */}

          <div className="register-mobile-brand">
            <img
              src={logoPapascI}
              alt="PAPASCI - Papua Adaptive Science Learning"
              className="register-mobile-logo"
            />
          </div>

          {/* HEADER */}

          <div className="register-header">
            <span>BUAT AKUN</span>

            <h2>Daftar di PAPASCI</h2>

            <p>
              Isi data berikut untuk membuat akun pembelajaranmu.
            </p>
          </div>

          {/* =========================================
              PESAN ERROR
          ========================================== */}

          {errorMessage && (
            <div className="register-message register-error">
              {errorMessage}
            </div>
          )}

          {/* =========================================
              PESAN SUCCESS
          ========================================== */}

          {successMessage && (
            <div className="register-message register-success">
              {successMessage}
            </div>
          )}

          {/* FORM */}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >
            {/* =========================================
                NAMA
            ========================================== */}

            <div className="register-group">
              <label htmlFor="nama_lengkap">
                Nama Lengkap
              </label>

              <div className="register-input">
                <FaUser />

                <input
                  id="nama_lengkap"
                  name="nama_lengkap"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* =========================================
                NIM
            ========================================== */}

            <div className="register-group">
              <label htmlFor="nim">
                Nomor Induk Mahasiswa
              </label>

              <div className="register-input">
                <FaIdCard />

                <input
                  id="nim"
                  name="nim"
                  type="text"
                  placeholder="Masukkan NIM"
                  value={formData.nim}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* =========================================
                EMAIL
            ========================================== */}

            <div className="register-group">
              <label htmlFor="email">
                Email
              </label>

              <div className="register-input">
                <FaEnvelope />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* =========================================
                PASSWORD
            ========================================== */}

            <div className="register-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="register-input">
                <FaLock />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="Buat password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            {/* =========================================
                CONFIRM PASSWORD
            ========================================== */}

            <div className="register-group">
              <label htmlFor="confirmPassword">
                Konfirmasi Password
              </label>

              <div className="register-input">
                <FaLock />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            {/* =========================================
                AGREEMENT
            ========================================== */}

            <label className="register-agreement">
              <input
                type="checkbox"
                checked={agreement}
                onChange={(e) =>
                  setAgreement(e.target.checked)
                }
              />

              <span>
                Saya menyetujui ketentuan penggunaan dan
                kebijakan privasi PAPASCI.
              </span>
            </label>

            {/* =========================================
                BUTTON
            ========================================== */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Mendaftarkan..." : "Buat Akun"}

              {!loading && <FaArrowRight />}
            </button>
          </form>

          {/* LOGIN */}

          <div className="register-login">
            <span>Sudah punya akun?</span>

            <Link to="/login">Masuk sekarang</Link>
          </div>

          {/* FOOTER */}

          <div className="register-footer">
            © 2026 PAPASCI · Papua Adaptive Science Learning
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;