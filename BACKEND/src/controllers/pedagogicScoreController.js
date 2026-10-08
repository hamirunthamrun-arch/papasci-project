const createSupabaseUserClient = require("../config/supabaseUserClient");

// ======================================================
// HELPER: MENGAMBIL ACCESS TOKEN
// ======================================================
const getAccessToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.replace("Bearer ", "");
};

// ======================================================
// HELPER: MENGAMBIL PROFILE USER YANG SEDANG LOGIN
// ======================================================
const getCurrentProfile = async (supabase) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User tidak ditemukan.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      nama_lengkap,
      nim,
      email,
      role
    `,
    )
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  return profile;
};

// ======================================================
// GET SEMUA DATA PENILAIAN
//
// MAHASISWA → hanya data sendiri
// DOSEN     → semua data mahasiswa
// ADMIN     → tidak boleh
//
// GET /api/pedagogic-scores
// ======================================================
const getAllPedagogicScores = async (req, res) => {
  try {
    // ==================================================
    // TOKEN
    // ==================================================

    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    // ==================================================
    // SUPABASE USER CLIENT
    // ==================================================

    const supabase = createSupabaseUserClient(accessToken);

    // ==================================================
    // PROFILE
    // ==================================================

    const profile = await getCurrentProfile(supabase);

    // ==================================================
    // ADMIN TIDAK BOLEH
    // ==================================================

    if (profile.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin tidak memiliki akses ke penilaian kompetensi pedagogik.",
      });
    }

    // ==================================================
    // VALIDASI ROLE
    // ==================================================

    if (profile.role !== "mahasiswa" && profile.role !== "dosen") {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses.",
      });
    }

    // ==================================================
    // QUERY
    // ==================================================

    let query = supabase.from("pedagogic_scores").select(`
        id,
        student_id,
        vidio_url,
        status,
        nilai,
        created_at,
        updated_at,
        profiles (
          id,
          nama_lengkap,
          nim,
          email,
          role,
          avatar_url
        )
      `);

    // ==================================================
    // MAHASISWA
    //
    // HANYA DATA SENDIRI
    // ==================================================

    if (profile.role === "mahasiswa") {
      query = query.eq("student_id", profile.id);
    }

    // ==================================================
    // DOSEN
    //
    // TIDAK ADA FILTER
    // DOSEN DAPAT MELIHAT SEMUA DATA
    // ==================================================

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw error;
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    console.error("Get all pedagogic scores error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// GET DATA BERDASARKAN ID
//
// MAHASISWA → hanya data sendiri
// DOSEN     → semua data
// ADMIN     → tidak boleh
//
// GET /api/pedagogic-scores/:id
// ======================================================
const getPedagogicScoreById = async (req, res) => {
  try {
    // ==================================================
    // TOKEN
    // ==================================================

    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    // ==================================================
    // SUPABASE
    // ==================================================

    const supabase = createSupabaseUserClient(accessToken);

    // ==================================================
    // PROFILE
    // ==================================================

    const profile = await getCurrentProfile(supabase);

    // ==================================================
    // ADMIN
    // ==================================================

    if (profile.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin tidak memiliki akses ke penilaian kompetensi pedagogik.",
      });
    }

    // ==================================================
    // VALIDASI ROLE
    // ==================================================

    if (profile.role !== "mahasiswa" && profile.role !== "dosen") {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses.",
      });
    }

    // ==================================================
    // AMBIL DATA
    // ==================================================

    const { data, error } = await supabase
      .from("pedagogic_scores")
      .select(
        `
        id,
        student_id,
        vidio_url,
        status,
        nilai,
        created_at,
        updated_at,
        profiles (
          id,
          nama_lengkap,
          nim,
          email,
          role,
          avatar_url
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Data penilaian tidak ditemukan.",
      });
    }

    // ==================================================
    // MAHASISWA
    //
    // TIDAK BOLEH MELIHAT DATA MAHASISWA LAIN
    // ==================================================

    if (profile.role === "mahasiswa" && data.student_id !== profile.id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke data ini.",
      });
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get pedagogic score by id error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// CREATE / SUBMIT VIDEO MAHASISWA
//
// HANYA MAHASISWA
//
// POST /api/pedagogic-scores
// ======================================================
const createPedagogicScore = async (req, res) => {
  try {
    // ==================================================
    // TOKEN
    // ==================================================

    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    // ==================================================
    // SUPABASE
    // ==================================================

    const supabase = createSupabaseUserClient(accessToken);

    // ==================================================
    // PROFILE
    // ==================================================

    const profile = await getCurrentProfile(supabase);

    // ==================================================
    // HANYA MAHASISWA
    // ==================================================

    if (profile.role !== "mahasiswa") {
      return res.status(403).json({
        success: false,
        message: "Hanya mahasiswa yang dapat mengirim video.",
      });
    }

    // ==================================================
    // AMBIL LINK VIDEO
    // ==================================================

    const { vidio_url } = req.body;

    if (!vidio_url || typeof vidio_url !== "string" || !vidio_url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Link video wajib diisi.",
      });
    }

    const cleanVideoUrl = vidio_url.trim();

    // ==================================================
    // CEK DATA YANG SUDAH ADA
    // ==================================================

    const { data: existingData, error: existingError } = await supabase
      .from("pedagogic_scores")
      .select(
        `
        id,
        student_id,
        vidio_url,
        status,
        nilai,
        created_at,
        updated_at
      `,
      )
      .eq("student_id", profile.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    // ==================================================
    // JIKA SUDAH ADA
    //
    // MAHASISWA MENGIRIM / MEMPERBARUI VIDEO
    // ==================================================

    if (existingData) {
      // ------------------------------------------------
      // CEK APAKAH VIDEO SEBELUMNYA SUDAH DINILAI
      // ------------------------------------------------

      const sudahDinilai =
        existingData.status === "dinilai" || existingData.nilai !== null;

      // ------------------------------------------------
      // JIKA SUDAH DINILAI
      //
      // VIDEO BARU HARUS DINILAI ULANG
      // NILAI LAMA DIHAPUS
      // ------------------------------------------------

      if (sudahDinilai) {
        const { data, error } = await supabase
          .from("pedagogic_scores")
          .update({
            vidio_url: cleanVideoUrl,
            status: "perlu_dinilai_ulang",
            nilai: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id)
          .select(
            `
            id,
            student_id,
            vidio_url,
            status,
            nilai,
            created_at,
            updated_at
          `,
          )
          .single();

        if (error) {
          throw error;
        }

        return res.status(200).json({
          success: true,
          message:
            "Link video berhasil diperbarui. Video baru menunggu penilaian ulang dari dosen.",
          data,
        });
      }

      // ------------------------------------------------
      // JIKA BELUM PERNAH DINILAI
      //
      // STATUS TETAP DIKUMPULKAN
      // ------------------------------------------------

      const { data, error } = await supabase
        .from("pedagogic_scores")
        .update({
          vidio_url: cleanVideoUrl,
          status: "dikumpulkan",
          nilai: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingData.id)
        .select(
          `
          id,
          student_id,
          vidio_url,
          status,
          nilai,
          created_at,
          updated_at
        `,
        )
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        message: "Link video berhasil diperbarui.",
        data,
      });
    }

    // ==================================================
    // JIKA BELUM ADA
    //
    // INSERT DATA BARU
    // ==================================================

    const { data, error } = await supabase
      .from("pedagogic_scores")
      .insert([
        {
          student_id: profile.id,
          vidio_url: cleanVideoUrl,
          status: "dikumpulkan",
          nilai: null,
        },
      ])
      .select(
        `
        id,
        student_id,
        vidio_url,
        status,
        nilai,
        created_at,
        updated_at
      `,
      )
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Link video berhasil dikirim.",
      data,
    });
  } catch (err) {
    console.error("Create pedagogic score error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// UPDATE DATA
//
// MAHASISWA:
//   mengubah link video miliknya
//
// DOSEN:
//   memberikan / mengubah nilai
//
// ADMIN:
//   tidak boleh
//
// PUT /api/pedagogic-scores/:id
// ======================================================
const updatePedagogicScore = async (req, res) => {
  try {
    // ==================================================
    // TOKEN
    // ==================================================

    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    // ==================================================
    // SUPABASE
    // ==================================================

    const supabase = createSupabaseUserClient(accessToken);

    // ==================================================
    // PROFILE
    // ==================================================

    const profile = await getCurrentProfile(supabase);

    // ==================================================
    // ADMIN
    // ==================================================

    if (profile.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin tidak memiliki akses.",
      });
    }

    // ==================================================
    // AMBIL DATA LAMA
    // ==================================================

    const { data: existingData, error: existingError } = await supabase
      .from("pedagogic_scores")
      .select("*")
      .eq("id", id)
      .single();

    if (existingError || !existingData) {
      return res.status(404).json({
        success: false,
        message: "Data penilaian tidak ditemukan.",
      });
    }

    // ==================================================
    // MAHASISWA
    //
    // HANYA BOLEH MENGUBAH VIDEO SENDIRI
    // ==================================================

    if (profile.role === "mahasiswa") {
      // ----------------------------------------------
      // CEK PEMILIK DATA
      // ----------------------------------------------

      if (existingData.student_id !== profile.id) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses ke data ini.",
        });
      }

      // ----------------------------------------------
      // AMBIL LINK VIDEO
      // ----------------------------------------------

      const { vidio_url } = req.body;

      if (!vidio_url || typeof vidio_url !== "string" || !vidio_url.trim()) {
        return res.status(400).json({
          success: false,
          message: "Link video wajib diisi.",
        });
      }

      // ----------------------------------------------
      // CEK APAKAH VIDEO SEBELUMNYA SUDAH DINILAI
      // ----------------------------------------------

      const sudahDinilai =
        existingData.status === "dinilai" || existingData.nilai !== null;

      // ----------------------------------------------
      // TENTUKAN STATUS VIDEO BARU
      // ----------------------------------------------

      const statusBaru = sudahDinilai ? "perlu_dinilai_ulang" : "dikumpulkan";

      // ----------------------------------------------
      // UPDATE VIDEO
      //
      // NILAI LAMA DIHAPUS
      // JIKA VIDEO SUDAH PERNAH DINILAI
      // ----------------------------------------------

      const { data, error } = await supabase
        .from("pedagogic_scores")
        .update({
          vidio_url: vidio_url.trim(),
          status: statusBaru,
          nilai: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          id,
          student_id,
          vidio_url,
          status,
          nilai,
          created_at,
          updated_at
        `,
        )
        .single();

      if (error) {
        throw error;
      }

      // ----------------------------------------------
      // RESPONSE
      // ----------------------------------------------

      return res.status(200).json({
        success: true,
        message: sudahDinilai
          ? "Link video berhasil diperbarui. Video baru menunggu penilaian ulang dari dosen."
          : "Link video berhasil diperbarui.",
        data,
      });
    }

    // ==================================================
    // DOSEN
    //
    // HANYA BOLEH MEMBERIKAN NILAI
    // ==================================================

    if (profile.role === "dosen") {
      const { nilai } = req.body;

      // ----------------------------------------------
      // VALIDASI NILAI
      // ----------------------------------------------

      if (nilai === undefined || nilai === null || nilai === "") {
        return res.status(400).json({
          success: false,
          message: "Nilai wajib diisi.",
        });
      }

      const numericNilai = Number(nilai);

      if (Number.isNaN(numericNilai)) {
        return res.status(400).json({
          success: false,
          message: "Nilai harus berupa angka.",
        });
      }

      if (numericNilai < 0 || numericNilai > 100) {
        return res.status(400).json({
          success: false,
          message: "Nilai harus berada di antara 0 sampai 100.",
        });
      }

      // ----------------------------------------------
      // UPDATE NILAI
      //
      // SETELAH DOSEN MEMBERIKAN NILAI,
      // STATUS KEMBALI MENJADI DINILAI
      // ----------------------------------------------

      const { data, error } = await supabase
        .from("pedagogic_scores")
        .update({
          nilai: numericNilai,
          status: "dinilai",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          id,
          student_id,
          vidio_url,
          status,
          nilai,
          created_at,
          updated_at
        `,
        )
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        message: "Nilai berhasil disimpan.",
        data,
      });
    }

    // ==================================================
    // ROLE TIDAK DIKENAL
    // ==================================================

    return res.status(403).json({
      success: false,
      message: "Anda tidak memiliki akses.",
    });
  } catch (err) {
    console.error("Update pedagogic score error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// DELETE DATA
//
// Tidak digunakan.
//
// MAHASISWA → tidak boleh
// DOSEN     → tidak boleh
// ADMIN     → tidak boleh
//
// DELETE /api/pedagogic-scores/:id
// ======================================================
const deletePedagogicScore = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const profile = await getCurrentProfile(supabase);

    return res.status(403).json({
      success: false,
      message: `Role ${profile.role} tidak memiliki izin untuk menghapus data penilaian kompetensi pedagogik.`,
    });
  } catch (err) {
    console.error("Delete pedagogic score error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================
module.exports = {
  getAllPedagogicScores,
  getPedagogicScoreById,
  createPedagogicScore,
  updatePedagogicScore,
  deletePedagogicScore,
};
