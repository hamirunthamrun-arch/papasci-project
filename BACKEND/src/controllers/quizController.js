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
// VERIFIKASI DOSEN
// =========================================================

const verifyDosen = async (supabase, accessToken) => {
  // Verifikasi identitas pengguna
  const { data: authData, error: authError } =
    await supabase.auth.getUser(accessToken);

  if (authError || !authData?.user) {
    return {
      valid: false,
      status: 401,
      message: "Sesi pengguna tidak valid.",
    };
  }

  // Periksa role pengguna
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    return {
      valid: false,
      status: 403,
      message: "Profil pengguna tidak ditemukan.",
    };
  }

  if (profile.role !== "dosen") {
    return {
      valid: false,
      status: 403,
      message: "Akses hanya untuk dosen.",
    };
  }

  return {
    valid: true,
    user: authData.user,
  };
};

// =========================================================
// VALIDASI INPUT KUIS
// =========================================================

const validateQuiz = (body, isUpdate = false) => {
  const {
    module_id,
    title,
    description,
    question_count,
    max_attempts,
    status,
  } = body;

  if (!isUpdate || module_id !== undefined) {
    if (!module_id) {
      return "Modul wajib dipilih.";
    }
  }

  if (!isUpdate || title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return "Judul kuis wajib diisi.";
    }
  }

  if (description !== undefined && typeof description !== "string") {
    return "Deskripsi harus berupa teks.";
  }

  if (!isUpdate || question_count !== undefined) {
    if (
      !Number.isInteger(Number(question_count)) ||
      Number(question_count) <= 0
    ) {
      return "Jumlah soal harus berupa bilangan bulat positif.";
    }
  }

  if (!isUpdate || max_attempts !== undefined) {
    if (![1, 2, 3].includes(Number(max_attempts))) {
      return "Maksimal percobaan harus 1, 2, atau 3.";
    }
  }

  if (status !== undefined && !["draft", "publik"].includes(status)) {
    return "Status harus draft atau publik.";
  }

  if (!isUpdate && status === undefined) {
    return null;
  }

  return null;
};

// =========================================================
// PENANGANAN ERROR DATABASE
// =========================================================

const handleQuizError = (err, res, operation) => {
  console.error(`${operation} quiz error:`, err);

  // Unique violation
  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      message:
        "Modul ini sudah memiliki kuis. Setiap modul hanya boleh memiliki satu kuis.",
    });
  }

  // Foreign key violation
  if (err.code === "23503") {
    return res.status(400).json({
      success: false,
      message: "Modul tidak ditemukan atau data masih digunakan.",
    });
  }

  // Data tidak ditemukan
  if (err.code === "PGRST116") {
    return res.status(404).json({
      success: false,
      message: "Data kuis tidak ditemukan.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan saat memproses kuis.",
  });
};

// =========================================================
// MENGAMBIL DAFTAR MODUL UNTUK DROPDOWN
// =========================================================

const getModulesForQuiz = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const verification = await verifyDosen(supabase, accessToken);

    if (!verification.valid) {
      return res.status(verification.status).json({
        success: false,
        message: verification.message,
      });
    }

    const { data, error } = await supabase
      .from("modules")
      .select("id, title")
      .order("order_number", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return handleQuizError(err, res, "Get modules");
  }
};

// =========================================================
// GET SEMUA KUIS
// =========================================================

const getAllQuizzes = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const verification = await verifyDosen(supabase, accessToken);

    if (!verification.valid) {
      return res.status(verification.status).json({
        success: false,
        message: verification.message,
      });
    }

    const { data, error } = await supabase
      .from("quizzes")
      .select(
        `
        *,
        modules (
          id,
          title
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return handleQuizError(err, res, "Get all");
  }
};

// =========================================================
// GET KUIS BERDASARKAN ID
// =========================================================

const getQuizById = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const verification = await verifyDosen(supabase, accessToken);

    if (!verification.valid) {
      return res.status(verification.status).json({
        success: false,
        message: verification.message,
      });
    }

    const { data, error } = await supabase
      .from("quizzes")
      .select(
        `
        *,
        modules (
          id,
          title
        )
      `,
      )
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return handleQuizError(err, res, "Get by ID");
  }
};

// =========================================================
// CREATE KUIS
// =========================================================

const createQuiz = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const validationError = validateQuiz(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const {
      module_id,
      title,
      description,
      question_count,
      max_attempts,
      status,
    } = req.body;

    const supabase = createSupabaseUserClient(accessToken);

    const verification = await verifyDosen(supabase, accessToken);

    if (!verification.valid) {
      return res.status(verification.status).json({
        success: false,
        message: verification.message,
      });
    }

    // Pastikan modul tersedia
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("id")
      .eq("id", module_id)
      .maybeSingle();

    if (moduleError) throw moduleError;

    if (!moduleData) {
      return res.status(404).json({
        success: false,
        message: "Modul yang dipilih tidak ditemukan.",
      });
    }

    // Simpan kuis
    const { data, error } = await supabase
      .from("quizzes")
      .insert({
        module_id,
        title: title.trim(),
        description: description?.trim() || null,
        question_count: Number(question_count),
        max_attempts: Number(max_attempts),
        status: status ?? "draft",
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Kuis berhasil ditambahkan.",
      data,
    });
  } catch (err) {
    return handleQuizError(err, res, "Create");
  }
};

// =========================================================
// UPDATE KUIS
// =========================================================

const updateQuiz = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const validationError = validateQuiz(req.body, true);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const verification = await verifyDosen(supabase, accessToken);

    if (!verification.valid) {
      return res.status(verification.status).json({
        success: false,
        message: verification.message,
      });
    }

    const {
      module_id,
      title,
      description,
      question_count,
      max_attempts,
      status,
    } = req.body;

    const updates = {};

    if (module_id !== undefined) updates.module_id = module_id;
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) {
      updates.description = description.trim() || null;
    }
    if (question_count !== undefined) {
      updates.question_count = Number(question_count);
    }
    if (max_attempts !== undefined) {
      updates.max_attempts = Number(max_attempts);
    }
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data yang diubah.",
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("quizzes")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Kuis berhasil diperbarui.",
      data,
    });
  } catch (err) {
    return handleQuizError(err, res, "Update");
  }
};

// =========================================================
// DELETE KUIS
// =========================================================

const deleteQuiz = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const verification = await verifyDosen(supabase, accessToken);

    if (!verification.valid) {
      return res.status(verification.status).json({
        success: false,
        message: verification.message,
      });
    }

    const { data, error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Kuis berhasil dihapus.",
      data,
    });
  } catch (err) {
    return handleQuizError(err, res, "Delete");
  }
};// =========================================================
// GET KUIS PUBLIK BERDASARKAN ID MODUL (SISWA)
// =========================================================

const getQuizByModule = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);
    const { moduleId } = req.params;

    // Pastikan sesi pengguna valid
    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: "Sesi pengguna tidak valid.",
      });
    }

    // Ambil kuis yang sudah dipublikasikan untuk modul tersebut
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("module_id", moduleId)
      .eq("status", "publik")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Kuis publik untuk modul ini belum tersedia.",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return handleQuizError(err, res, "Get by module");
  }
};



// =========================================================
// EXPORT CONTROLLER
// =========================================================

module.exports = {
  getModulesForQuiz,
  getQuizByModule,
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
