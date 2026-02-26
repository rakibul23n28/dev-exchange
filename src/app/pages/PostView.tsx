import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { format } from "date-fns";
import {
  getCurrentUser,
  vouchComment,
  getUserVote,
} from "../../lib/localStorage";
import {
  Clock,
  Eye,
  MessageSquare,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
} from "lucide-react";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const readingTime = post
    ? Math.ceil(post.content.split(/\s+/).length / 200)
    : 0;

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    if (!id) return;

    Promise.all([api.getPost(id), api.getComments(id)])
      .then(([postData, commentsData]) => {
        setPost(postData);
        setComments(commentsData);
        setUserVote(api.getUserVote(id));
      })
      .catch(console.error);
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim() || !user) return;

    try {
      const comment = await api.createComment(id, {
        content: newComment,
      });

      setComments([...comments, comment]);
      setNewComment("");

      if (post) {
        setPost({ ...post, reply_count: post.reply_count + 1 });
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  };

  const handleVouch = async (commentId: string) => {
    try {
      if (!id) return;
      const updatedComment = vouchComment(commentId, id);

      setComments(
        comments.map((c) => (c.id === commentId ? updatedComment : c)),
      );
    } catch (error) {
      console.error("Failed to vouch:", error);
    }
  };

  const handleLike = async () => {
    if (!id || !user) return;
    try {
      const result = await api.likePost(id);
      setPost(result.post);
      setUserVote(result.userVote);
    } catch (error) {
      console.error("Failed to like:", error);
      alert("Please log in to vote.");
    }
  };

  const handleDislike = async () => {
    if (!id || !user) return;
    try {
      const result = await api.dislikePost(id);
      setPost(result.post);
      setUserVote(result.userVote);
    } catch (error) {
      console.error("Failed to dislike:", error);
      alert("Please log in to vote.");
    }
  };

  const renderComments = (parentId: string | null = null, depth = 0) => {
    const filtered = comments.filter((c) => c.parent_id === parentId);

    return filtered.map((comment) => (
      <div key={comment.id} className={depth > 0 ? "threaded-comment" : ""}>
        <div className="retro-border-outset p-3 mb-3 bg-white">
          <div className="flex items-start gap-3">
            <div className="text-2xl">👤</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to={`/profile/${comment.author_id}`}
                  className="font-bold text-[#000080] hover:text-[#FF4500]"
                >
                  {comment.author_name}
                </Link>
                <span className="text-xs text-gray-500 font-mono">
                  {format(new Date(comment.created_at), "MM/dd/yyyy HH:mm")}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => handleVouch(comment.id)}
                    className="flex items-center gap-1 text-xs px-2 py-1 retro-button"
                    title="Vouch for this comment"
                  >
                    <CheckCircle size={12} />
                    <span>{comment.upvotes}</span>
                  </button>
                </div>
              </div>

              <p className="text-sm mb-2" style={{ textAlign: "left" }}>
                {comment.content}
              </p>

              {user && (
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="text-xs text-[#FF4500] hover:underline"
                >
                  Reply
                </button>
              )}
            </div>
          </div>
        </div>

        {renderComments(comment.id, depth + 1)}
      </div>
    ));
  };

  if (!post) {
    return (
      <div className="terminal-output">
        <pre>ERROR: POST NOT FOUND</pre>
        <pre>SYSTEM CODE: 404</pre>
        <pre className="mt-4">
          <Link to="/" className="text-[#00FF00] underline">
            RETURN TO MAIN TERMINAL
          </Link>
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Header */}
      <div className="retro-border-outset p-4 bg-[#C0C0C0]">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold text-[#000080]">{post.title}</h1>
          <div className="flex gap-2">
            <span
              className={`px-2 py-1 text-xs border retro-border-inset ${
                post.status === "published"
                  ? "bg-[#008000] text-white"
                  : "bg-gray-300"
              }`}
            >
              {post.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-mono text-gray-700">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{post.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{post.reply_count} replies</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen size={14} />
            <span>{readingTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>
              Modified: {format(new Date(post.updated_at), "MM/dd/yyyy HH:mm")}
            </span>
          </div>
        </div>

        <div className="mt-2 text-sm">
          By:{" "}
          <Link
            to={`/profile/${post.author_id}`}
            className="text-[#FF4500] hover:underline font-bold"
          >
            {post.author_name}
          </Link>{" "}
          on {format(new Date(post.created_at), "MMMM dd, yyyy")}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-2 flex gap-2">
            {post.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-[#FFFF00] text-xs border border-black"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="retro-border-inset p-6 bg-white">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Voting Panel */}
      <div className="retro-border-outset p-4 bg-[#C0C0C0]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-mono text-[#000080] font-bold">
            ARTICLE FEEDBACK SYSTEM v1.0
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={handleLike}
                  className={`retro-button px-4 py-2 flex items-center gap-2 ${
                    userVote === "like" ? "bg-[#008000] text-white" : ""
                  }`}
                  title="Approve this article"
                >
                  <ThumbsUp
                    size={16}
                    className={userVote === "like" ? "fill-white" : ""}
                  />
                  <span className="font-mono text-sm">{post.likes || 0}</span>
                  <span className="text-xs">APPROVE</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={`retro-button px-4 py-2 flex items-center gap-2 ${
                    userVote === "dislike" ? "bg-[#FF0000] text-white" : ""
                  }`}
                  title="Disapprove this article"
                >
                  <ThumbsDown
                    size={16}
                    className={userVote === "dislike" ? "fill-white" : ""}
                  />
                  <span className="font-mono text-sm">
                    {post.dislikes || 0}
                  </span>
                  <span className="text-xs">DISAPPROVE</span>
                </button>
              </>
            ) : (
              <div className="text-xs text-gray-600">
                <Link to="/login" className="text-[#FF4500] underline">
                  LOGIN
                </Link>{" "}
                to rate this article
              </div>
            )}
            <div className="retro-border-inset p-2 bg-white text-xs font-mono">
              NET SCORE:{" "}
              <span className="font-bold text-[#000080]">
                {(post.likes || 0) - (post.dislikes || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Log */}
      <div className="terminal-output text-xs">
        <pre>SYSTEM LOG :: POST_ID={post.id}</pre>
        <pre>CREATED_AT :: {post.created_at}</pre>
        <pre>LAST_MODIFIED :: {post.updated_at}</pre>
        <pre>AUTHOR_ID :: {post.author_id}</pre>
        <pre>STATUS :: {post.status.toUpperCase()}</pre>
      </div>

      {/* Comments Section */}
      <div className="space-y-4">
        <div className="retro-border-outset p-3 bg-[#C0C0C0]">
          <h2 className="text-lg font-bold text-[#000080] flex items-center gap-2">
            <MessageSquare size={20} />
            THREADED DISCUSSIONS ({post.reply_count})
          </h2>
        </div>

        {user ? (
          <form
            onSubmit={handleSubmitComment}
            className="retro-border-outset p-4 bg-white"
          >
            {replyTo &&
              (() => {
                const parentComment = comments.find((c) => c.id === replyTo);
                return (
                  <div className="mb-3 p-2 retro-border-inset bg-[#FFFFCC]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#000080]">
                        REPLYING TO:
                      </span>
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="text-xs retro-button px-2 py-0.5"
                      >
                        CANCEL
                      </button>
                    </div>
                    {parentComment && (
                      <div className="text-xs text-gray-700 mt-1">
                        <strong>{parentComment.author_name}:</strong>{" "}
                        {parentComment.content.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                );
              })()}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="retro-input w-full font-mono text-sm"
              rows={4}
              placeholder={
                replyTo ? "Enter your reply..." : "Enter your comment..."
              }
              required
            />
            <div className="mt-2 flex justify-end">
              <button type="submit" className="retro-button px-6 py-2">
                {replyTo ? "POST REPLY" : "POST COMMENT"}
              </button>
            </div>
          </form>
        ) : (
          <div className="retro-border-inset p-4 bg-gray-100 text-center">
            <p className="mb-2">You must be logged in to post comments.</p>
            <Link to="/login" className="retro-button">
              LOGIN
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {comments.length === 0 ? (
            <div className="retro-border-inset p-6 text-center text-gray-500 bg-white">
              NO COMMENTS YET. BE THE FIRST TO CONTRIBUTE!
            </div>
          ) : (
            renderComments()
          )}
        </div>
      </div>

      {/* Back button */}
      <div className="text-center">
        <Link to="/" className="retro-button px-6">
          ← RETURN TO FEED
        </Link>
      </div>
    </div>
  );
}
