import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { Terminal, Lock, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const resultJson = await result.json();
      if (resultJson.error) {
        setError(resultJson.error);
      } else if (resultJson.success) {
        login(resultJson.user, resultJson.token);
        navigate("/");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#C0C0C0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Window Titlebar */}
        <div className="titlebar flex items-center gap-2 mb-0">
          <Terminal size={16} />
          <span>SYSTEM LOGIN v1.0</span>
        </div>

        {/* Login Form */}
        <div className="retro-border-outset p-6 bg-white">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#000080] mb-2">
              THE DEV EXCHANGE
            </h1>
            <p className="text-sm text-gray-600">
              Workstation Authentication Required
            </p>
          </div>

          {error && (
            <div className="retro-border-inset bg-[#FFF0F0] p-3 mb-4 text-[#FF0000] text-sm">
              <strong>ERROR:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold mb-1 text-[#000080]">
                <User size={14} className="inline mr-1" />
                EMAIL ADDRESS:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="retro-input w-full"
                placeholder="user@devexchange.local"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold mb-1 text-[#000080]">
                <Lock size={14} className="inline mr-1" />
                PASSWORD:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="retro-input w-full"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {/* Demo Credentials Info */}
            <div className="retro-border-inset bg-[#F0F0F0] p-3 text-xs font-mono">
              <div className="font-bold text-[#000080] mb-2">
                DEMO ACCOUNTS:
              </div>
              <div className="space-y-1">
                <div>admin@devexchange.local / admin123</div>
                <div>johndoe@devexchange.local / password123</div>
                <div>janecoder@devexchange.local / password123</div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="retro-button w-full py-2 text-sm font-bold"
              disabled={loading}
            >
              {loading ? "AUTHENTICATING..." : "▶ LOGIN"}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">No account? </span>
            <Link
              to="/signup"
              className="text-[#FF4500] hover:underline font-bold"
            >
              CREATE NEW ACCOUNT
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="retro-border-inset bg-[#F0F0F0] p-2 text-xs text-center text-gray-600 font-mono mt-2">
          SYSTEM STATUS: ONLINE | SECURE CONNECTION ENABLED
        </div>
      </div>
    </div>
  );
}
