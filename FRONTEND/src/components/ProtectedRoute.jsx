import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import {
  fetchWithAuth,
  clearSession,
} from "../service/authService";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const response = await fetchWithAuth(
          "http://localhost:5000/api/auth/me"
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Session tidak valid."
          );
        }

        if (!isMounted) {
          return;
        }

        const currentUser = result.user;

        /*
         * Simpan data user terbaru.
         *
         * Kita pertahankan storage yang sedang digunakan.
         */
        const storage = localStorage.getItem("refresh_token")
          ? localStorage
          : sessionStorage;

        storage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

        /*
         * Cek role.
         */
        if (
          allowedRoles &&
          !allowedRoles.includes(currentUser.role)
        ) {
          setUser(currentUser);
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setUser(currentUser);
        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error(
          "Session validation error:",
          error
        );

        if (!isMounted) {
          return;
        }

        clearSession();

        setAuthorized(false);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles]);

  /*
   * Jangan langsung redirect sebelum
   * pemeriksaan session selesai.
   */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
      </div>
    );
  }

  /*
   * Session tidak valid.
   */
  if (!authorized && !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /*
   * User login tetapi role tidak sesuai.
   */
  if (!authorized && user) {
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

  return <Outlet />;
};

export default ProtectedRoute;