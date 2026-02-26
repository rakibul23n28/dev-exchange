import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signup } from "../../lib/localStorage";
import { Terminal, Mail, Lock, User } from "lucide-react";

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
        }),
      });
      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        navigate("/login");
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#C0C0C0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Window Titlebar */}
        <div className="titlebar flex items-center gap-2 mb-0">
          <Terminal size={16} />
          <span>NEW USER REGISTRATION v1.0</span>
        </div>

        {/* Signup Form */}
        <div className="retro-border-outset p-6 bg-white">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#000080] mb-2">
              CREATE ACCOUNT
            </h1>
            <p className="text-sm text-gray-600">
              Join The Dev Exchange Community
            </p>
          </div>

          {error && (
            <div className="retro-border-inset bg-[#FFF0F0] p-3 mb-4 text-[#FF0000] text-sm">
              <strong>ERROR:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-bold mb-1 text-[#000080]">
                <User size={14} className="inline mr-1" />
                FULL NAME:
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="retro-input w-full"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold mb-1 text-[#000080]">
                <Mail size={14} className="inline mr-1" />
                EMAIL ADDRESS:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="retro-input w-full"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-bold mb-1 text-[#000080]">
                <Lock size={14} className="inline mr-1" />
                CONFIRM PASSWORD:
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="retro-input w-full"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="retro-button w-full py-2 text-sm font-bold"
              disabled={loading}
            >
              {loading ? "CREATING ACCOUNT..." : "▶ CREATE ACCOUNT"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              to="/login"
              className="text-[#FF4500] hover:underline font-bold"
            >
              LOGIN HERE
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
