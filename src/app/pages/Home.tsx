import { Link } from "react-router";

export default function Home() {
  const posts = [
    {
      id: 1,
      date: "2026-02-25",
      category: "SYS",
      title: "Building a Retro Web Experience",
    },
    {
      id: 2,
      date: "2026-02-20",
      category: "CODE",
      title: "CSS Tricks from the 90s",
    },
    {
      id: 3,
      date: "2026-02-15",
      category: "DEV",
      title: "Nostalgia-Driven Development",
    },
    {
      id: 4,
      date: "2026-02-10",
      category: "WEB",
      title: "The Art of Beveled Borders",
    },
    {
      id: 5,
      date: "2026-02-05",
      category: "SYS",
      title: "When Tables Were King",
    },
  ];

  return (
    <div className="retro-container">
      {/* ASCII Art Logo */}
      <div className="terminal-bg mb-6">
        <pre
          className="text-center"
          style={{ fontSize: "12px", lineHeight: "1.2" }}
        >
          {`
 ██████╗ ███████╗██╗   ██╗    ██████╗ ██╗      ██████╗  ██████╗ 
 ██╔══██╗██╔════╝██║   ██║    ██╔══██╗██║     ██╔═══██╗██╔════╝ 
 ██║  ██║█████╗  ██║   ██║    ██████╔╝██║     ██║   ██║██║  ███╗
 ██║  ██║██╔══╝  ╚██╗ ██╔╝    ██╔══██╗██║     ██║   ██║██║   ██║
 ██████╔╝███████╗ ╚████╔╝     ██████╔╝███████╗╚██████╔╝╚██████╔╝
 ╚═════╝ ╚══════╝  ╚═══╝      ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ 
`}
        </pre>
        <p className="text-center mt-4">
          {">> SYSTEM ONLINE :: ESTABLISHING CONNECTION <<"}
        </p>
      </div>

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

      {/* Latest Logs Section */}
      <div className="beveled-border p-4 mb-6">
        <h2
          className="mb-4"
          style={{ color: "var(--retro-navy)" }}
        >
          <span className="code">&gt;&gt; LATEST LOGS</span>
        </h2>

        <table className="retro-table">
          <thead>
            <tr>
              <th style={{ width: "120px" }}>TIMESTAMP</th>
              <th style={{ width: "100px" }}>CATEGORY</th>
              <th>HEADLINE</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="code">{post.date}</td>
                <td
                  className="code"
                  style={{ color: "var(--retro-navy)" }}
                >
                  [{post.category}]
                </td>
                <td>
                  <Link
                    to={`/post/${post.id}`}
                    className="retro-link"
                  >
                    {post.title}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visitor Counter */}
      <div className="beveled-inset p-4 mb-4 text-center">
        <div className="mb-2">VISITOR COUNTER</div>
        <div
          className="inline-block px-4 py-2"
          style={{
            background: "#000",
            color: "#FF0000",
            fontFamily: '"Courier New", monospace',
            fontSize: "24px",
            letterSpacing: "4px",
            border: "2px solid #333",
          }}
        >
          0001337
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-4 justify-center items-center">
        <div
          className="beveled-border px-3 py-2 text-center"
          style={{ fontSize: "11px" }}
        >
          <div
            style={{
              fontWeight: "bold",
              color: "var(--retro-navy)",
            }}
          >
            BEST VIEWED IN
          </div>
          <div className="code">NETSCAPE NAVIGATOR</div>
          <div style={{ fontSize: "9px" }}>
            800x600 Resolution
          </div>
        </div>

        <div
          className="beveled-border px-3 py-2 text-center"
          style={{ fontSize: "11px" }}
        >
          <div
            style={{
              fontWeight: "bold",
              color: "var(--retro-orange)",
            }}
          >
            OPTIMIZED FOR
          </div>
          <div className="code">IE 4.0+</div>
          <div style={{ fontSize: "9px" }}>256 Colors</div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-6 text-center"
        style={{ fontSize: "11px", color: "#666" }}
      >
        <hr className="retro-hr" />
        <p className="code">
          © 1996-2026 DEV BLOG :: WEBMASTER@LOCALHOST
        </p>
        <p className="mt-1">
          This page is best experienced with JavaScript enabled
        </p>
      </div>
    </div>
  );
}