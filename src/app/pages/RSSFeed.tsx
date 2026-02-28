import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Rss,
  Copy,
  Download,
  Check,
  Eye,
  FileText,
  Code,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../../lib/api";

export function RSSFeed() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [rssContent, setRssContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "xml">("preview");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
  const feedUrl = `${API_BASE}/rss/${id}`;

  const generateRSSString = (data: any) => {
    const lastBuildDate = new Date().toUTCString();
    const publishedPosts =
      data.posts?.filter((p: any) => p.status?.toUpperCase() === "PUBLISHED") ||
      [];

    const items = publishedPosts
      .map(
        (p: any) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${window.location.origin}/post/${p.id}</link>
      <guid isPermaLink="false">${p.id}</guid>
      <pubDate>${new Date(p.created_at || p.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${p.content?.replace(/<[^>]*>/g, "").substring(0, 200)}...]]></description>
    </item>`,
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${data.username}'s Personnel Feed</title>
  <link>${window.location.origin}/profile/${data.id}</link>
  <description>${data.bio || "Data stream"}</description>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  ${items}
</channel>
</rss>`;
  };

  useEffect(() => {
    const fetchFeedData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await apiFetch(`/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok)
          throw new Error("Target node unreachable. Verify ID.");
        const data = await response.json();
        setProfile(data);
        setRssContent(generateRSSString(data));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedData();
  }, [id, token]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rssContent], { type: "application/rss+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile?.username || "user"}_feed.xml`;
    a.click();
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 font-mono text-[#000080]">
        <div className="w-12 h-12 border-4 border-t-blue-800 border-gray-200 rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse font-bold">PARSING_DATA_STREAM...</p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-md mx-auto mt-10 retro-border-outset bg-[#c0c0c0] p-1">
        <div className="bg-[#800000] text-white px-2 py-1 font-bold text-xs">
          SYSTEM_ERROR
        </div>
        <div className="p-6 bg-white border-2 border-inset border-gray-400 text-center">
          <p className="text-red-600 font-mono mb-4 italic">{error}</p>
          <Link to="/" className="retro-button px-4 py-1 text-xs">
            RETURN TO INDEX
          </Link>
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 font-mono">
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-6">
        <Link
          to={`/profile/${id}`}
          className="retro-button px-3 py-1 text-[10px] flex items-center gap-2"
        >
          <ArrowLeft size={12} /> BACK TO PROFILE
        </Link>
        <div className="text-[10px] text-gray-500 font-bold uppercase">
          Service: Syndication / {profile?.username}
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="retro-border-outset bg-[#C0C0C0] p-1 shadow-2xl">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-sm italic">
            <Rss size={18} className="text-orange-400" />
            RSS_GENERATOR_V1.0
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(rssContent)}
              className="retro-button-sm text-[9px] flex items-center gap-1"
            >
              {copied ? <Check size={10} /> : <Copy size={10} />} COPY_XML
            </button>
            <button
              onClick={handleDownload}
              className="retro-button-sm text-[9px] flex items-center gap-1"
            >
              <Download size={10} /> DOWNLOAD
            </button>
          </div>
        </div>

        {/* Action Bar (URL Display) */}
        <div className="p-4 bg-[#dfdfdf] border-b-2 border-gray-400">
          <label className="text-[9px] font-bold text-gray-600 block mb-1">
            YOUR_UNIQUE_FEED_URL:
          </label>
          <div className="flex gap-2">
            <div className="flex-1 bg-white border-2 border-inset border-gray-400 px-3 py-2 text-[#000080] text-xs font-bold truncate">
              {feedUrl}
            </div>
            <button
              onClick={() => copyToClipboard(feedUrl)}
              className="retro-button px-4 text-xs font-bold"
            >
              COPY_LINK
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#c0c0c0] px-1 pt-1 gap-1 border-b-2 border-gray-400">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-1 text-xs font-bold ${activeTab === "preview" ? "bg-white border-x-2 border-t-2 border-gray-500" : "hover:bg-gray-100"}`}
          >
            <span className="flex items-center gap-2">
              <Eye size={12} /> READER_VIEW
            </span>
          </button>
          <button
            onClick={() => setActiveTab("xml")}
            className={`px-4 py-1 text-xs font-bold ${activeTab === "xml" ? "bg-white border-x-2 border-t-2 border-gray-500" : "hover:bg-gray-100"}`}
          >
            <span className="flex items-center gap-2">
              <Code size={12} /> SOURCE_XML
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 bg-white m-1 border-2 border-inset border-gray-300 min-h-[400px]">
          {activeTab === "preview" ? (
            <div className="space-y-4">
              <div className="flex justify-between border-b-2 border-gray-100 pb-2">
                <h3 className="text-sm font-black text-blue-900 uppercase underline">
                  Current Broadcasts
                </h3>
                <span className="text-[10px] bg-blue-100 px-2 py-0.5 text-blue-800 font-bold rounded">
                  {profile?.posts?.length || 0} ITEMS
                </span>
              </div>

              {profile?.posts?.length > 0 ? (
                profile.posts.map((post: any) => (
                  <div
                    key={post.id}
                    className="p-3 border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-black">
                        {post.title}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(
                          post.created_at || post.createdAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 font-sans line-clamp-2 italic">
                      {post.content?.replace(/<[^>]*>/g, "")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <FileText size={40} />
                  <p className="text-xs font-bold mt-2 italic">
                    NO_PUBLISHED_DATA_FOUND
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-2 right-2 px-2 py-1 bg-green-900 text-[#00ff00] text-[8px] font-bold rounded shadow-lg border border-green-400 animate-pulse">
                XML_VALIDATED
              </div>
              <pre className="bg-black text-[#00ff00] p-4 rounded text-[10px] leading-tight overflow-auto max-h-[500px] border-4 border-inset border-gray-700">
                {rssContent}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer Helper */}
      <div className="mt-6 bg-blue-50 border-2 border-dashed border-blue-200 p-4 text-xs text-blue-800 flex items-start gap-3">
        <div className="bg-blue-800 text-white p-1 rounded font-bold">INFO</div>
        <p className="leading-relaxed">
          <strong>How to use:</strong> Copy the unique link above and paste it
          into any RSS aggregator (like Feedly or NewsBlur). This feed will
          automatically update whenever {profile?.username} publishes a new
          post.
        </p>
      </div>

      <style>{`
        .retro-button-sm {
          background: #c0c0c0;
          color: black;
          padding: 2px 8px;
          border-top: 1px solid #ffffff;
          border-left: 1px solid #ffffff;
          border-right: 1px solid #808080;
          border-bottom: 1px solid #808080;
        }
        .retro-button-sm:active {
          border: 1px solid #808080;
          border-top: 1px solid #000;
          border-left: 1px solid #000;
        }
      `}</style>
    </div>
  );
}
