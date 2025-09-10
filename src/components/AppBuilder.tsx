import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Settings, User, History, Send, Sparkles, Code, Eye, PanelLeftOpen } from "lucide-react";


interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  preview?: string;
}

export default function AppBuilder({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Welcome to Zulu AI! I'm here to help you build your dream application. What would you like to create today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<string>("");

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Call Zulu AI production backend
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://zulu-ai-api.onrender.com/api/v1";
      
      // Check backend health first
      const healthResponse = await fetch("https://zulu-ai-api.onrender.com/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!healthResponse.ok) {
        throw new Error("Backend not available");
      }

      // Make the API request to generate app
      const response = await fetch(`${API_BASE_URL}/generate_app`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea: currentInput }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // Extract files from generated_files object safely
      const generatedFiles = data.generated_files ? Object.values(data.generated_files).filter(Boolean) : [];
      const filesList = generatedFiles.length > 0 ? generatedFiles : ["No files generated"];
      
      // Create preview content from the response
      const previewContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2>✨ App Generated Successfully!</h2>
          <div style="margin: 20px 0;">
            <h3>💡 Message:</h3>
            <p>${data.message || "App generated with AI!"}</p>
          </div>
          <div style="margin: 20px 0;">
            <h3>🔧 Mode:</h3>
            <p style="font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 4px;">${data.mode || "unknown"}</p>
          </div>
          <div style="margin: 20px 0;">
            <h3>📁 Generated Files (${generatedFiles.length}):</h3>
            <ul>
              ${filesList.map(file => `<li style="font-family: monospace; margin: 5px 0;">${file}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
      
      setCurrentPreview(previewContent);
      
      // Save to localStorage for dashboard compatibility
      const savedApps = localStorage.getItem("zulu_generated_apps");
      const existingApps = savedApps ? JSON.parse(savedApps) : [];
      const newApp = {
        id: Date.now().toString(),
        idea: currentInput,
        slug: currentInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        files_created: generatedFiles,
        message: data.message || "App generated successfully",
        mode: data.mode || "unknown",
        created_at: new Date().toISOString()
      };
      existingApps.unshift(newApp);
      localStorage.setItem("zulu_generated_apps", JSON.stringify(existingApps));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `✨ Successfully generated app! The app includes ${generatedFiles.length} files. Mode: ${data.mode}. Check the preview panel for details.`,
        timestamp: new Date(),
        preview: previewContent
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error calling Zulu AI API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `❌ ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Navigation Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col zulu-interface-shadow">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="zulu-ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-zulu-dark-grey rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-futuristic font-bold text-lg">Zulu AI</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="zulu-ghost" className="w-full justify-start">
            <History className="w-4 h-4 mr-3" />
            Recent Projects
          </Button>
          <Button variant="zulu-ghost" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </Button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 zulu-transition cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-zulu-silver to-zulu-glow rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium font-interface truncate">User</p>
              <p className="text-xs text-muted-foreground font-interface">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-futuristic font-semibold">New Project</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-interface">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Ready to build
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isPreviewMode ? "zulu-primary" : "zulu-secondary"}
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreviewMode ? "Code" : "Preview"}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border zulu-interface-shadow'
                    }`}
                  >
                    <p className="font-interface">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2 font-interface">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Describe what you want to build..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    className="h-12 pr-12 font-interface bg-background/50 border-border/50 focus:border-primary/50"
                  />
                  <Button
                    variant="zulu-ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <Send className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-interface">
                Tip: Be specific about features, design preferences, and functionality you want.
              </p>
            </div>
          </div>

          {/* Live Preview Area */}
          <div className="w-1/2 border-l border-border bg-muted/20">
            <div className="h-full">
              {currentPreview ? (
                <div className="h-full overflow-auto">
                  <iframe
                    srcDoc={currentPreview}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="App Preview"
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Card className="p-8 text-center max-w-sm bg-background/80 backdrop-blur-sm zulu-interface-shadow">
                    <div className="w-16 h-16 bg-gradient-to-br from-zulu-silver to-zulu-glow rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-futuristic font-semibold mb-2">
                      Live Preview
                    </h3>
                    <p className="text-muted-foreground font-interface text-sm">
                      Your app will appear here as you describe it to Zulu AI. Start chatting to see the magic happen!
                    </p>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};