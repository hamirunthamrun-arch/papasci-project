const createSupabaseUserClient = require("../config/supabaseUserClient");

// =========================================================
// MENGAMBIL ACCESS TOKEN DARI REQUEST
// =========================================================

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

// =========================================================
// GET SEMUA PEDAGOGIC COMPETENCIES
// =========================================================

const getAllPedagogicCompetencies = async (req, res) => {
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
      .from("pedagogic_competencies")
      .select("*")
      .order("nomor", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get all pedagogic competencies error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// GET PEDAGOGIC COMPETENCY BERDASARKAN ID
// =========================================================

const getPedagogicCompetencyById = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("pedagogic_competencies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Kompetensi pedagogik tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get pedagogic competency by id error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// CREATE PEDAGOGIC COMPETENCY
// =========================================================

const createPedagogicCompetency = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { nomor, title, pemahaman, indicator, bukti, teknik } = req.body;

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("pedagogic_competencies")
      .insert([
        {
          nomor,
          title,
          pemahaman,
          indicator,
          bukti,
          teknik,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: "Kompetensi pedagogik berhasil ditambahkan.",
      data,
    });
  } catch (err) {
    console.error("Create pedagogic competency error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// UPDATE PEDAGOGIC COMPETENCY
// =========================================================

const updatePedagogicCompetency = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    const { nomor, title, pemahaman, indicator, bukti, teknik } = req.body;

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("pedagogic_competencies")
      .update({
        nomor,
        title,
        pemahaman,
        indicator,
        bukti,
        teknik,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Kompetensi pedagogik tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Kompetensi pedagogik berhasil diperbarui.",
      data,
    });
  } catch (err) {
    console.error("Update pedagogic competency error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// DELETE PEDAGOGIC COMPETENCY
// =========================================================

const deletePedagogicCompetency = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("pedagogic_competencies")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Kompetensi pedagogik tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Kompetensi pedagogik berhasil dihapus.",
      data,
    });
  } catch (err) {
    console.error("Delete pedagogic competency error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getAllPedagogicCompetencies,
  getPedagogicCompetencyById,
  createPedagogicCompetency,
  updatePedagogicCompetency,
  deletePedagogicCompetency,
};
