import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { api } from "../lib/api";
import { Post, Profile as ProfileType } from "../../share-types/types";
import { format } from "date-fns";
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
  TrendingUp,
  Clock,
  Eye,
  Rss,
} from "lucide-react";
import { getCurrentUser, updateReputation } from "../lib/localStorage";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: "",
    specialization: "",
    location: "",
    website: "",
    github: "",
    twitter: "",
  });
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    api
      .getProfile(id)
      .then((data: any) => {
        if (data) {
          setProfile(data);
          setPosts(data.posts || []);
          setEditForm({
            bio: data.bio || "",
            specialization: data.specialization || "",
            location: data.location || "",
            website: data.website || "",
            github: data.github || "",
            twitter: data.twitter || "",
          });
        } else {
          setError("Profile not found");
        }
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        setError(err.message || "Failed to load profile");
      })
      .finally(() => setLoading(false));

    // Load reviews for this user
    const savedReviews = localStorage.getItem("reviews");
    if (savedReviews) {
      const allReviews = JSON.parse(savedReviews);
      const userReviews = allReviews.filter((r: any) => r.reviewee_id === id);
      setReviews(userReviews);
    }
  }, [id]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to submit a review.");
      return;
    }

    if (currentUser.id === id) {
      alert("You cannot review yourself.");
      return;
    }

    const newReview = {
      id: `review-${Date.now()}`,
      reviewer_id: currentUser.id,
      reviewer_name: currentUser.username,
      reviewee_id: id,
      reviewee_name: profile?.username || "Unknown",
      rating,
      comment,
      created_at: new Date().toISOString(),
    };

    const savedReviews = localStorage.getItem("reviews");
    const allReviews = savedReviews ? JSON.parse(savedReviews) : [];
    const updatedReviews = [...allReviews, newReview];

    localStorage.setItem("reviews", JSON.stringify(updatedReviews));
    setReviews([...reviews, newReview]);

    // Update reputation for the reviewed user
    if (id) {
      updateReputation(
        id,
        rating,
        `Received ${rating}/10 peer review from ${currentUser.username}`,
      );

      // Refresh profile to show updated reputation
      api.getProfile(id).then((data: any) => {
        if (data) {
          setProfile(data);
        }
      });
    }

    // Reset form
    setRating(5);
    setComment("");
    setShowReviewForm(false);

    alert("Review submitted successfully!");
  };

  const handleSaveProfile = () => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      ...editForm,
    };

    // Update in localStorage
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      const userIndex = users.findIndex((u: any) => u.id === id);
      if (userIndex !== -1) {
        users[userIndex] = updatedProfile;
        localStorage.setItem("users", JSON.stringify(users));
        setProfile(updatedProfile);
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return "N/A";
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getTotalViews = () => {
    return posts.reduce((acc, post) => acc + (post.views || 0), 0);
  };

  const getTotalReplies = () => {
    return posts.reduce((acc, post) => acc + (post.reply_count || 0), 0);
  };

  const getPublishedCount = () => {
    return posts.filter((p) => p.status === "published").length;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#000080] font-mono animate-pulse">
        LOADING USER DOSSIER...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center">
        <div className="retro-border-outset bg-white p-8 max-w-md mx-auto">
          <div className="text-red-500 font-mono font-bold text-xl mb-4">
            ERROR
          </div>
          <div className="text-gray-700 font-mono mb-4">
            {error || "USER NOT FOUND IN DIRECTORY."}
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#FF4500] hover:underline font-mono text-sm"
          >
            <ArrowLeft size={14} /> RETURN TO INDEX
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-[#000080] hover:underline mb-4 font-mono text-xs"
      >
        <ArrowLeft size={12} /> RETURN TO INDEX
      </Link>

      {/* Business Card Header */}
      <div className="retro-border-outset bg-[#C0C0C0] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
          <Briefcase size={120} />
        </div>

        {isOwnProfile && (
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              if (isEditing) {
                setEditForm({
                  bio: profile.bio || "",
                  specialization: profile.specialization || "",
                  location: profile.location || "",
                  website: profile.website || "",
                  github: profile.github || "",
                  twitter: profile.twitter || "",
                });
              }
            }}
            className="absolute top-4 right-4 retro-button px-3 py-1 text-xs flex items-center gap-1 z-10"
          >
            {isEditing ? (
              <>
                <X size={12} /> CANCEL
              </>
            ) : (
              <>
                <Edit2 size={12} /> EDIT PROFILE
              </>
            )}
          </button>
        )}

        <div className="flex gap-6 relative z-10">
          <div className="w-32 h-32 bg-gray-300 retro-border-inset flex items-center justify-center shrink-0">
            <User size={64} className="text-gray-500" />
          </div>

          <div className="flex-1 space-y-2 font-mono">
            <div className="border-b-2 border-[#000080] pb-2 mb-2 flex justify-between items-end">
              <h1 className="text-2xl font-bold text-[#000080]">
                {profile.username.toUpperCase()}
              </h1>
              <span className="text-xs bg-[#000080] text-white px-2 py-1">
                ID: {profile.id.substring(0, 8)}
              </span>
            </div>

            {!isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-[#FF4500]" />
                    <span className="font-bold">ROLE:</span>
                    <span>{profile.specialization || "DEVELOPER"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#FF4500]" />
                    <span className="font-bold">JOINED:</span>
                    <span>
                      {profile.join_date
                        ? format(new Date(profile.join_date), "yyyy-MM-dd")
                        : "UNKNOWN"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-[#FF4500]" />
                    <span className="font-bold">REPUTATION:</span>
                    <span>{profile.reputation_score || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-[#FF4500]" />
                    <span className="font-bold">EMAIL:</span>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-[#000080] hover:underline text-xs"
                    >
                      {profile.email}
                    </a>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold">LOCATION:</span>
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold">WEBSITE:</span>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FF4500] hover:underline text-xs"
                      >
                        LINK
                      </a>
                    </div>
                  )}
                  {profile.github && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold">GITHUB:</span>
                      <a
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FF4500] hover:underline text-xs"
                      >
                        @{profile.github}
                      </a>
                    </div>
                  )}
                  {profile.twitter && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold">TWITTER:</span>
                      <a
                        href={`https://twitter.com/${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FF4500] hover:underline text-xs"
                      >
                        @{profile.twitter}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-white retro-border-inset text-xs italic min-h-[60px] overflow-y-auto">
                  "{profile.bio || "No bio available."}"
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      ROLE/SPECIALIZATION:
                    </label>
                    <input
                      type="text"
                      value={editForm.specialization}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specialization: e.target.value,
                        })
                      }
                      className="retro-input w-full text-xs"
                      placeholder="e.g., Full Stack Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      LOCATION:
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      className="retro-input w-full text-xs"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      WEBSITE:
                    </label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) =>
                        setEditForm({ ...editForm, website: e.target.value })
                      }
                      className="retro-input w-full text-xs"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      GITHUB USERNAME:
                    </label>
                    <input
                      type="text"
                      value={editForm.github}
                      onChange={(e) =>
                        setEditForm({ ...editForm, github: e.target.value })
                      }
                      className="retro-input w-full text-xs"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      TWITTER USERNAME:
                    </label>
                    <input
                      type="text"
                      value={editForm.twitter}
                      onChange={(e) =>
                        setEditForm({ ...editForm, twitter: e.target.value })
                      }
                      className="retro-input w-full text-xs"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">BIO:</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    className="retro-input w-full text-xs h-16"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="retro-button px-4 py-1 text-xs flex items-center gap-1"
                >
                  <Save size={12} /> SAVE CHANGES
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-4 gap-4">
        <div className="retro-border-outset bg-white p-4 text-center">
          <div className="flex items-center justify-center mb-2 text-[#000080]">
            <FileText size={24} />
          </div>
          <div className="text-2xl font-bold text-[#000080] font-mono">
            {getPublishedCount()}
          </div>
          <div className="text-xs text-gray-600 font-mono">ARTICLES</div>
        </div>
        <div className="retro-border-outset bg-white p-4 text-center">
          <div className="flex items-center justify-center mb-2 text-[#FF4500]">
            <Eye size={24} />
          </div>
          <div className="text-2xl font-bold text-[#FF4500] font-mono">
            {getTotalViews()}
          </div>
          <div className="text-xs text-gray-600 font-mono">TOTAL VIEWS</div>
        </div>
        <div className="retro-border-outset bg-white p-4 text-center">
          <div className="flex items-center justify-center mb-2 text-[#008000]">
            <MessageSquare size={24} />
          </div>
          <div className="text-2xl font-bold text-[#008000] font-mono">
            {getTotalReplies()}
          </div>
          <div className="text-xs text-gray-600 font-mono">TOTAL REPLIES</div>
        </div>
        <div className="retro-border-outset bg-white p-4 text-center">
          <div className="flex items-center justify-center mb-2 text-[#FF4500]">
            <Award size={24} />
          </div>
          <div className="text-2xl font-bold text-[#FF4500] font-mono">
            {getAverageRating()}
          </div>
          <div className="text-xs text-gray-600 font-mono">PEER RATING</div>
        </div>
      </div>

      {/* RSS Feed Link */}
      <div className="retro-border-outset bg-[#FFFF00] p-3 border-2 border-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rss size={20} className="text-[#FF4500]" />
            <div>
              <div className="font-bold text-[#000080] text-sm font-mono">
                RSS FEED AVAILABLE
              </div>
              <div className="text-xs font-mono text-gray-700">
                Subscribe to get updates when new articles are published
              </div>
            </div>
          </div>
          <Link
            to={`/rss/${id}`}
            className="retro-button px-4 py-2 text-xs flex items-center gap-2"
          >
            <Rss size={14} />
            VIEW RSS FEED
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Blog List */}
        <div className="col-span-2 space-y-4">
          <div className="retro-border-outset p-3 bg-[#C0C0C0]">
            <h2 className="font-bold text-[#000080] flex items-center gap-2">
              <FileText size={18} />
              PUBLISHED ARTICLES ({getPublishedCount()})
            </h2>
          </div>

          <div className="space-y-4">
            {posts.filter((p) => p.status === "published").length === 0 ? (
              <div className="retro-border-inset bg-white p-8 text-center">
                <p className="text-gray-500 italic text-sm font-mono">
                  No articles published yet.
                </p>
              </div>
            ) : (
              posts
                .filter((p) => p.status === "published")
                .map((post) => (
                  <div
                    key={post.id}
                    className="retro-border-outset p-4 bg-white relative group"
                  >
                    {post.reply_count > 5 && (
                      <div className="absolute -top-2 -right-2 z-10 bg-[#FFFF00] border-2 border-black px-2 py-1 text-[10px] font-bold rotate-12">
                        HIGHLY RATED
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <Link
                        to={`/post/${post.id}`}
                        className="text-lg font-bold text-[#000080] hover:text-[#FF4500] hover:underline"
                      >
                        {post.title}
                      </Link>
                      <span className="text-xs text-gray-500 font-mono">
                        {format(new Date(post.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <p
                      className="text-sm text-gray-600 line-clamp-3 mb-3"
                      style={{ textAlign: "left" }}
                    >
                      {post.content.substring(0, 150)}...
                    </p>
                    <div className="flex gap-4 items-center text-xs font-mono text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} /> {post.reply_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />{" "}
                        {format(new Date(post.created_at), "HH:mm")}
                      </span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-[#FFFF00] px-2 py-0.5 border border-black text-black font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Peer Reviews (Comment Wall) */}
        <div className="col-span-1 space-y-4">
          <div className="retro-border-outset bg-[#C0C0C0] p-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-[#000080] flex items-center gap-2">
                <MessageSquare size={18} />
                PEER REVIEWS
              </h2>
              <div className="bg-[#FFFF00] px-2 py-1 text-xs font-bold border-2 border-black">
                {getAverageRating()}/10
              </div>
            </div>
          </div>

          <div className="bg-gray-50 retro-border-inset p-3 h-[400px] overflow-y-auto space-y-3">
            {reviews.length > 0 ? (
              reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="border-2 border-gray-400 bg-white p-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      to={`/profile/${review.reviewer_id}`}
                      className="font-bold text-xs text-[#000080] hover:underline"
                    >
                      {review.reviewer_name}
                    </Link>
                    <div className="bg-[#008000] text-white px-2 py-0.5 text-xs font-bold">
                      {review.rating}/10
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 text-justify">
                    {review.comment}
                  </p>
                  <div className="text-[10px] text-gray-400 mt-1 text-right font-mono">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic text-center py-4">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>

          {currentUser && currentUser.id !== id && (
            <div>
              {!showReviewForm ? (
                <button
                  className="retro-button w-full text-xs"
                  onClick={() => setShowReviewForm(true)}
                >
                  + SUBMIT REVIEW
                </button>
              ) : (
                <div className="retro-border-outset p-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-[#000080]">
                      NEW REVIEW
                    </span>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="text-xs text-red-500 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleSubmitReview} className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        RATING (1-10):
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center font-bold text-[#000080]">
                        {rating}/10
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        COMMENT:
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Professional assessment..."
                        className="retro-input w-full text-xs h-20 font-mono"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="retro-button w-full text-xs"
                    >
                      SUBMIT
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
