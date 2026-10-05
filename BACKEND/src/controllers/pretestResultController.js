
const createSupabaseUserClient = require("../config/supabaseUserClient");

// ======================================================
// HELPER: VALIDASI USER DAN ROLE
// ======================================================

const getAuthenticatedUser = async (req, supabase, allowedRole) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return {
      error: {
        status: 401,
        message: "Token akses tidak ditemukan.",
      },
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    return {
      error: {
        status: 401,
        message: "Sesi tidak valid. Silakan login kembali.",
      },
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== allowedRole) {
    return {
      error: {
        status: 403,
        message: `Akses hanya untuk ${allowedRole}.`,
      },
    };
  }

  return { user };
};

// ======================================================
// HELPER: HITUNG NILAI PRETEST
// ======================================================

const calculatePretestScore = async (supabase, pretestId, answers) => {
  if (
    !pretestId ||
    !answers ||
    typeof answers !== "object" ||
    Array.isArray(answers)
  ) {
    throw new Error("Data jawaban pretest tidak valid.");
  }

  const { data: pretest, error: pretestError } = await supabase
    .from("pretests")
    .select("id")
    .eq("id", pretestId)
    .single();

  if (pretestError || !pretest) {
    throw new Error("Pretest tidak ditemukan.");
  }

  const { data: questions, error: questionError } = await supabase
    .from("pretest_questions")
    .select("id, correct_answer")
    .eq("pretest_id", pretestId);

  if (questionError) {
    throw new Error("Gagal mengambil soal pretest.");
  }

  if (!questions || questions.length === 0) {
    throw new Error("Pretest belum memiliki soal.");
  }

  const questionIds = new Set(questions.map((q) => q.id));

  // Pastikan seluruh soal dijawab dan tidak ada ID soal asing.
  const answerIds = Object.keys(answers);

  if (
    answerIds.length !== questions.length ||
    questions.some(
      (question) =>
        !Object.prototype.hasOwnProperty.call(answers, question.id) ||
        typeof answers[question.id] !== "string" ||
        !answers[question.id].trim()
    ) ||
    answerIds.some((id) => !questionIds.has(id))
  ) {
    throw new Error(
      "Semua soal harus dijawab dengan pilihan yang valid."
    );
  }

  let correctCount = 0;

  for (const question of questions) {
    const submittedAnswer = String(answers[question.id])
      .trim()
      .toUpperCase();

    const correctAnswer = String(question.correct_answer || "")
      .trim()
      .toUpperCase();

    if (!["A", "B", "C", "D"].includes(submittedAnswer)) {
      throw new Error("Pilihan jawaban tidak valid.");
    }

    if (!correctAnswer) {
      throw new Error(
        "Kunci jawaban belum tersedia pada salah satu soal."
      );
    }

    if (submittedAnswer === correctAnswer) {
      correctCount++;
    }
  }

  const totalQuestions = questions.length;
  const score = Math.round(
    (correctCount / totalQuestions) * 100
  );

  return {
    score,
    correct_count: correctCount,
    total_questions: totalQuestions,
  };
};

// ======================================================
// EVALUASI PRETEST (TIDAK MENYIMPAN HASIL)
// ======================================================

const evaluatePretest = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Token akses tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const auth = await getAuthenticatedUser(
      req,
      supabase,
      "mahasiswa"
    );

    if (auth.error) {
      return res.status(auth.error.status).json({
        success: false,
        message: auth.error.message,
      });
    }

    const { pretest_id, answers } = req.body;

    const result = await calculatePretestScore(
      supabase,
      pretest_id,
      answers
    );

    return res.status(200).json({
      success: true,
      message: "Pretest berhasil dievaluasi.",
      data: result,
    });
  } catch (error) {
    console.error("Error evaluatePretest:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Gagal memproses hasil pretest.",
    });
  }
};

// ======================================================
// SIMPAN HASIL RESMI PRETEST
// ======================================================

const submitPretestResult = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Token akses tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const auth = await getAuthenticatedUser(
      req,
      supabase,
      "mahasiswa"
    );

    if (auth.error) {
      return res.status(auth.error.status).json({
        success: false,
        message: auth.error.message,
      });
    }

    const { pretest_id, answers } = req.body;

    // Hitung ulang di server agar nilai tidak bisa dimanipulasi.
    const result = await calculatePretestScore(
      supabase,
      pretest_id,
      answers
    );

    const { data, error } = await supabase
      .from("pretest_results")
      .insert({
        student_id: auth.user.id,
        pretest_id,
        score: result.score,
        correct_count: result.correct_count,
        total_questions: result.total_questions,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Gagal menyimpan hasil pretest:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan hasil pretest.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Hasil pretest berhasil disimpan.",
      data,
    });
  } catch (error) {
    console.error("Error submitPretestResult:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Gagal menyimpan hasil pretest.",
    });
  }
};

// ======================================================
// AMBIL HASIL PRETEST MILIK MAHASISWA
// ======================================================

const getMyPretestResults = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Token akses tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const auth = await getAuthenticatedUser(
      req,
      supabase,
      "mahasiswa"
    );

    if (auth.error) {
      return res.status(auth.error.status).json({
        success: false,
        message: auth.error.message,
      });
    }

    const { data, error } = await supabase
      .from("pretest_results")
      .select(`
        id,
        pretest_id,
        score,
        correct_count,
        total_questions,
        submitted_at,
        pretests (
          id,
          title,
          module_id
        )
      `)
      .eq("student_id", auth.user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil hasil pretest:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil hasil pretest.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hasil pretest berhasil diambil.",
      data,
    });
  } catch (error) {
    console.error("Error getMyPretestResults:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

// ======================================================
// AMBIL SELURUH HASIL PRETEST (DOSEN)
// ======================================================

const getAllPretestResults = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Token akses tidak ditemukan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const auth = await getAuthenticatedUser(
      req,
      supabase,
      "dosen"
    );

    if (auth.error) {
      return res.status(auth.error.status).json({
        success: false,
        message: auth.error.message,
      });
    }

    const { data, error } = await supabase
      .from("pretest_results")
      .select(`
        id,
        score,
        correct_count,
        total_questions,
        submitted_at,
        student_id,
        pretest_id,
        profiles!pretest_results_student_id_fkey (
          nama_lengkap,
          nim,
          email
        ),
        pretests (
          title,
          module_id
        )
      `)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil hasil pretest:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil hasil pretest.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Daftar hasil pretest berhasil diambil.",
      data,
    });
  } catch (error) {
    console.error("Error getAllPretestResults:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

module.exports = {
  getMyPretestResults,
  getAllPretestResults,
  evaluatePretest,
  submitPretestResult,
};