const express = require('express');
const router = express.Router();
const { getQuestions, createQuestion, updateQuestion, deleteQuestion, submitQuiz } = require('../controllers/quizController');

router.get('/:moduleId', getQuestions);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);
router.post('/submit', submitQuiz);

module.exports = router;