import { useState } from "react";
import { Button, Container } from "react-bootstrap";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBookOpen,
  FaCheck,
  FaLightbulb,
  FaLeaf,
  FaSeedling,
  FaSearch,
  FaTrophy,
} from "react-icons/fa";

import "./ModuleDetail.css";

/* =========================================================
   DATA MATERI
========================================================= */

const materi = [
  {
    id: 1,
    title: "Apa Itu Makhluk Hidup?",
    subtitle: "Mari mengenal dunia makhluk hidup",
    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=80",
    content: (
      <>
        <p>
          Pernahkah kamu melihat kucing bermain, burung terbang, atau tanaman
          tumbuh di halaman rumah?
        </p>

        <p>
          Kucing, burung, dan tanaman merupakan contoh
          <strong> makhluk hidup</strong>.
        </p>

        <p>
          Makhluk hidup adalah sesuatu yang memiliki ciri-ciri kehidupan.
          Makhluk hidup dapat tumbuh, bernapas, membutuhkan makanan, bergerak,
          berkembang biak, dan melakukan berbagai aktivitas lainnya.
        </p>
      </>
    ),
    fact: "Di sekitar kita terdapat banyak sekali makhluk hidup, mulai dari manusia, hewan, hingga tumbuhan.",
    activity:
      "Coba lihat ke sekelilingmu. Temukan minimal 3 makhluk hidup yang ada di sekitar rumah atau sekolahmu.",
  },

  {
    id: 2,
    title: "Ciri-Ciri Makhluk Hidup",
    subtitle: "Apa yang membuat sesuatu disebut hidup?",
    image:
      "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80",
    content: (
      <>
        <p>
          Setiap makhluk hidup memiliki beberapa ciri yang membedakannya dari
          benda mati.
        </p>

        <p>Beberapa ciri makhluk hidup antara lain:</p>

        <ul className="materi-list">
          <li>Bernapas</li>
          <li>Membutuhkan makanan dan air</li>
          <li>Dapat bergerak</li>
          <li>Dapat tumbuh</li>
          <li>Dapat berkembang biak</li>
          <li>Peka terhadap rangsangan</li>
        </ul>

        <p>
          Walaupun bentuk manusia, hewan, dan tumbuhan berbeda, semuanya
          memiliki ciri-ciri kehidupan.
        </p>
      </>
    ),
    fact: "Tumbuhan juga bernapas, walaupun cara bernapasnya berbeda dengan manusia.",
    activity:
      "Pilih satu hewan di sekitarmu. Coba sebutkan sebanyak mungkin ciri makhluk hidup yang dimilikinya.",
  },

  {
    id: 3,
    title: "Kebutuhan Makhluk Hidup",
    subtitle: "Apa saja yang dibutuhkan makhluk hidup?",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
    content: (
      <>
        <p>
          Agar dapat hidup dan tumbuh dengan baik, makhluk hidup membutuhkan
          berbagai hal.
        </p>

        <p>
          Manusia membutuhkan makanan, air, udara, dan tempat tinggal. Hewan
          juga membutuhkan makanan, air, dan udara.
        </p>

        <p>
          Tumbuhan membutuhkan air, udara, cahaya matahari, dan unsur hara dari
          tanah.
        </p>
      </>
    ),
    fact: "Tanaman yang tidak mendapatkan cukup air biasanya akan layu.",
    activity:
      "Amati sebuah tanaman selama beberapa hari. Perhatikan apa yang terjadi ketika tanaman mendapatkan cukup air.",
  },

  {
    id: 4,
    title: "Pertumbuhan Makhluk Hidup",
    subtitle: "Makhluk hidup dapat tumbuh",
    image:
      "https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1200&q=80",
    content: (
      <>
        <p>
          Salah satu ciri makhluk hidup adalah dapat mengalami
          <strong> pertumbuhan</strong>.
        </p>

        <p>
          Pertumbuhan adalah proses bertambahnya ukuran, tinggi, berat, atau
          bagian tubuh makhluk hidup.
        </p>

        <p>
          Contohnya, manusia yang awalnya bayi akan tumbuh menjadi anak-anak
          kemudian menjadi orang dewasa.
        </p>

        <p>
          Tumbuhan juga mengalami pertumbuhan. Biji dapat tumbuh menjadi tanaman
          kecil dan kemudian menjadi tanaman yang lebih besar.
        </p>
      </>
    ),
    fact: "Pertumbuhan manusia membutuhkan makanan bergizi, air, udara, dan istirahat yang cukup.",
    activity:
      "Pernahkah kamu melihat foto ketika masih kecil? Bandingkan ukuran tubuhmu sekarang dengan saat masih kecil.",
  },

  {
    id: 5,
    title: "Perkembangbiakan",
    subtitle: "Bagaimana makhluk hidup menghasilkan keturunan?",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
    content: (
      <>
        <p>
          Makhluk hidup juga dapat
          <strong> berkembang biak</strong>.
        </p>

        <p>
          Berkembang biak berarti menghasilkan keturunan baru. Dengan berkembang
          biak, jumlah makhluk hidup dapat terus bertambah.
        </p>

        <p>
          Contohnya, ayam menghasilkan telur yang kemudian dapat menetas menjadi
          anak ayam.
        </p>

        <p>
          Tumbuhan juga dapat berkembang biak melalui biji, tunas, atau bagian
          tubuh tertentu.
        </p>
      </>
    ),
    fact: "Satu biji kecil dapat tumbuh menjadi tanaman besar jika mendapatkan kondisi yang sesuai.",
    activity:
      "Coba cari contoh hewan yang berkembang biak dengan bertelur dan hewan yang berkembang biak dengan melahirkan.",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function ModuleDetail() {
  const [currentMateri, setCurrentMateri] = useState(0);
  const [completedMateri, setCompletedMateri] = useState([]);

  const current = materi[currentMateri];
  const totalMateri = materi.length;
  const currentNumber = currentMateri + 1;

  /* =======================================================
     MENANDAI MATERI SELESAI
  ======================================================= */

  const markAsCompleted = () => {
    if (!completedMateri.includes(current.id)) {
      setCompletedMateri((prev) => [...prev, current.id]);
    }
  };

  /* =======================================================
     NEXT
  ======================================================= */

  const handleNext = () => {
    markAsCompleted();

    if (currentMateri < totalMateri - 1) {
      setCurrentMateri(currentMateri + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =======================================================
     PREVIOUS
  ======================================================= */

  const handlePrevious = () => {
    if (currentMateri > 0) {
      setCurrentMateri(currentMateri - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =======================================================
     SELESAI MODULE
  ======================================================= */

  const finishModule = () => {
    const updatedCompleted = [...new Set([...completedMateri, current.id])];

    setCompletedMateri(updatedCompleted);

    localStorage.setItem("module_1_completed", "true");
  };

  return (
    <div className="module-detail-page">
      <Container fluid>
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="module-detail-header">
          <div className="module-header-left">
            <a href="/module" className="back-module-link">
              <FaArrowLeft />
              <span>Kembali ke Module</span>
            </a>
          </div>

          <div className="module-header-center">
            <div className="module-label">
              <FaBookOpen />
              MODULE 01
            </div>

            <h1>Makhluk Hidup</h1>
          </div>

          <div className="module-header-right">
            <span>Materi</span>
            <strong>
              {currentNumber}/{totalMateri}
            </strong>
          </div>
        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="module-content-container">
          {/* ===============================================
              MATERI IMAGE
          =============================================== */}

          <div className="materi-hero">
            <img src={current.image} alt={current.title} />

            <div className="materi-hero-overlay">
              <span>MATERI {currentNumber}</span>

              <h2>{current.title}</h2>

              <p>{current.subtitle}</p>
            </div>
          </div>

          {/* ===============================================
              MAIN CONTENT
          =============================================== */}

          <div className="materi-main-grid">
            {/* =============================================
                ARTICLE
            ============================================= */}

            <article className="materi-article">
              <div className="materi-icon">
                {currentNumber === 1 && <FaLeaf />}
                {currentNumber === 2 && <FaSearch />}
                {currentNumber === 3 && <FaSeedling />}
                {currentNumber === 4 && <FaLeaf />}
                {currentNumber === 5 && <FaSeedling />}
              </div>

              <h3>Yuk, Kita Pelajari!</h3>

              <div className="materi-text">{current.content}</div>
            </article>

            {/* =============================================
                SIDEBAR MATERI
            ============================================= */}

            <aside className="materi-navigation">
              <div className="navigation-card">
                <div className="navigation-title">
                  <FaBookOpen />
                  <span>Daftar Materi</span>
                </div>

                <div className="materi-list-navigation">
                  {materi.map((item, index) => {
                    const isActive = index === currentMateri;
                    const isCompleted = completedMateri.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`materi-nav-item ${
                          isActive ? "active" : ""
                        }`}
                        onClick={() => setCurrentMateri(index)}
                      >
                        <span className="nav-number">
                          {isCompleted ? <FaCheck /> : `0${item.id}`}
                        </span>

                        <span className="nav-title">{item.title}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="navigation-tip">
                  <FaLightbulb />

                  <p>Baca setiap materi dengan teliti sebelum melanjutkan.</p>
                </div>
              </div>
            </aside>
          </div>

          {/* =================================================
              NAVIGATION BUTTON
          ================================================= */}

          <div className="materi-footer-navigation">
            <Button
              className="materi-prev-button"
              onClick={handlePrevious}
              disabled={currentMateri === 0}
            >
              <FaArrowLeft />
              Sebelumnya
            </Button>

            <div className="materi-dots">
              {materi.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`materi-dot ${
                    index === currentMateri ? "active" : ""
                  } ${completedMateri.includes(item.id) ? "completed" : ""}`}
                  onClick={() => setCurrentMateri(index)}
                />
              ))}
            </div>

            {currentMateri < totalMateri - 1 ? (
              <Button className="materi-next-button" onClick={handleNext}>
                Materi Berikutnya
                <FaArrowRight />
              </Button>
            ) : (
              <Button
                className="materi-next-button finish-button"
                onClick={finishModule}
                href="/quiz/1"
              >
                Selesai & Kerjakan Kuis
                <FaTrophy />
              </Button>
            )}
          </div>

          {/* =================================================
              FINISH MESSAGE
          ================================================= */}

          {currentMateri === totalMateri - 1 && (
            <div className="finish-module-card">
              <div className="finish-module-icon">🎉</div>

              <div>
                <h3>Hebat! Kamu sudah sampai di akhir materi.</h3>

                <p>
                  Setelah memahami semua materi, sekarang saatnya menguji
                  pengetahuanmu melalui kuis.
                </p>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export default ModuleDetail;
