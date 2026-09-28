import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Beranda from "./pages/Beranda";
import Module from "./pages/Module";
import LabSimulasi from "./pages/LabSimulasi";
import Microteaching from "./pages/Microteaching";
import Pretest from "./pages/Pretest";
import ModuleDetail from "./Modules/ModuleDetail";
import Quiz from "./Quiz/Quiz";
import DetailTugas from "./pages/DetailTugas";
import Login from "./pages/Login";
import Register from "./pages/Register";
import KompetensiPedagogik from "./pages/KompetensiPedagogik";
import Profil from "./pages/Profil";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMahasiswa from "./pages/admin/AdminMahasiswa";
import AdminProfil from "./pages/admin/AdminProfil";

import DosenDashboard from "./pages/dosen/DosenDashboard";
import DosenLayout from "./layouts/DosenLayout";
import DosenModule from "./pages/dosen/DosenModule";
import DosenPretest from "./pages/dosen/DosenPretest";
import DosenPretestSoal from "./pages/dosen/DosenPretestSoal";
import DosenQuiz from "./pages/dosen/DosenQuiz";
import DosenQuizSoal from "./pages/dosen/DosenQuizSoal";
import DosenLabSimulasi from "./pages/dosen/DosenLabSimulasi";
import DosenVideoPembelajaran from "./pages/dosen/DosenVideoPembelajaran";
import DosenTugas from "./pages/dosen/DosenTugas";
import DosenPengumpulan from "./pages/dosen/DosenPengumpulan";
import DosenNilai from "./pages/dosen/DosenNilai";
import DosenKompetensiPedagogik from "./pages/dosen/DosenKompetensiPedagogik";
import DosenProfil from "./pages/dosen/DosenProfil";
import AdminDosen from "./pages/admin/AdminDosen";
import DosenMateri from "./pages/dosen/DosenMateri";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Beranda />} />
          <Route path="/pretest/:moduleId" element={<Pretest />} />
          <Route path="/module" element={<Module />} />
          <Route path="/module/:moduleId" element={<ModuleDetail />} />
          <Route path="/quiz/:moduleId" element={<Quiz />} />
          <Route path="/labsimulasi" element={<LabSimulasi />} />
          <Route path="/microteaching" element={<Microteaching />} />
          <Route path="/microteaching/tugas/:id" element={<DetailTugas />} />
          <Route
            path="/kompetensi-pedagogik"
            element={<KompetensiPedagogik />}
          />
          <Route path="/profil" element={<Profil />} />
        </Route>
        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/mahasiswa"
          element={
            <AdminLayout>
              <AdminMahasiswa />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/dosen"
          element={
            <AdminLayout>
              <AdminDosen />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/profil"
          element={
            <AdminLayout>
              <AdminProfil />
            </AdminLayout>
          }
        />

        {/*Dosen  */}
        <Route
          path="/dosen"
          element={
            <DosenLayout>
              <DosenDashboard />
            </DosenLayout>
          }
        />

        <Route
          path="/dosen/module"
          element={
            <DosenLayout>
              <DosenModule />
            </DosenLayout>
          }
        />
        <Route
          path="/dosen/module/:moduleId/materi"
          element={<DosenMateri />}
        />
        <Route
          path="/dosen/pretest"
          element={
            <DosenLayout>
              <DosenPretest />
            </DosenLayout>
          }
        />

        <Route
          path="/dosen/pretest/:id/soal"
          element={
            <DosenLayout>
              <DosenPretestSoal />
            </DosenLayout>
          }
        />

        <Route
          path="/dosen/quiz"
          element={
            <DosenLayout>
              <DosenQuiz />
            </DosenLayout>
          }
        />
        <Route
          path="/dosen/quiz/:id/soal"
          element={
            <DosenLayout>
              <DosenQuizSoal />
            </DosenLayout>
          }
        />
        <Route
          path="/dosen/labsimulasi"
          element={
            <DosenLayout>
              <DosenLabSimulasi />
            </DosenLayout>
          }
        />
        <Route
          path="/dosen/video-pembelajaran"
          element={
            <DosenLayout>
              <DosenVideoPembelajaran />
            </DosenLayout>
          }
        />
        <Route
          path="/dosen/tugas"
          element={
            <DosenLayout>
              <DosenTugas />
            </DosenLayout>
          }
        />
        <Route
          path="/dosen/pengumpulan"
          element={
            <DosenLayout>
              <DosenPengumpulan />
            </DosenLayout>
          }
        />
        <Route
          path="/dosen/nilai"
          element={
            <DosenLayout>
              <DosenNilai />
            </DosenLayout>
          }
        />
        <Route
          path="/dosen/kompetensi-pedagogik"
          element={
            <DosenLayout>
              <DosenKompetensiPedagogik />
            </DosenLayout>
          }
        />
        <Route
          path="/dosen/profil"
          element={
            <DosenLayout>
              <DosenProfil />
            </DosenLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
