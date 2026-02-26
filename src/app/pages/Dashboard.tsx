import { use, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../contexts/AuthContext";
import {
  getCurrentUser,
  getUserSessions,
  getUserReputationLog,
  AccessSession,
} from "../../lib/localStorage";
import { Post } from "../../../share-types/types";
import { format } from "date-fns";
import {
  BarChart3,
  FileText,
  Edit,
  Plus,
  Activity,
  Trash2,
  Award,
  TrendingUp,
  Download,
  Rss,
} from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [sessions, setSessions] = useState<AccessSession[]>([]);
  const [reputationLog, setReputationLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // const [user, setUser] = useState<any>(null);

  const { user, token } = useAuth();

  if (!user) return null;

  useEffect(() => {
    const currentUser = getCurrentUser();
    // if (!currentUser) {
    //   navigate("/login");
    //   return;
    // }

    // Fetch user's posts
    api
      .getPosts()
      .then((allPosts) => {
        setPosts(allPosts.filter((p) => p.author_id === user.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load sessions
    const userSessions = getUserSessions(user.id, 5);
    setSessions(userSessions);

    // Load reputation log
    const repLog = getUserReputationLog(user.id, 10);
    setReputationLog(repLog);
  }, [navigate]);

  const calculateStats = () => {
    const published = posts.filter((p) => p.status === "published").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalReplies = posts.reduce(
      (sum, p) => sum + (p.reply_count || 0),
      0,
    );

    return { published, drafts, totalViews, totalReplies };
  };

  const handleExportData = () => {
    if (!user) return;

    const data = {
      user: {
        id: user.id,
        email: user.email,
        name: user.username,
        created_at: user.created_at,
      },
      posts,
      stats: calculateStats(),
      sessions,
      reputationLog,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dev_exchange_export_${user.id}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deletePost = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    )
      return;

    try {
      await api.deletePost(id);
      // Remove from state
      setPosts(posts.filter((p) => p.id !== id));
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  if (!user || loading) {
    return (
      <div className="terminal-output">
        <pre>LOADING DASHBOARD...</pre>
        <pre className="animate-pulse">
          ████████████░░░░░░░░░░░░░░░░░░░░░░░░
        </pre>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="titlebar flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} />
          <span>
            SYSOP DASHBOARD - {user.email?.split("@")[0].toUpperCase()}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportData}
            className="retro-button text-sm flex items-center gap-1"
          >
            <Download size={14} /> EXPORT DATA
          </button>
          <Link to="/new" className="retro-button text-sm">
            + NEW POST
          </Link>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="retro-border-outset p-4 bg-white">
        <h2 className="text-lg font-bold text-[#000080] mb-4 flex items-center gap-2">
          <BarChart3 size={18} />
          PERFORMANCE METRICS
        </h2>

        <div className="grid grid-cols-4 gap-4">
          <div className="retro-border-inset p-3 bg-[#F0F0F0]">
            <div className="text-xs text-gray-600 mb-1">PUBLISHED</div>
            <div className="text-2xl font-bold text-[#008000]">
              {stats.published}
            </div>
            <div className="html-bar-graph mt-2">
              <div
                className="html-bar-fill"
                style={{
                  width: `${Math.min((stats.published / posts.length) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="retro-border-inset p-3 bg-[#F0F0F0]">
            <div className="text-xs text-gray-600 mb-1">DRAFTS</div>
            <div className="text-2xl font-bold text-[#FF4500]">
              {stats.drafts}
            </div>
            <div className="html-bar-graph mt-2">
              <div
                className="html-bar-fill bg-[#FF4500]"
                style={{
                  width: `${Math.min((stats.drafts / posts.length) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="retro-border-inset p-3 bg-[#F0F0F0]">
            <div className="text-xs text-gray-600 mb-1">TOTAL VIEWS</div>
            <div className="text-2xl font-bold text-[#000080]">
              {stats.totalViews}
            </div>
            <div className="html-bar-graph mt-2">
              <div
                className="html-bar-fill bg-[#000080]"
                style={{
                  width: `${Math.min((stats.totalViews / (stats.totalViews + 100)) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="retro-border-inset p-3 bg-[#F0F0F0]">
            <div className="text-xs text-gray-600 mb-1">REPLIES</div>
            <div className="text-2xl font-bold text-[#008000]">
              {stats.totalReplies}
            </div>
            <div className="html-bar-graph mt-2">
              <div
                className="html-bar-fill bg-[#008000]"
                style={{
                  width: `${Math.min((stats.totalReplies / (stats.totalReplies + 50)) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* RSS Feed Section */}
      <div className="retro-border-outset bg-[#FFFF00] p-4 border-2 border-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rss size={24} className="text-[#FF4500]" />
            <div>
              <h2 className="text-sm font-bold text-[#000080] font-mono">
                YOUR RSS FEED
              </h2>
              <p className="text-xs font-mono text-gray-700">
                Share your RSS feed so others can subscribe to your published
                articles
              </p>
            </div>
          </div>
          <Link
            to={`/rss/${user.id}`}
            className="retro-button px-4 py-2 text-sm flex items-center gap-2"
          >
            <Rss size={16} />
            VIEW/EXPORT RSS
          </Link>
        </div>
      </div>

      {/* File Manager - Drafts & Posts */}
      <div className="retro-border-outset p-4 bg-white">
        <h2 className="text-lg font-bold text-[#000080] mb-4 flex items-center gap-2">
          <FileText size={18} />
          FILE MANAGER - MY POSTS
        </h2>

        {posts.length === 0 ? (
          <div className="retro-border-inset p-8 bg-gray-100 text-center text-gray-500">
            <p className="mb-2">NO POSTS FOUND</p>
            <Link to="/new" className="retro-button">
              CREATE YOUR FIRST POST
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="retro-border-outset p-3 bg-white flex items-center gap-4"
              >
                <div className="text-2xl">
                  {post.status === "draft" ? "📝" : "📄"}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/post/${post.id}`}
                      className="font-bold text-[#000080] hover:text-[#FF4500] hover:underline"
                    >
                      {post.title}
                    </Link>
                    <span
                      className={`px-2 py-0.5 text-xs border ${
                        post.status === "published"
                          ? "bg-[#008000] text-white border-black"
                          : "bg-gray-300 border-gray-500"
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-gray-600">
                    Created:{" "}
                    {format(new Date(post.created_at), "MM/dd/yyyy HH:mm")} |
                    Views: {post.views} | Replies: {post.reply_count}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/edit/${post.id}`}
                    className="retro-button px-3 py-1 text-xs flex items-center gap-1"
                  >
                    <Edit size={12} />
                    EDIT
                  </Link>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="retro-button px-3 py-1 text-xs flex items-center gap-1 text-[#FF0000]"
                  >
                    <Trash2 size={12} />
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Access Log */}
      <div className="retro-border-outset p-4 bg-black">
        <h2 className="text-sm font-bold text-[#00FF00] mb-3 flex items-center gap-2 font-mono">
          &gt;&gt; ACCESS LOG - LAST 5 SESSIONS
        </h2>

        <div
          className="terminal-output"
          style={{ padding: "12px", fontSize: "11px" }}
        >
          <pre className="mb-2">SECURITY MONITOR v2.1 :: TRACKING ENABLED</pre>
          <pre className="mb-2">
            ================================================
          </pre>
          {sessions.length > 0 ? (
            sessions.map((session, i) => (
              <pre key={session.id} className="mb-1 text-[#00FF00]">
                [{format(new Date(session.timestamp), "yyyy-MM-dd HH:mm:ss")}]
                LOGIN :: USER_ID={user.id.substring(0, 8).toUpperCase()} :: IP=
                {session.ip_address} :: OS={session.os} :: BROWSER=
                {session.browser}
              </pre>
            ))
          ) : (
            <pre className="text-yellow-400">
              NO SESSION DATA AVAILABLE. LOG IN TO GENERATE SESSIONS.
            </pre>
          )}
          <pre className="mt-2">
            ================================================
          </pre>
          <pre className="text-[#00FF00]">
            TOTAL LOGGED SESSIONS: {sessions.length}
          </pre>
          <pre className="text-gray-400 mt-1">
            STATUS: MONITORING ACTIVE :: SECURITY LEVEL: HIGH
          </pre>
        </div>
      </div>

      {/* Reputation Tracker */}
      <div className="retro-border-outset p-4 bg-white">
        <h2 className="text-lg font-bold text-[#000080] mb-4 flex items-center gap-2">
          <Award size={18} />
          REPUTATION TRACKER
        </h2>

        <div className="retro-border-inset p-4 bg-[#F0F0F0]">
          {reputationLog.length > 0 ? (
            <div className="space-y-2">
              {reputationLog.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs font-mono border-b border-gray-300 pb-2"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp
                      size={14}
                      className={
                        log.change > 0 ? "text-[#008000]" : "text-[#FF0000]"
                      }
                    />
                    <span className="text-gray-700">
                      {format(new Date(log.timestamp), "MM/dd/yyyy HH:mm")}
                    </span>
                    <span className="text-gray-900">{log.reason}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${log.change > 0 ? "text-[#008000]" : "text-[#FF0000]"}`}
                    >
                      {log.change > 0 ? "+" : ""}
                      {log.change}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="font-bold text-[#000080]">
                      {log.new_total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4 text-sm">
              <p>No reputation changes recorded yet.</p>
              <p className="text-xs mt-1">
                Create posts, receive comments, and get reviews to earn
                reputation!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
