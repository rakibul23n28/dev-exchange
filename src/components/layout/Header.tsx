import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getCurrentUser, logout, User, getPosts, getProfiles } from '../../lib/localStorage';
import { Terminal, LogOut, User as UserIcon } from 'lucide-react';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [marqueeText, setMarqueeText] = useState('*** SYSTEM ONLINE *** WELCOME TO THE DEV EXCHANGE ***');
  const navigate = useNavigate();

  useEffect(() => {
    // Check for current user on mount
    setUser(getCurrentUser());
    
    // Generate dynamic marquee text
    const generateMarqueeText = () => {
      const posts = getPosts().filter((p: any) => p.status === 'published');
      const users = getProfiles();
      
      const items: string[] = ['*** SYSTEM ONLINE ***', 'WELCOME TO THE DEV EXCHANGE'];
      
      // Add latest posts
      if (posts.length > 0) {
        const latestPosts = posts
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        
        latestPosts.forEach((post: any) => {
          items.push(`NEW POST: ${post.title.toUpperCase()}`);
        });
      }
      
      // Add user count
      if (users.length > 0) {
        items.push(`TOTAL USERS: ${users.length}`);
        
        // Add newest user
        const newestUser = users
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        if (newestUser) {
          items.push(`NEW USER JOINED: ${newestUser.username.toUpperCase()}`);
        }
      }
      
      // Add total posts
      if (posts.length > 0) {
        items.push(`TOTAL ARTICLES: ${posts.length}`);
      }
      
      setMarqueeText(items.join(' *** '));
    };
    
    generateMarqueeText();
    
    // Refresh marquee every 30 seconds
    const marqueeInterval = setInterval(generateMarqueeText, 30000);
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      setUser(getCurrentUser());
      generateMarqueeText();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    const handleAuthChange = () => {
      setUser(getCurrentUser());
      generateMarqueeText();
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      clearInterval(marqueeInterval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  return (
    <header className="bg-[#000080] text-white border-b-2 border-white shadow-md mb-4 sticky top-0 z-50">
      <div className="max-w-[1024px] mx-auto flex items-center justify-between px-4 py-2">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wider hover:text-[#FF4500] transition-colors no-underline">
          <Terminal size={24} />
          <span>THE DEV EXCHANGE</span>
        </Link>
        
        <div className="flex-1 mx-8 overflow-hidden bg-black border border-gray-500 h-6 flex items-center">
          <div className="whitespace-nowrap animate-marquee text-green-400 font-mono text-sm px-2">
            {marqueeText}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-mono">
          {user ? (
            <>
              <Link to={`/profile/${user.id}`} className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded no-underline text-white">
                <UserIcon size={16} />
                <span>{user.username.toUpperCase()}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded text-[#FF4500]"
              >
                <LogOut size={16} />
                <span>LOGOUT</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="retro-button bg-[#C0C0C0] text-black">
              LOGIN
            </Link>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </header>
  );
}