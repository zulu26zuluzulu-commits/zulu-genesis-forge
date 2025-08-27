import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Settings, User, History, Send, Sparkles, Code, Eye, PanelLeftOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      // Call v0.dev API through our Edge Function
      const { data, error } = await supabase.functions.invoke('generate-with-v0', {
        body: { prompt: currentInput }
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.success 
          ? `✨ Generated app for "${currentInput}":\n\n${JSON.stringify(data.data, null, 2)}`
          : `❌ Error: ${data.error}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling v0.dev API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `❌ Failed to generate app. Error: ${error.message}`,
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
          </div>
        </div>
      </main>
    </div>
  );
};