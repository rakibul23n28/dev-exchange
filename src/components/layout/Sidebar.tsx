import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Stats } from "../../../share-types/types";
import { Link } from "react-router";
import { User, Activity, FileText } from "lucide-react";
import { getPosts, getProfiles } from "../../lib/localStorage";

export function Sidebar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topContributors, setTopContributors] = useState<any[]>([]);

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error);

    // Calculate top contributors based on post count
    const calculateTopContributors = () => {
      const posts = getPosts().filter((p: any) => p.status === "published");
      const users = getProfiles();

      // Count posts per user
      const postCounts = posts.reduce((acc: any, post: any) => {
        acc[post.author_id] = (acc[post.author_id] || 0) + 1;
        return acc;
      }, {});

      // Create contributor list with post counts
      const contributors = users
        .map((user: any) => ({
          ...user,
          postCount: postCounts[user.id] || 0,
          // Calculate total likes across all their posts
          totalLikes: posts
            .filter((p: any) => p.author_id === user.id)
            .reduce((sum: number, p: any) => sum + (p.likes || 0), 0),
        }))
        .filter((user: any) => user.postCount > 0) // Only show users with posts
        .sort((a: any, b: any) => {
          // Sort by post count first, then by total likes
          if (b.postCount !== a.postCount) {
            return b.postCount - a.postCount;
          }
          return b.totalLikes - a.totalLikes;
        })
        .slice(0, 5); // Top 5 contributors

      setTopContributors(contributors);
    };

    calculateTopContributors();

    // Refresh contributors when storage changes
    const handleStorageChange = () => {
      calculateTopContributors();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleStorageChange);
    };
  }, []);

  return (
    <aside className="w-64 space-y-6">
      {/* System Statistics */}
      <div className="retro-border-outset p-4">
        <h3 className="font-bold text-[#000080] border-b border-gray-400 mb-2 flex items-center gap-2">
          <Activity size={16} />
          SYSTEM_STATS.EXE
        </h3>
        {stats ? (
          <div className="font-mono text-sm space-y-2">
            <div className="flex justify-between">
              <span>USERS:</span>
              <span className="text-[#008000]">{stats.users}</span>
            </div>
            <div className="flex justify-between">
              <span>POSTS:</span>
              <span className="text-[#008000]">{stats.posts}</span>
            </div>
            <div className="flex justify-between">
              <span>STORAGE:</span>
              <span className="text-[#008000]">{stats.kb_stored} KB</span>
            </div>
          </div>
        ) : (
          <div className="font-mono text-xs animate-pulse">CALCULATING...</div>
        )}
      </div>

      {/* User Directory */}
      <div className="retro-border-outset p-4">
        <h3 className="font-bold text-[#000080] border-b border-gray-400 mb-2 flex items-center gap-2">
          <User size={16} />
          TOP CONTRIBUTORS
        </h3>
        <ul className="text-sm font-mono space-y-1">
          {topContributors.length > 0 ? (
            topContributors.map((contributor: any, index: number) => (
              <li key={contributor.id}>
                <Link
                  to={`/profile/${contributor.id}`}
                  className="flex items-center justify-between hover:bg-blue-100 p-1 block"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
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
                    <span>{contributor.username}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {contributor.postCount}
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-xs text-gray-500 p-1">No contributors yet</li>
          )}
        </ul>
      </div>

      {/* File Manager (Quick Links) */}
      <div className="retro-border-outset p-4">
        <h3 className="font-bold text-[#000080] border-b border-gray-400 mb-2 flex items-center gap-2">
          <FileText size={16} />
          QUICK ACCESS
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/new"
            className="flex flex-col items-center justify-center p-2 hover:bg-blue-100 border border-transparent hover:border-blue-300"
          >
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop&q=80"
              alt="New Post"
              className="w-8 h-8 object-contain mb-1"
            />
            <span className="text-xs text-center">New Post</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center p-2 hover:bg-blue-100 border border-transparent hover:border-blue-300"
          >
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop&q=80"
              alt="Dashboard"
              className="w-8 h-8 object-contain mb-1"
            />
            <span className="text-xs text-center">Stats</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
