const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Utama
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/modules", require("./routes/moduleRoutes"));
app.use("/api/module-materials", require("./routes/moduleMaterialRoutes"));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use("/api/pretests", require("./routes/pretestRoutes"));
app.use("/api/pretest-questions", require("./routes/pretestQuestionRoutes"));
app.use("/api/pretest-results", require("./routes/pretestResultRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api/quiz-questions", require("./routes/quizQuestionRoutes"));
app.use("/api/quiz-results", require("./routes/quizResultRoutes"));
app.use("/api/simulasi", require("./routes/simulasiRoutes"));
app.use("/api/video-pembelajaran", require("./routes/videoPembelajaranRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/assignment-files", require("./routes/assignmentFileRoutes"));
app.use("/api/assignment-submissions", require("./routes/assignmentSubmissionRoutes"));



// Root Endpoint untuk Cek Kesehatan Server
app.get("/", (req, res) => {
  res.json({
    message: "API Media Pembelajaran IPAA Berjalan Normal dan Siap Digunakan!",
  });
});

// Menjalankan Server
app.listen(PORT, () => {
  console.log(`Server Express berjalan di port ${PORT}`);
});

// // 1. Auth (/api/auth)
// POST /api/auth/register
// POST /api/auth/login

// // 2. Modules (/api/modules)
// GET    /api/modules
// GET    /api/modules/:id
// POST   /api/modules
// PUT    /api/modules/:id
// DELETE /api/modules/:id

// // 3. Quiz (/api/quiz)
// GET    /api/quiz/:moduleId
// POST   /api/quiz
// PUT    /api/quiz/:id
// DELETE /api/quiz/:id
// POST   /api/quiz/submit

// // 4. Tasks (/api/tasks)
// GET    /api/tasks
// GET    /api/tasks/:id
// POST   /api/tasks
// PUT    /api/tasks/:id
// DELETE /api/tasks/:id
// POST   /api/tasks/submit

// // 5. Users (/api/users)
// GET    /api/users
// GET    /api/users/:id
// PUT    /api/users/:id
// DELETE /api/users/:id
