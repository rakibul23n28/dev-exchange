import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";
import { format } from "date-fns";
import { Search } from "lucide-react";

export function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filterTag, setFilterTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function to extract first image URL from markdown content
  const extractFirstImage = (content: string): string | null => {
    // Match markdown image syntax: ![alt](url)
    const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
    const match = content.match(markdownImageRegex);
    return match ? match[1] : null;
  };

  useEffect(() => {
    api
      .getPosts()
      .then((allPosts) => {
        // Filter out draft posts - only show published posts
        const publishedPosts = allPosts.filter((p) => p.status === "published");
        setPosts(publishedPosts);
      })
      .catch(console.error);
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-[#C0C0C0] p-4 retro-border-outset mb-6">
        <label htmlFor="search" className="font-bold text-[#000080]">
          SEARCH.EXE:
        </label>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 retro-input font-mono text-sm border-2 border-inset border-gray-400 p-1"
            placeholder="Search keywords or author..."
          />
          <button className="retro-button bg-[#C0C0C0] font-bold px-4 py-1 flex items-center gap-2">
            <Search size={16} /> GO!
          </button>
        </div>
      </div>

      {/* Main Feed Table */}
      <div className="bg-white border-2 border-inset border-gray-400 p-1 overflow-x-auto">
        <table className="w-full font-mono text-sm border-collapse">
          <thead>
            <tr className="bg-[#000080] text-white text-left">
              <th className="p-2 border border-white w-20">IMAGE</th>
              <th className="p-2 border border-white">SUBJECT LINE</th>
              <th className="p-2 border border-white w-32">AUTHOR</th>
              <th className="p-2 border border-white w-20 text-center">
                RATING
              </th>
              <th className="p-2 border border-white w-16 text-center">
                REPLIES
              </th>
              <th className="p-2 border border-white w-40 text-right">
                LAST ACTIVITY
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  NO RECORDS FOUND.
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-yellow-50 group border-b border-gray-200"
                >
                  <td className="p-2 border-r border-gray-200">
                    <div className="w-16 h-12 retro-border-inset p-0.5 bg-[#C0C0C0]">
                      <img
                        src={
                          extractFirstImage(post.content) ||
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="48"%3E%3Crect fill="%23C0C0C0" width="64" height="48"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="8"%3ENO IMG%3C/text%3E%3C/svg%3E'
                        }
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="48"%3E%3Crect fill="%23C0C0C0" width="64" height="48"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="8"%3ENO IMG%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    <Link
                      to={`/post/${post.id}`}
                      className="text-[#000080] font-bold hover:underline hover:text-[#FF4500] group-hover:underline"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    <Link
                      to={`/profile/${post.author_id}`}
                      className="text-[#555555] hover:text-black"
                    >
                      {post.author_name}
                    </Link>
                  </td>
                  <td className="p-2 border-r border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[#FF4500] font-bold">★</span>
                      <span className="font-bold text-[#008000]">
                        {post.likes || 0}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 border-r border-gray-200 text-center font-bold">
                    {post.reply_count}
                  </td>
                  <td className="p-2 text-right text-xs text-gray-500">
                    {format(new Date(post.updated_at), "MM/dd/yyyy HH:mm")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (Visual only for now) */}
      <div className="flex justify-between items-center text-xs font-mono text-gray-500 pt-2">
        <span>SHOWING {filteredPosts.length} RECORDS</span>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 border border-gray-400 bg-gray-100 disabled:opacity-50"
            disabled
          >
            PREV
          </button>
          <button
            className="px-2 py-1 border border-gray-400 bg-gray-100 disabled:opacity-50"
            disabled
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
