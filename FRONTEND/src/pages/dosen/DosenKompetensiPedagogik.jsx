import { useState } from "react";
import {
  Button,
  Container,
  Form,
  Modal,
} from "react-bootstrap";

import {
  FaClipboardCheck,
  FaEdit,
  FaSearch,
  FaSave,
  FaTimes,
  FaUserGraduate,
} from "react-icons/fa";

import "../../css/dosen/DosenKompetensiPedagogik.css";

/* =========================================================
   DATA KOMPETENSI PEDAGOGIK
========================================================= */

const kompetensiData = [
  {
    no: "01",
    title:
      "Menguasai karakteristik peserta didik dari aspek fisik, moral, spiritual, sosial, kultural, emosional dan intelektual",
    pemahaman:
      "Guru mengenali peserta didik secara utuh agar strategi, bahasa, kelompok belajar, dan dukungan yang diberikan tidak seragam secara membuta.",
    indikator:
      "Memiliki data identifikasi gaya belajar, kesulitan, dan latar belakang siswa serta memberi perlakuan berbeda sesuai kebutuhan.",
    bukti:
      "Catatan anekdot, asesmen awal, daftar kelompok belajar",
    teknik: "Observasi kelas, telaah dokumen",
  },
  {
    no: "02",
    title:
      "Menguasai teori belajar dan prinsip-prinsip pembelajaran yang mendidik",
    pemahaman:
      "Guru memilih teori dan pendekatan yang sesuai dengan tujuan, karakteristik materi IPA, perkembangan peserta didik, dan konteks belajar.",
    indikator:
      "Menerapkan teori belajar yang sesuai, pendekatan saintifik, pembelajaran berdiferensiasi, dan prinsip pembelajaran yang mendidik.",
    bukti:
      "RPP/modul ajar yang mencantumkan teori dan pendekatan",
    teknik: "Telaah RPP, wawancara",
  },
  {
    no: "03",
    title:
      "Mengembangkan kurikulum terkait dengan mata pelajaran yang diampu",
    pemahaman:
      "Guru menerjemahkan kurikulum menjadi pengalaman belajar IPA yang bermakna, terukur, dan relevan dengan konteks lokal Papua/Sorong.",
    indikator:
      "Menjabarkan CP menjadi TP dan ATP, memilih materi kontekstual, serta menyusun silabus dan modul ajar.",
    bukti:
      "Silabus, TP–ATP, modul ajar",
    teknik: "Telaah dokumen",
  },
  {
    no: "04",
    title:
      "Menyelenggarakan pembelajaran yang mendidik",
    pemahaman:
      "Guru menciptakan pembelajaran berpusat pada siswa melalui pembukaan yang bermakna, pengelolaan kelas, metode bervariasi, dan refleksi.",
    indikator:
      "Membuka, mengelola, melaksanakan, dan menutup pembelajaran dengan aktivitas yang aktif, aman, inklusif, dan reflektif.",
    bukti:
      "RPP/modul ajar dan rekaman pelaksanaan pembelajaran",
    teknik: "Observasi langsung",
  },
  {
    no: "05",
    title:
      "Memanfaatkan teknologi informasi dan komunikasi untuk kepentingan pembelajaran",
    pemahaman:
      "Teknologi dipakai untuk memperjelas konsep, memperluas akses, memberi umpan balik, dan mendukung pembelajaran offline–first bukan sekadar hiasan.",
    indikator:
      "Menggunakan LCD, video, LMS, Canva, Quizizz, atau HP secara pedagogis sesuai tujuan dan akses peserta didik.",
    bukti:
      "Media ajar, tautan kuis, screenshot, dan log aktivitas LMS",
    teknik: "Observasi, cek file",
  },
];

/* =========================================================
   DATA MAHASISWA
========================================================= */

