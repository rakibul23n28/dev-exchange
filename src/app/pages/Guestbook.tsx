import { Link } from "react-router";
import { useState } from "react";

interface GuestbookEntry {
  name: string;
  email: string;
  mood: string;
  message: string;
  date: string;
}

export function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([
    {
      name: "NetSurfer42",
      email: "surfer@geocities.com",
      mood: "😊",
      message: "Awesome site! Love the retro vibes! Keep up the great work!",
      date: "1996-02-24 14:32",
    },
    {
      name: "CyberKat",
      email: "kat@angelfire.com",
      mood: "😎",
      message: "This takes me back! The beveled borders are *chef's kiss*",
      date: "1996-02-23 09:15",
    },
    {
      name: "WebWizard",
      email: "wizard@tripod.com",
      mood: "🤓",
      message:
        "Finally, someone who appreciates the artistry of table-based layouts!",
      date: "1996-02-22 18:47",
    },
  ]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mood: "😊",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEntry: GuestbookEntry = {
      ...formData,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
    };

    setEntries([newEntry, ...entries]);
    setFormData({ username: "", email: "", mood: "😊", message: "" });
  };

  return (
    <div className="retro-container">
      {/* Navigation */}
      <nav className="beveled-outset p-3 mb-6">
        <div className="flex gap-2 justify-center flex-wrap">
          <Link to="/" className="retro-button">
            HOME
          </Link>
          <Link to="/projects" className="retro-button">
            PROJECTS
          </Link>
          <Link to="/about" className="retro-button">
            ABOUT SYSOP
          </Link>
          <Link to="/guestbook" className="retro-button">
            GUESTBOOK
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 style={{ color: "var(--retro-navy)" }}>📖 PUBLIC GUESTBOOK 📖</h1>
        <p className="mt-2" style={{ fontSize: "14px" }}>
          Sign my guestbook! Let me know you visited!
        </p>
      </div>

      {/* Guestbook Form */}
      <div className="beveled-border p-6 mb-6">
        <h2 className="mb-4" style={{ color: "var(--retro-navy)" }}>
          Sign the Guestbook:
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2" style={{ fontWeight: "bold" }}>
              Your Name: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="retro-input w-full"
              style={{ fontSize: "14px" }}
              placeholder="Enter your name..."
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2" style={{ fontWeight: "bold" }}>
              Email Address:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="retro-input w-full"
              style={{ fontSize: "14px" }}
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2" style={{ fontWeight: "bold" }}>
              Your Mood: <span style={{ color: "red" }}>*</span>
            </label>
            <select
              required
              value={formData.mood}
              onChange={(e) =>
                setFormData({ ...formData, mood: e.target.value })
              }
              className="retro-input"
              style={{ fontSize: "14px", padding: "8px 12px" }}
            >
              <option value="😊">😊 Happy</option>
              <option value="😎">😎 Cool</option>
              <option value="🤓">🤓 Nerdy</option>
              <option value="😍">😍 Loving It</option>
              <option value="🤔">🤔 Thoughtful</option>
              <option value="😂">😂 Laughing</option>
              <option value="🥳">🥳 Party Time</option>
              <option value="😴">😴 Sleepy</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2" style={{ fontWeight: "bold" }}>
              Your Message: <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="retro-input w-full"
              rows={5}
              style={{ fontSize: "14px", resize: "vertical" }}
              placeholder="Leave your message here..."
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="retro-button"
              style={{ fontSize: "16px", padding: "8px 32px" }}
            >
              📝 Post Message!
            </button>
          </div>
        </form>
      </div>

      {/* Previous Entries */}
      <div className="beveled-border p-6">
        <h2 className="mb-4" style={{ color: "var(--retro-navy)" }}>
          Previous Entries ({entries.length}):
        </h2>

        <div
          className="space-y-4"
          style={{ maxHeight: "600px", overflowY: "auto" }}
        >
          {entries.map((entry, index) => (
            <div key={index}>
              {index > 0 && (
                <div className="flex items-center gap-2 my-4">
                  <span style={{ fontSize: "16px" }}>⭐</span>
                  <div className="flex-1 retro-hr" style={{ margin: 0 }} />
                  <span style={{ fontSize: "16px" }}>⭐</span>
                  <div className="flex-1 retro-hr" style={{ margin: 0 }} />
                  <span style={{ fontSize: "16px" }}>⭐</span>
                </div>
              )}

              <div className="beveled-inset p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div style={{ fontSize: "32px" }}>{entry.mood}</div>
                  <div className="flex-1">
                    <div
                      style={{ fontWeight: "bold", color: "var(--retro-navy)" }}
                    >
                      {entry.name}
                    </div>
                    {entry.email && (
                      <div className="retro-link text-sm">{entry.email}</div>
                    )}
                    <div
                      className="code text-xs"
                      style={{ color: "#666", marginTop: "4px" }}
                    >
                      {entry.date}
                    </div>
                  </div>
                </div>

                <div
                  className="beveled-border p-3"
                  style={{
                    background: "#FFFFF0",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                >
                  {entry.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <div className="beveled-outset p-3 mb-4" style={{ fontSize: "12px" }}>
          <div>✨ Thank you for signing my guestbook! ✨</div>
          <div className="mt-1">
            All entries are public. Please be respectful!
          </div>
        </div>

        <Link to="/" className="retro-button">
          ← BACK TO TERMINAL
        </Link>
      </div>
    </div>
  );
}
