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
// GET SEMUA FILE MILIK SATU ASSIGNMENT
// =========================================================

const getFilesByAssignment = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID wajib diberikan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("assignment_files")
      .select(
        `
        id,
        assignment_id,
        file_name,
        file_path,
        created_at,
        updated_at
      `,
      )
      .eq("assignment_id", assignmentId)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get assignment files error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// GET SATU FILE BERDASARKAN ID
// =========================================================

const getAssignmentFileById = async (req, res) => {
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
      .from("assignment_files")
      .select(
        `
        id,
        assignment_id,
        file_name,
        file_path,
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
          message: "File tugas tidak ditemukan.",
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get assignment file error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// CREATE FILE TUGAS
// =========================================================

const createAssignmentFile = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { assignment_id, file_name, file_path } = req.body;

    // =====================================================
    // VALIDASI
    // =====================================================

    if (!assignment_id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID wajib diisi.",
      });
    }

    if (!file_name || !file_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama file wajib diisi.",
      });
    }

    if (!file_path || !file_path.trim()) {
      return res.status(400).json({
        success: false,
        message: "Path file wajib diisi.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    // =====================================================
    // PASTIKAN ASSIGNMENT ADA
    // =====================================================

    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("id")
      .eq("id", assignment_id)
      .single();

    if (assignmentError) {
      if (assignmentError.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Assignment tidak ditemukan.",
        });
      }

      throw assignmentError;
    }

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment tidak ditemukan.",
      });
    }

    // =====================================================
    // SIMPAN FILE
    // =====================================================

    const { data, error } = await supabase
      .from("assignment_files")
      .insert([
        {
          assignment_id,
          file_name: file_name.trim(),
          file_path: file_path.trim(),
        },
      ])
      .select(
        `
        id,
        assignment_id,
        file_name,
        file_path,
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
      message: "File tugas berhasil ditambahkan.",
      data,
    });
  } catch (err) {
    console.error("Create assignment file error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// UPDATE FILE TUGAS
// =========================================================

const updateAssignmentFile = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    const { file_name, file_path } = req.body;

    const updateData = {};

    // =====================================================
    // FILE NAME
    // =====================================================

    if (file_name !== undefined) {
      if (!file_name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Nama file tidak boleh kosong.",
        });
      }

      updateData.file_name = file_name.trim();
    }

    // =====================================================
    // FILE PATH
    // =====================================================

    if (file_path !== undefined) {
      if (!file_path.trim()) {
        return res.status(400).json({
          success: false,
          message: "Path file tidak boleh kosong.",
        });
      }

      updateData.file_path = file_path.trim();
    }

    // =====================================================
    // CEK DATA
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
      .from("assignment_files")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        id,
        assignment_id,
        file_name,
        file_path,
        created_at,
        updated_at
      `,
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "File tugas tidak ditemukan.",
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "File tugas berhasil diperbarui.",
      data,
    });
  } catch (err) {
    console.error("Update assignment file error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// DELETE FILE TUGAS
// =========================================================

const deleteAssignmentFile = async (req, res) => {
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
      .from("assignment_files")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "File tugas tidak ditemukan.",
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "File tugas berhasil dihapus.",
      data,
    });
  } catch (err) {
    console.error("Delete assignment file error:", err);

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
  getFilesByAssignment,
  getAssignmentFileById,
  createAssignmentFile,
  updateAssignmentFile,
  deleteAssignmentFile,
};
