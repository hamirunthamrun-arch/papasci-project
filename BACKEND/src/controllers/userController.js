const supabase = require("../config/supabaseClient");

// =====================================================
// 1. MENGAMBIL SEMUA USER
// =====================================================

const getAllProfiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Gagal mengambil data user:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// 2. TAMBAH USER BARU
// =====================================================

const createUser = async (req, res) => {
  try {
    const { nama, email, password, nim, role } = req.body;

    // -----------------------------------------------
    // Validasi
    // -----------------------------------------------

    if (!nama || !email) {
      return res.status(400).json({
        success: false,
        message: "Nama dan email wajib diisi.",
      });
    }

    // -----------------------------------------------
    // Password default
    // -----------------------------------------------

    const userPassword = password || "defaultpassword123";

    // -----------------------------------------------
    // Role default
    // -----------------------------------------------

    const userRole = role || "mahasiswa";

    // -----------------------------------------------
    // Buat akun Supabase Auth
    // -----------------------------------------------

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: userPassword,

      options: {
        data: {
          nama_lengkap: nama,
          nim: nim || null,
          role: userRole,
        },
      },
    });

    if (authError) {
      throw authError;
    }

    // -----------------------------------------------
    // Auth berhasil dibuat
    //
    // profiles dibuat otomatis oleh trigger
    // handle_new_user()
    // -----------------------------------------------

    res.status(201).json({
      success: true,
      message: "Akun berhasil ditambahkan!",
      data: authData.user,
    });
  } catch (err) {
    console.error("Gagal membuat user:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// 3. UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const { nama, email, nim, role } = req.body;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        nama_lengkap: nama,
        email,
        nim,
        role,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui.",
      data: data[0],
    });
  } catch (err) {
    console.error("Gagal memperbarui profile:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// 4. DELETE PROFILE
// =====================================================

const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "User berhasil dihapus.",
    });
  } catch (err) {
    console.error("Gagal menghapus user:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getAllProfiles,
  createUser,
  updateProfile,
  deleteProfile,
};
