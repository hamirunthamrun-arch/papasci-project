const createSupabaseUserClient = require("../config/supabaseUserClient");

// =========================================================
// MENGAMBIL ACCESS TOKEN
// =========================================================

const getAccessToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.replace("Bearer ", "");
};

// =========================================================
// GET SEMUA MATERI DALAM MODUL
// =========================================================

const getMaterialsByModule = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { module_id } = req.params;
    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("module_materials")
      .select("*")
      .eq("module_id", module_id)
      .order("order_number", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get materials error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// GET MATERI BERDASARKAN ID
// =========================================================

const getMaterialById = async (req, res) => {
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
      .from("module_materials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get material by id error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// CREATE MATERI
// =========================================================

const createMaterial = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const {
      module_id,
      title,
      subtitle,
      image_url,
      content,
      order_number,
    } = req.body;

    if (!module_id || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "module_id, title, dan content wajib diisi.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("module_materials")
      .insert([
        {
          module_id,
          title,
          subtitle,
          image_url,
          content,
          order_number,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Materi berhasil ditambahkan.",
      data,
    });
  } catch (err) {
    console.error("Create material error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// UPDATE MATERI
// =========================================================

const updateMaterial = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    const {
      module_id,
      title,
      subtitle,
      image_url,
      content,
      order_number,
    } = req.body;

    const updateData = {
      module_id,
      title,
      subtitle,
      image_url,
      content,
      order_number,
      updated_at: new Date().toISOString(),
    };

    // Hapus properti yang tidak dikirim agar nilainya tidak tertimpa null
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("module_materials")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Materi berhasil diperbarui.",
      data,
    });
  } catch (err) {
    console.error("Update material error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// DELETE MATERI
// =========================================================

const deleteMaterial = async (req, res) => {
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
      .from("module_materials")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Materi berhasil dihapus.",
      data,
    });
  } catch (err) {
    console.error("Delete material error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getMaterialsByModule,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
