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
// GET SEMUA SIMULASI
// =========================================================

const getAllSimulasi = async (req, res) => {
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
      .from("simulasi")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get all simulasi error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// GET SIMULASI BERDASARKAN ID
// =========================================================

const getSimulasiById = async (req, res) => {
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
      .from("simulasi")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Simulasi tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get simulasi by id error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// CREATE SIMULASI
// =========================================================

const createSimulasi = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { judul, deskripsi, link_simulasi, image_path, status } = req.body;

    if (!judul?.trim() || !link_simulasi?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Judul dan link simulasi wajib diisi.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("simulasi")
      .insert({
        judul: judul.trim(),
        deskripsi: deskripsi || "",
        link_simulasi: link_simulasi.trim(),
        image_path: image_path || null,
        status: status || "public",
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Simulasi berhasil ditambahkan.",
      data,
    });
  } catch (err) {
    console.error("Create simulasi error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// UPDATE SIMULASI
// =========================================================

const updateSimulasi = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    const { judul, deskripsi, link_simulasi, image_path, status } = req.body;

    const supabase = createSupabaseUserClient(accessToken);

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (judul !== undefined) updateData.judul = judul.trim();
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (link_simulasi !== undefined) {
      updateData.link_simulasi = link_simulasi.trim();
    }
    if (image_path !== undefined) updateData.image_path = image_path;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from("simulasi")
      .update(updateData)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Simulasi tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Simulasi berhasil diperbarui.",
      data,
    });
  } catch (err) {
    console.error("Update simulasi error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// DELETE SIMULASI
// =========================================================

const deleteSimulasi = async (req, res) => {
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
      .from("simulasi")
      .delete()
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Simulasi tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Simulasi berhasil dihapus.",
      data,
    });
  } catch (err) {
    console.error("Delete simulasi error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getAllSimulasi,
  getSimulasiById,
  createSimulasi,
  updateSimulasi,
  deleteSimulasi,
};