const initialStudents = [
  {
    id: 1,
    nama: "Andi Saputra",
    nim: "20240001",
    nilai: [85, 90, 78, 88, 82],
  },
  {
    id: 2,
    nama: "Budi Pratama",
    nim: "20240002",
    nilai: [78, 82, 75, 80, 79],
  },
  {
    id: 3,
    nama: "Citra Lestari",
    nim: "20240003",
    nilai: [90, 88, 92, 94, 89],
  },
  {
    id: 4,
    nama: "Dina Wulandari",
    nim: "20240004",
    nilai: [80, 76, 82, 78, 85],
  },
  {
    id: 5,
    nama: "Eka Putri",
    nim: "20240005",
    nilai: [92, 94, 90, 91, 93],
  },
  {
    id: 6,
    nama: "Fajar Ramadhan",
    nim: "20240006",
    nilai: [76, 84, 80, 78, 82],
  },
];

/* =========================================================
   FUNGSI STATUS KATEGORI
========================================================= */

const getKategori = (nilai) => {
  if (nilai === "" || nilai === null || nilai === undefined) {
    return {
      label: "Belum Dinilai",
      className: "belum",
    };
  }

  const score = Number(nilai);

  if (score >= 86) {
    return {
      label: "Sangat Baik",
      className: "sangat-baik",
    };
  }

  if (score >= 76) {
    return {
      label: "Baik",
      className: "baik",
    };
  }

  if (score >= 66) {
    return {
      label: "Cukup",
      className: "cukup",
    };
  }

  return {
    label: "Perlu Pengembangan",
    className: "perlu-pengembangan",
  };
};

/* =========================================================
   COMPONENT
========================================================= */

