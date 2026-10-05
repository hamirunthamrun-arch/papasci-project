const supabase = require('../config/supabaseClient');

// 1. Mengambil semua daftar user (Mahasiswa/Dosen)
const getAllProfiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Tambah User Baru oleh Admin (Otomatis buat akun Auth + Profiles)
const createUser = async (req, res) => {
  try {
    const { nama, email, password, nim, nidn, role, status } = req.body;

    // Buat akun di Supabase Auth terlebih dahulu
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password || 'defaultpassword123', // Password default jika tidak diisi
      email_confirm: true,
      user_metadata: { nama, role, nim: nim || null, nidn: nidn || null }
    });

    if (authError) throw authError;

    // Masukkan/perbarui data tambahan ke tabel profiles
    const userId = authData.user.id;
    const { data, error: profileError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: userId,
          nama_lengkap: nama,
          email: email,
          role: role || 'mahasiswa',
          nim: nim || null,
          nidn: nidn || null,
          status: status || 'Aktif'
        }
      ])
      .select();

    if (profileError) throw profileError;

    res.status(201).json({
      success: true,
      message: 'Akun berhasil ditambahkan!',
      data: data[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Update Profil / User
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, nim, nidn, status, role } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ nama_lengkap: nama, email, nim, nidn, status, role })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Profil berhasil diperbarui', data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Hapus Profil / User
const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hapus dari tabel profiles (dan idealnya auth jika didukung service role)
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;

    res.status(200).json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllProfiles, createUser, updateProfile, deleteProfile };