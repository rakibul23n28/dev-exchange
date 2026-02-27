import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";
import {
  BarChart3,
  FileText,
  Edit,
  Trash2,
  Award,
  TrendingUp,
  Download,
  Rss,
  Terminal,
  Activity,
  Plus,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  authorId: string;
  views: number;
  likes: number;
  createdAt: string;
}

interface AccessSession {
  id: string;
  timestamp: string;
  ipAddress: string;
  os: string;
  browser: string;
}

interface ReputationLog {
  id: string;
  change: number;
  reason: string;
  newTotal: number;
  timestamp: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [sessions, setSessions] = useState<AccessSession[]>([]);
  const [reputationLog, setReputationLog] = useState<ReputationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const [postsRes, sessionsRes, repRes] = await Promise.all([
          fetch(`${API_BASE}/posts/user/${user.id}`),
          fetch(`${API_BASE}/sessions/${user.id}`, { headers }),
          fetch(`${API_BASE}/reputation/${user.id}`, { headers }),
        ]);

        if (postsRes.ok) setPosts(await postsRes.json());
        if (sessionsRes.ok) setSessions(await sessionsRes.json());
        if (repRes.ok) setReputationLog(await repRes.json());
      } catch (error) {
        console.error("Critical error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      }
    } catch (error) {
      alert("Failed to delete post.");
    }
  };

  const stats = {
    published: posts.filter((p) => p.status === "PUBLISHED").length,
    drafts: posts.filter((p) => p.status === "DRAFT").length,
    totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
    totalLikes: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="retro-border-outset p-4 bg-[#C0C0C0] w-96">
          <div className="bg-[#000080] text-white p-1 text-xs font-bold mb-4">
            SYSTEM_CHECK.EXE
          </div>
          <pre className="text-xs font-mono mb-2">
            LOADING CLOUD_RESOURCES...
          </pre>
          <div className="w-full bg-gray-300 h-4 border border-black overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-800 animate-[load_2s_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10 px-4">
      {/* Top Application Bar */}
      <div className="retro-border-outset bg-[#C0C0C0] mb-6">
        <div className="bg-[#000080] text-white p-1.5 flex items-center justify-between mx-1 mt-1">
          <div className="flex items-center gap-2 px-1">
            <Activity size={16} />
            <span className="text-xs font-bold tracking-tight">
              CONTROL_PANEL.MSC - [Logged in as: {user.username?.toUpperCase()}]
            </span>
          </div>
          <div className="flex gap-1">
            <Link
              to="/"
              className="bg-[#C0C0C0] text-black px-2 text-xs border-outset font-bold"
            >
              <button className="bg-[#C0C0C0] text-black px-2 text-xs border-outset font-bold">
                X
              </button>
            </Link>
          </div>
        </div>

        <div className="p-3 flex flex-wrap gap-4 items-center justify-between bg-[#C0C0C0]">
          <div className="flex gap-2">
            <Link
              to="/new"
              className="retro-button px-4 py-1.5 flex items-center gap-2 text-sm font-bold bg-gray-100"
            >
              <Plus size={16} /> NEW_POST
            </Link>
            <button
              onClick={() => {
                const data = { user, posts, stats, sessions, reputationLog };
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `backup_${user.username}.json`;
                a.click();
              }}
              className="retro-button px-4 py-1.5 flex items-center gap-2 text-sm"
            >
              <Download size={16} /> BACKUP
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#FFFFE1] border border-black px-3 py-1 text-[11px] font-mono shadow-inner">
            <Rss size={14} className="text-orange-600" />
            <span>RSS: /rss/{user.id.slice(0, 8)}...</span>
            <Link
              to={`/rss/${user.id}`}
              className="underline text-blue-800 ml-2"
            >
              VIEW
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN - CONTENT & STATS */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Performance Grid */}
          <div className="retro-border-outset p-4 bg-[#C0C0C0]">
            <h2 className="text-xs font-bold bg-[#808080] text-white px-2 py-0.5 mb-4 tracking-widest flex items-center gap-2">
              <BarChart3 size={14} /> PERFORMANCE_METRICS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "PUBLISHED", val: stats.published, color: "#008000" },
                { label: "DRAFTS", val: stats.drafts, color: "#800000" },
                { label: "VIEWS", val: stats.totalViews, color: "#000080" },
                { label: "LIKES", val: stats.totalLikes, color: "#008000" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="retro-border-inset p-2 bg-white text-center"
                >
                  <div className="text-[9px] font-bold text-gray-500 uppercase">
                    {stat.label}
                  </div>
                  <div
                    className="text-xl font-bold font-mono"
                    style={{ color: stat.color }}
                  >
                    {stat.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* File Manager (Posts) */}
          <div className="retro-border-outset p-4 bg-[#C0C0C0]">
            <h2 className="text-xs font-bold bg-[#808080] text-white px-2 py-0.5 mb-4 tracking-widest flex items-center gap-2">
              <FileText size={14} /> FILE_MANAGER
            </h2>
            <div className="bg-white retro-border-inset min-h-[400px]">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-400">
                    <th className="p-2 border-r border-gray-300">STATUS</th>
                    <th className="p-2 border-r border-gray-300">FILENAME</th>
                    <th className="p-2 border-r border-gray-300">VIEWS</th>
                    <th className="p-2 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-10 text-center text-gray-400 italic"
                      >
                        DIR: NO FILES FOUND
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-gray-100 hover:bg-blue-50"
                      >
                        <td className="p-2 border-r border-gray-100">
                          <span
                            className={`px-1 py-0.5 text-[9px] font-bold border ${post.status === "PUBLISHED" ? "bg-green-100 border-green-600 text-green-700" : "bg-gray-100 border-gray-600"}`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="p-2 border-r border-gray-100">
                          <Link
                            to={`/post/${post.id}`}
                            className="text-blue-800 font-bold hover:underline truncate block max-w-[200px]"
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td className="p-2 border-r border-gray-100">
                          {post.views}
                        </td>
                        <td className="p-2 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/edit/${post.id}`)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="text-red-600 hover:underline"
                          >
                            Del
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - LOGS & REPUTATION */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Reputation Log */}
          <div className="retro-border-outset p-4 bg-[#C0C0C0]">
            <h2 className="text-xs font-bold bg-[#808080] text-white px-2 py-0.5 mb-4 tracking-widest flex items-center gap-2">
              <Award size={14} /> REPUTATION_LOG
            </h2>
            <div className="retro-border-inset bg-[#F0F0F0] p-2 space-y-2 max-h-[250px] overflow-y-auto">
              {reputationLog.length > 0 ? (
                reputationLog.map((log) => (
                  <div
                    key={log.id}
                    className="text-[10px] font-mono flex flex-col border-b border-gray-300 pb-1"
                  >
                    <div className="flex justify-between font-bold">
                      <span className="text-blue-800">{log.reason}</span>
                      <span
                        className={
                          log.change > 0 ? "text-green-700" : "text-red-700"
                        }
                      >
                        {log.change > 0 ? "+" : ""}
                        {log.change}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {format(new Date(log.timestamp), "yyyy/MM/dd HH:mm")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[10px] py-4 text-gray-500 italic">
                  No entry logs found.
                </div>
              )}
            </div>
          </div>

          {/* Remote Access Log */}
          <div className="retro-border-outset p-4 bg-black text-[#00FF00]">
            <h2 className="text-xs font-bold mb-3 flex items-center gap-2">
              <Terminal size={14} /> REMOTE_ACCESS_LOG
            </h2>
            <div className="font-mono text-[9px] space-y-1 h-[250px] overflow-y-auto custom-scrollbar">
              <div className="text-gray-500 mb-2 border-b border-gray-800">
                SEC_MONITOR: ACTIVE
              </div>
              {sessions.map((s) => (
                <div key={s.id} className="whitespace-nowrap">
                  [{format(new Date(s.timestamp), "HH:mm:ss")}] LOGIN:{" "}
                  {s.ipAddress}
                  <br />
                  <span className="opacity-60 italic">&gt; OS: {s.os}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #333; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #666; border: 2px solid #333; }
        @keyframes load {
          0% { left: -100%; width: 30%; }
          100% { left: 100%; width: 30%; }
        }
      `}</style>
    </div>
  );
}
