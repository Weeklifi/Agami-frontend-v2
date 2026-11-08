import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-400">
        লোড হচ্ছে…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_staff) return <Navigate to={user.role === "TEACHER" ? "/teacher" : "/student"} replace />;

  return children;
}
