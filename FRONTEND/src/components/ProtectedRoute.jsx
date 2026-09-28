import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const accessToken =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const userData =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  // Belum login
  if (!accessToken || !userData) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    console.error("Data user tidak valid:", error);

    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // Jika role tidak diperbolehkan
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    // Arahkan kembali ke halaman sesuai role
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "dosen") {
      return <Navigate to="/dosen" replace />;
    }

    if (user.role === "mahasiswa") {
      return <Navigate to="/" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  // Akses diperbolehkan
  return <Outlet />;
};

export default ProtectedRoute;