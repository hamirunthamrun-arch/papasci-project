
const createSupabaseUserClient = require("../config/supabaseUserClient");

// Membuat Supabase client berdasarkan access token pengguna
const getSupabaseClient = (req) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    const error = new Error("Access token tidak ditemukan.");
    error.status = 401;
    throw error;
  }

  const accessToken = authHeader.slice(7).trim();

  if (!accessToken) {
    const error = new Error("Access token tidak valid.");
    error.status = 401;
    throw error;
  }

  return createSupabaseUserClient(accessToken);
};

// Menangani error secara konsisten
const handleError = (res, error) => {
  const status = error.status || 500;

  return res.status(status).json({
    success: false,
    message: error.message || "Terjadi kesalahan pada server.",
  });
};

// GET: Mengambil semua soal berdasarkan ID pretest
const getQuestionsByPretest = async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);
    const { pretestId } = req.params;

    const { data, error } = await supabase
      .from("pretest_questions")
      .select("*")
      .eq("pretest_id", pretestId)
      .order("order_number", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET: Mengambil detail satu soal
const getQuestionById = async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);
    const { id } = req.params;

    const { data, error } = await supabase
      .from("pretest_questions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Soal tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET: Mengambil soal untuk mahasiswa tanpa kunci jawaban
const getStudentQuestionsByPretest = async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);
    const { pretestId } = req.params;

    const { data, error } = await supabase
      .from("pretest_questions")
      .select(`
        id,
        pretest_id,
        question_text,
        image_url,
        option_a,
        option_b,
        option_c,
        option_d,
        order_number
      `)
      .eq("pretest_id", pretestId)
      .order("order_number", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST: Menambahkan soal
const createQuestion = async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);

    const {
      pretest_id,
      question_text,
      image_url,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      weight = 10,
      order_number,
    } = req.body;

    if (
      !pretest_id ||
      !question_text?.trim() ||
      !option_a?.trim() ||
      !option_b?.trim() ||
      !option_c?.trim() ||
      !option_d?.trim() ||
      !correct_answer
    ) {
      return res.status(400).json({
        success: false,
        message: "Data soal belum lengkap.",
      });
    }

    if (!["A", "B", "C", "D"].includes(correct_answer)) {
      return res.status(400).json({
        success: false,
        message: "Kunci jawaban harus A, B, C, atau D.",
      });
    }

    if (!Number.isInteger(weight) || weight <= 0) {
      return res.status(400).json({
        success: false,
        message: "Bobot soal harus berupa bilangan bulat positif.",
      });
    }

    let finalOrder = order_number;

    if (finalOrder == null) {
      const { data: lastQuestion, error: orderError } = await supabase
        .from("pretest_questions")
        .select("order_number")
        .eq("pretest_id", pretest_id)
        .order("order_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (orderError) throw orderError;

      finalOrder = (lastQuestion?.order_number || 0) + 1;
    }

    if (!Number.isInteger(finalOrder) || finalOrder < 1) {
      return res.status(400).json({
        success: false,
        message: "Urutan soal harus berupa bilangan bulat positif.",
      });
    }

    const { data, error } = await supabase
      .from("pretest_questions")
      .insert({
        pretest_id,
        question_text: question_text.trim(),
        image_url: image_url || null,
        option_a: option_a.trim(),
        option_b: option_b.trim(),
        option_c: option_c.trim(),
        option_d: option_d.trim(),
        correct_answer,
        weight,
        order_number: finalOrder,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Soal berhasil ditambahkan.",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// PUT: Memperbarui soal
const updateQuestion = async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);
    const { id } = req.params;

    const {
      question_text,
      image_url,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      weight,
      order_number,
    } = req.body;

    if (
      !question_text?.trim() ||
      !option_a?.trim() ||
      !option_b?.trim() ||
      !option_c?.trim() ||
      !option_d?.trim() ||
      !["A", "B", "C", "D"].includes(correct_answer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Data soal atau kunci jawaban tidak valid.",
      });
    }

    if (
      weight !== undefined &&
      (!Number.isInteger(weight) || weight <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Bobot soal harus berupa bilangan bulat positif.",
      });
    }

    if (
      order_number !== undefined &&
      (!Number.isInteger(order_number) || order_number < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Urutan soal harus berupa bilangan bulat positif.",
      });
    }

    const updateData = {
      question_text: question_text.trim(),
      image_url: image_url || null,
      option_a: option_a.trim(),
      option_b: option_b.trim(),
      option_c: option_c.trim(),
      option_d: option_d.trim(),
      correct_answer,
      updated_at: new Date().toISOString(),
    };

    if (weight !== undefined) {
      updateData.weight = weight;
    }

    if (order_number !== undefined) {
      updateData.order_number = order_number;
    }

    const { data, error } = await supabase
      .from("pretest_questions")
      .update(updateData)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Soal tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Soal berhasil diperbarui.",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE: Menghapus soal
const deleteQuestion = async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);
    const { id } = req.params;

    const { data, error } = await supabase
      .from("pretest_questions")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Soal tidak ditemukan atau tidak dapat dihapus.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Soal berhasil dihapus.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  getQuestionsByPretest,
  getStudentQuestionsByPretest,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,

};