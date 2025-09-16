import React, { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "../hooks/useAuth";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
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

const sidebarViews = ["Files", "Search", "Version Control", "Settings", "AI Chat"];
const rightPanelTabs = ["Preview", "AI Chat"];

  const [activeSidebar, setActiveSidebar] = useState("Files");
  const [activeRightTab, setActiveRightTab] = useState("Preview");
  // Example file tree
  const [files, setFiles] = useState([
    { path: "src/App.tsx", name: "App.tsx", content: "// App code here" },
    { path: "src/pages/Index.tsx", name: "Index.tsx", content: "// Index page code" },
    { path: "src/pages/SettingsPage.tsx", name: "SettingsPage.tsx", content: "// Settings page code" },
  ]);
  const [activeFile, setActiveFile] = useState(files[0]);
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [newPageName, setNewPageName] = useState("");


export function AppLayout() {
  const { user } = useAuth();
  const [activeSidebar, setActiveSidebar] = useState("Files");
  const [activeRightTab, setActiveRightTab] = useState("Preview");
  const [isInitializing, setIsInitializing] = useState(true);
  const [files, setFiles] = useState([
    { path: "src/App.tsx", name: "App.tsx", content: "// App code here" },
    { path: "src/pages/Index.tsx", name: "Index.tsx", content: "// Index page code" },
    { path: "src/pages/SettingsPage.tsx", name: "SettingsPage.tsx", content: "// Settings page code" },
  ]);
  const [activeFile, setActiveFile] = useState(files[0]);

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
    <div className="flex h-screen w-screen bg-background">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Sidebar */}
        <ResizablePanel
          defaultSize={15}
          minSize={10}
          maxSize={20}
          collapsible
          collapsedSize={4}
        >
          <div className="h-full border-r flex flex-col">
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
        {activeSidebar === "Files" && (
          <FileExplorer files={files} onOpen={path => {
            const file = files.find(f => f.path === path);
            if (file) setActiveFile(file);
          }} />
        )}
        {activeSidebar === "Pages" && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border/50 font-bold text-lg">Pages</div>
            <div className="flex-1 overflow-y-auto">
              {files
                .filter(
                  file =>
                    file.path.startsWith('src/pages/') ||
                    (file.content && file.content.includes('export default function'))
                )
                .map(file => (
                  <button
                    key={file.path}
                    className={`flex items-center gap-3 w-full px-4 py-2 hover:bg-muted/30 transition rounded text-left ${
                      activeFile?.path === file.path ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => setActiveFile(file)}
                  >
                    {/* FileText icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" /></svg>
                    <span className="font-interface font-medium">{file.name.replace('.tsx', '')}</span>
                  </button>
                ))}
            </div>
            <div className="p-4 border-t border-border/50">
              <button
                className="w-full flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition"
                onClick={() => setShowNewPageDialog(true)}
              >
                {/* Plus icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Page
              </button>
              {/* Dialog for creating a new page */}
              {showNewPageDialog && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-background rounded-lg shadow-lg p-6 w-96">
                    <h2 className="font-bold mb-4">Create New Page</h2>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 mb-4"
                      placeholder="Page name (e.g. About)"
                      value={newPageName}
                      onChange={e => setNewPageName(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-4 py-2 rounded bg-muted hover:bg-muted/80"
                        onClick={() => setShowNewPageDialog(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-primary text-primary-foreground"
                        onClick={() => {
                          if (!newPageName.trim()) return;
                          const fileName = `src/pages/${newPageName.replace(/\s+/g, '')}.tsx`;
                          const template = `import React from 'react';\n\nexport default function ${newPageName.replace(/\s+/g, '')}() {\n  return <div>${newPageName} Page</div>;\n}\n`;
                          setFiles([...files, { path: fileName, name: `${newPageName.replace(/\s+/g, '')}.tsx`, content: template }]);
                          setShowNewPageDialog(false);
                          setNewPageName('');
                          setActiveFile({ path: fileName, name: `${newPageName.replace(/\s+/g, '')}.tsx`, content: template });
                        }}
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Panel>
      <main className="flex-1 flex">
        <CodeEditor value={activeFile?.content ?? ""} onChange={v => setActiveFile({ ...activeFile, content: v })} />
      </main>
      <Panel dock="right" width={400}>
        {/* Tabbed interface for Live Preview and Zulu AI */}
        <div className="flex flex-col h-full">
          <div className="border-b border-border/50 bg-muted/30 px-6 pt-4">
            <div className="grid w-full max-w-md grid-cols-2 bg-background/50 backdrop-blur-sm">
              <button
                className={`relative font-interface px-4 py-2 ${activeRightTab === 'Preview' ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => setActiveRightTab('Preview')}
              >
                Live Preview
              </button>
              <button
                className={`relative font-interface px-4 py-2 ${activeRightTab === 'AI Chat' ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => setActiveRightTab('AI Chat')}
              >
                Zulu AI
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {activeRightTab === 'Preview' ? (
              <div className="h-full bg-muted/20 flex flex-col">
                {/* Replace with your actual preview iframe logic */}
                <iframe
                  srcDoc={activeFile?.content || '<h1>Preview not available</h1>'}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  title="AI Generated App Preview"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col m-0">
                {/* Replace with your actual chat logic */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-interface text-muted-foreground">Zulu AI chat goes here...</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative group">
                      <input
                        placeholder="Describe your dream application..."
                        className="h-14 pr-14 font-interface text-base border rounded px-4 w-full"
                        // Add value, onChange, and send logic as needed
                      />
                      <button
                        className="absolute right-2 top-2 h-10 w-10 bg-primary text-white rounded"
                        // Add onClick logic as needed
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
