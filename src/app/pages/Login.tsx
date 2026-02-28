import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Terminal, Lock, User, ShieldAlert, Cpu, X, Minus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../../lib/api";

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
      const result = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userAgent: window.navigator.userAgent,
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
      setError("AUTHENTICATION_FAILURE: CONNECTION_LOST");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#C0C0C0] flex items-center justify-center p-4 font-mono">
      {/* The "Desktop" background color #008080 is the classic Win95 Teal */}

      <div className="w-full max-w-md shadow-[4px_4px_0_rgba(0,0,0,1)]">
        {/* Window Titlebar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between border-b border-white">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-gray-300" />
            <span className="text-[11px] font-bold tracking-tight">
              SYSTEM_AUTH.EXE
            </span>
          </div>
          <div className="flex gap-1">
            <Link to="/">
              <button className="w-4 h-4 bg-[#C0C0C0] border-outset border-gray-100 flex items-center justify-center text-black pointer-events-none font-bold">
                <X size={10} />
              </button>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="retro-border-outset bg-[#C0C0C0] p-4">
          <div className="bg-white border-2 border-inset border-gray-400 p-6">
            {/* Header / Logo Section */}
            <div className="text-center mb-8 border-b-2 border-dotted border-gray-300 pb-6">
              <div className="inline-block p-2 bg-[#C0C0C0] border-inset border-2 mb-3">
                <Cpu size={32} className="text-[#000080]" />
              </div>
              <h1 className="text-xl font-black text-[#000080] tracking-tighter uppercase italic">
                The Dev Exchange
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                Version 2.0.4 - Secure Terminal Access
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="bg-black text-[#FF0000] p-3 mb-6 border-2 border-red-600 flex gap-3 items-center animate-pulse">
                <ShieldAlert size={20} />
                <div className="text-[10px] font-bold leading-tight">
                  [SECURITY_ALERT]
                  <br />
                  {error.toUpperCase()}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[11px] font-bold text-[#000080]">
                  <User size={12} /> USER_ID (EMAIL):
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-inset border-gray-400 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-800 font-mono"
                  placeholder="admin@dev.local"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[11px] font-bold text-[#000080]">
                  <Lock size={12} /> ACCESS_KEY:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-2 border-inset border-gray-400 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-800 font-mono"
                  placeholder="********"
                  required
                  disabled={loading}
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className={`retro-button w-full py-3 mt-4 font-bold text-xs uppercase flex items-center justify-center gap-2 ${
                  loading ? "bg-gray-400 italic" : "bg-[#C0C0C0]"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
                    VERIFYING_CREDENTIALS...
                  </>
                ) : (
                  "▶ INITIATE_LOGIN"
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
              <Link
                to="/signup"
                className="text-[10px] font-bold text-[#000080] hover:text-[#FF4500] no-underline border-2 border-outset bg-[#C0C0C0] px-4 py-1 inline-block active:border-inset"
              >
                REQUEST_NEW_ACCESS_GRANT
              </Link>
            </div>
          </div>

          {/* Bottom "Status" Panel */}
          <div className="mt-4 flex justify-between items-center px-1">
            <div className="text-[9px] font-bold text-gray-600 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_3px_#22c55e]"></div>
              CRYPT_LINK_ESTABLISHED
            </div>
            <div className="text-[9px] font-bold text-gray-500 uppercase">
              Node: {window.location.hostname}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .border-outset {
          border-top: 2px solid #ffffff;
          border-left: 2px solid #ffffff;
          border-right: 2px solid #808080;
          border-bottom: 2px solid #808080;
        }
        .border-inset {
          border-top: 2px solid #808080;
          border-left: 2px solid #808080;
          border-right: 2px solid #ffffff;
          border-bottom: 2px solid #ffffff;
        }
        .retro-button {
          border-top: 2px solid #ffffff;
          border-left: 2px solid #ffffff;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
          box-shadow: 1px 1px 0 rgba(0,0,0,1);
        }
        .retro-button:active:not(:disabled) {
          border: 2px solid #808080;
          border-top-color: #404040;
          border-left-color: #404040;
          box-shadow: none;
          transform: translate(1px, 1px);
        }
      `}</style>
    </div>
  );
}
