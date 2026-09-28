const supabase = require("../config/supabaseClient");

// 1. Endpoint Register
const register = async (req, res) => {
  try {
    const { email, password, nama_lengkap, nim } = req.body;

    // Memanggil Supabase Auth untuk mendaftarkan user baru
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama_lengkap,
          nim,
        },
      },
    });

    if (error) throw error;

    res.status(201).json({
      success: true,
      message:
        "Registrasi berhasil! Silakan cek email jika verifikasi diaktifkan, atau langsung login.",
      data: data.user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// 2. Endpoint Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Login melalui Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Ambil data profile berdasarkan ID user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, nim, email, role")
      .eq("id", data.user.id)
      .single();

    if (profileError) throw profileError;

    // Kirim response
    res.status(200).json({
      success: true,
      message: "Login berhasil!",

      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },

      user: {
        id: data.user.id,
        email: data.user.email,
        nama_lengkap: profile.nama_lengkap,
        nim: profile.nim,
        role: profile.role,
      },
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  register,
  login,
};
