import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Terminal, LogOut, User as UserIcon, Activity } from "lucide-react";
import { useAuth } from "../../app/contexts/AuthContext";
import { apiFetch } from "../../lib/api";

export function Header() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [marqueeText, setMarqueeText] = useState("*** SYSTEM ONLINE ***");
  const [currentTime, setCurrentTime] = useState(new Date());

  const updateMarqueeData = async () => {
    try {
      const response = await apiFetch(`/system/stats`);
      if (!response.ok) throw new Error();
      const stats = await response.json();
      const items = [
        "*** STATUS: SECURE ***",
        `USERS: ${stats.users || 0}`,
        `DB_SEGMENTS: ${stats.posts || 0}`,
        `LOCAL_TIME: ${new Date().toLocaleTimeString()}`,
      ];
      setMarqueeText(items.join(" *** "));
    } catch (err) {
      setMarqueeText(
        "*** SYSTEM ONLINE *** ENCRYPTION: AES-256 *** V_SECURE.VXD LOADED ***",
      );
    }
  };

  useEffect(() => {
    updateMarqueeData();
    const marqueeInterval = setInterval(updateMarqueeData, 60000);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleAuthChange = () => updateMarqueeData();
    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      clearInterval(marqueeInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.dispatchEvent(new Event("auth-change"));
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-[#C0C0C0] border-b-2 border-white shadow-[0_1px_0_rgba(0,0,0,1)] mb-4 sticky top-0 z-50 py-1 px-2">
      <div className="max-w-6xl mx-auto flex items-center gap-4 h-9">
        {/* Compact Logo - Font bumped to text-sm */}
        <Link
          to="/"
          className="retro-button px-3 py-1 flex items-center gap-2 no-underline text-black group min-w-fit"
        >
          <Terminal
            size={16}
            className="group-hover:text-blue-800 text-blue-900"
          />
          <span className="font-bold text-sm tracking-tight uppercase">
            DEV_EXCHANGE
          </span>
        </Link>

        {/* Slim CRT Marquee - Font bumped to 11px */}
        <div className="flex-1 overflow-hidden bg-black border-2 border-inset border-gray-600 h-7 flex items-center relative rounded-sm">
          <div className="whitespace-nowrap animate-marquee text-[#33ff33] font-mono text-[11px] uppercase tracking-wider font-bold">
            {marqueeText}
          </div>
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px]"></div>
        </div>

        {/* User Actions & Compact Clock */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                to={`/profile/${user.id}`}
                className="retro-button px-3 py-1 flex items-center gap-2 no-underline text-black text-[12px] font-bold"
              >
                <UserIcon size={14} className="text-blue-800" />
                <span>{user.username?.toUpperCase()}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="retro-button px-2 py-1 text-red-800 hover:bg-red-50 transition-colors"
                title="LOGOUT"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="retro-button px-4 py-1 text-black font-bold no-underline text-[12px]"
            >
              LOGIN.EXE
            </Link>
          )}

          {/* System Tray Style Clock - Font bumped to 11px */}
          <div className="retro-border-inset bg-[#C0C0C0] px-3 py-1 flex items-center gap-2 text-[11px] font-mono font-bold text-gray-800 shadow-inner min-w-[85px]">
            <Activity size={12} className="text-blue-700 animate-pulse" />
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 25s linear infinite;
        }
        .retro-button {
          background: #C0C0C0;
          border-top: 2px solid #FFFFFF;
          border-left: 2px solid #FFFFFF;
          border-right: 2px solid #808080;
          border-bottom: 2px solid #808080;
          box-shadow: 1px 1px 0 rgba(0,0,0,1);
        }
        .retro-button:active {
          border: 2px solid #808080;
          border-top-color: #404040;
          border-left-color: #404040;
          box-shadow: none;
          transform: translate(1px, 1px);
        }
        .retro-border-inset {
          border-top: 2px solid #808080;
          border-left: 2px solid #808080;
          border-right: 2px solid #FFFFFF;
          border-bottom: 2px solid #FFFFFF;
        }
      `}</style>
    </header>
  );
}
