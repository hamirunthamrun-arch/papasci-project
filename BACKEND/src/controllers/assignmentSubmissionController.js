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
// GET SEMUA SUBMISSION MILIK SATU ASSIGNMENT
// =========================================================

const getSubmissionsByAssignment = async (req, res) => {
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
      .from("assignment_submissions")
      .select(
        `
        id,
        assignment_id,
        student_id,
        submission_url,
        submitted_at,
        status,
        score,
        created_at,
        updated_at
      `,
      )
      .eq("assignment_id", assignmentId)
      .order("submitted_at", {
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
    console.error("Get assignment submissions error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// GET SATU SUBMISSION BERDASARKAN ID
// =========================================================

const getAssignmentSubmissionById = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Submission ID wajib diberikan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(
        `
        id,
        assignment_id,
        student_id,
        submission_url,
        submitted_at,
        status,
        score,
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
          message: "Pengumpulan tugas tidak ditemukan.",
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get assignment submission error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// GET SUBMISSION MILIK SATU MAHASISWA
// =========================================================

const getSubmissionByStudent = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { assignmentId, studentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID wajib diberikan.",
      });
    }

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID wajib diberikan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(
        `
        id,
        assignment_id,
        student_id,
        submission_url,
        submitted_at,
        status,
        score,
        created_at,
        updated_at
      `,
      )
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get student submission error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// CREATE SUBMISSION
// =========================================================

const createAssignmentSubmission = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const {
      assignment_id,
      student_id,
      submission_url,
    } = req.body;

    // =====================================================
    // VALIDASI
    // =====================================================

    if (!assignment_id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID wajib diisi.",
      });
    }

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID wajib diisi.",
      });
    }

    if (!submission_url || !submission_url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Link tugas wajib diisi.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    // =====================================================
    // PASTIKAN ASSIGNMENT ADA
    // =====================================================

    const { data: assignment, error: assignmentError } =
      await supabase
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
    // SIMPAN SUBMISSION
    // =====================================================

    const { data, error } = await supabase
      .from("assignment_submissions")
      .insert([
        {
          assignment_id,
          student_id,
          submission_url: submission_url.trim(),
          status: "dikumpulkan",
        },
      ])
      .select(
        `
        id,
        assignment_id,
        student_id,
        submission_url,
        submitted_at,
        status,
        score,
        created_at,
        updated_at
      `,
      )
      .single();

    if (error) {
      // ================================================
      // MAHASISWA SUDAH PERNAH MENGUMPULKAN
      // ================================================

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Kamu sudah mengumpulkan tugas ini.",
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Tugas berhasil dikumpulkan.",
      data,
    });
  } catch (err) {
    console.error("Create assignment submission error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// UPDATE SUBMISSION
// =========================================================

const updateAssignmentSubmission = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Submission ID wajib diberikan.",
      });
    }

    const {
      submission_url,
      status,
      score,
    } = req.body;

    const updateData = {};

    // =====================================================
    // SUBMISSION URL
    // =====================================================

    if (submission_url !== undefined) {
      if (!submission_url.trim()) {
        return res.status(400).json({
          success: false,
          message: "Link tugas tidak boleh kosong.",
        });
      }

      updateData.submission_url = submission_url.trim();
    }

    // =====================================================
    // STATUS
    // =====================================================

    if (status !== undefined) {
      if (!["dikumpulkan", "dinilai"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status pengumpulan tidak valid.",
        });
      }

      updateData.status = status;
    }

    // =====================================================
    // SCORE
    // =====================================================

    if (score !== undefined) {
      if (score !== null) {
        const numericScore = Number(score);

        if (
          Number.isNaN(numericScore) ||
          numericScore < 0 ||
          numericScore > 100
        ) {
          return res.status(400).json({
            success: false,
            message: "Nilai harus berada di antara 0 sampai 100.",
          });
        }

        updateData.score = numericScore;
      } else {
        updateData.score = null;
      }
    }

    // =====================================================
    // CEK DATA UPDATE
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
      .from("assignment_submissions")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        id,
        assignment_id,
        student_id,
        submission_url,
        submitted_at,
        status,
        score,
        created_at,
        updated_at
      `,
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Pengumpulan tugas tidak ditemukan.",
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Pengumpulan tugas berhasil diperbarui.",
      data,
    });
  } catch (err) {
    console.error("Update assignment submission error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// DELETE SUBMISSION
// =========================================================

const deleteAssignmentSubmission = async (req, res) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Submission ID wajib diberikan.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    const { data, error } = await supabase
      .from("assignment_submissions")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Pengumpulan tugas tidak ditemukan.",
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Pengumpulan tugas berhasil dihapus.",
      data,
    });
  } catch (err) {
    console.error("Delete assignment submission error:", err);

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
  getSubmissionsByAssignment,
  getAssignmentSubmissionById,
  getSubmissionByStudent,
  createAssignmentSubmission,
  updateAssignmentSubmission,
  deleteAssignmentSubmission,
};