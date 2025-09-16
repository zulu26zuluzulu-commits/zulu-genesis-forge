import React, { useState, useEffect } from "react";
// Note: resizable panels refactor was incomplete; using simpler layout for stability.
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  FileText,
  Search,
  GitBranch,
  Settings,
  MessageSquare,
  Split,
  Maximize2,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "../components/Sidebar";
import { Panel } from "../components/Panel";
import { FileExplorer } from "../components/FileExplorer";
import { CodeEditor } from "../components/Editor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { CommandPalette } from "../components/CommandPalette";
import { useAuth } from "../hooks/useAuth";

const sidebarViews = ["Files", "Search", "Version Control", "Settings", "AI Chat"] as const;
const rightPanelTabs = ["Preview", "AI Chat"] as const;

interface Tab {
  id: string;
  title: string;
  content: string;
  path: string;
}

export function AppLayout() {
  const { user } = useAuth();
  const [activeSidebar, setActiveSidebar] = useState<typeof sidebarViews[number]>("Files");
  const [activeRightTab, setActiveRightTab] = useState<typeof rightPanelTabs[number]>("Preview");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isVerticalSplit, setIsVerticalSplit] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileRightOpen, setIsMobileRightOpen] = useState(false);
  
  const [files, setFiles] = useState<Tab[]>([
    { id: "1", path: "src/App.tsx", title: "App.tsx", content: "// App code here" },
    { id: "2", path: "src/pages/Index.tsx", title: "Index.tsx", content: "// Index page code" },
    { id: "3", path: "src/pages/SettingsPage.tsx", title: "SettingsPage.tsx", content: "// Settings page code" },
  ]);
  const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({});
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [activeFile, setActiveFile] = useState<Tab | null>(files[0] ?? null);
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  // Load from localStorage (persistence)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('zulu.files');
      const active = localStorage.getItem('zulu.activePath');
      if (raw) {
        const parsed: Tab[] = JSON.parse(raw);
        setFiles(parsed);
        if (active) {
          const f = parsed.find((p) => p.path === active);
          if (f) {
            setActiveFile(f);
            setActiveTabId(f.id);
          }
        } else if (parsed.length) {
          setActiveFile(parsed[0]);
          setActiveTabId(parsed[0].id);
        }
      } else {
        // If no saved files, seed with a friendly Welcome file
        const welcome: Tab = {
          id: 'welcome',
          path: 'welcome.md',
          title: 'Welcome',
          content: `# Welcome to Zulu\n\n- Tip: Press Cmd/Ctrl+K to open the command palette.\n- Tip: Create a new file with the "New" button above.\n\nHappy hacking!`,
        };
        setFiles([welcome]);
        setActiveFile(welcome);
        setActiveTabId(welcome.id);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('zulu.files', JSON.stringify(files));
      if (activeFile) localStorage.setItem('zulu.activePath', activeFile.path);
    } catch (e) {}
  }, [files, activeFile]);

  // Command handlers for the CommandPalette
  const handleOpenFile = (path: string) => {
    const file = files.find((f) => f.path === path) ?? files[0];
    if (file) {
      setActiveFile(file);
      setActiveTabId(file.id);
    }
  };

  const handleCreateFile = (name: string) => {
    const base = name.replace(/\s+/g, '') || 'NewFile';
    const path = `src/${base}.tsx`;
    const id = `${Date.now()}`;
    const content = `import React from 'react';\n\nexport default function ${base}() {\n  return <div>${base}</div>;\n}\n`;
    const newFile: Tab = { id, path, title: `${base}.tsx`, content };
    setFiles((s) => [...s, newFile]);
    setActiveFile(newFile);
    setActiveTabId(id);
  };

  const handleCloseFile = (id: string) => {
    // basic confirmation
    if (!confirm('Close this file?')) return;
    setFiles((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const next = prev.filter((p) => p.id !== id);
      if (next.length === 0) {
        // seed welcome file if nothing left
        const welcome: Tab = {
          id: 'welcome',
          path: 'welcome.md',
          title: 'Welcome',
          content: `# Welcome to Zulu\n\n- Tip: Press Cmd/Ctrl+K to open the command palette.\n- Tip: Create a new file with the "New" button above.\n\nHappy hacking!`,
        };
        setActiveFile(welcome);
        setActiveTabId(welcome.id);
        return [welcome];
      }

      // if the closed file was active, pick a sensible neighbor
      if (activeFile?.id === id) {
        const chooseIdx = Math.min(idx, next.length - 1);
        const pick = next[chooseIdx] ?? next[next.length - 1];
        setActiveFile(pick);
        setActiveTabId(pick.id);
      }
      return next;
    });
  };

  // Keyboard shortcut: Cmd/Ctrl+K for command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    // Initialize workspace
    const initWorkspace = async () => {
      try {
        // Add workspace initialization logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      } finally {
        setIsInitializing(false);
      }
    };

    if (user) {
      initWorkspace();
    }
  }, [user]);

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner className="h-8 w-8" />
          <div className="flex flex-col items-center">
            <h3 className="font-semibold text-lg">Loading Your Workspace</h3>
            <p className="text-sm text-muted-foreground">Setting up your development environment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-background flex-col">
      {/* Mobile header */}
      <header className="sm:hidden w-full border-b px-2 py-2 flex items-center gap-2 bg-background">
        <button aria-label="Open menu" className="p-2" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
        <div className="flex-1 text-center font-semibold">Zulu Workspace</div>
        <button aria-label="Open command palette" className="p-2" onClick={() => setIsCommandOpen(true)}>🔎</button>
        <button aria-label="Open right panel" className="p-2" onClick={() => setIsMobileRightOpen(true)}>💬</button>
      </header>
      {/* Left Sidebar (resizable) */}
      <ResizablePanelGroup className="h-full" direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={12} maxSize={40}>
          <aside className="h-full border-r flex flex-col">
            <div className="p-2 border-b">
          <div className="space-y-2">
            {sidebarViews.map((view) => (
              <Button
                key={view}
                variant={activeSidebar === view ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSidebar(view)}
              >
                {view === "Files" && <FileText className="h-4 w-4 mr-2" />}
                {view === "Search" && <Search className="h-4 w-4 mr-2" />}
                {view === "Version Control" && <GitBranch className="h-4 w-4 mr-2" />}
                {view === "Settings" && <Settings className="h-4 w-4 mr-2" />}
                {view === "AI Chat" && <MessageSquare className="h-4 w-4 mr-2" />}
                <span>{view}</span>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {activeSidebar === "Files" && (
            <FileExplorer
              files={files}
              onOpen={(path) => {
                const file = files.find((f) => f.path === path);
                if (file) setActiveFile(file);
              }}
            />
          )}
            </div>
          </aside>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel>
          {/* Main editor area */}
          <main className="flex-1 flex">
            <div className="flex-1 h-full flex flex-col">
              {/* Tabs */}
              <div className="flex items-center gap-2 px-2 py-1 border-b bg-background/50">
                {files.map((t) => (
                    <div key={t.id} className={`flex items-center gap-2 px-2 py-1 rounded ${activeTabId === t.id ? 'bg-muted/80' : ''}`}>
                      <button
                        className="px-3 py-1 rounded-md"
                        onClick={() => {
                          setActiveTabId(t.id);
                          setActiveFile(t);
                        }}
                      >
                        {t.title} {dirtyMap[t.id] ? <span className="text-xs text-amber-400">•</span> : null}
                      </button>
                      <button
                        className="text-muted-foreground hover:text-foreground px-1"
                        onClick={() => handleCloseFile(t.id)}
                        aria-label={`Close ${t.title}`}
                      >
                        ✕
                      </button>
                    </div>
                ))}
                <div className="ml-auto">
                  <button className="px-2 py-1" onClick={() => setShowNewPageDialog(true)}>New</button>
                </div>
              </div>

              <div className="flex-1">
                <CodeEditor
                  value={activeFile?.content ?? ''}
                  onChange={(v) => {
                    if (!activeFile) return;
                    const updated = { ...activeFile, content: v };
                    setActiveFile(updated);
                    setFiles((s) => s.map((f) => (f.id === updated.id ? updated : f)));
                  }}
                  onDirty={(isDirty) => {
                    if (!activeFile) return;
                    setDirtyMap((d) => ({ ...d, [activeFile.id]: isDirty }));
                  }}
                  onSave={(value) => {
                    if (!activeFile) return;
                    const updated = { ...activeFile, content: value };
                    setFiles((s) => s.map((f) => (f.id === updated.id ? updated : f)));
                    setDirtyMap((d) => ({ ...d, [activeFile.id]: false }));
                  }}
                />
              </div>
            </div>
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>

  {/* Right panel */}
  <aside className="w-96 border-l flex flex-col hidden sm:flex">
        <div className="border-b p-4">
          <div className="grid grid-cols-2">
            <button
              className={`px-4 py-2 ${activeRightTab === "Preview" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setActiveRightTab("Preview")}
            >
              Live Preview
            </button>
            <button
              className={`px-4 py-2 ${activeRightTab === "AI Chat" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setActiveRightTab("AI Chat")}
            >
              Zulu AI
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {activeRightTab === "Preview" ? (
            <iframe
              srcDoc={activeFile?.content || "<h1>Preview not available</h1>"}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="AI Generated App Preview"
            />
          ) : (
            <div className="p-6">Zulu AI Chat (coming soon)</div>
          )}
        </div>
      </aside>

  <CommandPalette
    open={isCommandOpen}
    onClose={() => setIsCommandOpen(false)}
    files={files.map(f => ({ path: f.path, title: f.title }))}
    onOpenFile={handleOpenFile}
    onCreateFile={handleCreateFile}
  />
      {/* Mobile drawers */}
      {isMobileSidebarOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-background border-r p-4 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold">Menu</div>
              <button onClick={() => setIsMobileSidebarOpen(false)} aria-label="Close menu">✕</button>
            </div>
            <div className="space-y-2">
              {sidebarViews.map((view) => (
                <Button key={view} variant={activeSidebar === view ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => { setActiveSidebar(view); setIsMobileSidebarOpen(false); }}>
                  <span>{view}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isMobileRightOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileRightOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-3/4 max-w-xs bg-background border-l p-4 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold">Zulu AI</div>
              <button onClick={() => setIsMobileRightOpen(false)} aria-label="Close panel">✕</button>
            </div>
            <div className="p-2">Zulu AI Chat (coming soon)</div>
          </div>
        </div>
      )}

    </div>
  );
}
