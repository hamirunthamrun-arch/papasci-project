import { useState } from "react";
import {
  FaEdit,
  FaFlask,
  FaImage,
  FaLink,
  FaPlus,
  FaSave,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

import "../../css/dosen/DosenLabSimulasi.css";

/* =========================================================
   DATA SIMULASI
========================================================= */

const initialSimulations = [
  {
    id: 1,
    title: "Gaya dan Gerak",
    description:
      "Pelajari hubungan antara gaya, gerak, dan perubahan gerak benda melalui simulasi interaktif.",
    url: "https://phet.colorado.edu/",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    title: "Bentuk dan Perubahan Energi",
    description:
      "Eksplorasi berbagai bentuk energi dan perubahan energi melalui simulasi.",
    url: "https://phet.colorado.edu/",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 3,
    title: "Perubahan Wujud Air",
    description:
      "Amati proses perubahan wujud air dari padat, cair, hingga gas.",
    url: "https://phet.colorado.edu/",
    image:
      "https://images.unsplash.com/photo-1501691223387-dd0500403074?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 4,
    title: "Rangkaian Listrik Sederhana",
    description:
      "Pelajari cara kerja rangkaian listrik sederhana melalui simulasi.",
    url: "https://phet.colorado.edu/",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function DosenLabSimulasi() {
  const [simulations, setSimulations] = useState(
    initialSimulations
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingSimulation, setEditingSimulation] =
    useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    image: "",
  });

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredSimulations = simulations.filter(
    (simulation) => {
      const keyword = searchTerm.toLowerCase();

      return (
        simulation.title.toLowerCase().includes(keyword) ||
        simulation.description
          .toLowerCase()
          .includes(keyword)
      );
    }
  );

  /* =======================================================
     INPUT
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     TAMBAH
  ======================================================= */

  const handleAdd = () => {
    setEditingSimulation(null);

    setFormData({
      title: "",
      description: "",
      url: "",
      image: "",
    });

    setShowModal(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (simulation) => {
    setEditingSimulation(simulation);

    setFormData({
      title: simulation.title,
      description: simulation.description,
      url: simulation.url,
      image: simulation.image || "",
    });

    setShowModal(true);
  };

  /* =======================================================
     UPLOAD GAMBAR
  ======================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File yang dipilih harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setFormData((previous) => ({
      ...previous,
      image: imageUrl,
    }));
  };

  /* =======================================================
     HAPUS GAMBAR
  ======================================================= */

  const handleRemoveImage = () => {
    setFormData((previous) => ({
      ...previous,
      image: "",
    }));
  };

  /* =======================================================
     SIMPAN
  ======================================================= */

  const handleSave = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Judul simulasi harus diisi.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Deskripsi simulasi harus diisi.");
      return;
    }

    if (!formData.url.trim()) {
      alert("Link simulasi harus diisi.");
      return;
    }

    if (!formData.image) {
      alert("Gambar simulasi harus ditambahkan.");
      return;
    }

    if (editingSimulation) {
      setSimulations((previous) =>
        previous.map((simulation) =>
          simulation.id === editingSimulation.id
            ? {
                ...simulation,
                ...formData,
              }
            : simulation
        )
      );
    } else {
      const newSimulation = {
        id: Date.now(),
        ...formData,
      };

      setSimulations((previous) => [
        ...previous,
        newSimulation,
      ]);
    }

    setShowModal(false);
    setEditingSimulation(null);
  };

  /* =======================================================
     HAPUS
  ======================================================= */

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus simulasi ini?"
    );

    if (!confirmed) {
      return;
    }

    setSimulations((previous) =>
      previous.filter(
        (simulation) => simulation.id !== id
      )
    );
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSimulation(null);
  };

  return (
    <div className="dosen-lab-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dosen-lab-header">

        <div>
          <div className="dosen-lab-title">

            <div className="dosen-lab-title-icon">
              <FaFlask />
            </div>

            <div>
              <h1>Lab Simulasi</h1>

              <p>
                Kelola simulasi pembelajaran IPA untuk
                mahasiswa.
              </p>
            </div>

          </div>
        </div>

        <button
          type="button"
          className="dosen-lab-add-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Tambah Simulasi
        </button>

      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="dosen-lab-toolbar">

        <div className="dosen-lab-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Cari simulasi..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

        </div>

        <div className="dosen-lab-total">
          {filteredSimulations.length} Simulasi
        </div>

      </div>

      {/* =================================================
          CARD GRID
      ================================================= */}

      {filteredSimulations.length === 0 ? (

        <div className="dosen-lab-empty">

          <FaFlask />

          <h3>Simulasi tidak ditemukan</h3>

          <p>
            Coba gunakan kata pencarian yang berbeda.
          </p>

        </div>

      ) : (

        <div className="dosen-lab-grid">

          {filteredSimulations.map((simulation) => (

            <div
              className="dosen-lab-card"
              key={simulation.id}
            >

              {/* IMAGE */}

              <div className="dosen-lab-card-image">

                <img
                  src={simulation.image}
                  alt={simulation.title}
                />

              </div>

              {/* CONTENT */}

              <div className="dosen-lab-card-content">

                <h3>{simulation.title}</h3>

                <p>{simulation.description}</p>

                <div className="dosen-lab-url">

                  <FaLink />

                  <span>
                    {simulation.url}
                  </span>

                </div>

                {/* ACTIONS */}

                <div className="dosen-lab-card-actions">

                  <button
                    type="button"
                    className="dosen-lab-edit-btn"
                    onClick={() =>
                      handleEdit(simulation)
                    }
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="dosen-lab-delete-btn"
                    onClick={() =>
                      handleDelete(simulation.id)
                    }
                  >
                    <FaTrash />
                    Hapus
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* =================================================
          MODAL TAMBAH / EDIT
      ================================================= */}

      {showModal && (

        <div className="dosen-lab-modal-overlay">

          <div className="dosen-lab-modal">

            <div className="dosen-lab-modal-header">

              <div>

                <h2>
                  {editingSimulation
                    ? "Edit Simulasi"
                    : "Tambah Simulasi"}
                </h2>

                <p>
                  Lengkapi informasi simulasi pembelajaran.
                </p>

              </div>

              <button
                type="button"
                className="dosen-lab-close-btn"
                onClick={handleCloseModal}
              >
                <FaTimes />
              </button>

            </div>

            <form
              className="dosen-lab-form"
              onSubmit={handleSave}
            >

              {/* =================================================
                  GAMBAR
              ================================================= */}

              <div className="dosen-lab-form-group">

                <label>
                  Gambar Simulasi
                  <span>*</span>
                </label>

                {formData.image ? (

                  <div className="dosen-lab-image-preview">

                    <img
                      src={formData.image}
                      alt="Preview simulasi"
                    />

                    <div className="dosen-lab-image-actions">

                      <label className="dosen-lab-change-image">

                        <FaUpload />

                        Ganti Gambar

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />

                      </label>

                      <button
                        type="button"
                        className="dosen-lab-remove-image"
                        onClick={handleRemoveImage}
                      >
                        <FaTrash />
                        Hapus Gambar
                      </button>

                    </div>

                  </div>

                ) : (

                  <label className="dosen-lab-image-upload">

                    <FaImage />

                    <strong>
                      Tambahkan gambar simulasi
                    </strong>

                    <span>
                      JPG, PNG, WEBP — maksimal 5 MB
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />

                  </label>

                )}

              </div>

              {/* =================================================
                  JUDUL
              ================================================= */}

              <div className="dosen-lab-form-group">

                <label>
                  Judul Simulasi
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Gaya dan Gerak"
                />

              </div>

              {/* =================================================
                  DESKRIPSI
              ================================================= */}

              <div className="dosen-lab-form-group">

                <label>
                  Deskripsi
                  <span>*</span>
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tuliskan deskripsi simulasi..."
                  rows="4"
                />

              </div>

              {/* =================================================
                  URL
              ================================================= */}

              <div className="dosen-lab-form-group">

                <label>
                  Link Simulasi
                  <span>*</span>
                </label>

                <div className="dosen-lab-url-input">

                  <FaLink />

                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="dosen-lab-modal-footer">

                <button
                  type="button"
                  className="dosen-lab-cancel-btn"
                  onClick={handleCloseModal}
                >
                  <FaTimes />
                  Batal
                </button>

                <button
                  type="submit"
                  className="dosen-lab-save-btn"
                >
                  <FaSave />

                  {editingSimulation
                    ? "Simpan Perubahan"
                    : "Simpan Simulasi"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default DosenLabSimulasi;