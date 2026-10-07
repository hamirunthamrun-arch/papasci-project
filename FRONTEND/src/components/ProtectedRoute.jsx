import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

import { fetchWithAuth, clearSession } from "../service/authService";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const handleSessionExpired = () => {
      clearSession();

      if (!isMounted) return;

      setUser(null);
      setAuthorized(false);
      setLoading(false);

      navigate("/login", {
        replace: true,
        state: { from: location },
      });
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    const checkSession = async () => {
      try {
        const response = await fetchWithAuth(
          "http://localhost:5000/api/auth/me",
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Session tidak valid.");
        }

        if (!isMounted) return;

        const currentUser = result.user;

        const storage = localStorage.getItem("refresh_token")
          ? localStorage
          : sessionStorage;

        storage.setItem("user", JSON.stringify(currentUser));

        setUser(currentUser);

        if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error("Session validation error:", error);

        if (!isMounted) return;

        clearSession();
        setUser(null);
        setAuthorized(false);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;

      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [allowedRoles, location, navigate]);

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
        <style>{`
    @keyframes cek-sesi-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `}</style>

        <FaSpinner
          className="cek-sesi-spinner"
          style={{
            display: "inline-block",
            animation: "cek-sesi-spin 0.9s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!authorized && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

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
