
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
// GET SEMUA VIDEO PEMBELAJARAN
// =========================================================

const getAllVideoPembelajaran = async (req, res) => {
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
      .from("video_pembelajaran")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get all video pembelajaran error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// GET VIDEO BERDASARKAN ID
// =========================================================

const getVideoPembelajaranById = async (req, res) => {
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
      .from("video_pembelajaran")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Video pembelajaran tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get video pembelajaran by id error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// CREATE VIDEO PEMBELAJARAN
// =========================================================

const createVideoPembelajaran = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { judul, deskripsi, link } = req.body;

    if (
      typeof judul !== "string" ||
      !judul.trim() ||
      typeof link !== "string" ||
      !link.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Judul dan link YouTube wajib diisi.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("video_pembelajaran")
      .insert({
        judul: judul.trim(),
        deskripsi:
          typeof deskripsi === "string" ? deskripsi.trim() : "",
        link: link.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Video pembelajaran berhasil ditambahkan.",
      data,
    });
  } catch (err) {
    console.error("Create video pembelajaran error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// UPDATE VIDEO PEMBELAJARAN
// =========================================================

const updateVideoPembelajaran = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;
    const { judul, deskripsi, link } = req.body;

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (judul !== undefined) {
      if (typeof judul !== "string" || !judul.trim()) {
        return res.status(400).json({
          success: false,
          message: "Judul tidak boleh kosong.",
        });
      }

      updateData.judul = judul.trim();
    }

    if (deskripsi !== undefined) {
      if (typeof deskripsi !== "string") {
        return res.status(400).json({
          success: false,
          message: "Deskripsi harus berupa teks.",
        });
      }

      updateData.deskripsi = deskripsi.trim();
    }

    if (link !== undefined) {
      if (typeof link !== "string" || !link.trim()) {
        return res.status(400).json({
          success: false,
          message: "Link YouTube tidak boleh kosong.",
        });
      }

      updateData.link = link.trim();
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("video_pembelajaran")
      .update(updateData)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Video pembelajaran tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Video pembelajaran berhasil diperbarui.",
      data,
    });
  } catch (err) {
    console.error("Update video pembelajaran error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// DELETE VIDEO PEMBELAJARAN
// =========================================================

const deleteVideoPembelajaran = async (req, res) => {
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
      .from("video_pembelajaran")
      .delete()
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Video pembelajaran tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Video pembelajaran berhasil dihapus.",
      data,
    });
  } catch (err) {
    console.error("Delete video pembelajaran error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getAllVideoPembelajaran,
  getVideoPembelajaranById,
  createVideoPembelajaran,
  updateVideoPembelajaran,
  deleteVideoPembelajaran,
};