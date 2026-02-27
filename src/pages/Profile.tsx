import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { format, isValid, parseISO } from "date-fns";
import { useAuth } from "../app/contexts/AuthContext";
import {
  User,
  Mail,
  Calendar,
  Briefcase,
  MessageSquare,
  Star,
  ArrowLeft,
  FileText,
  Edit2,
  Save,
  X,
  Award,
  Eye,
  Github,
  Twitter,
  Globe,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Hash,
  Terminal,
  Image,
  Rss,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  views: number;
  reply_count: number;
  created_at: string;
  tags?: string[];
}

interface ProfileData {
  profileImageUrl?: string;
  id: string;
  username: string;
  email: string;
  bio?: string;
  specialization?: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  joinDate?: string;
  reputationScore?: number;
  posts: Post[];
  reviewsReceived: any[];
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    profileImageUrl: "",
    bio: "",
    specialization: "",
    location: "",
    website: "",
    github: "",
    twitter: "",
  });

  const isOwnProfile = user?.id === id;
  const BASE_URL = "http://localhost:5000/api";

  const safeFormat = (
    dateStr: string | undefined | null,
    formatStr: string,
  ) => {
    if (!dateStr) return "N/A";
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, formatStr) : "Invalid Date";
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/profile/info/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile dossier.");

      const data = await response.json();
      setProfile(data);
      setEditForm({
        profileImageUrl: data.profileImageUrl || "",
        bio: data.bio || "",
        specialization: data.specialization || "",
        location: data.location || "",
        website: data.website || "",
        github: data.github || "",
        twitter: data.twitter || "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfile();
  }, [id, token]);

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/profile/info/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Update failed");

      setIsEditing(false);
      fetchProfile();
      alert("Profile dossier updated.");
    } catch (err) {
      alert("Error updating profile.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Login required.");

    try {
      const response = await fetch(`${BASE_URL}/profile/${id}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) throw new Error("Could not submit review");

      setComment("");
      setShowReviewForm(false);
      fetchProfile();
    } catch (err) {
      alert("Error submitting review.");
    }
  };

  const publishedPosts =
    profile?.posts?.filter((p) => p.status?.toUpperCase() === "PUBLISHED") ||
    [];
  const averageRating = profile?.reviewsReceived?.length
    ? (
        profile.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) /
        profile.reviewsReceived.length
      ).toFixed(1)
    : "0.0";

  if (loading)
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

  if (error || !profile) {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto">
        <div className="retro-border-outset bg-[#c0c0c0] p-1 shadow-xl">
          <div className="bg-[#800000] text-white px-2 py-1 flex justify-between font-bold text-sm">
            <span>SYSTEM_ALERT.EXE</span>
            <Link to="/">
              <X size={14} />
            </Link>
          </div>
          <div className="p-8 bg-white m-1 border-2 border-inset border-gray-400">
            <h2 className="text-red-600 font-bold text-2xl mb-2 font-mono">
              404: NODE NOT FOUND
            </h2>
            <p className="text-gray-700 font-mono mb-6 italic">
              {error || "Requested ID does not exist in the mainframe."}
            </p>
            <Link
              to="/"
              className="retro-button px-6 py-2 inline-flex items-center gap-2 font-bold no-underline text-black uppercase text-xs"
            >
              <ArrowLeft size={14} /> Return to Index
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 font-mono">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="retro-button px-3 py-1 flex items-center gap-2 no-underline text-black text-xs font-bold uppercase"
        >
          <ArrowLeft size={14} /> Back to Network
        </Link>
        <div className="text-[10px] text-gray-500 font-bold uppercase">
          Path: System / Nodes / {profile.username.toLowerCase()}
        </div>
      </div>

      {/* Profile Header Dossier */}
      <div className="retro-border-outset bg-[#C0C0C0] p-1 shadow-2xl">
        <div className="bg-[#000080] text-white px-3 py-1.5 flex justify-between items-center font-bold text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-yellow-400" />
              <span>PERSONNEL_FILE_VIEWER</span>
            </div>

            {/* RSS FEED LINK ADDED HERE */}
            <Link
              to={`/profile/rss/${id}`}
              className="flex items-center gap-1.5 bg-[#c0c0c0] text-[#000080] px-2 py-0.5 text-[10px] uppercase border-t-white border-l-white border-b-gray-600 border-r-gray-600 border-[1px] hover:bg-white transition-colors"
            >
              <Rss size={10} />
              RSS_FEED.XML
            </Link>
          </div>

          <div className="flex items-center gap-4 text-[10px] opacity-80 uppercase tracking-widest">
            <span>Level: Unrestricted</span>
            <span>Uplink: Secure</span>
          </div>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-8 relative overflow-hidden">
          {/* Scanline Effect overlay for header */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.02)_50%)] bg-[length:100%_2px] opacity-30"></div>

          {/* User Photo Area */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-40 h-40 bg-white retro-border-inset p-1 flex items-center justify-center relative group">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-400">
                <img
                  src={profile.profileImageUrl || "/panda.png"}
                  className="w-full h-full object-cover group-hover:brightness-110 transition-opacity mx-auto"
                  alt={profile.username}
                />
              </div>
              <div
                className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"
                title="Online"
              ></div>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`w-full retro-button px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-2 ${isEditing ? "text-red-700" : "text-blue-900"}`}
              >
                {isEditing ? (
                  <>
                    <X size={14} /> CANCEL
                  </>
                ) : (
                  <>
                    <Edit2 size={14} /> MOD_PROFILE
                  </>
                )}
              </button>
            )}
          </div>

          {/* User Identity Details */}
          <div className="flex-1 space-y-4 relative z-10">
            <div className="border-b-4 border-[#000080] pb-2 flex flex-col md:flex-row md:items-end justify-between gap-2">
              <div>
                <h1 className="text-4xl font-black text-[#000080] tracking-tighter uppercase italic">
                  {profile.username}
                </h1>
                <p className="text-[#FF4500] font-bold text-xs mt-1 flex items-center gap-1 uppercase tracking-tighter">
                  <Hash size={12} /> {profile.id}
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-gray-500 uppercase">
                  Reputation_Level
                </div>
                <div className="flex gap-1 justify-end mt-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-2 border border-black ${i < (profile.reputationScore || 0) / 20 ? "bg-yellow-400 shadow-[0_0_5px_yellow]" : "bg-gray-400"}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase size={16} className="text-gray-600" />
                    <span className="font-bold uppercase text-[11px] w-20">
                      Specialty:
                    </span>
                    <span className="text-blue-900 font-bold italic underline decoration-blue-200">
                      {profile.specialization || "Generalist"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-600" />
                    <span className="font-bold uppercase text-[11px] w-20">
                      Enlisted:
                    </span>
                    <span className="text-gray-800">
                      {safeFormat(profile.joinDate, "MMMM yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Star
                      size={16}
                      className="text-yellow-600 fill-yellow-600"
                    />
                    <span className="font-bold uppercase text-[11px] w-20">
                      Score:
                    </span>
                    <span className="text-black text-lg">
                      {profile.reputationScore || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-600" />
                    <span className="font-bold uppercase text-[11px] w-20">
                      Comms:
                    </span>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-blue-700 hover:text-red-600 truncate"
                    >
                      {profile.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-gray-600" />
                    <span className="font-bold uppercase text-[11px] w-20">
                      Base:
                    </span>
                    <span className="text-gray-800">
                      {profile.location || "Unknown Node"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-col gap-2 pt-2 md:pt-0">
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-[10px] font-bold text-gray-700 hover:text-black border-l-2 border-gray-400 pl-2"
                    >
                      <Github size={14} /> GITHUB.COM/LINK
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={profile.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 border-l-2 border-gray-400 pl-2"
                    >
                      <Twitter size={14} /> TWITTER_SYNC
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-[10px] font-bold text-green-700 hover:text-green-900 border-l-2 border-gray-400 pl-2"
                    >
                      <Globe size={14} /> WEB_PORTAL
                    </a>
                  )}
                </div>

                <div className="md:col-span-3 mt-4">
                  <div className="text-[10px] font-bold text-[#000080] uppercase mb-1 flex items-center gap-1">
                    <FileText size={10} /> Personnel_Manifesto
                  </div>
                  <div className="bg-white border-2 border-inset border-gray-300 p-4 text-sm italic font-sans leading-relaxed text-gray-700 shadow-inner">
                    "
                    {profile.bio ||
                      "Data packets empty. This operative has not yet written a biography."}
                    "
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-200 p-4 border-2 border-inset border-gray-400">
                {Object.keys(editForm).map((key) => (
                  <div
                    key={key}
                    className={`flex flex-col gap-1 ${key === "bio" ? "md:col-span-2" : ""}`}
                  >
                    <label className="text-[10px] font-bold text-gray-600 uppercase">
                      Input::{key}
                    </label>
                    {key === "bio" ? (
                      <textarea
                        className="retro-input text-sm h-24 p-2 font-sans"
                        value={(editForm as any)[key]}
                        onChange={(e) =>
                          setEditForm({ ...editForm, [key]: e.target.value })
                        }
                      />
                    ) : (
                      <input
                        className="retro-input text-sm p-2"
                        type="text"
                        value={(editForm as any)[key]}
                        onChange={(e) =>
                          setEditForm({ ...editForm, [key]: e.target.value })
                        }
                      />
                    )}
                  </div>
                ))}
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="retro-button px-6 py-2 text-xs font-bold flex items-center gap-2 text-green-800 uppercase"
                  >
                    <Save size={16} /> Save_Changes.vxd
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Articles_Pub",
            val: publishedPosts.length,
            icon: FileText,
            color: "text-blue-900",
          },
          {
            label: "Net_Views",
            val: profile.posts.reduce((a, b) => a + (b.views || 0), 0),
            icon: Eye,
            color: "text-orange-700",
          },
          {
            label: "Peer_Comm",
            val: profile.posts.reduce((a, b) => a + (b.reply_count || 0), 0),
            icon: MessageSquare,
            color: "text-green-800",
          },
          {
            label: "Net_Rating",
            val: `${averageRating}/10`,
            icon: Award,
            color: "text-purple-900",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="retro-border-outset bg-white p-4 flex items-center gap-4 group"
          >
            <div
              className={`p-2 bg-gray-100 border-2 border-inset border-gray-300 ${stat.color} group-hover:scale-110 transition-transform`}
            >
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-black italic tracking-tighter">
                {stat.val}
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Stream Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Posts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="retro-border-outset bg-[#000080] text-white p-2 font-bold flex items-center gap-2 shadow-lg italic">
            <FileText size={18} /> DATA_STREAM::PUBLISHED_CONTENT
          </div>

          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {publishedPosts.length === 0 ? (
              <div className="retro-border-inset bg-white p-16 text-center text-gray-400 font-bold uppercase italic border-2 border-dashed border-gray-300">
                [ No broadcast history found on this node ]
              </div>
            ) : (
              publishedPosts.map((post) => (
                <div
                  key={post.id}
                  className="retro-border-outset bg-white p-5 group hover:bg-gray-50 transition-all border-l-4 border-l-[#000080]"
                >
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                    <Link
                      to={`/post/${post.id}`}
                      className="text-xl font-bold text-[#000080] no-underline group-hover:text-red-700 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      {post.title}
                    </Link>
                    <span className="text-[10px] font-bold bg-gray-200 px-2 py-0.5 border border-gray-400 text-gray-600">
                      {safeFormat(post.created_at, "dd-MM-yy HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-sans line-clamp-3 mb-4 leading-relaxed">
                    {post.content
                      ? post.content.replace(/<[^>]*>/g, "").substring(0, 250)
                      : "No textual data."}
                    ...
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-[10px] font-bold text-gray-400 uppercase">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {post.views} Views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} /> {post.reply_count} Replies
                      </span>
                    </div>
                    <Link
                      to={`/post/${post.id}`}
                      className="text-[10px] font-black text-[#000080] flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      ACCESS_FULL_LOG <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Peer Reviews Terminal */}
        <div className="space-y-4">
          <div className="retro-border-outset bg-[#008000] text-white p-2 flex justify-between items-center font-bold shadow-lg">
            <span className="flex items-center gap-2 italic">
              <Star size={18} className="fill-white" /> PEER_EVALUATIONS
            </span>
            <span className="bg-black text-[#00ff00] font-mono px-2 text-sm border border-gray-500">
              AVG:{averageRating}
            </span>
          </div>

          <div className="bg-black border-4 border-inset border-gray-600 p-4 max-h-[400px] overflow-y-auto space-y-4 relative custom-scrollbar">
            {/* Terminal Glow Effect */}
            <div className="sticky top-0 h-0 w-full shadow-[0_0_50px_rgba(0,128,0,0.2)]"></div>

            {profile.reviewsReceived.length > 0 ? (
              profile.reviewsReceived.map((rev, i) => (
                <div
                  key={i}
                  className="border-b border-green-900 pb-3 last:border-0 group"
                >
                  <div className="flex justify-between mb-1 font-mono">
                    <Link to={`/profile/${rev.reviewer.id}`}>
                      <span className="text-green-500 text-xs font-bold">
                        {">"}{" "}
                        {rev.reviewer.username?.toUpperCase() || "ANON_USER"}
                      </span>
                    </Link>
                    <span className="text-yellow-500 font-bold text-xs">
                      [{rev.rating}/10]
                    </span>
                  </div>
                  <p className="text-[#00ff00] text-[11px] font-mono leading-tight italic opacity-90 group-hover:opacity-100">
                    "{rev.comment}"
                  </p>
                  <div className="text-[8px] text-green-950 font-bold text-right mt-1 tracking-widest uppercase">
                    Logged: {safeFormat(rev.created_at, "MMM dd, yyyy")}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-30 text-green-500 space-y-2">
                <Terminal size={32} />
                <span className="text-[10px] font-black">
                  NO_EVALUATIONS_LOGGED
                </span>
              </div>
            )}
          </div>

          {!isOwnProfile && user && (
            <div className="retro-border-outset bg-[#c0c0c0] p-1">
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="retro-button w-full py-2 text-[11px] font-black uppercase text-[#000080] flex items-center justify-center gap-2"
                >
                  <Edit2 size={12} /> INIT_EVALUATION_PROCESS
                </button>
              ) : (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-3 space-y-3 bg-white border border-gray-400"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-900">
                      RATING_INPUT: {rating}/10
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="text-red-600 font-bold text-[9px] hover:underline uppercase"
                    >
                      Abort
                    </button>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full accent-blue-900"
                  />
                  <textarea
                    className="retro-input w-full h-24 text-[11px] font-mono p-2 focus:ring-0"
                    placeholder="Enter professional feedback data packet..."
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="retro-button w-full py-2 text-xs font-bold uppercase text-green-900"
                  >
                    SUBMIT_EVALUATION.EXE
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 14px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e0e0e0;
          border-left: 1px solid #808080;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c0c0c0;
          border: 2px solid;
          border-color: #ffffff #808080 #808080 #ffffff;
          box-shadow: inset 1px 1px 0 #dfdfdf;
        }
        .retro-input {
          background: white;
          border-top: 2px solid #808080;
          border-left: 2px solid #808080;
          border-right: 2px solid #ffffff;
          border-bottom: 2px solid #ffffff;
          outline: none;
        }
        .retro-input:focus {
          border: 2px solid #000080;
        }
      `}</style>
    </div>
  );
}
