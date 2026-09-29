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

// 3. Endpoint Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token wajib dikirim.",
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      return res.status(401).json({
        success: false,
        message: "Session tidak dapat diperbarui.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Token berhasil diperbarui.",
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch (err) {
    console.error("Refresh token error:", err);

    res.status(401).json({
      success: false,
      message: "Refresh token tidak valid atau sudah kedaluwarsa.",
    });
  }
};

// 4. Endpoint mengecek session pengguna
const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header tidak ditemukan.",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token tidak ditemukan.",
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: "Session tidak valid.",
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, nim, email, role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    res.status(200).json({
      success: true,
      message: "Session valid.",
      user: {
        id: user.id,
        email: user.email,
        nama_lengkap: profile.nama_lengkap,
        nim: profile.nim,
        role: profile.role,
      },
    });
  } catch (err) {
    console.error("Get current user error:", err);

    res.status(401).json({
      success: false,
      message: "Session tidak valid atau sudah berakhir.",
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getCurrentUser,
};
