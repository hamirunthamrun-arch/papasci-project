import { useState } from "react";
import { Container, Button } from "react-bootstrap";
import {
  FaFlask,
  FaSearch,
  FaExternalLinkAlt,
  FaArrowRight,
  FaLightbulb,
  FaPlay,
} from "react-icons/fa";

import "../css/LabSimulasi.css";

/* =========================================================
   DATA SIMULASI
========================================================= */

const simulations = [
  {
    id: 1,
    title: "Forces and Motion: Basics",
    image:
      "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics-600.png",
    color: "blue",
    description: "Pelajari bagaimana gaya dapat memengaruhi gerak suatu benda.",
    url: "https://phet.colorado.edu/en/simulations/forces-and-motion-basics",
  },

  {
    id: 2,
    title: "States of Matter: Basics",
    image:
      "https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics-600.png",
    color: "cyan",
    description:
      "Amati bagaimana partikel bergerak pada benda padat, cair, dan gas.",
    url: "https://phet.colorado.edu/en/simulations/states-of-matter-basics",

  },

  {
    id: 3,
    title: "Buoyancy: Basics",
    image:
      "https://phet.colorado.edu/sims/html/buoyancy-basics/latest/buoyancy-basics-600.png",
    color: "green",
    description:
      "Eksplorasi mengapa benda dapat mengapung atau tenggelam di dalam air.",
    url: "https://phet.colorado.edu/en/simulations/buoyancy-basics",

  },

  {
    id: 4,
    title: "Gravity and Orbits",
    image:
      "https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits-600.png",
    color: "purple",
    description:
      "Jelajahi hubungan gravitasi dengan gerakan planet dan benda langit.",
    url: "https://phet.colorado.edu/en/simulations/gravity-and-orbits",

  },

  {
    id: 5,
    title: "Energy Skate Park: Basics",
    image:
      "https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics-600.png",
    color: "orange",
    description:
      "Amati perubahan energi saat seorang pemain bergerak di lintasan.",
    url: "https://phet.colorado.edu/en/simulations/energy-skate-park-basics",
  },

  {
    id: 6,
    title: "Balloons and Static Electricity",
    image:
      "https://phet.colorado.edu/sims/html/balloons-and-static-electricity/latest/balloons-and-static-electricity-600.png",
    color: "pink",
    description:
      "Cari tahu bagaimana listrik statis dapat membuat benda saling menarik.",
    url: "https://phet.colorado.edu/en/simulations/balloons-and-static-electricity",
  },

  {
    id: 7,
    title: "Circuit Construction Kit: DC",
    image:
      "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc-600.png",
    color: "yellow",
    description:
      "Buat rangkaian listrik sederhana dan lihat bagaimana listrik mengalir.",
    url: "https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc",

  },

  {
    id: 8,
    title: "Build an Atom",
    image:
      "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom-600.png",
    color: "red",
    description:
      "Bangun sebuah atom dengan menyusun proton, neutron, dan elektron.",
    url: "https://phet.colorado.edu/en/simulations/build-an-atom",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function LabSimulasi() {
  const [search, setSearch] = useState("");

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredSimulations = simulations.filter((simulation) => {
    const keyword = search.toLowerCase().trim();

    return (
      simulation.title.toLowerCase().includes(keyword) ||
      simulation.description.toLowerCase().includes(keyword) ||
      simulation.category.toLowerCase().includes(keyword)
    );
  });

  /* =======================================================
     OPEN SIMULATION
  ======================================================= */

  const openSimulation = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="lab-page">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="lab-hero">
        <Container>
          <div className="lab-hero-content">
            <div className="lab-hero-text">
              <div className="lab-eyebrow">
                <FaFlask />
                LAB SIMULASI IPA
              </div>

              <h1>
                Yuk,
                <span>Eksplorasi</span>
              </h1>

              <p>
                Belajar IPA jadi lebih seru. Coba berbagai simulasi interaktif
                dan temukan bagaimana dunia di sekitar kita bekerja.
              </p>

              <div className="lab-hero-buttons">
                <Button
                  className="lab-explore-button"
                  onClick={() => {
                    document.getElementById("simulation-list")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  <FaPlay />
                  Mulai Eksplorasi
                  <FaArrowRight />
                </Button>

                <span className="lab-hero-note">
                  ✨ Belajar sambil mencoba!
                </span>
              </div>
            </div>

            {/* =================================================
                HERO ILLUSTRATION
            ================================================= */}

            <div className="lab-hero-visual">
              <div className="lab-orbit orbit-one" />
              <div className="lab-orbit orbit-two" />

              <div className="lab-flask">🧪</div>

              <div className="lab-floating-icon icon-one">⚛️</div>

              <div className="lab-floating-icon icon-two">🌍</div>

              <div className="lab-floating-icon icon-three">⚡</div>

              <div className="lab-floating-icon icon-four">🔬</div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===================================================
          INFO
      =================================================== */}

      <section className="lab-info">
        <Container>
          <div className="lab-info-card">
            <div className="lab-info-icon">
              <FaFlask />
            </div>

            <div className="lab-info-text">
              <h3>Apa itu Lab Simulasi?</h3>

              <p>
                Di sini kamu bisa mencoba simulasi IPA interaktif dari PhET.
                Kamu dapat mengubah berbagai kondisi, melakukan percobaan, dan
                melihat apa yang terjadi.
              </p>
            </div>

            <div className="lab-info-badge">
              <strong>PhET</strong>

              <span>Interactive Simulations</span>
            </div>
          </div>
        </Container>
      </section>

      {/* ===================================================
          SEARCH + SIMULATIONS
      =================================================== */}

      <section className="lab-simulations" id="simulation-list">
        <Container>
          <div className="lab-section-heading">
            <div>
              <span>PILIH SIMULASI</span>

              <h2>Mau mencoba apa hari ini? 🔬</h2>
            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="lab-search">
              <FaSearch />

              <input
                type="text"
                placeholder="Cari simulasi..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {/* =================================================
              SIMULATION CARDS
          ================================================= */}

          <div className="simulation-grid">
            {filteredSimulations.map((simulation) => (
              <article className="simulation-card" key={simulation.id}>
                {/* =================================================
                    VISUAL
                ================================================= */}

                <div className="simulation-visual">
                  <img
                    src={simulation.image}
                    alt={simulation.title}
                    className="simulation-image"
                  />

                </div>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="simulation-body">

                  <h3>{simulation.title}</h3>

                  <p>{simulation.description}</p>

                  <Button
                    className="simulation-button"
                    onClick={() => openSimulation(simulation.url)}
                  >
                    <FaPlay />
                    Mulai Simulasi
                    <FaExternalLinkAlt />
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredSimulations.length === 0 && (
            <div className="lab-empty">
              <div>🔎</div>

              <h3>Simulasi tidak ditemukan</h3>

              <p>Coba gunakan kata pencarian lainnya.</p>
            </div>
          )}

          {/* =================================================
              FOOTER NOTE
          ================================================= */}

          <div className="lab-source-note">
            <FaLightbulb />

            <p>
              Simulasi akan dibuka di website resmi
              <strong> PhET Interactive Simulations</strong>. Pastikan
              perangkatmu terhubung ke internet.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default LabSimulasi;
