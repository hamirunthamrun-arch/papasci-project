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
  FaExclamationCircle,
  FaCheckCircle,
  FaInfoCircle,
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
  const [loading, setLoading] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nim: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const showSuccess = (text) => {
    setMessage({
      type: "success",
      text,
    });
  };

  /* =========================================
     NORMALISASI ERROR BACKEND
  ========================================== */

  const getRegisterErrorMessage = (status, backendMessage = "") => {
    const text = String(backendMessage).toLowerCase();

    // Email sudah digunakan.
    if (
      text.includes("email already") ||
      text.includes("email sudah terdaftar") ||
      text.includes("email telah terdaftar") ||
      text.includes("user already registered") ||
      text.includes("already registered") ||
      text.includes("duplicate email")
    ) {
      return "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun kamu.";
    }

    // NIM sudah digunakan.
    if (
      text.includes("nim sudah") ||
      text.includes("nim telah") ||
      text.includes("nim already") ||
      (text.includes("duplicate key") && text.includes("nim"))
    ) {
      return "NIM ini sudah terdaftar. Periksa kembali NIM kamu atau hubungi administrator.";
    }

    // Data ditolak karena tidak valid.
    if (
      text.includes("invalid email") ||
      text.includes("email tidak valid") ||
      text.includes("format email")
    ) {
      return "Format email tidak valid. Periksa kembali alamat email kamu.";
    }

    if (
      text.includes("password should") ||
      text.includes("password minimal") ||
      text.includes("weak password")
    ) {
      return "Password belum memenuhi persyaratan. Gunakan password yang sesuai ketentuan.";
    }

    if (status === 409) {
      return "Email atau NIM sudah digunakan. Periksa kembali data yang kamu masukkan.";
    }

    if (status >= 500) {
      return "Server sedang mengalami gangguan. Data belum dapat diproses. Silakan coba lagi nanti.";
    }

    return "Registrasi belum berhasil. Periksa kembali data yang kamu masukkan.";
  };

  /* =========================================
     SUBMIT REGISTER
  ========================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setMessage(null);

    const nama_lengkap = formData.nama_lengkap.trim();
    const nim = formData.nim.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    /* =========================================
       VALIDASI INPUT
    ========================================== */

    if (!nama_lengkap || !nim || !email || !password || !confirmPassword) {
      showError("Semua kolom wajib diisi.");
      return;
    }

    if (/\s/.test(nim)) {
      showError("NIM tidak boleh mengandung spasi.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showError("Format email belum benar. Contoh: nama@email.com.");
      return;
    }

    if (!agreement) {
      showError(
        "Silakan menyetujui ketentuan penggunaan dan kebijakan privasi PAPASCI.",
      );
      return;
    }

    if (password.length < 6) {
      showError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Konfirmasi password tidak sama dengan password.");
      return;
    }

    /* =========================================
       KIRIM REQUEST KE BACKEND
    ========================================== */

    setLoading(true);

    try {
      let response;

      try {
        response = await fetch("http://localhost:5000/api/auth/register", {
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
        });
      } catch (fetchError) {
        console.error("Fetch register gagal:", fetchError);

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
        console.error("Respons register tidak valid:", parseError);

        showError(
          "Server memberikan respons yang tidak dapat dibaca. Registrasi belum dapat dipastikan berhasil. Silakan periksa kembali sebelum mencoba lagi.",
        );

        return;
      }

      /* =========================================
         CEK RESPONSE BACKEND
      ========================================== */

      if (!response.ok || !result?.success) {
        showError(getRegisterErrorMessage(response.status, result?.message));

        return;
      }

      /* =========================================
         REGISTER BERHASIL
      ========================================== */

      setFormData({
        nama_lengkap: "",
        nim: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setAgreement(false);
      setShowPassword(false);
      setShowConfirmPassword(false);

      showSuccess(
        "Registrasi berhasil! Akun kamu sudah dibuat. Kamu akan diarahkan ke halaman login.",
      );

      /* =========================================
         PINDAH KE LOGIN
      ========================================== */

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 2500);
    } catch (error) {
      console.error("Register error:", error);

      showError(
        "Terjadi kesalahan saat memproses registrasi. Silakan coba kembali.",
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
          <div className="register-logo">
            <img
              src={logoPapascI}
              alt="PAPASCI - Papua Adaptive Science Learning"
              className="register-logo-image"
            />
          </div>

          <div className="register-hero">
            <span>BERGABUNG BERSAMA PAPASCI</span>

            <h2>
              Mulai Petualangan
              <strong> Sainsmu! </strong>
            </h2>

            <p>
              Buat akun dan nikmati pengalaman belajar IPA yang interaktif,
              menyenangkan, dan mudah dipahami.
            </p>
          </div>

          <div className="register-science">
            <div className="register-science-main">🔬</div>
            <div className="register-floating one">🌱</div>
            <div className="register-floating two">🧪</div>
            <div className="register-floating three">⚡</div>
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

            <p>Isi data berikut untuk membuat akun pembelajaranmu.</p>
          </div>

          {/* =========================================
              PESAN STATUS
          ========================================== */}

          {message && (
            <div
              className={`register-message register-message-${message.type}`}
              role={message.type === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              <span className="register-message-icon" aria-hidden="true">
                {message.type === "error" ? (
                  <FaExclamationCircle />
                ) : message.type === "success" ? (
                  <FaCheckCircle />
                ) : (
                  <FaInfoCircle />
                )}
              </span>

              <p>{message.text}</p>
            </div>
          )}

          {/* FORM */}

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            {/* NAMA */}

            <div className="register-group">
              <label htmlFor="nama_lengkap">Nama Lengkap</label>

              <div className="register-input">
                <FaUser aria-hidden="true" />

                <input
                  id="nama_lengkap"
                  name="nama_lengkap"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* NIM */}

            <div className="register-group">
              <label htmlFor="nim">Nomor Induk Mahasiswa</label>

              <div className="register-input">
                <FaIdCard aria-hidden="true" />

                <input
                  id="nim"
                  name="nim"
                  type="text"
                  placeholder="Masukkan NIM"
                  value={formData.nim}
                  onChange={handleChange}
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
            </div>

            {/* EMAIL */}

            <div className="register-group">
              <label htmlFor="email">Email</label>

              <div className="register-input">
                <FaEnvelope aria-hidden="true" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="register-group">
              <label htmlFor="password">Password</label>

              <div className="register-input">
                <FaLock aria-hidden="true" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="register-password-toggle"
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

            {/* KONFIRMASI PASSWORD */}

            <div className="register-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>

              <div className="register-input">
                <FaLock aria-hidden="true" />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan konfirmasi password"
                      : "Tampilkan konfirmasi password"
                  }
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* AGREEMENT */}

            <label className="register-agreement">
              <input
                type="checkbox"
                checked={agreement}
                onChange={(e) => {
                  setAgreement(e.target.checked);

                  if (message) {
                    setMessage(null);
                  }
                }}
                disabled={loading}
              />

              <span>
                Saya menyetujui ketentuan penggunaan dan kebijakan privasi
                PAPASCI.
              </span>
            </label>

            {/* BUTTON */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              <span>{loading ? "Mendaftarkan..." : "Buat Akun"}</span>

              {!loading && <FaArrowRight aria-hidden="true" />}
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
