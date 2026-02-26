import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Wait for context to finish checking localStorage
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#C0C0C0] font-mono">
        LOADING SYSTEM...
      </div>
    );
  }

  // If user is logged in, redirect away from Login/Signup to Home
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
