import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
} from "react-bootstrap";

import {
  FaUserCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaIdCard,
  FaChalkboardTeacher,
} from "react-icons/fa";

import "../../css/dosen/DosenProfil.css";

function DosenProfil() {
  /* =========================================================
     DATA PROFIL DUMMY
  ========================================================= */

  const [profile, setProfile] = useState({
    nama: "Dr. Maria Natalia, S.Pd., M.Pd.",
    nidn: "0012345678",
    email: "maria@papasci.ac.id",
    role: "Dosen",
  });

  /* =========================================================
     STATE EDIT
  ========================================================= */

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(profile);

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
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);

    alert("Profil berhasil diperbarui.");
  };

  return (
    <div className="dosen-profile-page">
      <Container fluid>
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="dosen-profile-header">
          <div>
            <span className="dosen-profile-label">
              PROFIL DOSEN
            </span>

            <h1>Profil Saya</h1>

            <p>
              Kelola informasi akun dan profil dosen PAPASCI.
            </p>
          </div>
        </div>

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

                    <p>
                      Informasi dasar akun dosen.
                    </p>
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
                    {/* =================================================
                        NAMA
                    ================================================= */}

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>
                          Nama Lengkap
                        </Form.Label>

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

                    {/* =================================================
                        NIDN
                    ================================================= */}

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          NIDN
                        </Form.Label>

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

                    {/* =================================================
                        EMAIL
                    ================================================= */}

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          Email
                        </Form.Label>

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

                    {/* =================================================
                        ROLE
                    ================================================= */}

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>
                          Role
                        </Form.Label>

                        <div className="dosen-profile-input-wrapper">
                          <FaChalkboardTeacher />

                          <Form.Control
                            type="text"
                            value={formData.role}
                            disabled
                          />
                        </div>

                        <Form.Text>
                          Role akun ditentukan oleh sistem.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* =================================================
                      EDIT BUTTONS
                  ================================================= */}

                  {isEditing && (
                    <div className="dosen-profile-form-actions">
                      <Button
                        className="dosen-profile-cancel-btn"
                        onClick={handleCancel}
                      >
                        <FaTimes />
                        Batal
                      </Button>

                      <Button
                        className="dosen-profile-save-btn"
                        onClick={handleSave}
                      >
                        <FaSave />
                        Simpan Perubahan
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