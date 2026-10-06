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
// MENGAMBIL PROFIL MAHASISWA DARI TABEL PROFILES
// =========================================================

const attachStudentProfiles = async (supabase, submissions) => {
  if (!submissions) {
    return submissions;
  }

  const isArray = Array.isArray(submissions);
  const items = isArray ? submissions : [submissions];

  if (items.length === 0) {
    return isArray ? [] : null;
  }

  const studentIds = [
    ...new Set(
      items
        .map((item) => item.student_id)
        .filter(Boolean)
        .map(String),
    ),
  ];

  let profiles = [];

  if (studentIds.length > 0) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, nim")
      .in("id", studentIds);

    if (error) {
      throw error;
    }

    profiles = data || [];
  }

  const profileMap = new Map(
    profiles.map((profile) => [String(profile.id), profile]),
  );

  const result = items.map((submission) => {
    const profile = submission.student_id
      ? profileMap.get(String(submission.student_id)) || null
      : null;

    return {
      ...submission,

      // Identitas mahasiswa dari tabel profiles.
      student_name: profile?.nama_lengkap || null,
      student_nim: profile?.nim || null,

      // Format yang digunakan halaman DosenNilai.
      nama_lengkap: profile?.nama_lengkap || null,
      nim: profile?.nim || null,

      // Profil mahasiswa lengkap.
      profiles: profile,
    };
  });

  return isArray ? result : result[0];
};

// =========================================================
// MENGAMBIL IDENTITAS PENGGUNA YANG SEDANG LOGIN
// =========================================================

const getAuthenticatedUser = async (supabase, accessToken) => {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    throw new Error("Sesi login tidak valid. Silakan login kembali.");
  }

  return data.user;
};

// =========================================================
// GET SEMUA SUBMISSION MILIK SATU ASSIGNMENT
// BESERTA NAMA DAN NIM MAHASISWA
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

    const submissionsWithProfiles = await attachStudentProfiles(
      supabase,
      data || [],
    );

    return res.status(200).json({
      success: true,
      data: submissionsWithProfiles,
    });
  } catch (err) {
    console.error("Get assignment submissions error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Gagal mengambil pengumpulan tugas.",
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

    const submission = await attachStudentProfiles(supabase, data);

    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (err) {
    console.error("Get assignment submission error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Gagal mengambil pengumpulan tugas.",
    });
  }
};

// =========================================================
// GET SUBMISSION BERDASARKAN ASSIGNMENT DAN MAHASISWA
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

    if (!assignmentId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID dan Student ID wajib diberikan.",
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

    const submission = await attachStudentProfiles(supabase, data);

    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (err) {
    console.error("Get student submission error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Gagal mengambil pengumpulan mahasiswa.",
    });
  }
};

// =========================================================
// CREATE SUBMISSION
// ID MAHASISWA DIAMBIL DARI AKUN YANG LOGIN
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

    const { assignment_id, submission_url } = req.body;

    if (!assignment_id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID wajib diisi.",
      });
    }

    if (typeof submission_url !== "string" || !submission_url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Link tugas wajib diisi.",
      });
    }

    const supabase = createSupabaseUserClient(accessToken);

    // Jangan mempercayai student_id dari frontend.
    const user = await getAuthenticatedUser(supabase, accessToken);
    const authenticatedStudentId = user.id;

    // Pastikan tugas tersedia.
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

    const { data, error } = await supabase
      .from("assignment_submissions")
      .insert([
        {
          assignment_id,
          student_id: authenticatedStudentId,
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
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Kamu sudah mengumpulkan tugas ini.",
        });
      }

      throw error;
    }

    const submission = await attachStudentProfiles(supabase, data);

    return res.status(201).json({
      success: true,
      message: "Tugas berhasil dikumpulkan.",
      data: submission,
    });
  } catch (err) {
    console.error("Create assignment submission error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Gagal mengumpulkan tugas.",
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

    const { submission_url, status, score } = req.body;

    const updateData = {};

    // Validasi link tugas.
    if (submission_url !== undefined) {
      if (typeof submission_url !== "string" || !submission_url.trim()) {
        return res.status(400).json({
          success: false,
          message: "Link tugas tidak boleh kosong.",
        });
      }

      updateData.submission_url = submission_url.trim();
    }

    // Validasi status.
    if (status !== undefined) {
      if (!["dikumpulkan", "dinilai"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status pengumpulan tidak valid.",
        });
      }

      updateData.status = status;
    }

    // Validasi nilai.
    if (score !== undefined) {
      if (score === null) {
        updateData.score = null;
      } else {
        const numericScore = Number(score);

        if (
          score === "" ||
          !Number.isFinite(numericScore) ||
          numericScore < 0 ||
          numericScore > 100
        ) {
          return res.status(400).json({
            success: false,
            message: "Nilai harus berada di antara 0 sampai 100.",
          });
        }

        updateData.score = numericScore;
      }
    }

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

    const submission = await attachStudentProfiles(supabase, data);

    return res.status(200).json({
      success: true,
      message: "Pengumpulan tugas berhasil diperbarui.",
      data: submission,
    });
  } catch (err) {
    console.error("Update assignment submission error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memperbarui pengumpulan tugas.",
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
      message: err.message || "Gagal menghapus pengumpulan tugas.",
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
