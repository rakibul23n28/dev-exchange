import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  Bold,
  Italic,
  Code,
  Image,
  Palette,
  Eye,
  Edit,
  FileText,
  Save,
  XCircle,
  Type,
} from "lucide-react";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { apiFetch } from "../../lib/api";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user, token } = useAuth();

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await apiFetch(`/posts/${id}`);
          if (!response.ok) throw new Error("Could not find post");
          const post = await response.json();
          setTitle(post.title);
          setContent(post.content);
          setTags(post.tags || []);
          setStatus(post.status.toLowerCase());
        } catch (err) {
          console.error("Failed to load post:", err);
          navigate("/dashboard");
        }
      };
      fetchPost();
    }
  }, [id, navigate]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
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

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Log in required.");
    setLoading(true);

    try {
      const postData = {
        title,
        content,
        tags,
        status: status.toUpperCase(),
        authorId: user.id,
      };

      const baseUrl = "/posts";
      const url = id ? `${baseUrl}/${id}` : baseUrl;
      const method = id ? "PATCH" : "POST";

      const response = await apiFetch(`${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error("Failed to save post");

      const result = await response.json();
      const postId = id || result.id;

      setTimeout(() => {
        setLoading(false);
        navigate(status === "published" ? `/post/${postId}` : "/dashboard");
      }, 800);
    } catch (error) {
      setLoading(false);
      alert("System Error: Failed to commit to database.");
    }
  };

  //loading
  if (!title && id !== undefined) {
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
    <div className="max-w-5xl mx-auto pb-10">
      <div className="retro-border-outset bg-[#C0C0C0] shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        {/* Titlebar - Minimize removed */}
        <div className="bg-[#000080] text-white p-1 flex items-center justify-between mx-1 mt-1">
          <div className="flex items-center gap-2 px-1">
            <FileText size={16} />
            <span className="text-sm font-bold tracking-wide">
              {id ? "EDIT_POST.EXE" : "NEW_POST.EXE"} - PUBLISHING_SUITE_V1
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => navigate(-1)}
              className="bg-[#C0C0C0] text-black px-2 py-0.5 text-xs font-bold border border-white border-b-gray-600 border-r-gray-600 active:border-inset flex items-center justify-center"
              style={{ minWidth: "20px" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Toolbar with Font Size, Color, and Styles */}
        <div className="p-2 border-b border-white shadow-[0_1px_0_rgba(128,128,128,1)] flex items-center justify-between bg-[#C0C0C0]">
          <div className="flex items-center gap-1 flex-wrap">
            {/* Formatting Group */}
            <div className="flex gap-0.5 border-r border-gray-500 pr-2 mr-2">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="toolbar-icon"
                title="Bold"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="toolbar-icon"
                title="Italic"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("`", "`")}
                className="toolbar-icon"
                title="Code"
              >
                <Code size={14} />
              </button>
            </div>

            {/* Font Size Group */}
            <div className="flex items-center gap-2 border-r border-gray-500 pr-2 mr-2">
              <Type size={14} className="text-[#000080]" />
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
                className="retro-input text-[10px] px-1 py-0 h-6 outline-none bg-white"
                disabled={previewMode}
              >
                <option value="">Size</option>
                {[10, 12, 14, 16, 18, 20, 22, 24].map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>

            {/* Color Picker Group */}
            <div className="flex items-center gap-2 border-r border-gray-500 pr-2 mr-2">
              <Palette size={14} className="text-[#000080]" />
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
                className="retro-input text-[10px] px-1 py-0 h-6 outline-none bg-white"
                disabled={previewMode}
              >
                <option value="">Color</option>
                <option value="#000000">Black</option>
                <option value="#FF0000">Red</option>
                <option value="#008000">Green</option>
                <option value="#0000FF">Blue</option>
                <option value="#800080">Purple</option>
                <option value="#808080">Gray</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => insertFormatting("![alt](", ")")}
              className="toolbar-icon"
              title="Image"
              disabled={previewMode}
            >
              <Image size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-3 py-1 text-xs font-bold border-2 ${previewMode ? "bg-gray-400 border-inset" : "border-outset"}`}
          >
            {previewMode ? <Edit size={14} /> : <Eye size={14} />}
            {previewMode ? "EDITOR" : "PREVIEW"}
          </button>
        </div>

        {/* Main Workspace */}
        <form onSubmit={handlePublish} className="p-4 bg-[#D4D0C8]">
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Editor Content */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <div className="bg-white p-4 retro-border-inset">
                <label className="block text-xs font-bold text-[#000080] mb-1 tracking-tighter">
                  SUBJECT_LINE:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-lg font-mono outline-none border-b border-gray-200 focus:border-blue-800 pb-1"
                  placeholder="Untitled Document"
                  required
                  disabled={previewMode}
                />
              </div>

              <div className="bg-white retro-border-inset min-h-[500px]">
                {previewMode ? (
                  <div className="p-6 h-[500px] overflow-y-auto prose max-w-none">
                    <MarkdownRenderer content={content} />
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-[500px] p-4 outline-none font-mono text-sm resize-none leading-relaxed"
                    placeholder="Start typing your transmission..."
                    required
                  />
                )}
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <div className="retro-border-outset p-4 bg-[#C0C0C0] sticky top-4">
                <h3 className="text-xs font-bold bg-[#808080] text-white px-2 py-0.5 mb-4 tracking-widest">
                  PROPERTIES
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold mb-1">
                      PUBLICATION_STATUS:
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as "draft" | "published")
                      }
                      className="retro-input w-full text-xs font-mono py-1"
                      disabled={previewMode}
                    >
                      <option value="draft">DRAFT_MODE</option>
                      <option value="published">LIVE_PUBLISH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold mb-1">
                      TAG_RECORDS:
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="retro-input w-full text-xs py-1 mb-2"
                      placeholder="Type & press Enter"
                      disabled={previewMode}
                    />
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 bg-[#FFFF00] border border-black px-1.5 py-0.5 text-[10px] font-bold"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-600"
                            disabled={previewMode}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full retro-button py-2 flex items-center justify-center gap-2 font-bold text-sm bg-green-100"
                    >
                      <Save size={16} />
                      {loading
                        ? "SAVING..."
                        : id
                          ? "UPDATE_ENTRY"
                          : "COMMIT_PUBLISH"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-full retro-button py-2 flex items-center justify-center gap-2 font-bold text-sm"
                    >
                      <XCircle size={16} />
                      ABORT_CHANGES
                    </button>
                  </div>
                </div>
              </div>

              <div className="retro-border-inset bg-[#FFFFE1] p-3 text-[10px] font-mono text-gray-700">
                <strong>SYSTEM_TIP:</strong>
                <br />
                Apply font sizes or colors to specific text by highlighting it
                before selecting a property from the toolbar.
              </div>
            </div>
          </div>
        </form>

        {/* Status Bar */}
        <div className="bg-[#C0C0C0] border-t border-white p-1 flex justify-between text-[10px] font-mono mx-1 mb-1">
          <div className="flex gap-4 px-2">
            <span className="border-r border-gray-400 pr-4">
              CHARS: {content.length}
            </span>
            <span className="border-r border-gray-400 pr-4">
              USER: {user?.username?.toUpperCase() || "GUEST"}
            </span>
          </div>
          <div className="px-2">READY</div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="retro-border-outset p-2 bg-[#C0C0C0] w-80 shadow-2xl">
            <div className="bg-[#000080] text-white text-xs p-1 font-bold italic">
              WRITING_TO_DISK...
            </div>
            <div className="p-6 bg-white flex flex-col items-center">
              <div className="w-full bg-gray-200 h-4 border border-black mb-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-800 animate-[load_1.5s_infinite]"></div>
              </div>
              <span className="text-[10px] font-mono">
                COMMITTING CHANGES TO DATABASE
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes load {
          0% { left: -100%; width: 30%; }
          100% { left: 100%; width: 30%; }
        }
      `}</style>
    </div>
  );
}
