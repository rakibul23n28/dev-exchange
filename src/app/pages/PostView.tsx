import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router";
import { format } from "date-fns";
import {
  Clock,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  CornerDownRight,
  Tag,
} from "lucide-react";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { useAuth } from "../../app/contexts/AuthContext";

const API_BASE = "http://localhost:5000/api";

export function PostView() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Ref to prevent double-counting views in React Strict Mode during development
  const viewedRef = useRef(false);

  const getHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [token]);

  // --- New Function: Increment View Count ---
  const incrementView = useCallback(async () => {
    if (!id || viewedRef.current) return;
    viewedRef.current = true; // Set flag to prevent double-increment

    try {
      await fetch(`${API_BASE}/posts/${id}/view`, {
        method: "PATCH", // Using PATCH to update a single field
        headers: getHeaders(),
      });
    } catch (error) {
      console.error("Failed to register view:", error);
    }
  }, [id, getHeaders]);

  const fetchPostData = useCallback(async () => {
    if (!id) return;
    try {
      const postRes = await fetch(`${API_BASE}/posts/${id}`);
      if (postRes.ok) {
        const postData = await postRes.json();
        setPost(postData);
      }

      const commentsRes = await fetch(`${API_BASE}/posts/${id}/comments`);
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      }

      if (token) {
        const voteRes = await fetch(`${API_BASE}/posts/${id}/vote-status`, {
          headers: getHeaders(),
        });
        if (voteRes.ok) {
          const { vote } = await voteRes.json();
          setUserVote(vote);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, [id, token, getHeaders]);

  // Initial Data Load
  useEffect(() => {
    fetchPostData();
    incrementView(); // Trigger view count on mount
  }, [fetchPostData, incrementView]);

  const readingTime = post
    ? Math.ceil(post.content.split(/\s+/).length / 200)
    : 0;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim() || !user) return;

    try {
      const response = await fetch(`${API_BASE}/posts/${id}/comments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          authorId: user.id,
          content: newComment,
          parentId: replyTo,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        const uiComment = {
          ...comment,
          author: { username: user.username },
        };

        setComments([...comments, uiComment]);
        setNewComment("");
        setReplyTo(null);
        if (post)
          setPost({ ...post, reply_count: (post.reply_count || 0) + 1 });
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleVote = async (type: "like" | "dislike") => {
    if (!id || !user) {
      alert("Please log in to vote.");
      return;
    }
    if (isVoting) return;

    setIsVoting(true);
    try {
      const response = await fetch(`${API_BASE}/posts/${id}/vote`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const result = await response.json();
        setPost(result.post);
        setUserVote(result.userVote);
      }
    } catch (error) {
      console.error(`Failed to ${type}:`, error);
    } finally {
      setTimeout(() => setIsVoting(false), 500);
    }
  };

  const renderComments = (parentId: string | null = null, depth = 0) => {
    const filtered = comments.filter((c) => c.parentId === parentId);

    return filtered.map((comment) => (
      <div
        key={comment.id}
        className={`border-l border-dotted border-gray-400 ${depth > 0 ? "ml-4" : ""}`}
      >
        <div className="bg-white hover:bg-[#f8f8f8] border-b border-gray-200">
          <div className="flex items-stretch">
            <div className="bg-[#e0e0e0] px-1 py-0.5 text-[8px] font-mono border-r border-gray-300 min-w-[45px] text-center text-gray-500 hidden sm:block">
              {comment.id.slice(-4)}
            </div>

            <div className="flex-1 px-2 py-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono leading-none">
                  {depth > 0 && (
                    <CornerDownRight size={8} className="text-gray-400" />
                  )}
                  <Link
                    to={`/profile/${comment.authorId}`}
                    className="font-bold text-[#0000ee] uppercase hover:underline"
                  >
                    {comment.author?.username || "anon"}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">
                    {format(new Date(comment.createdAt), "MM/dd HH:mm")}
                  </span>
                </div>

                {user && (
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="text-[9px] font-bold uppercase px-1 py-0 bg-[#C0C0C0] border-t-white border-l-white border-b-gray-700 border-r-gray-700 border shadow-sm active:border-b-white active:border-r-white active:border-t-gray-700 active:border-l-gray-700"
                  >
                    Reply
                  </button>
                )}
              </div>

              <div className="text-sm font-sans leading-tight text-gray-900 break-words pl-1 border-l-2 border-transparent">
                {comment.content}
              </div>
            </div>
          </div>
        </div>
        {renderComments(comment.id, depth + 1)}
      </div>
    ));
  };

  if (!post) {
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
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Post Header */}
      <div className="retro-border-outset p-3 bg-[#C0C0C0]">
        <div className="flex justify-between items-start border-b border-gray-400 mb-2 pb-1">
          <h1 className="text-xl font-bold text-[#000080] tracking-tight uppercase">
            {post.title}
          </h1>
          <div className="bg-black text-white px-2 py-0.5 text-[10px] font-mono uppercase">
            {post.status}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-gray-600">
          <span className="flex items-center gap-1">
            <Eye size={12} /> {post.views} VIEWS
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} /> {post.reply_count || 0} REPLIES
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} /> {readingTime} MIN READ
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {format(new Date(post.updatedAt), "MM/dd/yy")}
          </span>
        </div>

        <div className="mt-2 text-xs font-sans text-gray-800">
          AUTHOR_ID:{" "}
          <Link
            to={`/profile/${post.authorId}`}
            className="text-[#FF4500] font-bold hover:underline"
          >
            {post.author?.username?.toUpperCase()}
          </Link>{" "}
          // LOG_DATE: {format(new Date(post.createdAt), "yyyy.MM.dd")}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <Tag size={12} className="text-gray-500" />
            {post.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="px-1.5 py-0.5 bg-[#FFFF00] text-[10px] font-bold border border-black uppercase shadow-[1px_1px_0px_#000]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="retro-border-inset p-5 bg-white shadow-inner min-h-[300px] font-sans leading-relaxed">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Voting Panel */}
      <div className="retro-border-outset p-2 bg-[#C0C0C0] flex items-center justify-between">
        <div className="flex gap-2">
          {user ? (
            <>
              <button
                disabled={isVoting}
                onClick={() => handleVote("like")}
                className={`retro-button px-4 py-1 flex items-center gap-2 text-xs font-bold ${userVote === "like" ? "bg-[#008000] text-white" : ""}`}
              >
                <ThumbsUp size={14} /> APPROVE ({post.likesCount || 0})
              </button>
              <button
                disabled={isVoting}
                onClick={() => handleVote("dislike")}
                className={`retro-button px-4 py-1 flex items-center gap-2 text-xs font-bold ${userVote === "dislike" ? "bg-[#FF0000] text-white" : ""}`}
              >
                <ThumbsDown size={14} /> DISAPPROVE ({post.dislikesCount || 0})
              </button>
            </>
          ) : (
            <div className="text-[10px] font-mono text-gray-600 uppercase p-1 italic border border-dotted border-gray-500">
              GUEST_MODE: READ_ONLY
            </div>
          )}
        </div>
        <div className="bg-black text-[#00FF00] px-3 py-0.5 text-[11px] font-mono font-bold border border-gray-600">
          NET_SCORE: {(post.likesCount || 0) - (post.dislikesCount || 0)}
        </div>
      </div>

      {/* Discussion Section */}
      <div className="space-y-0.5">
        <div className="bg-[#000080] text-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
          <MessageSquare size={12} /> Threaded_Discussion_Stream
        </div>

        {user ? (
          <form
            onSubmit={handleSubmitComment}
            className="retro-border-inset p-2 bg-[#D4D0C8]"
          >
            {replyTo && (
              <div className="bg-[#FFFFE1] border border-gray-500 p-1 mb-1 text-[9px] font-mono flex justify-between items-center uppercase">
                <span className="flex items-center gap-1">
                  <CornerDownRight size={10} /> RE:{" "}
                  {comments.find((c) => c.id === replyTo)?.author?.username}
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="bg-[#C0C0C0] border border-gray-800 px-1 py-0 text-[8px] hover:bg-red-600 hover:text-white"
                >
                  [Esc] Cancel
                </button>
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full font-mono text-xs p-1 border-t-gray-800 border-l-gray-800 border-b-white border-r-white border bg-white focus:outline-none"
              rows={2}
              placeholder="Post a message..."
              required
            />
            <div className="flex justify-end mt-1">
              <button
                type="submit"
                className="retro-button px-3 py-0.5 text-[10px] font-bold uppercase"
              >
                Submit_Entry
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 text-center text-[10px] font-mono bg-[#E0E0E0] border border-inset border-gray-400 italic text-gray-500 uppercase">
            -- LOGIN_REQUIRED TO POST_COMMENT --
          </div>
        )}

        <div className="border border-gray-400 bg-white">
          {comments.length === 0 ? (
            <div className="p-8 text-center text-[10px] font-mono text-gray-300 uppercase italic">
              -- END OF STREAM --
            </div>
          ) : (
            renderComments()
          )}
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <Link
          to="/"
          className="retro-button px-8 py-2 text-sm font-bold uppercase"
        >
          ← Return_to_Mainframe
        </Link>
      </div>
    </div>
  );
}
