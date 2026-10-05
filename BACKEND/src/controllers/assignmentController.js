const createSupabaseUserClient = require("../config/supabaseUserClient");

// =========================================================
// MENGAMBIL ACCESS TOKEN DARI REQUEST
// =========================================================

const getAccessToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.replace("Bearer ", "");
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
        image_path,
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
    console.error("Get all assignments error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
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
        image_path,
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
    console.error("Get assignment by id error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
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

    const { title, description, image_path, deadline, is_active } = req.body;

    // Validasi judul
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
          image_path: image_path || null,
          deadline: deadline || null,
          is_active: is_active ?? true,
        },
      ])
      .select(
        `
        id,
        title,
        description,
        image_path,
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
    console.error("Create assignment error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
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

    const { title, description, image_path, deadline, is_active } = req.body;

    const updateData = {};

    // TITLE
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Judul tugas tidak boleh kosong.",
        });
      }

      updateData.title = title.trim();
    }

    // DESCRIPTION
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    // IMAGE
    if (image_path !== undefined) {
      updateData.image_path = image_path || null;
    }

    // DEADLINE
    if (deadline !== undefined) {
      updateData.deadline = deadline || null;
    }

    // STATUS
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    // Tidak ada data
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
        image_path,
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
    console.error("Update assignment error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
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
    console.error("Delete assignment error:", err);

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
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
