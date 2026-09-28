import { Container } from "react-bootstrap";
import { FaClipboardCheck, FaChevronRight } from "react-icons/fa";

import "../css/KompetensiPedagogik.css";

const kompetensiData = [
  {
    no: "01",
    title:
      "Menguasai karakteristik peserta didik dari aspek fisik, moral, spiritual, sosial, kultural, emosional dan intelektual",
    pemahaman:
      "Guru mengenali peserta didik secara utuh agar strategi, bahasa, kelompok belajar, dan dukungan yang diberikan tidak seragam secara membuta.",
    indikator:
      "Memiliki data identifikasi gaya belajar, kesulitan, dan latar belakang siswa serta memberi perlakuan berbeda sesuai kebutuhan.",
    bukti: "Catatan anekdot, asesmen awal, daftar kelompok belajar",
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
    bukti: "RPP/modul ajar yang mencantumkan teori dan pendekatan",
    teknik: "Telaah RPP, wawancara",
  },
  {
    no: "03",
    title: "Mengembangkan kurikulum terkait dengan mata pelajaran yang diampu",
    pemahaman:
      "Guru menerjemahkan kurikulum menjadi pengalaman belajar IPA yang bermakna, terukur, dan relevan dengan konteks lokal Papua/Sorong.",
    indikator:
      "Menjabarkan CP menjadi TP dan ATP, memilih materi kontekstual, serta menyusun silabus dan modul ajar.",
    bukti: "Silabus, TP–ATP, modul ajar",
    teknik: "Telaah dokumen",
  },
  {
    no: "04",
    title: "Menyelenggarakan pembelajaran yang mendidik",
    pemahaman:
      "Guru menciptakan pembelajaran berpusat pada siswa melalui pembukaan yang bermakna, pengelolaan kelas, metode bervariasi, dan refleksi.",
    indikator:
      "Membuka, mengelola, melaksanakan, dan menutup pembelajaran dengan aktivitas yang aktif, aman, inklusif, dan reflektif.",
    bukti: "RPP/modul ajar dan rekaman pelaksanaan pembelajaran",
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
    bukti: "Media ajar, tautan kuis, screenshot, dan log aktivitas LMS",
    teknik: "Observasi, cek file",
  },
];

function KompetensiPedagogik() {
  return (
    <div className="pedagogik-page">
      <Container fluid className="pedagogik-container">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="pedagogik-header">
          <div className="pedagogik-header-content">
            <span className="pedagogik-label">KERANGKA PENGUKURAN</span>

            <h1>5 Cakupan Kompetensi Pedagogik</h1>

            <p>
              Setiap cakupan memiliki pemahaman, indikator, bukti fisik, dan
              teknik ukur agar penilaian kompetensi calon guru dapat dilakukan
              secara terarah dan dapat ditelusuri.
            </p>
          </div>
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="competency-table-wrapper">
          <div className="competency-table">
            {/* TABLE HEADER */}

            <div className="competency-table-head">
              <div className="col-no">NO</div>

              <div className="col-cakupan">CAKUPAN & PEMAHAMAN</div>

              <div className="col-indikator">INDIKATOR YANG BISA DIUKUR</div>

              <div className="col-bukti">BUKTI FISIK</div>

              <div className="col-teknik">TEKNIK UKUR</div>

              <div className="col-skor">SKOR</div>
            </div>

            {/* TABLE BODY */}

            {kompetensiData.map((item) => (
              <div className="competency-row" key={item.no}>
                {/* NOMOR */}

                <div className="col-no">
                  <span className="competency-number">{item.no}</span>
                </div>

                {/* CAKUPAN */}

                <div className="col-cakupan">
                  <h3>{item.title}</h3>

                  <p className="understanding">
                    <strong>Pemahaman:</strong> {item.pemahaman}
                  </p>
                </div>

                {/* INDIKATOR */}

                <div className="col-indikator">
                  <p>{item.indikator}</p>
                </div>

                {/* BUKTI FISIK */}

                <div className="col-bukti">
                  <p>{item.bukti}</p>
                </div>

                {/* TEKNIK UKUR */}

                <div className="col-teknik">
                  <span className="technique-badge">{item.teknik}</span>
                </div>

                {/* SKOR */}

                <div className="col-skor">
                  <div className="score-wrapper">
                    <div className="score-top">
                      <strong>0</strong>

                      <div className="score-line">
                        <span></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="score-button"
                      aria-label={`Lihat penilaian kompetensi ${item.no}`}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================
            MOBILE INFO
        ===================================================== */}

        <div className="mobile-score-info">
          <div className="mobile-score-icon">
            <FaClipboardCheck />
          </div>

          <div>
            <strong>Penilaian Kompetensi</strong>

            <p>
              Geser tabel ke kiri atau kanan untuk melihat seluruh informasi
              kompetensi.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default KompetensiPedagogik;
