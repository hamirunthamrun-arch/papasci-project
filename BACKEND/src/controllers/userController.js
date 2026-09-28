const supabase = require('../config/supabaseClient');

// 1. Mengambil semua daftar profil (untuk tabel list user di Admin Panel)
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

// 2. Mengambil detail profil berdasarkan ID
const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Memperbarui / Edit profil (misal: ganti nama atau mengubah role user jadi 'teacher' / 'student')
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_lengkap, role } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ nama_lengkap, role })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: data[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Menghapus profil
const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Catatan: Menghapus dari tabel profiles. 
    // Jika ingin menghapus akun autentikasinya juga, idealnya dihapus via Supabase Admin Auth API.
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Profil berhasil dihapus'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllProfiles, getProfileById, updateProfile, deleteProfile };