// src/pages/CodingWorkspace.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Save,
  X,
  MessageSquare,
  FileCode2,
  Play,
  FileText,
  Trash2,
  Edit3,
  Circle,
} from "lucide-react";

/**
 * Tabbed Coding Workspace
 * - File explorer (open / rename / delete / create)
 * - Tabbed editor (open files as tabs)
 * - Live preview (iframe; reloads when active file changes)
 * - AI Chat (sticky input, auto-scroll)
 *
 * Paste this entire file over your current CodingWorkspace.
 */

// -----------------------------
// Initial files (demo)
// -----------------------------
const initialFiles: Record<string, string> = {
  "/src/App.tsx": `// App.tsx
import React from 'react';

export default function App() {
  return <div style={{padding:20}}>Hello World</div>;
}`,
  "/src/pages/Index.tsx": `// Index.tsx
import React from 'react';

export default function Index() {
  return <div>Index Page</div>;
}`,
  "/src/components/HeroSection.tsx": `// HeroSection.tsx
import React from 'react';

export default function HeroSection() {
  return <div>Hero Section</div>;
}`,
};

// -----------------------------
// Preview helper
// -----------------------------
const getPreviewHtml = (code: string): string => {
  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Preview</title>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <style>
          body { margin: 0; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: #0f1117; color: #f8f8f2; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/javascript">
          try {
            ${code.replace(/export default /, "window.Component = ")}
            ReactDOM.render(React.createElement(window.Component), document.getElementById("root"));
          } catch (e) {
            document.body.innerHTML = '<pre style="color: #ff6b6b; padding:1rem;">' + (e && e.stack ? e.stack : e.toString()) + '</pre>';
          }
        </script>
      </body>
    </html>
  `;
};

// -----------------------------
// Main Workspace component
// -----------------------------
const CodingWorkspace: React.FC = () => {
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  const fileKeys = useMemo(() => Object.keys(files), [files]);

  // Tabs state
  const [openTabs, setOpenTabs] = useState<string[]>([fileKeys[0]]);
  const [activeTab, setActiveTab] = useState<string>(fileKeys[0]);

  // Explorer / file operations
  const [selectedFile, setSelectedFile] = useState<string>(fileKeys[0]);
  const [newFileName, setNewFileName] = useState<string>("");
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  // Chat state
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "ai"; content: string; id: string }>
  >([{ role: "ai", content: "👋 Hi! Ask me anything about your code.", id: "init" }]);
  const [loading, setLoading] = useState(false);

  // Preview reload key (bump to force iframe reload)
  const [previewKey, setPreviewKey] = useState<number>(0);

  // Refs
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null); // Monaco editor instance (if needed)

  // Ensure when files list changes, keep active selection valid
  useEffect(() => {
    const keys = Object.keys(files);
    if (!keys.includes(selectedFile)) {
      setSelectedFile(keys[0] || "");
    }
    // If activeTab was removed, switch to first open or first file
    if (!openTabs.includes(activeTab)) {
      setActiveTab(openTabs[0] ?? keys[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  // When selectedFile changes, open it in tabs and make active
  useEffect(() => {
    if (!selectedFile) return;
    if (!openTabs.includes(selectedFile)) {
      setOpenTabs((t) => [...t, selectedFile]);
    }
    setActiveTab(selectedFile);
  }, [selectedFile]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages]);

  // Update preview when activeTab content changes
  useEffect(() => {
    // bump preview key to reload iframe
    setPreviewKey((k) => k + 1);
  }, [activeTab]);

  // -----------------------------
  // File operations
  // -----------------------------
  const openFile = (path: string) => {
    setSelectedFile(path);
  };

  const createFile = () => {
    const name = newFileName.trim();
    if (!name) return;
    if (files[name]) {
      // already exists — just open
      openFile(name);
      setNewFileName("");
      return;
    }
    setFiles((prev) => ({ ...prev, [name]: "// New file\n" }));
    setNewFileName("");
    setSelectedFile(name);
  };

  const deleteFile = (path: string) => {
    if (!files[path]) return;
    if (Object.keys(files).length === 1) return; // keep at least one file
    const updated = { ...files };
    delete updated[path];
    setFiles(updated);
    // remove from tabs if open
    setOpenTabs((tabs) => tabs.filter((t) => t !== path));
    if (activeTab === path) {
      const next = openTabs.find((t) => t !== path) ?? Object.keys(updated)[0];
      setActiveTab(next);
      setSelectedFile(next);
    }
  };

  const startRename = (path: string) => {
    setRenamingFile(path);
    setRenameValue(path);
  };

  const submitRename = () => {
    if (!renamingFile) return;
    const newName = renameValue.trim();
    if (!newName || files[newName]) {
      setRenamingFile(null);
      setRenameValue("");
      return;
    }
    const updated: Record<string, string> = {};
    Object.entries(files).forEach(([k, v]) => {
      if (k === renamingFile) {
        updated[newName] = v;
      } else {
        updated[k] = v;
      }
    });
    setFiles(updated);
    setRenamingFile(null);
    setRenameValue("");
    // update tabs and selections
    setOpenTabs((tabs) => tabs.map((t) => (t === renamingFile ? newName : t)));
    if (activeTab === renamingFile) setActiveTab(newName);
    if (selectedFile === renamingFile) setSelectedFile(newName);
  };

  const closeTab = (path: string) => {
    setOpenTabs((tabs) => {
      const next = tabs.filter((t) => t !== path);
      // if closing active, pick previous or first
      if (path === activeTab) {
        const idx = tabs.indexOf(path);
        const pick = tabs[idx - 1] ?? tabs[idx + 1] ?? next[0] ?? Object.keys(files)[0];
        setActiveTab(pick);
        setSelectedFile(pick);
      }
      return next;
    });
  };

  // Editor change -> update file contents and bump preview
  const onEditorChange = (value: string | undefined) => {
    const newValue = value ?? "";
    setFiles((prev) => ({ ...prev, [activeTab]: newValue }));
    // small debounce-ish reload: immediate bump is fine for demo
    setPreviewKey((k) => k + 1);
  };

  // Tab click
  const onSelectTab = (path: string) => {
    if (!openTabs.includes(path)) setOpenTabs((t) => [...t, path]);
    setActiveTab(path);
    setSelectedFile(path);
  };

  // -----------------------------
  // AI Chat
  // -----------------------------
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user" as const, content: chatInput.trim(), id: String(Date.now()) };
    setChatMessages((m) => [...m, userMsg]);
    setChatInput("");
    setLoading(true);
    try {
      // Replace /api/ai-chat with your real endpoint when ready
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, files }),
      });
      const data = await res.json().catch(() => null);
      const reply = data?.response ?? "Sorry — I couldn't get an AI response right now.";
      setChatMessages((m) => [...m, { role: "ai", content: reply, id: `ai-${Date.now()}` }]);
    } catch (e) {
      setChatMessages((m) => [...m, { role: "ai", content: "⚠️ Error contacting AI backend.", id: `ai-${Date.now()}` }]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Derived state
  // -----------------------------
  const activeContent = files[activeTab] ?? "";

  return (
    <ResizablePanelGroup direction="horizontal">
      {/* ----------------- File Explorer ----------------- */}
      <ResizablePanel defaultSize={18} minSize={10} maxSize={30}>
        <div className="h-full flex flex-col border-r bg-muted/40">
          <div className="p-3 border-b flex items-center gap-2 text-sm font-medium bg-muted/20">
            <FileCode2 className="w-4 h-4" /> Files
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1 text-sm">
              {Object.keys(files).map((file) => (
                <li key={file} className="flex items-center gap-2 px-1">
                  {/* small colored indicator */}
                  <Circle className="w-3 h-3 text-muted-foreground" />
                  {renamingFile === file ? (
                    <>
                      <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitRename()}
                        className="h-7 text-xs"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={submitRename}>
                        <Save className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setRenamingFile(null)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        className={`truncate flex-1 text-left ${
                          activeTab === file
                            ? "font-semibold text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => onSelectTab(file)}
                      >
                        {file}
                      </button>

                      <div className="flex items-center gap-1">
                        <Button size="xs" variant="ghost" onClick={() => startRename(file)}>
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button size="xs" variant="ghost" onClick={() => deleteFile(file)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-2 border-t flex gap-2 items-center">
            <Input
              placeholder="/src/newFile.tsx"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createFile()}
              className="h-8 text-xs"
            />
            <Button size="icon" variant="ghost" onClick={createFile} aria-label="Create file">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </ResizablePanel>

      {/* ----------------- Editor + Tabs ----------------- */}
      <ResizablePanel defaultSize={44} minSize={30}>
        <div className="h-full flex flex-col">
          {/* Tabs bar */}
          <div className="flex items-center gap-2 px-2 border-b bg-muted/20">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto py-2">
              <AnimatePresence initial={false}>
                {openTabs.map((tab) => (
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer select-none ${
                      tab === activeTab ? "bg-background/0 border border-border shadow-sm" : "hover:bg-muted/30"
                    }`}
                    onClick={() => onSelectTab(tab)}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="truncate max-w-[24rem] text-sm">{tab.replace(/^\/+/, "")}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab);
                      }}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      aria-label={`Close ${tab}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Save / quick actions */}
            <div className="flex items-center gap-2 pr-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // quick download as file (single active)
                  const content = files[activeTab] ?? "";
                  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = activeTab.replace(/\//g, "_") || "file.txt";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Save className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1">
            <Editor
              key={activeTab}
              height="100%"
              defaultLanguage="typescript"
              language="typescript"
              theme="vs-dark"
              value={activeContent}
              onChange={onEditorChange}
              onMount={(editor) => (editorRef.current = editor)}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </ResizablePanel>

      {/* ----------------- Preview ----------------- */}
      <ResizablePanel defaultSize={18} minSize={12}>
        <div className="h-full flex flex-col border-l bg-[#0f1117] text-white">
          <div className="p-2 border-b bg-[#0b0c10] flex items-center gap-2">
            <Play className="w-4 h-4" /> Live Preview
          </div>
          <div className="flex-1 overflow-hidden">
            {activeContent ? (
              <iframe
                key={`${previewKey}-${activeTab}`}
                title="Live Preview"
                srcDoc={getPreviewHtml(activeContent)}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="p-4 text-muted-foreground text-sm">Nothing to preview</div>
            )}
          </div>
        </div>
      </ResizablePanel>

      {/* ----------------- AI Chat ----------------- */}
      <ResizablePanel defaultSize={20} minSize={12}>
        <div className="h-full flex flex-col">
          <div className="p-2 border-b bg-muted/20 text-sm font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> AI Chat
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[95%] ${msg.role === "ai" ? "bg-muted/20 text-foreground" : "bg-primary text-primary-foreground self-end ml-auto"} p-2 rounded-md`}
              >
                <div className="text-xs opacity-70 mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm">{msg.role === "ai" ? "AI" : "You"}</span>
                  <span>{msg.role === "ai" ? "Zulu AI" : "You"}</span>
                </div>
                <div className="text-sm leading-snug">{msg.content}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-2 border-t bg-muted/10 sticky bottom-0">
            <div className="flex gap-2">
              <Input
                placeholder="Ask the AI about your code or project..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                className="h-9"
              />
              <Button onClick={handleSendChat} disabled={loading || !chatInput.trim()}>
                {loading ? "…" : "Send"}
              </Button>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Tip: include which file or feature you want help with.</div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default CodingWorkspace;
