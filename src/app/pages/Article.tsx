import { Link, useParams } from "react-router";

export function Article() {
  const { id } = useParams();

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

      {/* Article Content */}
      <div className="beveled-border p-6">
        {/* Document Header */}
        <div className="mb-6 text-center" style={{ borderBottom: '3px double #000', paddingBottom: '12px' }}>
          <div className="code" style={{ fontSize: '10px' }}>TECHNICAL DOCUMENTATION</div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>Document No. TD-{id}-1996</div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <div className="dymo-label mb-4">
            Section 1: Introduction
          </div>
          <h1 style={{ color: 'var(--retro-navy)', marginLeft: '120px' }}>
            Building a Retro Web Experience
          </h1>
        </div>

        {/* Two-column layout with margin notes */}
        <div className="flex gap-4 mb-6">
          {/* Left margin for notes */}
          <div style={{ width: '120px', flexShrink: 0 }}>
            <div 
              className="beveled-inset p-2 text-xs code mb-4" 
              style={{ position: 'sticky', top: '20px' }}
            >
              <div style={{ color: 'var(--retro-navy)', fontWeight: 'bold' }}>NOTE 1.1:</div>
              <div className="mt-1">Beveled borders are essential</div>
            </div>
            
            <div 
              className="beveled-inset p-2 text-xs code mb-4" 
              style={{ position: 'sticky', top: '120px' }}
            >
              <div style={{ color: 'var(--retro-navy)', fontWeight: 'bold' }}>NOTE 1.2:</div>
              <div className="mt-1">Always use 800px width</div>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1 }}>
            <p className="mb-4" style={{ textAlign: 'justify' }}>
              In the mid-1990s, the World Wide Web was a frontier of innovation and creativity. 
              Developers crafted experiences using the limited tools available, creating a 
              distinct aesthetic that defined an era. This document explores the technical 
              specifications required to recreate that authentic experience.
            </p>

            <div className="dymo-label mb-4 mt-6">
              Section 2: Code Examples
            </div>

            <p className="mb-4" style={{ textAlign: 'justify' }}>
              The following code block demonstrates the proper implementation of retro 
              styling techniques using modern CSS while maintaining period-appropriate 
              visual fidelity.
            </p>

            {/* Green-bar paper code block */}
            <div className="greenbar-paper mb-4">
              <pre style={{ margin: 0, fontSize: '13px' }}>{`function createRetroSite() {
  const container = document.createElement('div');
  container.style.border = '4px ridge #999';
  container.style.width = '800px';
  container.style.margin = '0 auto';
  container.style.background = '#FFFFFF';
  
  return container;
}

// Initialize the retro experience
window.onload = function() {
  createRetroSite();
  playMidiMusic();
};`}</pre>
            </div>

            <p className="text-center text-xs italic mb-6" style={{ color: '#666' }}>
              Figure 1.1: Example JavaScript implementation for retro styling
            </p>

            <div className="dymo-label mb-4 mt-6">
              Section 3: Visual Guidelines
            </div>

            <p className="mb-4" style={{ textAlign: 'justify' }}>
              All images must be processed to achieve an 8-bit dithered appearance, 
              simulating the color limitations of mid-90s display technology. This creates 
              an authentic pixelated aesthetic that evokes the era of 256-color palettes.
            </p>

            {/* Placeholder for image */}
            <div className="beveled-inset mb-2" style={{ padding: '40px', textAlign: 'center', background: '#E0E0E0' }}>
              <div className="code" style={{ color: '#666' }}>[IMAGE: 8-BIT DITHERED EXAMPLE]</div>
              <div className="text-xs mt-2" style={{ color: '#666' }}>640 x 480 pixels</div>
            </div>
            <p className="text-center text-xs italic mb-6" style={{ color: '#666' }}>
              Figure 1.2: Proper image dithering technique demonstration
            </p>

            <div className="dymo-label mb-4 mt-6">
              Section 4: Typography
            </div>

            <p className="mb-4" style={{ textAlign: 'justify' }}>
              Typography in the retro web consisted primarily of system fonts. Times New Roman 
              served as the standard serif typeface for body text, while Courier New provided 
              monospaced rendering for code and technical content. These fonts were universally 
              available across platforms, ensuring consistent display.
            </p>

            <div className="beveled-outset p-4 mb-4">
              <p style={{ fontFamily: '"Times New Roman", serif', marginBottom: '8px' }}>
                <strong>Times New Roman:</strong> Used for headings and body text
              </p>
              <p className="code">
                <strong>Courier New:</strong> Reserved for code blocks and technical data
              </p>
            </div>

            <hr className="retro-hr" />

            <div className="mt-6 text-center">
              <p className="code" style={{ fontSize: '11px', color: '#666' }}>
                END OF DOCUMENT :: CLASSIFICATION: PUBLIC DOMAIN
              </p>
            </div>
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
