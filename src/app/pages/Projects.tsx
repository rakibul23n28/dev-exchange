import { Link } from "react-router";
import { useState } from "react";

interface Project {
  name: string;
  path: string;
  description: string;
  date: string;
}

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects: Project[] = [
    {
      name: "VINTAGE_CSS.EXE",
      path: "C:/BLOG/PROJECTS/VINTAGE_CSS.EXE",
      description: "A comprehensive CSS framework for recreating 1990s web aesthetics with modern browser compatibility.",
      date: "02-20-1996"
    },
    {
      name: "RETRO_ROUTER.SYS",
      path: "C:/BLOG/PROJECTS/RETRO_ROUTER.SYS",
      description: "Navigation system designed for multi-page retro web applications using React Router.",
      date: "02-15-1996"
    },
    {
      name: "BEVEL_GEN.COM",
      path: "C:/BLOG/PROJECTS/BEVEL_GEN.COM",
      description: "Automated beveled border generator with support for ridge, inset, and outset styles.",
      date: "02-10-1996"
    },
    {
      name: "ASCII_LOGO.BAT",
      path: "C:/BLOG/PROJECTS/ASCII_LOGO.BAT",
      description: "Command-line utility for generating ASCII art logos from text input.",
      date: "02-05-1996"
    },
    {
      name: "GUESTBOOK.DLL",
      path: "C:/BLOG/PROJECTS/GUESTBOOK.DLL",
      description: "Public guestbook system with 90s-style emoticons and scrolling message display.",
      date: "01-30-1996"
    }
  ];

  return (
    <div className="retro-container">
      {/* Navigation */}
      <nav className="beveled-outset p-3 mb-6">
        <div className="flex gap-2 justify-center flex-wrap">
          <Link to="/" className="retro-button">HOME</Link>
          <Link to="/projects" className="retro-button">PROJECTS</Link>
          <Link to="/about" className="retro-button">ABOUT SYSOP</Link>
          <Link to="/guestbook" className="retro-button">GUESTBOOK</Link>
        </div>
      </nav>

      {/* DOS Directory Interface */}
      <div className="dos-bg p-6">
        <pre className="mb-4">{`
Microsoft(R) MS-DOS(R) Version 6.22
(C)Copyright Microsoft Corp 1981-1996.

C:\\BLOG\\PROJECTS>DIR /W
`}</pre>

        <div className="mb-4">
          <div className="mb-2">Volume in drive C is PROJECTS</div>
          <div className="mb-2">Volume Serial Number is 1337-BEEF</div>
          <div className="mb-4">Directory of C:\\BLOG\\PROJECTS</div>
        </div>

        {/* File listing */}
        <div className="space-y-2">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 hover:bg-green-900 cursor-pointer p-1"
              onClick={() => setSelectedProject(project)}
            >
              <span style={{ color: 'var(--retro-yellow)' }}>[+]</span>
              <span className="flex-1">{project.path}</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>{project.date}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div>{projects.length} File(s)</div>
          <div>1,234,567 bytes free</div>
        </div>

        <div className="mt-4">
          <span style={{ color: 'var(--retro-green)' }}>C:\BLOG\PROJECTS&gt;</span>
          <span className="animate-pulse">_</span>
        </div>
      </div>

      {/* Windows 95 Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="win95-modal p-1"
            style={{ width: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title bar */}
            <div className="win95-titlebar flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '14px' }}>⚠️</span>
                <span>File Information</span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-2"
                style={{ 
                  background: '#C0C0C0', 
                  border: '1px outset #999',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-4 bg-white border-2" style={{ borderStyle: 'inset', borderColor: '#999' }}>
              <div className="flex gap-4 mb-4">
                <div style={{ fontSize: '48px' }}>💾</div>
                <div className="flex-1">
                  <div className="code mb-2" style={{ fontWeight: 'bold', color: 'var(--retro-navy)' }}>
                    {selectedProject.name}
                  </div>
                  <div className="text-sm mb-2">
                    <strong>Location:</strong> {selectedProject.path}
                  </div>
                  <div className="text-sm mb-2">
                    <strong>Modified:</strong> {selectedProject.date}
                  </div>
                  <div className="text-sm" style={{ textAlign: 'justify' }}>
                    {selectedProject.description}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-end mt-4">
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="retro-button"
                >
                  OK
                </button>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="retro-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="mt-6 text-center">
        <Link to="/" className="retro-button">← BACK TO TERMINAL</Link>
      </div>
    </div>
  );
}
