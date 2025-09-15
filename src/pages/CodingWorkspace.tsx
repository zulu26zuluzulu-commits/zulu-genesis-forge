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
  Download,
  Search,
} from "lucide-react";
import JSZip from "jszip"; // ✅ npm install jszip file-saver
import { saveAs } from "file-saver";
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
const getPreviewHtml = (code: string): string => `
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Preview</title>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <style>
        body { margin:0; font-family:Inter,system-ui; background:#0f1117; color:#f8f8f2; }
      </style>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/javascript">
        try {
          ${code.replace(/export default /, "window.Component = ")}
          ReactDOM.render(React.createElement(window.Component), document.getElementById("root"));
        } catch (e) {
          document.body.innerHTML = '<pre style="color:#ff6b6b;padding:1rem;">' + (e.stack || e.toString()) + '</pre>';
        }
      </script>
    </body>
  </html>
`;
const CodingWorkspace: React.FC = () => {
  const [files, setFiles] = useState(initialFiles);
  const fileKeys = useMemo(() => Object.keys(files), [files]);
  const [openTabs, setOpenTabs] = useState<string[]>([fileKeys[0]]);
  const [activeTab, setActiveTab] = useState(fileKeys[0]);
  const [selectedFile, setSelectedFile] = useState(fileKeys[0]);
  const [newFileName, setNewFileName] = useState("");
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "ai"; content: string; id: string }>
  >([{ role: "ai", content: "👋 Hi! Ask me anything about your code.", id: "init" }]);
  const [loading, setLoading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);
  useEffect(() => {
    if (!openTabs.includes(activeTab)) setActiveTab(openTabs[0] ?? fileKeys[0]);
  }, [files, openTabs]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  useEffect(() => {
    setPreviewKey((k) => k + 1);
  }, [activeTab]);
  // ⌨️ Keyboard Shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        exportFile(activeTab);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setShowPalette(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  // ---------------- File Ops ----------------
  const openFile = (path: string) => {
    if (!openTabs.includes(path)) setOpenTabs((t) => [...t, path]);
    setActiveTab(path);
    setSelectedFile(path);
  };
  const createFile = () => {
    if (!newFileName.trim()) return;
    setFiles({ ...files, [newFileName]: "// New file\n" });
    setOpenTabs((t) => [...t, newFileName]);
    setActiveTab(newFileName);
    setNewFileName("");
  };
  const deleteFile = (path: string) => {
    const updated = { ...files };
    delete updated[path];
    setFiles(updated);
    setOpenTabs((t) => t.filter((f) => f !== path));
    if (activeTab === path) setActiveTab(Object.keys(updated)[0]);
  };
  const renameFile = () => {
    if (!renamingFile) return;
    const updated: Record<string, string> = {};
    Object.entries(files).forEach(([k, v]) => {
      updated[k === renamingFile ? renameValue : k] = v;
    });
    setFiles(updated);
    setOpenTabs((t) => t.map((f) => (f === renamingFile ? renameValue : f)));
    setActiveTab(renameValue);
    setRenamingFile(null);
    setRenameValue("");
  };
  const closeTab = (path: string) => {
    setOpenTabs((t) => t.filter((f) => f !== path));
    if (activeTab === path) setActiveTab(openTabs[0]);
  };
  const onEditorChange = (val?: string) => {
    setFiles((f) => ({ ...f, [activeTab]: val ?? "" }));
    setPreviewKey((k) => k + 1);
  };
  // ---------------- Export ----------------
  const exportFile = (path: string) => {
    const content = files[path] ?? "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, path.replace(/\//g, "_"));
  };
  const exportProject = async () => {
    const zip = new JSZip();
    Object.entries(files).forEach(([path, content]) => {
      zip.file(path.startsWith("/") ? path.slice(1) : path, content);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "zulu-project.zip");
  };
  // ---------------- AI ----------------
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", content: chatInput, id: String(Date.now()) };
    setChatMessages((m) => [...m, userMsg]);
    setChatInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          activeFile: activeTab,
          code: files[activeTab],
        }),
      });
      const data = await res.json().catch(() => null);
      setChatMessages((m) => [
        ...m,
        { role: "ai", content: data?.response ?? "AI unavailable", id: `ai-${Date.now()}` },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const activeContent = files[activeTab] ?? "";
  return (
    <ResizablePanelGroup direction="horizontal">
      {/* File Explorer */}
      <ResizablePanel defaultSize={18}>
        <div className="h-full flex flex-col border-r bg-muted/40">
          <div className="p-3 border-b flex items-center gap-2 text-sm font-medium">
            <FileCode2 className="w-4 h-4" /> Files
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {Object.keys(files).map((file) => (
              <div key={file} className="flex items-center gap-2 text-sm mb-1">
                <Circle className="w-2 h-2 text-muted-foreground" />
                {renamingFile === file ? (
                  <>
                    <Input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && renameFile()}
                      autoFocus
                      className="h-7 text-xs"
                    />
                    <Button size="icon" variant="ghost" onClick={renameFile}>
                      <Save className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openFile(file)}
                      className={`truncate flex-1 text-left ${
                        activeTab === file ? "font-semibold text-primary" : ""
                      }`}
                    >
                      {file}
                    </button>
                    <Button size="xs" variant="ghost" onClick={() => setRenamingFile(file)}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => deleteFile(file)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2">
            <Input
              placeholder="/src/New.tsx"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createFile()}
              className="h-8 text-xs"
            />
            <Button size="icon" variant="ghost" onClick={createFile}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </ResizablePanel>
      {/* Editor + Tabs */}
      <ResizablePanel defaultSize={44}>
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex items-center justify-between px-2 border-b bg-muted/20">
            <div className="flex gap-2 overflow-x-auto">
              {openTabs.map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 flex items-center gap-1 cursor-pointer rounded ${
                    tab === activeTab ? "bg-background border" : "hover:bg-muted/30"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {tab}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pr-2">
              <Button size="sm" variant="ghost" onClick={() => exportFile(activeTab)}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={exportProject}>
                <Download className="w-4 h-4 mr-1" /> Export Project
              </Button>
            </div>
          </div>
          {/* Editor */}
          <Editor
            key={activeTab}
            height="100%"
            language="typescript"
            theme="vs-dark"
            value={activeContent}
            onChange={onEditorChange}
            onMount={(editor) => (editorRef.current = editor)}
            options={{ fontSize: 13, minimap: { enabled: false }, automaticLayout: true }}
          />
        </div>
      </ResizablePanel>
      {/* Preview */}
      <ResizablePanel defaultSize={18}>
        <iframe
          key={previewKey}
          srcDoc={getPreviewHtml(activeContent)}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </ResizablePanel>
      {/* AI Chat */}
      <ResizablePanel defaultSize={20}>
        <div className="h-full flex flex-col">
          <div className="p-2 border-b bg-muted/20 flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="w-4 h-4" /> AI Chat
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-md max-w-[90%] ${
                  msg.role === "ai" ? "bg-muted/20" : "bg-primary text-primary-foreground ml-auto"
                }`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-2 border-t flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Ask about your code..."
            />
            <Button onClick={handleSendChat} disabled={loading}>
              {loading ? "…" : "Send"}
            </Button>
          </div>
        </div>
      </ResizablePanel>
      {/* Command Palette */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-start justify-center z-50"
            onClick={() => setShowPalette(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-md shadow-lg mt-20 w-[500px] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4" />
                <Input
                  autoFocus
                  placeholder="Search files..."
                  value={paletteQuery}
                  onChange={(e) => setPaletteQuery(e.target.value)}
                />
              </div>
              <div className="max-h-64 overflow-auto">
                {fileKeys
                  .filter((f) => f.toLowerCase().includes(paletteQuery.toLowerCase()))
                  .map((f) => (
                    <div
                      key={f}
                      onClick={() => {
                        openFile(f);
                        setShowPalette(false);
                      }}
                      className="px-2 py-1 hover:bg-muted cursor-pointer rounded"
                    >
                      {f}
                    </div>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ResizablePanelGroup>
  );
};
export default CodingWorkspace;
