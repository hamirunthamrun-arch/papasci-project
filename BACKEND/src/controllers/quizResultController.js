const createSupabaseUserClient = require("../config/supabaseUserClient");

// ======================================================
// HELPER: AMBIL ACCESS TOKEN
// ======================================================

const getAccessToken = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.split(" ")[1];
};

// ======================================================
// HELPER: VALIDASI USER DOSEN
// ======================================================

const authenticateDosen = async (accessToken) => {
  const supabase = createSupabaseUserClient(accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    return {
      supabase: null,
      user: null,
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

  if (profileError || profile?.role !== "dosen") {
    return {
      supabase: null,
      user: null,
      error: {
        status: 403,
        message: "Akses hanya untuk dosen.",
      },
    };
  }

  return {
    supabase,
    user,
    error: null,
  };
};

// ======================================================
// MENILAI SATU PERCOBAAN KUIS
// ======================================================

const evaluateAttempt = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Token akses tidak ditemukan.",
      });
    }

    const { quiz_id, answers } = req.body;

    if (
      !quiz_id ||
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID kuis atau format jawaban tidak valid.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Sesi tidak valid. Silakan login kembali.",
      });
    }

    const { data, error: rpcError } = await supabase.rpc(
      "evaluate_quiz_attempt",
      {
        p_quiz_id: quiz_id,
        p_answers: answers,
      },
    );

    if (rpcError) {
      console.error("Gagal menilai percobaan kuis:", rpcError);

      return res.status(400).json({
        success: false,
        message: rpcError.message || "Percobaan kuis gagal dinilai.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Percobaan kuis berhasil dinilai.",
      data,
    });
  } catch (error) {
    console.error("Error evaluateAttempt:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

// ======================================================
// SIMPAN HASIL KUIS
// ======================================================

const submitQuizResult = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Token akses tidak ditemukan.",
      });
    }

    const { quiz_id, answers } = req.body;

    if (
      !quiz_id ||
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID kuis atau format jawaban tidak valid.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Sesi tidak valid. Silakan login kembali.",
      });
    }

    const { data, error: rpcError } = await supabase.rpc(
      "submit_quiz_result",
      {
        p_quiz_id: quiz_id,
        p_answers: answers,
      },
    );

    if (rpcError) {
      console.error("Gagal menyimpan hasil kuis:", rpcError);

      return res.status(400).json({
        success: false,
        message: rpcError.message || "Hasil kuis gagal disimpan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hasil kuis berhasil dikirim dan disimpan.",
      data,
    });
  } catch (error) {
    console.error("Error submitQuizResult:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

// ======================================================
// AMBIL SEMUA HASIL KUIS UNTUK DOSEN
// ======================================================

const getAllQuizResults = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Token akses tidak ditemukan.",
      });
    }

    const auth = await authenticateDosen(accessToken);

    if (auth.error) {
      return res.status(auth.error.status).json({
        success: false,
        message: auth.error.message,
      });
    }

    const { supabase } = auth;

    // ==================================================
    // 1. AMBIL HASIL QUIZ
    // ==================================================

    const { data: quizResults, error: quizResultError } = await supabase
      .from("quiz_results")
      .select(`
        id,
        quiz_id,
        student_id,
        attempt_number,
        score,
        correct_count,
        total_questions,
        started_at,
        submitted_at,
        attempts_used
      `)
      .order("submitted_at", {
        ascending: false,
      });

    if (quizResultError) {
      console.error(
        "Gagal mengambil hasil quiz:",
        quizResultError,
      );

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil hasil quiz.",
      });
    }

    if (!quizResults || quizResults.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Belum ada hasil quiz.",
        data: [],
      });
    }

    // ==================================================
    // 2. KUMPULKAN ID STUDENT DAN QUIZ
    // ==================================================

    const studentIds = [
      ...new Set(
        quizResults
          .map((item) => item.student_id)
          .filter(Boolean),
      ),
    ];

    const quizIds = [
      ...new Set(
        quizResults
          .map((item) => item.quiz_id)
          .filter(Boolean),
      ),
    ];

    // ==================================================
    // 3. AMBIL DATA MAHASISWA
    // ==================================================

    const { data: students, error: studentError } = await supabase
      .from("profiles")
      .select(`
        id,
        nama_lengkap,
        nim,
        email
      `)
      .in("id", studentIds);

    if (studentError) {
      console.error(
        "Gagal mengambil data mahasiswa:",
        studentError,
      );

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data mahasiswa.",
      });
    }

    // ==================================================
    // 4. AMBIL DATA QUIZ
    // ==================================================

    const { data: quizzes, error: quizError } = await supabase
      .from("quizzes")
      .select(`
        id,
        module_id,
        title,
        description,
        question_count,
        max_attempts,
        status
      `)
      .in("id", quizIds);

    if (quizError) {
      console.error(
        "Gagal mengambil data quiz:",
        quizError,
      );

      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data quiz.",
      });
    }

    // ==================================================
    // 5. AMBIL DATA MODULE
    // ==================================================

    const moduleIds = [
      ...new Set(
        (quizzes || [])
          .map((quiz) => quiz.module_id)
          .filter(Boolean),
      ),
    ];

    let modules = [];

    if (moduleIds.length > 0) {
      const { data: moduleData, error: moduleError } =
        await supabase
          .from("modules")
          .select(`
            id,
            title
          `)
          .in("id", moduleIds);

      if (moduleError) {
        console.error(
          "Gagal mengambil data module:",
          moduleError,
        );

        return res.status(500).json({
          success: false,
          message: "Gagal mengambil data module.",
        });
      }

      modules = moduleData || [];
    }

    // ==================================================
    // 6. GABUNGKAN DATA
    // ==================================================

    const result = quizResults.map((resultItem) => {
      const student = (students || []).find(
        (item) => item.id === resultItem.student_id,
      );

      const quiz = (quizzes || []).find(
        (item) => item.id === resultItem.quiz_id,
      );

      const module = (modules || []).find(
        (item) => item.id === quiz?.module_id,
      );

      return {
        id: resultItem.id,

        student_id: resultItem.student_id,

        nama_lengkap: student?.nama_lengkap || "-",

        nim: student?.nim || "-",

        email: student?.email || "-",

        quiz_id: resultItem.quiz_id,

        quiz_title: quiz?.title || "-",

        module_id: quiz?.module_id || null,

        module_title: module?.title || "-",

        attempt_number: resultItem.attempt_number,

        score: resultItem.score,

        correct_count: resultItem.correct_count,

        total_questions: resultItem.total_questions,

        started_at: resultItem.started_at,

        submitted_at: resultItem.submitted_at,

        attempts_used: resultItem.attempts_used,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Daftar hasil quiz berhasil diambil.",
      data: result,
    });
  } catch (error) {
    console.error("Error getAllQuizResults:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  evaluateAttempt,
  submitQuizResult,
  getAllQuizResults,
};