const createSupabaseUserClient = require("../config/supabaseUserClient");

// =========================================================
// MENGAMBIL ACCESS TOKEN
// =========================================================

const getAccessToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7);
};

// =========================================================
// VALIDASI INPUT
// =========================================================

const validatePretest = (body) => {
  const { module_id, title, question_count, status } = body;

  if (!module_id || !title?.trim()) {
    return "Module dan judul pretest wajib diisi.";
  }

  if (
    question_count !== undefined &&
    (!Number.isInteger(Number(question_count)) || Number(question_count) <= 0)
  ) {
    return "Jumlah soal harus berupa bilangan bulat positif.";
  }

  if (status !== undefined && !["draf", "publik"].includes(status)) {
    return "Status harus draf atau publik.";
  }

  return null;
};

// =========================================================
// PENANGANAN ERROR DATABASE
// =========================================================

const handlePretestError = (err, res, operation) => {
  console.error(`${operation} pretest error:`, err);

  // PostgreSQL unique violation
  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      message:
        "Modul ini sudah memiliki pretest. Setiap modul hanya boleh memiliki satu pretest.",
    });
  }

  // Foreign key violation
  if (err.code === "23503") {
    return res.status(400).json({
      success: false,
      message: "Modul yang dipilih tidak ditemukan.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan saat memproses pretest.",
  });
};

// =========================================================
// GET SEMUA PRETEST
// =========================================================

const getAllPretests = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("pretests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return handlePretestError(err, res, "Get all");
  }
};

// =========================================================
// GET PRETEST BERDASARKAN ID
// =========================================================

const getPretestById = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("pretests")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return handlePretestError(err, res, "Get by ID");
  }
};

// =========================================================
// CREATE PRETEST
// =========================================================

const createPretest = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const validationError = validatePretest(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { module_id, title, description, question_count, status } = req.body;

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("pretests")
      .insert({
        module_id,
        title: title.trim(),
        description: description || null,
        question_count: question_count ?? 10,
        status: status ?? "draf",
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Pretest berhasil ditambahkan.",
      data,
    });
  } catch (err) {
    return handlePretestError(err, res, "Create");
  }
};

// =========================================================
// UPDATE PRETEST
// =========================================================

const updatePretest = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const validationError = validatePretest(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { module_id, title, description, question_count, status } = req.body;

    const updates = {
      module_id,
      title: title.trim(),
      description: description || null,
      question_count: question_count ?? 10,
      status: status ?? "draf",
      updated_at: new Date().toISOString(),
    };

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("pretests")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Pretest berhasil diperbarui.",
      data,
    });
  } catch (err) {
    return handlePretestError(err, res, "Update");
  }
};

// =========================================================
// DELETE PRETEST
// =========================================================

const deletePretest = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("pretests")
      .delete()
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Pretest berhasil dihapus.",
      data,
    });
  } catch (err) {
    return handlePretestError(err, res, "Delete");
  }
};

// =========================================================
// GET PRETEST PUBLIK BERDASARKAN MODULE (MAHASISWA)
// =========================================================

const getPublishedPretestByModule = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    // Verifikasi identitas pengguna dari token
    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "Sesi pengguna tidak valid.",
      });
    }

    // Periksa role pengguna
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        success: false,
        message: "Profil pengguna tidak ditemukan.",
      });
    }

    if (profile.role !== "mahasiswa") {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk mahasiswa.",
      });
    }

    const { moduleId } = req.params;

    const { data, error } = await supabase
      .from("pretests")
      .select("id, module_id, title, description, question_count, status")
      .eq("module_id", moduleId)
      .eq("status", "publik")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Pretest publik untuk module ini tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return handlePretestError(err, res, "Get published by module");
  }
};

// =========================================================
// SUBMIT PRETEST MAHASISWA
// =========================================================

const submitPretest = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { pretest_id, answers } = req.body;

    if (
      !pretest_id ||
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID pretest dan jawaban wajib diisi dengan format yang valid.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    // Verifikasi token dan identitas pengguna
    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "Sesi pengguna tidak valid.",
      });
    }

    // Pastikan pengguna adalah mahasiswa
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        success: false,
        message: "Profil pengguna tidak ditemukan.",
      });
    }

    if (profile.role !== "mahasiswa") {
      return res.status(403).json({
        success: false,
        message: "Hanya mahasiswa yang dapat mengumpulkan pretest.",
      });
    }

    // Panggil fungsi database untuk menghitung dan menyimpan nilai
    const { data, error } = await supabase.rpc("submit_pretest", {
      p_pretest_id: pretest_id,
      p_answers: answers,
    });

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Kamu sudah pernah mengerjakan pretest ini.",
        });
      }

      if (error.code === "42501") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.code === "P0001") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Pretest berhasil dikumpulkan.",
      data,
    });
  } catch (err) {
    console.error("Submit pretest error:", err);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengumpulkan pretest.",
    });
  }
};

module.exports = {
  getAllPretests,
  getPretestById,
  createPretest,
  updatePretest,
  deletePretest,
  getPublishedPretestByModule,
  submitPretest,
};
