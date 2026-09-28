const supabase = require('../config/supabaseClient');

const getAllAssignments = async (req, res) => {
  try {
    const { data, error } = await supabase.from('assignments').select('*').order('id', { ascending: true });
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('assignments').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { judul_tugas, deskripsi, deadline, lampiran_url } = req.body;
    const { data, error } = await supabase
      .from('assignments')
      .insert([{ judul_tugas, deskripsi, deadline, lampiran_url }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Tugas berhasil dibuat', data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul_tugas, deskripsi, deadline, lampiran_url } = req.body;
    const { data, error } = await supabase
      .from('assignments')
      .update({ judul_tugas, deskripsi, deadline, lampiran_url })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Tugas berhasil diperbarui', data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Tugas berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, userId, fileUrl } = req.body;
    const { data, error } = await supabase
      .from('submissions')
      .insert([{ assignment_id: assignmentId, user_id: userId, file_url: fileUrl }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Tugas berhasil dikumpulkan', data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllAssignments, getAssignmentById, createAssignment, updateAssignment, deleteAssignment, submitAssignment };