import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bold, Italic, Image as ImageIcon, Code, Save, Send } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

export default function Editor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('IDLE'); // IDLE, CONNECTING, UPLOADING, DONE

  const handlePublish = async () => {
    if (!title || !content) return;
    
    setLoading(true);
    setStatus('CONNECTING');
    
    // Simulate handshake
    setTimeout(async () => {
      setStatus('UPLOADING');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Authentication failed. Please login.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7416ca23/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            title,
            content,
            status: 'published',
            tags: ['general']
          })
        });
        
        if (res.ok) {
           setStatus('DONE');
           setTimeout(() => {
             navigate('/');
           }, 1000);
        } else {
           throw new Error('Upload failed');
        }
      } catch (e) {
        console.error(e);
        alert("Transmission Error: " + e.message);
        setLoading(false);
        setStatus('IDLE');
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#C0C0C0] p-1 border-2 border-white border-r-gray-600 border-b-gray-600">
      {/* Menu Bar */}
      <div className="flex bg-[#000080] text-white px-2 py-1 mb-1 justify-between items-center select-none">
        <span className="font-bold text-sm">Post Composer v1.0 - [Untitled.txt]</span>
        <button className="text-xs bg-red-600 px-1 border border-white">X</button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-1 mb-2 bg-[#C0C0C0] border-b border-gray-400 pb-1">
        {[Bold, Italic, ImageIcon, Code].map((Icon, i) => (
           <button key={i} className="p-1 border-2 border-white border-r-gray-600 border-b-gray-600 active:border-gray-600 active:border-r-white active:border-b-white hover:bg-white/20">
             <Icon size={16} />
           </button>
        ))}
        <div className="w-[1px] bg-gray-500 mx-1"></div>
        <button onClick={handlePublish} disabled={loading} className="p-1 px-2 border-2 border-white border-r-gray-600 border-b-gray-600 active:border-gray-600 active:border-r-white active:border-b-white hover:bg-white/20 flex items-center gap-1 font-bold text-sm text-[#000080]">
           <Send size={14} /> PUBLISH
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex gap-2 overflow-hidden">
         {/* Main Text Area */}
         <div className="flex-1 bg-gray-500 p-4 shadow-inner overflow-y-auto border-2 border-gray-600 border-r-white border-b-white relative">
            <div className="bg-white min-h-full shadow-lg p-8 max-w-2xl mx-auto border border-gray-300">
               <input 
                 type="text" 
                 placeholder="Enter Headline..." 
                 className="w-full text-2xl font-bold font-serif mb-4 border-b border-dotted border-gray-400 outline-none placeholder-gray-300"
                 value={title}
                 onChange={e => setTitle(e.target.value)}
               />
               <textarea 
                 className="w-full h-[60vh] resize-none outline-none font-serif text-lg leading-relaxed placeholder-gray-300"
                 placeholder="Start typing your article here..."
                 value={content}
                 onChange={e => setContent(e.target.value)}
               />
            </div>
         </div>
         
         {/* Sidebar Metadata */}
         <div className="w-48 bg-[#C0C0C0] border-l border-white p-2 flex flex-col gap-4">
            <div className="border-2 border-white border-r-gray-600 border-b-gray-600 p-2">
               <div className="text-xs font-bold mb-1">METADATA</div>
               <div className="space-y-2">
                 <div>
                   <label className="text-xs block text-gray-700">Category:</label>
                   <select className="w-full text-xs border border-gray-500">
                     <option>General</option>
                     <option>Technical</option>
                     <option>Rant</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs block text-gray-700">Audience:</label>
                   <select className="w-full text-xs border border-gray-500">
                     <option>Everyone</option>
                     <option>Developers</option>
                     <option>SysAdmins</option>
                   </select>
                 </div>
               </div>
            </div>
         </div>
      </div>

      {/* Publishing Modal */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-[#C0C0C0] border-2 border-white border-r-gray-600 border-b-gray-600 w-64 shadow-2xl p-1">
              <div className="bg-[#000080] text-white px-2 py-0.5 text-xs font-bold mb-2 flex justify-between">
                <span>Uplink Status</span>
                <span>X</span>
              </div>
              <div className="p-4 flex flex-col items-center gap-4">
                 <div className="w-full bg-white border border-gray-600 h-6 relative">
                    <div 
                      className="bg-[#000080] h-full transition-all duration-300" 
                      style={{ width: status === 'CONNECTING' ? '30%' : status === 'UPLOADING' ? '70%' : '100%' }}
                    ></div>
                 </div>
                 <div className="text-sm font-mono text-center">
                    {status === 'CONNECTING' && "Handshaking..."}
                    {status === 'UPLOADING' && "Transmitting Packets..."}
                    {status === 'DONE' && "Upload Complete!"}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
