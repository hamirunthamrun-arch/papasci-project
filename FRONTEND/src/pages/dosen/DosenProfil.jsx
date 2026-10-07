import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

import {
  FaUserCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaIdCard,
  FaChalkboardTeacher,
} from "react-icons/fa";

import { getAccessToken } from "../../service/authService";

import "../../css/dosen/DosenProfil.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function DosenProfil() {
  /* =========================================================
     STATE PROFIL
  ========================================================= */

  const [profile, setProfile] = useState({
    nama: "",
    nidn: "",
    email: "",
    role: "",
  });

  /* =========================================================
     STATE FORM
  ========================================================= */

  const [formData, setFormData] = useState({
    nama: "",
    nidn: "",
    email: "",
    role: "",
  });

  /* =========================================================
     STATE
  ========================================================= */

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     AUTH HEADERS
  ========================================================= */

  const getAuthHeaders = useCallback(async () => {
    const token = await getAccessToken();

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Konfigurasi Supabase tidak ditemukan.");
    }

    if (!token) {
      throw new Error("Sesi login tidak ditemukan.");
    }

    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  /* =========================================================
     GET CURRENT USER
  ========================================================= */

  const getCurrentUser = useCallback(async () => {
    const headers = await getAuthHeaders();

    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data pengguna.");
    }

    return response.json();
  }, [getAuthHeaders]);

  /* =========================================================
     GET PROFILE
  ========================================================= */

  const getProfile = useCallback(
    async (userId) => {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=id,nama_lengkap,email,role,nim&id=eq.${userId}`,
        {
          method: "GET",
          headers,
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data profil.");
      }

      const data = await response.json();

      return data[0] || null;
    },
    [getAuthHeaders],
  );

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        /* =========================================
           GET USER LOGIN
        ========================================= */

        const authUser = await getCurrentUser();

        if (!authUser?.id) {
          throw new Error("Data pengguna tidak ditemukan.");
        }

        /* =========================================
           GET PROFILE SUPABASE
        ========================================= */

        const data = await getProfile(authUser.id);

        if (!data) {
          throw new Error("Profil dosen tidak ditemukan.");
        }

        /* =========================================
           MAPPING DATA
        ========================================= */

        const profileData = {
          nama:
            data.nama_lengkap ||
            authUser.user_metadata?.nama_lengkap ||
            authUser.user_metadata?.nama ||
            "",

          /*
           * NIDN menggunakan kolom nim
           * di tabel profiles
           */
          nidn: data.nim || "",

          email: data.email || authUser.email || "",

          role: data.role || "dosen",
        };

        setProfile(profileData);
        setFormData(profileData);
      } catch (err) {
        console.error("Gagal memuat profil dosen:", err);

        setError(err.message || "Gagal memuat data profil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [getCurrentUser, getProfile]);

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     EDIT PROFIL
  ========================================================= */

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
    setError("");
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setError("");
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      /* =========================================
         GET AUTH USER
      ========================================= */

      const authUser = await getCurrentUser();

      if (!authUser?.id) {
        throw new Error("Data pengguna tidak ditemukan.");
      }

      /* =========================================
         GET AUTH HEADERS
      ========================================= */

      const headers = await getAuthHeaders();

      /* =========================================
         UPDATE PROFILE
      ========================================= */

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${authUser.id}`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            nama_lengkap: formData.nama,
            nim: formData.nidn,
            email: formData.email,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.error("Supabase update error:", errorData);

        throw new Error(errorData?.message || "Gagal memperbarui profil.");
      }

      /* =========================================
         UPDATE STATE
      ========================================= */

      const updatedProfile = {
        ...profile,
        nama: formData.nama,
        nidn: formData.nidn,
        email: formData.email,
      };

      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);

      alert("Profil berhasil diperbarui.");
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);

      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="dosen-profile-page">
        <Container fluid>
          <div className="dosen-profile-header">
            <div>
              <span className="dosen-profile-label">PROFIL DOSEN</span>

              <h1>Profil Saya</h1>

              <p>Memuat informasi profil dosen...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="dosen-profile-page">
      <Container fluid>
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="dosen-profile-header">
          <div>
            <span className="dosen-profile-label">PROFIL DOSEN</span>

            <h1>Profil Saya</h1>

            <p>Kelola informasi akun dan profil dosen PAPASCI.</p>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* =================================================
            PROFILE HEADER CARD
        ================================================= */}

        <Card className="dosen-profile-main-card">
          <Card.Body>
            <div className="dosen-profile-user-header">
              <div className="dosen-profile-avatar">
                <FaUserCircle />
              </div>

              <div className="dosen-profile-user-info">
                <h2>{profile.nama}</h2>

                <div className="dosen-profile-role">
                  <FaChalkboardTeacher />

                  <span>{profile.role}</span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* =================================================
            PROFILE INFORMATION
        ================================================= */}

        <Row className="g-4">
          <Col lg={12}>
            <Card className="dosen-profile-card">
              <Card.Body>
                <div className="dosen-profile-card-header">
                  <div>
                    <h3>Informasi Profil</h3>

                    <p>Informasi dasar akun dosen.</p>
                  </div>

                  {!isEditing && (
                    <Button
                      className="dosen-profile-edit-btn"
                      onClick={handleEdit}
                    >
                      <FaEdit />
                      Edit Profil
                    </Button>
                  )}
                </div>

                <Form>
                  <Row className="g-3">
                    {/* =====================================
                        NAMA
                    ===================================== */}

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Nama Lengkap</Form.Label>

                        <div className="dosen-profile-input-wrapper">
                          <FaUserCircle />

                          <Form.Control
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    {/* =====================================
                        NIDN
                    ===================================== */}

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>NIDN</Form.Label>

                        <div className="dosen-profile-input-wrapper">
                          <FaIdCard />

                          <Form.Control
                            type="text"
                            name="nidn"
                            value={formData.nidn}
                            onChange={handleChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    {/* =====================================
                        EMAIL
                    ===================================== */}

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>

                        <div className="dosen-profile-input-wrapper">
                          <FaEnvelope />

                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    {/* =====================================
                        ROLE
                    ===================================== */}

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Role</Form.Label>

                        <div className="dosen-profile-input-wrapper">
                          <FaChalkboardTeacher />

                          <Form.Control
                            type="text"
                            value={formData.role}
                            disabled
                          />
                        </div>

                        <Form.Text>Role akun ditentukan oleh sistem.</Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* =====================================
                      EDIT BUTTONS
                  ===================================== */}

                  {isEditing && (
                    <div className="dosen-profile-form-actions">
                      <Button
                        type="button"
                        className="dosen-profile-cancel-btn"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <FaTimes />
                        Batal
                      </Button>

                      <Button
                        type="button"
                        className="dosen-profile-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <FaSave />

                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DosenProfil;
