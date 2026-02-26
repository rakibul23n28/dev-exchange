import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Terminal,
  Lock,
  User,
  Mail,
  X,
  Minus,
  UserPlus,
  ShieldCheck,
} from "lucide-react";

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

    if (formData.password !== formData.confirmPassword) {
      setError("VALIDATION_ERROR: PASSWORDS_DO_NOT_MATCH");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setError("CRITICAL_FAILURE: UNABLE_TO_REACH_AUTH_SERVER");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-[#C0C0C0] flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-2xl shadow-[4px_4px_0_rgba(0,0,0,1)]">
        {/* Window Titlebar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between border-b border-white">
          <div className="flex items-center gap-2">
            <UserPlus size={14} className="text-gray-300" />
            <span className="text-[11px] font-bold tracking-tight uppercase">
              User_Registration_Wizard.exe
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
        <div className="retro-border-outset bg-[#C0C0C0] p-4 flex flex-col md:flex-row gap-4">
          {/* Left Sidebar - Wizard Graphic */}
          <div className="hidden md:flex w-48 bg-[#808080] border-2 border-inset border-gray-600 flex-col items-center justify-center p-4 text-center space-y-4">
            <div className="p-3 bg-[#C0C0C0] border-outset border-2 shadow-lg">
              <Terminal size={48} className="text-[#000080]" />
            </div>
            <div className="text-white space-y-2">
              <p className="text-[10px] font-bold uppercase leading-tight">
                Terminal Setup
              </p>
              <div className="h-[2px] w-full bg-white/20"></div>
              <p className="text-[9px] opacity-80 uppercase leading-relaxed text-left">
                Welcome to the global exchange node. Follow instructions to
                initialize your identity.
              </p>
            </div>
          </div>

          {/* Right Section - The Form */}
          <div className="flex-1 bg-white border-2 border-inset border-gray-400 p-6 relative overflow-hidden">
            {/* Background scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

            <div className="relative z-10">
              <h1 className="text-lg font-black text-[#000080] mb-1 uppercase italic tracking-tighter">
                Identity_Initialization
              </h1>
              <p className="text-[10px] text-gray-500 font-bold mb-6 border-b border-gray-200 pb-2 uppercase">
                Step 1 of 1: Input Account Parameters
              </p>

              {error && (
                <div className="bg-black text-[#FF0000] p-2 mb-4 border-2 border-red-600 flex gap-2 items-center text-[10px] font-bold">
                  <X size={16} /> {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[10px] font-bold text-[#000080]">
                    <User size={12} /> USERNAME:
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-inset border-gray-400 p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-800"
                    placeholder="OPERATOR_01"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[10px] font-bold text-[#000080]">
                    <Mail size={12} /> UPLINK_EMAIL:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-inset border-gray-400 p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-800"
                    placeholder="operator@dev.local"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[10px] font-bold text-[#000080]">
                    <Lock size={12} /> ACCESS_KEY:
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-inset border-gray-400 p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-800"
                    placeholder="******"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[10px] font-bold text-[#000080]">
                    <ShieldCheck size={12} /> VERIFY_KEY:
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-inset border-gray-400 p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-800"
                    placeholder="******"
                    required
                  />
                </div>

                <div className="md:col-span-2 pt-4 flex items-center justify-between gap-4">
                  <Link
                    to="/login"
                    className="text-[10px] font-bold text-gray-600 hover:text-black uppercase"
                  >
                    &lt;&lt; Back to Terminal
                  </Link>
                  <button
                    type="submit"
                    className="retro-button px-6 py-2 font-bold text-[11px] flex items-center gap-2 bg-[#C0C0C0]"
                    disabled={loading}
                  >
                    {loading ? "TRANSMITTING..." : "FINISH_REGISTRATION >>"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Status Bar Footer */}
        <div className="bg-[#C0C0C0] border-t border-white p-1 flex justify-between px-3 text-[9px] font-bold text-gray-600 uppercase">
          <span>Identity_Manager_Service</span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            Waiting for input...
          </span>
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
