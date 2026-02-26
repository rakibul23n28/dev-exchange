import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { Search, ChevronLeft, ChevronRight, Loader2, Eye } from "lucide-react";

// --- Custom Debounce Hook ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface Post {
  id: string;
  title: string;
  content: string;
  status: "PUBLISHED" | "DRAFT";
  likesCount: number;
  dislikesCount: number;
  score: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: { username: string };
  reply_count: number;
}

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const LIMIT = 10;

  const debouncedSearch = useDebounce(searchQuery, 500);
  const API_BASE = "http://localhost:5000/api";

  const extractFirstImage = (content: string): string | null => {
    const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
    const match = content.match(markdownImageRegex);
    return match ? match[1] : null;
  };

  const fetchPosts = useCallback(
    async (search: string, page: number) => {
      setIsSearching(true);
      try {
        const url = new URL(`${API_BASE}/posts`);
        if (search) url.searchParams.append("search", search);
        url.searchParams.append("page", page.toString());
        url.searchParams.append("limit", LIMIT.toString());

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.meta.totalPages);
        setTotalRecords(data.meta.totalCount);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [API_BASE],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchPosts(debouncedSearch, currentPage);
  }, [debouncedSearch, currentPage, fetchPosts]);

  // --- Skeleton Component for Table Rows ---
  const TableSkeleton = () => (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="border-b border-gray-200 animate-pulse">
          <td className="p-2 border-r border-gray-200">
            <div className="w-16 h-12 bg-gray-300 retro-border-inset"></div>
          </td>
          <td className="p-2 border-r border-gray-200">
            <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-100 w-1/2"></div>
          </td>
          <td className="p-2 border-r border-gray-200">
            <div className="h-3 bg-gray-200 w-20"></div>
          </td>
          <td className="p-2 border-r border-gray-200">
            <div className="h-4 bg-gray-200 w-8 mx-auto"></div>
          </td>
          <td className="p-2 border-r border-gray-200">
            <div className="h-4 bg-gray-200 w-8 mx-auto"></div>
          </td>
          <td className="p-2 border-r border-gray-200">
            <div className="h-4 bg-gray-200 w-6 mx-auto"></div>
          </td>
          <td className="p-2 text-right">
            <div className="h-3 bg-gray-100 w-24 ml-auto mb-1"></div>
            <div className="h-3 bg-gray-50 w-16 ml-auto"></div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-12">
      {/* Header / Title Bar */}
      <div className="retro-border-outset bg-[#C0C0C0] p-1 mb-6">
        <div className="bg-[#000080] text-white p-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gray-300 p-0.5">
              <div className="w-3 h-3 bg-blue-800"></div>
            </div>
            <span className="text-xs font-bold tracking-tight uppercase">
              Global_Archive_Browser.exe - [{totalRecords} Records Indexed]
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="flex items-center gap-2 bg-[#C0C0C0] p-3 retro-border-outset">
        <label
          htmlFor="search"
          className="font-bold text-[#000080] font-mono text-sm px-2"
        >
          QUERY_DB:
        </label>
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full font-mono text-sm border-2 border-inset border-gray-400 p-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800"
              placeholder="Enter search parameters..."
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] text-blue-800 font-bold font-mono">
                <Loader2 size={12} className="animate-spin" />
                <span>SCANNING...</span>
              </div>
            )}
          </div>
          <button className="retro-button bg-[#C0C0C0] font-bold px-6 py-1 active:shadow-none text-xs uppercase flex items-center gap-2">
            <Search size={14} /> EXECUTE
          </button>
        </div>
      </div>

      {/* Main Feed Table */}
      <div className="bg-white border-2 border-inset border-gray-400 p-1 overflow-x-auto shadow-[4px_4px_0_rgba(0,0,0,1)]">
        <table className="w-full font-mono text-sm border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#808080] text-white text-left uppercase text-[10px]">
              <th className="p-2 border border-white w-20 text-center">
                Thumbnail
              </th>
              <th className="p-2 border border-white">Subject_Title</th>
              <th className="p-2 border border-white w-32">Uploader</th>
              <th className="p-2 border border-white w-20 text-center">
                Score
              </th>
              <th className="p-2 border border-white w-20 text-center">
                Views
              </th>
              <th className="p-2 border border-white w-16 text-center">
                Replies
              </th>
              <th className="p-2 border border-white w-40 text-right">
                Last_Sync
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : posts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-20 text-center text-gray-400 italic bg-gray-50 font-mono"
                >
                  --- ERROR 404: NO MATCHING DATA SEGMENTS FOUND ---
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-[#FFFFE1] group border-b border-gray-100 cursor-default"
                >
                  <td className="p-2 border-r border-gray-200">
                    <div className="w-16 h-12 retro-border-inset p-0.5 bg-[#404040] mx-auto overflow-hidden">
                      <img
                        src={
                          extractFirstImage(post.content) ||
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="48"%3E%3Crect fill="%23c0c0c0" width="64" height="48"/%3E%3C/svg%3E'
                        }
                        alt=""
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
                      />
                    </div>
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    <Link
                      to={`/post/${post.id}`}
                      className="text-[#0000EE] font-bold hover:underline group-hover:text-[#FF4500] block truncate max-w-md"
                    >
                      {post.title.toUpperCase()}
                    </Link>
                    <div className="text-[9px] text-gray-400 mt-1 uppercase font-bold">
                      ID: {post.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    <Link
                      to={`/profile/${post.authorId}`}
                      className="text-[#555555] hover:text-black no-underline block truncate"
                    >
                      {post.author?.username || "ANONYMOUS"}
                    </Link>
                  </td>
                  <td className="p-2 border-r border-gray-200 text-center">
                    <div
                      className={`font-bold ${post.score > 0 ? "text-green-700" : post.score < 0 ? "text-red-700" : "text-gray-600"}`}
                    >
                      {post.score > 0 ? `+${post.score}` : post.score}
                    </div>
                  </td>
                  <td className="p-2 border-r border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-500">
                      <Eye size={12} />
                      <span className="text-[11px]">{post.views}</span>
                    </div>
                  </td>
                  <td className="p-2 border-r border-gray-200 text-center font-bold text-blue-900">
                    {post.reply_count || 0}
                  </td>
                  <td className="p-2 text-right text-[10px] text-gray-500 font-mono leading-tight">
                    {format(new Date(post.updatedAt), "yyyy-MM-dd")}
                    <br />
                    {format(new Date(post.updatedAt), "HH:mm:ss")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Status Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-gray-600 pt-4">
        <div className="flex items-center gap-3">
          <div className="bg-black text-[#00FF00] px-3 py-1 border-inset border-2 border-gray-400">
            TOTAL_DATA_NODES: {totalRecords}
          </div>
          <span
            className={`${isSearching ? "text-blue-600 animate-pulse" : "text-green-700"} font-bold`}
          >
            {isSearching ? ">> SYNC_IN_PROGRESS" : ">> CONNECTION_STABLE"}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#C0C0C0] p-1 retro-border-outset">
          <span className="px-3 font-bold border-r border-gray-400">
            PAGE: {currentPage} / {totalPages || 1}
          </span>
          <button
            className="retro-button px-3 py-1 flex items-center disabled:opacity-50 text-[10px]"
            disabled={currentPage <= 1 || isSearching}
            onClick={() => {
              setCurrentPage((prev) => prev - 1);
              window.scrollTo(0, 0);
            }}
          >
            <ChevronLeft size={12} /> PREV
          </button>
          <button
            className="retro-button px-3 py-1 flex items-center disabled:opacity-50 text-[10px]"
            disabled={currentPage >= totalPages || isSearching}
            onClick={() => {
              setCurrentPage((prev) => prev + 1);
              window.scrollTo(0, 0);
            }}
          >
            NEXT <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
