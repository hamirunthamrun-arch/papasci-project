const createSupabaseUserClient = require("../config/supabaseUserClient");

// =========================================================
// MENGAMBIL ACCESS TOKEN DARI REQUEST
// =========================================================

const getAccessToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim() || null;
};

// =========================================================
// MENGIDENTIFIKASI ERROR AUTENTIKASI SUPABASE
// =========================================================

const isAuthError = (error) => {
  const message = error?.message || "";

  return (
    error?.code === "PGRST301" ||
    /expected 3 parts in jwt|jwt expired|invalid jwt|invalid token/i.test(
      message,
    )
  );
};

// =========================================================
// PENANGANAN ERROR CONTROLLER
// =========================================================

const handleControllerError = (res, error, logMessage, fallbackMessage) => {
  console.error(logMessage, error);

  if (isAuthError(error)) {
    return res.status(401).json({
      success: false,
      message: "Session tidak valid. Silakan perbarui session.",
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

// =========================================================
// GET SEMUA ASSIGNMENTS
// =========================================================

const getAllAssignments = async (req, res) => {
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
      .from("assignments")
      .select(
        `
        id,
        title,
        description,
        image_url,
        deadline,
        is_active,
        created_at,
        updated_at
      `,
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return handleControllerError(
      res,
      err,
      "Get all assignments error:",
      "Gagal mengambil daftar tugas.",
    );
  }
};

// =========================================================
// GET ASSIGNMENT BERDASARKAN ID
// =========================================================

const getAssignmentById = async (req, res) => {
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
      .from("assignments")
      .select(
        `
        id,
        title,
        description,
        image_url,
        deadline,
        is_active,
        created_at,
        updated_at
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Assignment tidak ditemukan.",
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return handleControllerError(
      res,
      err,
      "Get assignment by id error:",
      "Gagal mengambil detail tugas.",
    );
  }
};

// =========================================================
// CREATE ASSIGNMENT
// =========================================================

const createAssignment = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { title, description, image_url, deadline, is_active } = req.body;

    // =====================================================
    // VALIDASI JUDUL
    // =====================================================

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Judul tugas wajib diisi.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("assignments")
      .insert([
        {
          title: title.trim(),
          description: description?.trim() || null,
          image_url: image_url || null,
          deadline: deadline || null,
          is_active: is_active ?? true,
        },
      ])
      .select(
        `
        id,
        title,
        description,
        image_url,
        deadline,
        is_active,
        created_at,
        updated_at
      `,
      )
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Assignment berhasil ditambahkan.",
      data,
    });
  } catch (err) {
    return handleControllerError(
      res,
      err,
      "Create assignment error:",
      "Gagal menambahkan tugas.",
    );
  }
};

// =========================================================
// UPDATE ASSIGNMENT
// =========================================================

const updateAssignment = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    const { title, description, image_url, deadline, is_active } = req.body;

    const updateData = {};

    // =====================================================
    // TITLE
    // =====================================================

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Judul tugas tidak boleh kosong.",
        });
      }

      updateData.title = title.trim();
    }

    // =====================================================
    // DESCRIPTION
    // =====================================================

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    // =====================================================
    // IMAGE
    // =====================================================

    if (image_url !== undefined) {
      updateData.image_url = image_url || null;
    }

    // =====================================================
    // DEADLINE
    // =====================================================

    if (deadline !== undefined) {
      updateData.deadline = deadline || null;
    }

    // =====================================================
    // STATUS
    // =====================================================

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    // =====================================================
    // TIDAK ADA DATA
    // =====================================================

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data yang diperbarui.",
      });
    }

    updateData.updated_at = new Date().toISOString();

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("assignments")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        id,
        title,
        description,
        image_url,
        deadline,
        is_active,
        created_at,
        updated_at
      `,
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Assignment tidak ditemukan.",
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Assignment berhasil diperbarui.",
      data,
    });
  } catch (err) {
    return handleControllerError(
      res,
      err,
      "Update assignment error:",
      "Gagal memperbarui tugas.",
    );
  }
};

// =========================================================
// DELETE ASSIGNMENT
// =========================================================

const deleteAssignment = async (req, res) => {
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
      .from("assignments")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Assignment tidak ditemukan.",
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Assignment berhasil dihapus.",
      data,
    });
  } catch (err) {
    return handleControllerError(
      res,
      err,
      "Delete assignment error:",
      "Gagal menghapus tugas.",
    );
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
