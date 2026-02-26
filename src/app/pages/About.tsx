import { Link } from "react-router";

export function About() {
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

      {/* Personnel File */}
      <div className="beveled-border" style={{ background: '#F5F5DC', position: 'relative' }}>
        {/* TOP SECRET Stamp */}
        <div className="absolute right-8 top-8 stamp">
          TOP SECRET
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6" style={{ borderBottom: '2px solid #000', paddingBottom: '8px' }}>
            <div className="typewriter-text" style={{ fontWeight: 'bold', fontSize: '18px' }}>
              PERSONNEL FILE
            </div>
            <div className="typewriter-text" style={{ fontSize: '12px', marginTop: '4px' }}>
              CLEARANCE LEVEL: GAMMA :: FILE NO. PF-2026-001
            </div>
          </div>

          {/* Photo with paperclip */}
          <div className="flex gap-6 mb-6">
            <div style={{ position: 'relative' }}>
              {/* Paperclip graphic */}
              <div 
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  fontSize: '48px',
                  transform: 'rotate(45deg)',
                  filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))'
                }}
              >
                📎
              </div>
              
              {/* Photo placeholder */}
              <div 
                className="beveled-inset pixelated-img"
                style={{
                  width: '150px',
                  height: '180px',
                  background: '#D0D0D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}
              >
                👤
              </div>
              <div className="text-center typewriter-text" style={{ fontSize: '10px', marginTop: '4px' }}>
                PHOTO ID: 1996-A
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 typewriter-text">
              <div className="mb-3">
                <strong>NAME:</strong> <span className="ml-2">SYSTEM OPERATOR (SYSOP)</span>
              </div>
              <div className="mb-3">
                <strong>ALIAS:</strong> <span className="ml-2">RetroWebMaster</span>
              </div>
              <div className="mb-3">
                <strong>DESIGNATION:</strong> <span className="ml-2">Chief Developer</span>
              </div>
              <div className="mb-3">
                <strong>CLEARANCE:</strong> <span className="ml-2">GAMMA-7</span>
              </div>
              <div className="mb-3">
                <strong>LOCATION:</strong> <span className="ml-2 redacted-bar">REDACTED</span>
              </div>
              <div className="mb-3">
                <strong>STATUS:</strong> <span className="ml-2" style={{ color: 'green' }}>ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="typewriter-text mb-6" style={{ textAlign: 'justify', lineHeight: '2' }}>
            <div className="mb-4" style={{ borderBottom: '1px solid #000', paddingBottom: '4px' }}>
              <strong>BACKGROUND SUMMARY:</strong>
            </div>
            
            <p className="mb-4">
              Subject has demonstrated exceptional proficiency in recreating historical 
              web technologies using modern frameworks. Primary expertise includes <span className="redacted-bar">REDACTED</span> 
              {' '}and advanced CSS manipulation techniques.
            </p>

            <p className="mb-4">
              Known for pioneering work in retro-aesthetic web development, including the 
              implementation of beveled borders, terminal interfaces, and <span className="redacted-bar">CLASSIFIED</span> 
              {' '}dithering algorithms. Subject maintains active <span className="redacted-bar">SECRET PROJECT</span> 
              {' '}related to 1990s web preservation.
            </p>

            <p className="mb-4">
              Special skills include: DOS navigation systems, ASCII art generation, 
              Windows 95 UI recreation, and authentic visitor counter implementation. 
              Subject's favorite color is <span className="redacted-bar">REDACTED</span>.
            </p>

            <div className="mt-6 mb-4" style={{ borderBottom: '1px solid #000', paddingBottom: '4px' }}>
              <strong>TECHNICAL SPECIFICATIONS:</strong>
            </div>

            <div className="ml-4">
              <div className="mb-2">- Expertise: HTML 3.2, CSS Ridge Borders, JavaScript 1.0</div>
              <div className="mb-2">- Tools: Netscape Navigator, Microsoft FrontPage 97</div>
              <div className="mb-2">- Certifications: Webring Master (1996), GIF Animator Pro</div>
              <div className="mb-2">- Notable Achievement: <span className="redacted-bar">TOP SECRET CLEARANCE REQUIRED</span></div>
            </div>
          </div>

          {/* Stamps and signatures */}
          <div className="flex justify-between items-end mt-8 pt-4" style={{ borderTop: '2px solid #000' }}>
            <div className="typewriter-text">
              <div className="mb-2">AUTHORIZED BY:</div>
              <div style={{ fontFamily: 'cursive', fontSize: '20px' }}>J. Administrator</div>
              <div style={{ fontSize: '10px' }}>Lab Director</div>
            </div>

            <div className="stamp" style={{ transform: 'rotate(10deg)' }}>
              APPROVED
            </div>
          </div>

          {/* Footer notes */}
          <div className="mt-6 text-center typewriter-text" style={{ fontSize: '10px', color: '#666' }}>
            <div>CLASSIFICATION: TOP SECRET // NOFORN // EYES ONLY</div>
            <div className="mt-1">This document contains sensitive information. Unauthorized disclosure is prohibited.</div>
            <div className="mt-1">Document valid until: 12/31/2026</div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="mt-6 text-center">
        <Link to="/" className="retro-button">← BACK TO TERMINAL</Link>
      </div>
    </div>
  );
}
