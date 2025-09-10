import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Settings, User, History, Send, Sparkles, Code, Eye, PanelLeftOpen, MessageCircle, Monitor, Zap } from "lucide-react";


interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  preview?: string;
}

export const AppBuilder = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Welcome to Zulu AI! I'm here to help you build your dream application. What would you like to create today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://zulu-ai-api.onrender.com/api/v1";

      const healthResponse = await fetch("https://zulu-ai-api.onrender.com/health", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!healthResponse.ok) throw new Error("Backend service is not available");
      const healthData = await healthResponse.json();

      if (healthData.ai_mode !== "live") throw new Error(`Backend is in ${healthData.ai_mode || "mock"} mode. Live AI generation is not available.`);
      if (!healthData.gemini_configured) throw new Error("Gemini AI is not configured on the backend");

      const response = await fetch(`${API_BASE_URL}/generate_app`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: currentInput }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || errorData?.message || `API Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const generatedFiles = data.generated_files ? Object.values(data.generated_files).filter(Boolean) : [];
      const filesList = generatedFiles.length > 0 ? generatedFiles : ["No files generated"];

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        {/* Sidebar */}
        <ResizablePanel defaultSize={sidebarCollapsed ? 5 : 20} minSize={5} maxSize={25}>
          <aside className="h-full bg-card/80 backdrop-blur-md border-r border-border/50 flex flex-col zulu-interface-shadow">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Button
                  variant="zulu-ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-8 w-8 hover:bg-accent/50"
                >
                  <PanelLeftOpen className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                </Button>
                {!sidebarCollapsed && (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-zulu-dark-grey rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-futuristic font-bold text-lg bg-gradient-to-r from-primary to-zulu-glow bg-clip-text text-transparent">
                      Zulu AI
                    </span>
                  </>
                )}
              </div>
              {!sidebarCollapsed && (
                <Button
                  variant="zulu-ghost"
                  size="sm"
                  onClick={onBack}
                  className="mt-3 w-full justify-start text-xs"
                >
                  ← Back to Dashboard
                </Button>
              )}
            </div>

            {!sidebarCollapsed && (
              <nav className="flex-1 p-4 space-y-2">
                <Button variant="zulu-ghost" className="w-full justify-start group">
                  <History className="w-4 h-4 mr-3 group-hover:text-primary transition-colors" />
                  Recent Projects
                </Button>
                <Button variant="zulu-ghost" className="w-full justify-start group">
                  <Settings className="w-4 h-4 mr-3 group-hover:text-primary transition-colors" />
                  Settings
                </Button>
              </nav>
            )}

            <div className="p-4 border-t border-border/50">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 zulu-transition cursor-pointer group">
                <div className="w-8 h-8 bg-gradient-to-br from-zulu-silver to-zulu-glow rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-interface truncate">User</p>
                    <p className="text-xs text-muted-foreground font-interface">Free Plan</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main */}
        <ResizablePanel defaultSize={sidebarCollapsed ? 95 : 80} minSize={60}>
          <main className="h-full flex flex-col">
            <header className="h-16 border-b border-border/50 bg-background/90 backdrop-blur-md zulu-interface-shadow">
              <div className="h-full flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-zulu-glow rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-lg font-futuristic font-semibold">AI Builder</h1>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-interface">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        Ready to create magic
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs font-interface">
                    {messages.length - 1} messages
                  </Badge>
                  {currentPreview && (
                    <Badge variant="outline" className="text-xs font-interface bg-green-500/10 text-green-600 border-green-500/20">
                      ✨ Preview Ready
                    </Badge>
                  )}
                </div>
              </div>
            </header>

            <div className="flex-1 flex flex-col">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "preview")} className="flex-1 flex flex-col">
                <div className="border-b border-border/50 bg-muted/30 px-6 pt-4">
                  <TabsList className="grid w-full max-w-md grid-cols-2 bg-background/50 backdrop-blur-sm">
                    <TabsTrigger value="chat" className="relative font-interface data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                      {messages.length > 1 && (
                        <Badge variant="secondary" className="ml-2 h-5 text-xs">
                          {messages.length - 1}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="relative font-interface data-[state=active]:bg-primary data-[state=active]:text-primary data-[state=active]:text-primary-foreground" disabled={!currentPreview}>
                      <Monitor className="w-4 h-4 mr-2" />
                      Preview
                      {currentPreview && <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2 animate-pulse"></div>}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="chat" className="flex-1 flex flex-col m-0">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((message, index) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className={`max-w-2xl rounded-2xl px-6 py-4 ${message.type === 'user'
                            ? 'bg-gradient-to-r from-primary to-zulu-glow text-primary-foreground'
                            : 'bg-card/80 backdrop-blur-sm border border-border/50'}`}>
                          <p className="font-interface leading-relaxed">{message.content}</p>
                          <p className="text-xs opacity-70 mt-3 font-interface">{message.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl px-6 py-4 max-w-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-primary to-zulu-glow rounded-full flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-primary-foreground animate-pulse" />
                            </div>
                            <p className="font-interface text-muted-foreground">Zulu AI is thinking...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-6">
                    <div className="flex gap-4">
                      <div className="flex-1 relative group">
                        <Input
                          placeholder="Describe your dream application..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                          disabled={isLoading}
                          className="h-14 pr-14 font-interface text-base"
                        />
                        <Button
                          variant="zulu-ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-10 w-10"
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isLoading}
                        >
                          <Send className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 m-0">
                  <div className="h-full bg-muted/20">
                    {currentPreview ? (
                      <div className="h-full flex flex-col">
                        <div className="border-b border-border/50 p-4 bg-background/80 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h3 className="font-futuristic font-semibold">Live Preview</h3>
                                <p className="text-xs text-muted-foreground font-interface">Your AI-generated application</p>
                              </div>
                            </div>
                            <Button
                              variant="zulu-secondary"
                              size="sm"
                              onClick={() => setActiveTab("chat")}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Back to Chat
                            </Button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                          <iframe
                            srcDoc={currentPreview}
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin"
                            title="AI Generated App Preview"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Card className="p-12 text-center max-w-lg bg-background/90 backdrop-blur-sm border-border/50">
                          <div className="w-20 h-20 bg-gradient-to-br from-zulu-silver to-zulu-glow rounded-3xl mx-auto mb-6 flex items-center justify-center">
                            <Monitor className="w-10 h-10 text-primary" />
                          </div>
                          {/* ✅ Added Preview Panel section */}
                          <h3 className="text-xl font-futuristic font-semibold mb-4">
                            Preview Panel
                          </h3>
                          <p className="text-muted-foreground font-interface mb-6">
                            Generate an app to see a live preview of your application here.
                          </p>
                          <Button variant="zulu-primary" onClick={() => setActiveTab("chat")}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Start Building
                          </Button>
                        </Card>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
