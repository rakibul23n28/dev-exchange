import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { User, Activity, FileText, Cpu } from "lucide-react";
import { useAuth } from "../../app/contexts/AuthContext";

interface Contributor {
  id: string;
  username: string;
  postCount: number;
}

interface UserData {
  username: string;
  reputationScore: number;
  specialization: string | null;
}

const API_BASE = "http://localhost:5000/api";

export function Sidebar() {
  const [topContributors, setTopContributors] = useState<Contributor[]>([]);
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState("");
  const { token } = useAuth(); // Getting token from Context

  // We use useCallback to keep the function stable
  const generateAiAdvice = useCallback((user: UserData) => {
    const messages = [
      `Welcome back, ${user.username}. Your reputation is currently ${user.reputationScore}. Keep contributing to reach the next tier.`,
      `Analyzing ${user.specialization || "General"} trends... I suggest reviewing the latest Database Optimization threads.`,
      `System indicates ${user.reputationScore > 50 ? "High" : "Standard"} trust level. Your recent posts are performing well.`,
      `Recommendation: Update your bio to include ${user.specialization || "new skills"} to increase profile visibility.`,
    ];
    setAiMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, []);

  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        setIsLoading(true);

        // Prioritize the token from Context, fallback to LocalStorage
        const activeToken = token || localStorage.getItem("token");

        // Prepare fetch promises
        const fetchContributors = fetch(`${API_BASE}/system/contributors`);

        // Only fetch profile if a token exists
        const fetchProfile = activeToken
          ? fetch(`${API_BASE}/profile/me`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${activeToken}`,
                "Content-Type": "application/json",
              },
            })
          : Promise.resolve(null);

        const [contributorsRes, profileRes] = await Promise.all([
          fetchContributors,
          fetchProfile,
        ]);

        // Handle Contributors
        if (contributorsRes.ok) {
          const contributorsData = await contributorsRes.json();
          setTopContributors(contributorsData);
        }

        // Handle Profile
        if (profileRes && profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
          generateAiAdvice(profileData);
        } else if (profileRes?.status === 401) {
          console.error("AI_ADVISOR: Session expired or invalid.");
        }
      } catch (error) {
        console.error("AI_ADVISOR_LINK_FAILED:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSidebarData();
  }, [token, generateAiAdvice]); // Re-run if token changes

  return (
    <aside className="w-64 space-y-6">
      {/* AI_COPILOT_ADVISOR.EXE */}
      <div className="retro-border-outset p-4 bg-[#c0c0c0]">
        <h3 className="font-bold text-[#800080] border-b border-gray-400 mb-2 flex items-center gap-2 text-sm uppercase">
          <Cpu size={14} />
          AI_COPILOT_ADVISOR.EXE
        </h3>

        <div className="bg-[#000040] text-[#00ff00] p-3 border-2 border-gray-600 shadow-inner font-mono text-[11px] min-h-[100px] relative overflow-hidden">
          {/* CRT Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-30"></div>

          <div className="relative z-10">
            <span className="opacity-50 text-[9px] block border-b border-[#00ff00]/30 mb-2 animate-pulse">
              {">"} INCOMING_STREAM_LOADED...
            </span>

            {isLoading ? (
              <span className="animate-pulse">BOOTING_NEURAL_LINK...</span>
            ) : userProfile ? (
              <p className="leading-relaxed">
                {aiMessage || "Processing user context..."}
              </p>
            ) : (
              <p className="text-amber-400 opacity-80 italic">
                {">"} AUTH_REQUIRED: Please log in to enable AI Advisor.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 px-1">
          <div className="flex flex-col">
            <span className="text-gray-600 text-[9px] uppercase font-bold">
              Model: GPT-v3.0_RETRO
            </span>
            <span className="text-[8px] text-gray-500">ENCRYPTION: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-gray-600 font-bold uppercase">
              Status
            </span>
            <div
              className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${
                userProfile
                  ? "bg-[#00ff00] shadow-[#00ff00]"
                  : "bg-red-600 shadow-red-600"
              }`}
              title={userProfile ? "AI Link Online" : "AI Link Offline"}
            ></div>
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="retro-border-outset p-4 bg-[#c0c0c0]">
        <h3 className="font-bold text-[#000080] border-b border-gray-400 mb-2 flex items-center gap-2 text-sm">
          <User size={16} />
          TOP CONTRIBUTORS
        </h3>
        <ul className="text-sm font-mono space-y-1">
          {!isLoading && topContributors.length > 0 ? (
            topContributors.map((contributor, index) => (
              <li key={contributor.id}>
                <Link
                  to={`/profile/${contributor.id}`}
                  className="flex items-center justify-between hover:bg-[#000080] hover:text-white p-1 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2"
                      style={{
                        backgroundColor:
                          index === 0
                            ? "#FFD700"
                            : index === 1
                              ? "#C0C0C0"
                              : index === 2
                                ? "#CD7F32"
                                : "#008000",
                      }}
                    ></div>
                    <span className="truncate w-32">
                      {contributor.username}
                    </span>
                  </div>
                  <span className="text-xs opacity-70">
                    [{contributor.postCount}]
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-xs text-gray-500 p-1">
              {isLoading ? "LOADING..." : "No data available."}
            </li>
          )}
        </ul>
      </div>

      {/* Quick Access */}
      <div className="retro-border-outset p-4 bg-[#c0c0c0]">
        <h3 className="font-bold text-[#000080] border-b border-gray-400 mb-2 flex items-center gap-2 text-sm">
          <FileText size={16} />
          QUICK ACCESS
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/new"
            className="flex flex-col items-center justify-center p-2 hover:bg-white border border-transparent active:border-inset group"
          >
            <div className="w-8 h-8 mb-1 flex items-center justify-center bg-gray-200 group-hover:bg-blue-100 border border-gray-400">
              📄
            </div>
            <span className="text-[10px] text-center font-bold">New Post</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center p-2 hover:bg-white border border-transparent active:border-inset group"
          >
            <div className="w-8 h-8 mb-1 flex items-center justify-center bg-gray-200 group-hover:bg-blue-100 border border-gray-400">
              📊
            </div>
            <span className="text-[10px] text-center font-bold">Dashboard</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
