import { Outlet } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CommandPalette } from "../../app/components/CommandPalette";

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="bg-[#7C7C7C] min-h-screen h-screen flex flex-col items-center overflow-hidden">
      <CommandPalette />
      <div className="w-full h-full bg-[#C0C0C0] retro-border-outset flex flex-col shadow-xl">
        <Header />

        <div className="flex flex-1 overflow-hidden relative">
          <main className="flex-1 bg-white border-2 border-inset border-gray-400 overflow-y-auto">
            <Outlet />
          </main>

          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#C0C0C0] border-2 border-white border-r-gray-600 border-b-gray-600 p-1 hover:bg-gray-300 active:border-gray-600 active:border-r-white active:border-b-white"
            style={{ marginRight: sidebarCollapsed ? "0" : "272px" }}
            title={sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          <div
            className={`bg-[#C0C0C0] border-l-2 border-white overflow-y-auto transition-all ${sidebarCollapsed ? "w-0" : "w-[272px]"}`}
          >
            {!sidebarCollapsed && <Sidebar />}
          </div>
        </div>

        <footer className="mt-auto bg-[#000080] text-white p-2 text-center text-xs font-mono border-t-2 border-white">
          &copy; 1996 THE DEV EXCHANGE. ALL RIGHTS RESERVED. OPTIMIZED FOR
          NETSCAPE NAVIGATOR 3.0.
        </footer>
      </div>
    </div>
  );
}
