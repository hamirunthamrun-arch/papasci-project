const supabase = require('../config/supabaseClient');

const getAllModules = async (req, res) => {
  try {
    const { data, error } = await supabase.from('modules').select('*').order('id', { ascending: true });
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('modules').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Modul tidak ditemukan' });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createModule = async (req, res) => {
  try {
    const { judul, deskripsi, kategori, file_materi_url, image_url } = req.body;
    const { data, error } = await supabase
      .from('modules')
      .insert([{ judul, deskripsi, kategori, file_materi_url, image_url }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Modul berhasil ditambahkan', data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, deskripsi, kategori, file_materi_url, image_url } = req.body;
    const { data, error } = await supabase
      .from('modules')
      .update({ judul, deskripsi, kategori, file_materi_url, image_url })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Modul berhasil diperbarui', data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Modul berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllModules, getModuleById, createModule, updateModule, deleteModule };