function DosenKompetensiPedagogik() {
  const [students, setStudents] = useState(initialStudents);

  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [showModal, setShowModal] = useState(false);

  const [nilaiForm, setNilaiForm] = useState([]);

  /* =======================================================
     FILTER MAHASISWA
  ======================================================= */

  const filteredStudents = students.filter((student) => {
    const keyword = search.toLowerCase();

    return (
      student.nama.toLowerCase().includes(keyword) ||
      student.nim.toLowerCase().includes(keyword)
    );
  });

  /* =======================================================
     BUKA PENILAIAN
  ======================================================= */

  const handleOpenAssessment = (student) => {
    setSelectedStudent(student);

    setNilaiForm([...student.nilai]);

    setShowModal(true);
  };

  /* =======================================================
     TUTUP MODAL
  ======================================================= */

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setNilaiForm([]);
  };

  /* =======================================================
     UBAH NILAI
  ======================================================= */

  const handleScoreChange = (index, value) => {
    if (value === "") {
      const updated = [...nilaiForm];

      updated[index] = "";

      setNilaiForm(updated);

      return;
    }

    const score = Number(value);

    if (score < 0 || score > 100) {
      return;
    }

    const updated = [...nilaiForm];

    updated[index] = score;

    setNilaiForm(updated);
  };

  /* =======================================================
     SIMPAN PENILAIAN
  ======================================================= */

  const handleSaveAssessment = () => {
    if (!selectedStudent) return;

    const updatedStudents = students.map((student) => {
      if (student.id === selectedStudent.id) {
        return {
          ...student,
          nilai: nilaiForm,
        };
      }

      return student;
    });

    setStudents(updatedStudents);

    setSelectedStudent({
      ...selectedStudent,
      nilai: nilaiForm,
    });

    alert("Penilaian kompetensi berhasil disimpan.");
  };

  return (
    <div className="dosen-kompetensi-page">
      <Container fluid>
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="dosen-kompetensi-header">
          <div>
            <span className="dosen-kompetensi-label">
              PENILAIAN DOSEN
            </span>

            <h1>Kompetensi Pedagogik</h1>

            <p>
              Penilaian kompetensi pedagogik mahasiswa sebagai
              calon guru.
            </p>
          </div>

          <div className="dosen-kompetensi-header-icon">
            <FaClipboardCheck />
          </div>
        </div>

        {/* =================================================
            INFO
        ================================================= */}

        <div className="dosen-kompetensi-info">
          <FaUserGraduate />

          <div>
            <strong>Penilaian Mahasiswa</strong>

            <p>
              Pilih mahasiswa untuk memberikan nilai pada
              setiap kompetensi pedagogik.
            </p>
          </div>
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="dosen-kompetensi-toolbar">
          <div className="dosen-kompetensi-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Cari nama atau NIM mahasiswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* =================================================
            DAFTAR MAHASISWA
        ================================================= */}

        <div className="dosen-kompetensi-card">
          <div className="dosen-kompetensi-card-header">
            <div>
              <h2>Daftar Mahasiswa</h2>

              <p>
                Pilih mahasiswa untuk melakukan penilaian
                kompetensi pedagogik.
              </p>
            </div>

            <span className="dosen-kompetensi-total">
              {filteredStudents.length} Mahasiswa
            </span>
          </div>

          <div className="dosen-kompetensi-table-wrapper">
            <table className="dosen-kompetensi-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Mahasiswa</th>
                  <th>NIM</th>
                  <th>Penilaian</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>{String(index + 1).padStart(2, "0")}</td>

                      <td>
                        <div className="student-name">
                          <div className="student-avatar">
                            <FaUserGraduate />
                          </div>

                          <strong>{student.nama}</strong>
                        </div>
                      </td>

                      <td>{student.nim}</td>

                      <td>
                        <div className="student-score-summary">
                          {student.nilai.map((nilai, index) => {
                            const kategori =
                              getKategori(nilai);

                            return (
                              <span
                                key={index}
                                className={`score-mini ${kategori.className}`}
                                title={`Kompetensi ${
                                  index + 1
                                }`}
                              >
                                {nilai}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td>
                        <Button
                          className="dosen-kompetensi-assess-btn"
                          onClick={() =>
                            handleOpenAssessment(student)
                          }
                        >
                          <FaEdit />
                          Nilai
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="dosen-kompetensi-empty"
                    >
                      Mahasiswa tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>

      {/* =====================================================
          MODAL PENILAIAN
      ===================================================== */}

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="xl"
        centered
        scrollable
        className="dosen-kompetensi-modal"
      >
        <Modal.Header>
          <div>
            <span className="modal-small-label">
              PENILAIAN KOMPETENSI
            </span>

            <Modal.Title>
              {selectedStudent?.nama}
            </Modal.Title>

            <p>{selectedStudent?.nim}</p>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={handleCloseModal}
          >
            <FaTimes />
          </button>
        </Modal.Header>

        <Modal.Body>
          <div className="assessment-intro">
            <FaClipboardCheck />

            <div>
              <strong>
                Berikan nilai pada setiap kompetensi
              </strong>

              <p>
                Nilai berada pada rentang 0–100. Status
                kategori akan ditentukan secara otomatis.
              </p>
            </div>
          </div>

          <div className="competency-assessment-list">
            {kompetensiData.map((item, index) => {
              const nilai = nilaiForm[index];

              const kategori = getKategori(nilai);

              return (
                <div
                  className="competency-assessment-item"
                  key={item.no}
                >
                  <div className="competency-item-number">
                    {item.no}
                  </div>

                  <div className="competency-item-content">
                    <h3>{item.title}</h3>

                    <div className="competency-detail">
                      <div>
                        <strong>Pemahaman</strong>

                        <p>{item.pemahaman}</p>
                      </div>

                      <div>
                        <strong>Indikator</strong>

                        <p>{item.indikator}</p>
                      </div>

                      <div>
                        <strong>Bukti Fisik</strong>

                        <p>{item.bukti}</p>
                      </div>

                      <div>
                        <strong>Teknik Ukur</strong>

                        <p>{item.teknik}</p>
                      </div>
                    </div>

                    <div className="competency-score-area">
                      <div className="score-input-group">
                        <label>Nilai</label>

                        <Form.Control
                          type="number"
                          min="0"
                          max="100"
                          value={nilai}
                          onChange={(e) =>
                            handleScoreChange(
                              index,
                              e.target.value
                            )
                          }
                          placeholder="0–100"
                        />
                      </div>

                      <div className="score-category-group">
                        <label>Status Kategori</label>

                        <span
                          className={`score-category ${kategori.className}`}
                        >
                          {kategori.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            className="dosen-kompetensi-cancel-btn"
            onClick={handleCloseModal}
          >
            <FaTimes />
            Batal
          </Button>

          <Button
            className="dosen-kompetensi-save-btn"
            onClick={handleSaveAssessment}
          >
            <FaSave />
            Simpan Penilaian
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DosenKompetensiPedagogik;