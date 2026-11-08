import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-400">
        লোড হচ্ছে…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // ভুল role-এর route — নিজের এলাকায় ফেরত
  if (role && user.role !== role) {
    return <Navigate to={user.role === "TEACHER" ? "/teacher" : "/student"} replace />;
  }

  return children;
}
