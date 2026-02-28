import * as React from "react";
import { Command } from "cmdk";
import {
  Search,
  Calculator,
  Settings,
  User,
  FileText,
  Home,
  Terminal,
  Rss,
} from "lucide-react";
import { useNavigate } from "react-router";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const user = localStorage.getItem("auth_user");
    // If it's a JSON string, remember to parse it!
    const parsedUser = user ? JSON.parse(user) : null;

    setCurrentUser(parsedUser);
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-none border-2 border-white bg-[#C0C0C0] shadow-2xl retro-border-outset">
        <div className="flex items-center justify-between bg-[#000080] px-2 py-1 text-white">
          <div className="flex items-center gap-2">
            <Terminal size={14} />
            <span className="font-mono text-xs font-bold">
              COMMAND_PALETTE.EXE
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-4 w-4 items-center justify-center bg-[#C0C0C0] text-black border-2 border-white border-r-gray-600 border-b-gray-600 active:border-gray-600 active:border-r-white active:border-b-white text-[10px] font-bold leading-none"
          >
            ×
          </button>
        </div>

        <Command className="w-full bg-[#C0C0C0] p-2">
          <div className="flex items-center border-b-2 border-gray-400 bg-white px-3 retro-border-inset mb-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              autoFocus
            />
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden retro-border-inset bg-white p-1">
            <Command.Empty className="py-6 text-center text-sm font-mono text-gray-500">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Suggestions"
              className="text-xs font-bold text-gray-500 px-2 py-1 mb-1 border-b border-gray-200"
            >
              <Command.Item
                onSelect={() => runCommand(() => navigate("/dashboard"))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[#000080] aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group hover:bg-[#000080] hover:text-white font-mono"
              >
                <Calculator className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
                <span className="ml-auto text-xs text-gray-400 group-hover:text-gray-200">
                  CMD+D
                </span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate("/new"))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[#000080] aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group hover:bg-[#000080] hover:text-white font-mono"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>New Post</span>
                <span className="ml-auto text-xs text-gray-400 group-hover:text-gray-200">
                  CMD+N
                </span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate("/"))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[#000080] aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group hover:bg-[#000080] hover:text-white font-mono"
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </Command.Item>
            </Command.Group>

            <Command.Group
              heading="Settings"
              className="text-xs font-bold text-gray-500 px-2 py-1 mb-1 border-b border-gray-200 mt-2"
            >
              <Command.Item
                onSelect={() =>
                  runCommand(() => navigate("/profile/" + currentUser?.id))
                }
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[#000080] aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group hover:bg-[#000080] hover:text-white font-mono"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <span className="ml-auto text-xs text-gray-400 group-hover:text-gray-200">
                  CMD+P
                </span>
              </Command.Item>
              {currentUser && (
                <Command.Item
                  onSelect={() =>
                    runCommand(() => navigate(`/profile/rss/${currentUser.id}`))
                  }
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[#000080] aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group hover:bg-[#000080] hover:text-white font-mono"
                >
                  <Rss className="mr-2 h-4 w-4" />
                  <span>My RSS Feed</span>
                  <span className="ml-auto text-xs text-gray-400 group-hover:text-gray-200">
                    CMD+R
                  </span>
                </Command.Item>
              )}
              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    // Toggle theme or open settings dialog (if implemented)
                    alert("System Settings are restricted by Administrator.");
                  })
                }
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[#000080] aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group hover:bg-[#000080] hover:text-white font-mono"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>System Settings</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="border-t-2 border-gray-400 mt-2 pt-1 flex justify-between text-[10px] text-gray-600 font-mono">
            <span>Press Esc to close</span>
            <span>Ver 1.0.4</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
