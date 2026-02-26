import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Bold,
  Italic,
  Code,
  Image,
  FileText,
  Palette,
  Eye,
  Edit,
} from "lucide-react";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { user, token } = useAuth();

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/posts/${id}`);

          if (!response.ok) {
            throw new Error("Could not find post");
          }

          const post = await response.json();

          // Populate your state
          setTitle(post.title);
          setContent(post.content);
          setTags(post.tags || []);
          // Handle case if DB uses uppercase 'DRAFT' and state uses 'draft'
          setStatus(post.status.toLowerCase());
        } catch (err) {
          console.error("Failed to load post:", err);
          // Optional: navigate back if the post doesn't exist
          navigate("/dashboard");
        }
      };

      fetchPost();
    }
  }, [id]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newContent);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to save posts.");
      return;
    }

    setLoading(true);

    try {
      const postData = {
        title,
        content,
        tags,
        // Prisma enums are usually uppercase: "DRAFT" or "PUBLISHED"
        status: status.toUpperCase(),
        authorId: user.id, // REQUIRED by your Prisma model
      };

      let postId = id;

      // 2. Use the full URL since your server is on port 5000
      const baseUrl = "http://localhost:5000/api/posts";
      const url = id ? `${baseUrl}/${id}` : baseUrl;
      const method = id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          // 3. Pass the token from your AuthContext
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save post");
      }

      const result = await response.json();
      postId = id || result.id;

      setLoading(false);

      // Retro-style delay for "System Processing" feel
      setTimeout(() => {
        navigate(status === "published" ? `/post/${postId}` : "/dashboard");
      }, 500);
    } catch (error) {
      console.error("Failed to publish:", error);
      alert(error instanceof Error ? error.message : "Failed to publish post.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Editor Title */}
      <div className="titlebar">
        <div className="flex items-center gap-2">
          <FileText size={20} />
          <span>{id ? "EDIT POST" : "NEW POST"} - PUBLISHING SUITE v1.0</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="retro-border-outset bg-[#C0C0C0] p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Text Formatting Group */}
            <div className="flex items-center gap-1 border-r-2 border-gray-400 pr-2">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="toolbar-icon"
                title="Bold"
                disabled={previewMode}
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="toolbar-icon"
                title="Italic"
                disabled={previewMode}
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("`", "`")}
                className="toolbar-icon"
                title="Code"
                disabled={previewMode}
              >
                <Code size={16} />
              </button>
            </div>

            {/* Font Size Dropdown */}
            <div className="flex items-center gap-1 border-r-2 border-gray-400 pr-2">
              <label className="text-xs font-bold text-[#000080]">SIZE:</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    insertFormatting(
                      `<span style="font-size: ${e.target.value}px">`,
                      "</span>",
                    );
                    e.target.value = "";
                  }
                }}
                className="retro-input text-xs px-1 py-0.5"
                defaultValue=""
                disabled={previewMode}
              >
                <option value="">--</option>
                <option value="10">10px</option>
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
                <option value="22">22px</option>
                <option value="24">24px</option>
              </select>
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-1 border-r-2 border-gray-400 pr-2">
              <Palette size={16} className="text-[#000080]" />
              <label className="text-xs font-bold text-[#000080]">COLOR:</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    insertFormatting(
                      `<span style="color: ${e.target.value}">`,
                      "</span>",
                    );
                    e.target.value = "";
                  }
                }}
                className="retro-input text-xs px-1 py-0.5"
                defaultValue=""
                disabled={previewMode}
              >
                <option value="">--</option>
                <option value="#000000">Black</option>
                <option value="#000080">Navy</option>
                <option value="#FF4500">Orange</option>
                <option value="#FF0000">Red</option>
                <option value="#008000">Green</option>
                <option value="#0000FF">Blue</option>
                <option value="#800080">Purple</option>
                <option value="#808080">Gray</option>
              </select>
            </div>

            {/* Image */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertFormatting("![alt](", ")")}
                className="toolbar-icon"
                title="Insert Image"
                disabled={previewMode}
              >
                <Image size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l-2 border-white pl-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`toolbar-icon flex items-center gap-1 px-2 w-auto ${previewMode ? "bg-gray-400" : ""}`}
              title={
                previewMode ? "Switch to Edit Mode" : "Switch to Preview Mode"
              }
            >
              {previewMode ? <Edit size={16} /> : <Eye size={16} />}
              <span className="text-xs font-bold">
                {previewMode ? "EDIT" : "PREVIEW"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handlePublish}
        className="retro-border-outset p-4 bg-[#C0C0C0]"
      >
        <div className="grid gap-4 grid-cols-4">
          {/* Main Editor Area */}
          <div className="col-span-3">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-bold text-[#000080]">
                  SUBJECT LINE:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="retro-input w-full text-lg"
                  placeholder="Enter post title..."
                  required
                  disabled={previewMode}
                />
              </div>

              <div>
                <label className="block mb-2 font-bold text-[#000080]">
                  DOCUMENT BODY:
                </label>
                {previewMode ? (
                  <div className="retro-border-inset bg-white p-4 h-[500px] overflow-y-auto">
                    <MarkdownRenderer content={content} />
                  </div>
                ) : (
                  <div className="retro-border-inset bg-white p-2">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full border-none outline-none font-mono text-sm"
                      rows={24}
                      style={{ resize: "vertical", background: "white" }}
                      placeholder="Enter your content here..."
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="col-span-1 space-y-4">
            <div className="retro-border-outset p-3 bg-white">
              <h3 className="font-bold text-sm text-[#000080] mb-2">
                METADATA
              </h3>

              <div className="mb-3">
                <label className="block text-xs mb-1 font-bold">STATUS:</label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "published")
                  }
                  className="retro-input w-full text-xs"
                  disabled={previewMode}
                >
                  <option value="draft">DRAFT</option>
                  <option value="published">PUBLISHED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1 font-bold">
                  CATEGORY TAGS:
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="retro-input w-full text-xs mb-2"
                  placeholder="Press Enter to add"
                  disabled={previewMode}
                />
                <div className="space-y-1">
                  {tags.map((tag, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-[#FFFF00] px-2 py-1 text-xs border border-black"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[#FF0000] font-bold"
                        disabled={previewMode}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Publish Button */}
        <div className="mt-4 flex items-center gap-4">
          <button
            type="submit"
            className="retro-button px-8 py-2 text-lg"
            disabled={loading}
          >
            {loading ? "PUBLISHING..." : id ? "UPDATE" : "PUBLISH"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="retro-button px-6 py-2"
            disabled={loading}
          >
            CANCEL
          </button>
        </div>
      </form>

      {/* Publishing Dialog */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="win-dialog p-2" style={{ width: "400px" }}>
            <div className="titlebar mb-2">PUBLISHING DOCUMENT</div>
            <div className="p-4 bg-white">
              <p className="mb-4 font-mono text-sm">
                Handshaking with server...
              </p>
              <div className="progress-bar mb-2">
                <div className="progress-bar-fill" style={{ width: "100%" }} />
              </div>
              <p className="text-xs font-mono text-gray-600 text-center">
                100% complete
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
