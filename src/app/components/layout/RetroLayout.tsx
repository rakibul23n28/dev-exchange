import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Menu, Search, Activity, User, FileText, Globe, Terminal, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { cn } from '../../components/ui/utils';

// Initialize Supabase client
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

export function RetroLayout() {
  const location = useLocation();
  const [stats, setStats] = useState({ users: 0, posts: 0, kb_stored: 0 });
  const [tickerItems, setTickerItems] = useState<string[]>([
    "Welcome to The Dev Exchange",
    "System Online",
    "Connection Established: 56k",
    "New protocol update available..."
  ]);
  const [session, setSession] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Fetch stats
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7416ca23/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen h-screen bg-[#7C7C7C] flex justify-center font-sans select-none overflow-hidden">
      <div className="w-full h-full bg-[#C0C0C0] border-2 border-white border-r-gray-600 border-b-gray-600 shadow-xl flex flex-col">
        
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center select-none">
          <div className="flex items-center gap-2 font-bold tracking-wide">
            <Terminal size={16} />
            <span>The Dev Exchange - Professional Workstation v4.0</span>
          </div>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-[#C0C0C0] border border-white border-r-gray-600 border-b-gray-600 text-black flex items-center justify-center text-xs cursor-pointer active:border-gray-600 active:border-r-white active:border-b-white">_</div>
            <div className="w-4 h-4 bg-[#C0C0C0] border border-white border-r-gray-600 border-b-gray-600 text-black flex items-center justify-center text-xs cursor-pointer active:border-gray-600 active:border-r-white active:border-b-white">□</div>
            <div className="w-4 h-4 bg-[#C0C0C0] border border-white border-r-gray-600 border-b-gray-600 text-black flex items-center justify-center text-xs cursor-pointer active:border-gray-600 active:border-r-white active:border-b-white">X</div>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex px-1 py-1 border-b border-gray-400 bg-[#C0C0C0]">
          {['File', 'Edit', 'View', 'Go', 'Favorites', 'Help'].map((item) => (
            <button key={item} className="px-3 py-0.5 hover:bg-[#000080] hover:text-white focus:outline-none text-sm">
              <span className="underline">{item[0]}</span>{item.slice(1)}
            </button>
          ))}
        </div>

        {/* Toolbar / Search */}
        <div className="flex items-center gap-2 px-2 py-2 border-b border-white border-t-gray-400">
          <div className="flex gap-4 items-center flex-1">
             <div className="flex gap-2">
                <Link to="/" className={cn("p-1 border-2 border-transparent active:border-gray-600 hover:border-gray-400", location.pathname === '/' ? 'border-gray-600 bg-gray-300' : '')} title="Global Wire">
                  <Globe size={20} className="text-gray-800" />
                </Link>
                {session && (
                  <>
                    <Link to="/editor" className={cn("p-1 border-2 border-transparent active:border-gray-600 hover:border-gray-400", location.pathname === '/editor' ? 'border-gray-600 bg-gray-300' : '')} title="New Post">
                      <FileText size={20} className="text-gray-800" />
                    </Link>
                    <Link to="/dashboard" className={cn("p-1 border-2 border-transparent active:border-gray-600 hover:border-gray-400", location.pathname === '/dashboard' ? 'border-gray-600 bg-gray-300' : '')} title="Dashboard">
                      <Activity size={20} className="text-gray-800" />
                    </Link>
                     <Link to={`/profile/${session.user.id}`} className={cn("p-1 border-2 border-transparent active:border-gray-600 hover:border-gray-400", location.pathname.startsWith('/profile') ? 'border-gray-600 bg-gray-300' : '')} title="My Profile">
                      <User size={20} className="text-gray-800" />
                    </Link>
                  </>
                )}
             </div>
             <div className="h-6 w-[1px] bg-gray-500 mx-2"></div>
             <div className="flex items-center gap-2 flex-1 max-w-md">
               <span className="text-sm font-bold text-gray-700">Address:</span>
               <div className="bg-white border-2 border-gray-600 border-r-white border-b-white flex-1 px-2 py-0.5 text-sm font-mono overflow-hidden whitespace-nowrap">
                 http://the-dev-exchange.net{location.pathname}
               </div>
               <button className="px-3 py-0.5 border-2 border-white border-r-gray-600 border-b-gray-600 bg-[#C0C0C0] text-sm font-bold active:border-gray-600 active:border-r-white active:border-b-white active:translate-y-[1px]">Go!</button>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!session ? (
              <Link to="/login" className="px-3 py-0.5 border-2 border-white border-r-gray-600 border-b-gray-600 bg-[#C0C0C0] text-sm font-bold active:border-gray-600 active:border-r-white active:border-b-white text-[#000080]">
                LOGIN
              </Link>
            ) : (
              <button onClick={handleLogout} className="px-3 py-0.5 border-2 border-white border-r-gray-600 border-b-gray-600 bg-[#C0C0C0] text-sm font-bold active:border-gray-600 active:border-r-white active:border-b-white flex items-center gap-1">
                <LogOut size={12} /> LOGOUT
              </button>
            )}
          </div>
        </div>

        {/* Ticker Tape */}
        <div className="bg-black text-[#00FF00] font-mono text-sm py-1 px-2 border-b-2 border-gray-600 overflow-hidden whitespace-nowrap relative">
           <div className="animate-marquee inline-block">
             {tickerItems.join(" *** ")} *** {tickerItems.join(" *** ")}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden h-[calc(100vh-160px)]">
          {/* Sidebar */}
          <div className={`bg-[#C0C0C0] border-r-2 border-white border-l-gray-600 flex flex-col p-2 gap-4 overflow-y-auto transition-all ${sidebarCollapsed ? 'w-0 p-0 border-0' : 'w-64'}`}>
             {!sidebarCollapsed && (
               <>
                 {/* System Stats */}
                 <div className="border-2 border-white border-r-gray-600 border-b-gray-600 p-2">
                   <div className="bg-[#000080] text-white px-1 text-sm font-bold mb-2 text-center">SYSTEM STATUS</div>
                   <div className="text-xs font-mono space-y-1">
                     <div className="flex justify-between"><span>USERS:</span> <span>{stats.users}</span></div>
                     <div className="flex justify-between"><span>POSTS:</span> <span>{stats.posts}</span></div>
                     <div className="flex justify-between"><span>DATA:</span> <span>{stats.kb_stored} KB</span></div>
                     <div className="flex justify-between text-[#008000]"><span>SERVER:</span> <span>ONLINE</span></div>
                   </div>
                 </div>

                 {/* User Directory */}
                 <div className="border-2 border-white border-r-gray-600 border-b-gray-600 p-2 flex-1">
                   <div className="bg-[#808080] text-white px-1 text-sm font-bold mb-2">DIRECTORY</div>
                   <ul className="text-sm space-y-2 font-mono">
                     <li className="flex items-center gap-2 cursor-pointer hover:bg-[#000080] hover:text-white px-1">
                       <span className="w-2 h-2 bg-green-500 inline-block"></span>
                       <span>sysadmin</span>
                     </li>
                     <li className="flex items-center gap-2 cursor-pointer hover:bg-[#000080] hover:text-white px-1">
                       <span className="w-2 h-2 bg-yellow-500 inline-block"></span>
                       <span>net_surfer</span>
                     </li>
                     <li className="flex items-center gap-2 cursor-pointer hover:bg-[#000080] hover:text-white px-1">
                       <span className="w-2 h-2 bg-gray-500 inline-block"></span>
                       <span>guest</span>
                     </li>
                   </ul>
                 </div>

                 {/* Ad Space / Banner */}
                 <div className="border-2 border-gray-600 border-r-white border-b-white bg-black p-2 text-center">
                   <div className="text-[#FF4500] font-mono text-xs animate-pulse">
                     JOIN THE ELITE<br/>
                     DEV EXCHANGE<br/>
                     TODAY!
                   </div>
                 </div>
               </>
             )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#C0C0C0] border-2 border-white border-r-gray-600 border-b-gray-600 p-1 hover:bg-gray-300 active:border-gray-600 active:border-r-white active:border-b-white"
            style={{ marginLeft: sidebarCollapsed ? '0' : '256px' }}
            title={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Page Content */}
          <div className="flex-1 bg-white overflow-y-auto border-l-2 border-gray-600 relative">
            <Outlet context={{ session }} />
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#C0C0C0] border-t border-white p-1 text-xs flex justify-between font-mono">
          <span>Ready</span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>
    </div>
  );
}