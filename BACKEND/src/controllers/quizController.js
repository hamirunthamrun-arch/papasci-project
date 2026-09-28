const supabase = require('../config/supabaseClient');

const getQuestions = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { tipe } = req.query;

    let query = supabase.from('questions').select('id, module_id, tipe, pertanyaan, pilihan_ganda, image_url').eq('module_id', moduleId);
    if (tipe) query = query.eq('tipe', tipe);

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { module_id, tipe, pertanyaan, pilihan_ganda, jawaban_benar, image_url } = req.body;
    const { data, error } = await supabase
      .from('questions')
      .insert([{ module_id, tipe, pertanyaan, pilihan_ganda, jawaban_benar, image_url }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Soal berhasil ditambahkan', data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { pertanyaan, pilihan_ganda, jawaban_benar, image_url } = req.body;
    const { data, error } = await supabase
      .from('questions')
      .update({ pertanyaan, pilihan_ganda, jawaban_benar, image_url })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Soal berhasil diperbarui', data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Soal berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { userId, moduleId, tipe, userAnswers } = req.body;
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, jawaban_benar')
      .eq('module_id', moduleId)
      .eq('tipe', tipe);

    if (error) throw error;
    if (!questions || questions.length === 0) {
      return res.status(404).json({ success: false, message: 'Soal tidak ditemukan' });
    }

    let correctCount = 0;
    const totalQuestions = questions.length;

    questions.forEach((q) => {
      if (userAnswers[q.id] && userAnswers[q.id].trim().toUpperCase() === q.jawaban_benar.trim().toUpperCase()) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / totalQuestions) * 100);

    if (userId) {
      await supabase.from('user_scores').insert([
        { user_id: userId, module_id: moduleId, tipe: tipe, skor: finalScore }
      ]);
    }

    res.status(200).json({
      success: true,
      message: 'Kuis berhasil dikoreksi',
      data: { totalSoal: totalQuestions, jawabanBenar: correctCount, skor: finalScore }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getQuestions, createQuestion, updateQuestion, deleteQuestion, submitQuiz };