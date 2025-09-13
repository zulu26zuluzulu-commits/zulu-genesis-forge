import React, { useState } from "react";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import MonacoEditor from "react-monaco-editor";

// -----------------------------
// Initial files for demo
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
      </head>
      <body>
        <div id="root"></div>
        <script type="text/javascript">
          try {
            ${code.replace(/export default /, "window.Component = ")}
            ReactDOM.render(React.createElement(window.Component), document.getElementById("root"));
          } catch (e) {
            document.body.innerHTML = '<pre style="color:red">' + e.toString() + '</pre>';
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

  // File management
  const [newFileName, setNewFileName] = useState<string>("");
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  // AI Chat state
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([
    { role: "ai", content: "Hi! Ask me anything about your code." }
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleFileSelect = (file: string) => setSelectedFile(file);

  const handleCodeChange = (newCode: string) =>
    setFiles((prev) => ({ ...prev, [selectedFile]: newCode }));

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
      setChatMessages((prev) => [...prev, { role: "ai", content: "Error contacting AI backend." }]);
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
        <div className="h-full bg-gray-100 p-2">
          <h2 className="font-bold mb-2">Files</h2>
          <ul>
            {Object.keys(files).map((file) => (
              <li key={file} className="flex items-center gap-2 mb-1">
                {renamingFile === file ? (
                  <>
                    <input
                      className="border rounded px-1"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
                    />
                    <button className="text-green-600" onClick={handleRenameSubmit}>Save</button>
                    <button className="text-gray-600" onClick={() => setRenamingFile(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      className={`text-blue-600 underline ${selectedFile === file ? "font-bold" : ""}`}
                      onClick={() => handleFileSelect(file)}
                    >
                      {file}
                    </button>
                    <button className="text-yellow-600" onClick={() => handleRenameFile(file)}>Rename</button>
                    <button className="text-red-600" onClick={() => handleDeleteFile(file)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input
              className="border rounded px-1 flex-1"
              placeholder="/src/newFile.tsx"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
            />
            <button className="text-green-600" onClick={handleCreateFile}>New File</button>
          </div>
        </div>
      </ResizablePanel>

      {/* ----------------- Code Editor ----------------- */}
      <ResizablePanel defaultSize={40} minSize={20}>
        <div className="h-full p-2">
          <h2 className="font-bold mb-2">Code Editor</h2>
          <MonacoEditor
            width="100%"
            height="400"
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
        <div className="h-full p-2 bg-gray-50">
          <h2 className="font-bold mb-2">Live Preview</h2>
          <div className="border rounded p-2">
            {selectedFile.endsWith(".tsx") ? (
              <iframe
                title="Live Preview"
                srcDoc={getPreviewHtml(files[selectedFile])}
                style={{ width: "100%", height: "300px", border: "none" }}
              />
            ) : (
              <span className="text-gray-500">Preview only available for .tsx files</span>
            )}
          </div>
        </div>
      </ResizablePanel>

      {/* ----------------- AI Chat ----------------- */}
      <ResizablePanel defaultSize={20} minSize={10}>
        <div className="h-full p-2 bg-gray-50 flex flex-col">
          <h2 className="font-bold mb-2">AI Chat</h2>
          <div className="border rounded p-2 flex-1 overflow-y-auto mb-2" style={{ maxHeight: 220 }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 ${msg.role === "ai" ? "text-gray-700" : "text-blue-700 text-right"}`}
              >
                <span className="block">{msg.content}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="border rounded px-1 flex-1"
              placeholder="Ask the AI about your code..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSendChat()}
              disabled={loading}
            />
            <button className="text-green-600" onClick={handleSendChat} disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default CodingWorkspace;
