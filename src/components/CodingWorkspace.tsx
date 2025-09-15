import React, { useState } from "react";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, X, MessageSquare, FileCode2, Play } from "lucide-react";

// -----------------------------
// Initial files
// -----------------------------
const initialFiles: Record<string, string> = {
  "/src/App.tsx": `// App.tsx
import React from 'react';

export default function App() {
  return <div>Hello World</div>;
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
}`
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
        <style>body { margin: 0; font-family: sans-serif; }</style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/javascript">
          try {
            ${code.replace(/export default /, "window.Component = ")}
            ReactDOM.render(React.createElement(window.Component), document.getElementById("root"));
          } catch (e) {
            document.body.innerHTML = '<pre style="color:red; padding:1rem;">' + e.toString() + '</pre>';
          }
        </script>
      </body>
    </html>
  `;
};

// -----------------------------
// Main Workspace
// -----------------------------
const CodingWorkspace: React.FC = () => {
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<string>("/src/App.tsx");

  const [newFileName, setNewFileName] = useState<string>("");
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([
    { role: "ai", content: "👋 Hi! Ask me anything about your code." }
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleFileSelect = (file: string) => setSelectedFile(file);

  const handleCodeChange = (newCode: string | undefined) =>
    setFiles((prev) => ({ ...prev, [selectedFile]: newCode || "" }));

  const handleCreateFile = () => {
    if (newFileName && !files[newFileName]) {
      setFiles((prev) => ({ ...prev, [newFileName]: "// New file" }));
      setSelectedFile(newFileName);
      setNewFileName("");
    }
  };

  const handleDeleteFile = (file: string) => {
    if (Object.keys(files).length > 1) {
      const updated = { ...files };
      delete updated[file];
      setFiles(updated);
      if (selectedFile === file) {
        setSelectedFile(Object.keys(updated)[0]);
      }
    }
  };

  const handleRenameFile = (file: string) => {
    setRenamingFile(file);
    setRenameValue(file);
  };

  const handleRenameSubmit = () => {
    if (renamingFile && renameValue && !files[renameValue]) {
      const updated = { ...files };
      updated[renameValue] = updated[renamingFile];
      delete updated[renamingFile];
      setFiles(updated);
      setSelectedFile(renameValue);
      setRenamingFile(null);
      setRenameValue("");
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [...prev, { role: "user", content: chatInput }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput, files })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "ai", content: data.response || "(No response)" }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "ai", content: "⚠️ Error contacting AI backend." }]);
    } finally {
      setChatInput("");
      setLoading(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <ResizablePanelGroup direction="horizontal">
      {/* ----------------- File Explorer ----------------- */}
      <ResizablePanel defaultSize={20} minSize={10} maxSize={30}>
        <div className="h-full p-3 border-r bg-muted/40">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <FileCode2 className="w-4 h-4" /> Files
          </h2>
          <ul className="space-y-2 text-sm">
            {Object.keys(files).map((file) => (
              <li key={file} className="flex items-center gap-2">
                {renamingFile === file ? (
                  <>
                    <Input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
                      className="h-7 text-xs"
                    />
                    <Button size="icon" variant="ghost" onClick={handleRenameSubmit}>
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
                        selectedFile === file
                          ? "font-semibold text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => handleFileSelect(file)}
                    >
                      {file}
                    </button>
                    <Button size="xs" variant="ghost" onClick={() => handleRenameFile(file)}>
                      Rename
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => handleDeleteFile(file)}>
                      Delete
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="/src/newFile.tsx"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
              className="h-7 text-xs"
            />
            <Button size="icon" variant="ghost" onClick={handleCreateFile}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </ResizablePanel>

      {/* ----------------- Code Editor ----------------- */}
      <ResizablePanel defaultSize={40} minSize={20}>
        <div className="h-full flex flex-col">
          <div className="p-2 border-b bg-muted/30 text-sm font-medium">Code Editor</div>
          <Editor
            height="100%"
            language="typescript"
            theme="vs-dark"
            value={files[selectedFile]}
            onChange={handleCodeChange}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>
      </ResizablePanel>

      {/* ----------------- Live Preview ----------------- */}
      <ResizablePanel defaultSize={20} minSize={10}>
        <div className="h-full flex flex-col">
          <div className="p-2 border-b bg-muted/30 text-sm font-medium flex items-center gap-1">
            <Play className="w-4 h-4" /> Live Preview
          </div>
          <div className="flex-1 bg-background">
            {selectedFile.endsWith(".tsx") ? (
              <iframe
                title="Live Preview"
                srcDoc={getPreviewHtml(files[selectedFile])}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="p-4 text-muted-foreground text-sm">
                Preview only available for <code>.tsx</code> files
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>

      {/* ----------------- AI Chat ----------------- */}
      <ResizablePanel defaultSize={20} minSize={10}>
        <div className="h-full flex flex-col">
          <div className="p-2 border-b bg-muted/30 text-sm font-medium flex items-center gap-1">
            <MessageSquare className="w-4 h-4" /> AI Chat
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {chatMessages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2 rounded-md max-w-[90%] ${
                  msg.role === "ai"
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground self-end ml-auto"
                }`}
              >
                {msg.content}
              </motion.div>
            ))}
          </div>
          <div className="p-2 border-t bg-muted/20 flex gap-2">
            <Input
              placeholder="Ask the AI about your code..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSendChat()}
              disabled={loading}
            />
            <Button onClick={handleSendChat} disabled={loading}>
              {loading ? "…" : "Send"}
            </Button>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default CodingWorkspace;
