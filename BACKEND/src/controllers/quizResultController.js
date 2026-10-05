const createSupabaseUserClient = require("../config/supabaseUserClient");

const getAccessToken = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.split(" ")[1];
};

// Validasi sesi pengguna
const authenticateUser = async (accessToken) => {
  const supabase = createSupabaseUserClient(accessToken);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return { supabase: null, user: null };
  }

  return { supabase, user };
};

// Menilai satu percobaan kuis secara sementara
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

    const { supabase } = await authenticateUser(accessToken);

    if (!supabase) {
      return res.status(401).json({
        success: false,
        message: "Sesi tidak valid. Silakan login kembali.",
      });
    }

    const { data, error } = await supabase.rpc("evaluate_quiz_attempt", {
      p_quiz_id: quiz_id,
      p_answers: answers,
    });

    if (error) {
      console.error("Gagal menilai percobaan kuis:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Percobaan kuis gagal dinilai.",
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

// Menyimpan hasil kuis sebagai hasil resmi
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

    const { supabase } = await authenticateUser(accessToken);

    if (!supabase) {
      return res.status(401).json({
        success: false,
        message: "Sesi tidak valid. Silakan login kembali.",
      });
    }

    const { data, error } = await supabase.rpc("submit_quiz_result", {
      p_quiz_id: quiz_id,
      p_answers: answers,
    });

    if (error) {
      console.error("Gagal menyimpan hasil kuis:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Hasil kuis gagal disimpan.",
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

module.exports = {
  evaluateAttempt,
  submitQuizResult,
};
