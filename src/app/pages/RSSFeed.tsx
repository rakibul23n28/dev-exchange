import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getProfile, getPosts } from '../../lib/localStorage';
import { generateRSS } from '../../lib/rss';
import { ArrowLeft, Rss, Copy, Download, Check } from 'lucide-react';

export function RSSFeed() {
  const { id } = useParams<{ id: string }>();
  const [rssContent, setRssContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!id) {
      setError('User ID not provided');
      setLoading(false);
      return;
    }

    try {
      // Get user profile
      const profile = getProfile(id);
      if (!profile) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      setUsername(profile.username);

      // Get all posts
      const allPosts = getPosts();
      const userPosts = allPosts.filter((p: any) => p.author_id === id);

      // Generate RSS feed
      const rss = generateRSS(profile, userPosts);
      setRssContent(rss);
      setLoading(false);
    } catch (err) {
      console.error('RSS generation error:', err);
      setError('Failed to generate RSS feed');
      setLoading(false);
    }
  }, [id]);

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(rssContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for when clipboard API is blocked
      try {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = rssContent;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([rssContent], { type: 'application/rss+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}_feed.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="retro-border-outset bg-white p-8 max-w-4xl mx-auto">
          <div className="text-[#000080] font-mono font-bold text-xl mb-4 animate-pulse">
            GENERATING RSS FEED...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="retro-border-outset bg-white p-8 max-w-md mx-auto">
          <div className="text-red-500 font-mono font-bold text-xl mb-4">ERROR</div>
          <div className="text-gray-700 font-mono mb-4">{error}</div>
          <Link to="/" className="inline-flex items-center gap-2 text-[#FF4500] hover:underline font-mono text-sm">
            <ArrowLeft size={14} /> RETURN TO INDEX
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Link to={`/profile/${id}`} className="inline-flex items-center gap-2 text-[#000080] hover:underline mb-4 font-mono text-xs">
        <ArrowLeft size={12} /> RETURN TO PROFILE
      </Link>

      {/* Header */}
      <div className="retro-border-outset bg-[#C0C0C0] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rss size={24} className="text-[#FF4500]" />
            <div>
              <h1 className="text-xl font-bold text-[#000080] font-mono">
                RSS FEED GENERATOR
              </h1>
              <p className="text-sm font-mono text-gray-700">
                User: {username} | Format: RSS 2.0
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="retro-button px-3 py-2 text-xs flex items-center gap-2"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-[#008000]" />
                  COPIED!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  COPY XML
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="retro-button px-3 py-2 text-xs flex items-center gap-2"
              title="Download XML file"
            >
              <Download size={14} />
              DOWNLOAD
            </button>
          </div>
        </div>
      </div>

      {/* Feed URL Info */}
      <div className="retro-border-outset bg-white p-4">
        <h2 className="text-sm font-bold text-[#000080] mb-2 font-mono">FEED URL:</h2>
        <div className="retro-border-inset bg-[#F0F0F0] p-3 font-mono text-xs overflow-x-auto">
          <code className="text-[#000080]">
            {window.location.origin}/rss/{id}
          </code>
        </div>
        <p className="text-xs text-gray-600 mt-2 font-mono">
          ℹ️ Subscribe to this feed in your RSS reader to get updates when new posts are published.
        </p>
      </div>

      {/* RSS Content Display */}
      <div className="retro-border-outset bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#000080] font-mono">XML OUTPUT:</h2>
          <span className="text-xs text-gray-500 font-mono">
            {rssContent.length} bytes
          </span>
        </div>
        <div className="retro-border-inset bg-black p-4 overflow-auto max-h-[600px]">
          <pre className="text-[#00FF00] font-mono text-xs whitespace-pre-wrap break-all">
            {rssContent}
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="retro-border-outset bg-white p-4">
        <h2 className="text-sm font-bold text-[#000080] mb-3 font-mono">USAGE INSTRUCTIONS:</h2>
        <div className="space-y-2 text-xs font-mono">
          <div className="retro-border-inset bg-[#F0F0F0] p-3">
            <p className="font-bold text-[#000080] mb-1">1. COPY THE FEED URL</p>
            <p className="text-gray-700">
              Use the feed URL shown above to subscribe in any RSS reader application.
            </p>
          </div>
          <div className="retro-border-inset bg-[#F0F0F0] p-3">
            <p className="font-bold text-[#000080] mb-1">2. ADD TO RSS READER</p>
            <p className="text-gray-700">
              Popular RSS readers include Feedly, Inoreader, NewsBlur, and The Old Reader.
            </p>
          </div>
          <div className="retro-border-inset bg-[#F0F0F0] p-3">
            <p className="font-bold text-[#000080] mb-1">3. DOWNLOAD XML FILE</p>
            <p className="text-gray-700">
              Click "DOWNLOAD" to save the XML file locally for offline use or archival purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}