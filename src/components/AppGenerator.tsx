import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, XCircle, FileText, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://zulu-ai-api.onrender.com/api/v1";

interface GenerateAppResponse {
  idea: string;
  slug: string;
  files_created: string[];
}

interface AppGeneratorProps {
  onBack: () => void;
}

export const AppGenerator = ({ onBack }: AppGeneratorProps) => {
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<GenerateAppResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkBackendHealth = async (): Promise<boolean> => {
    try {
      const healthResponse = await fetch("https://zulu-ai-api.onrender.com/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return healthResponse.ok;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  };

  const generateApp = async () => {
    if (!idea.trim()) {
      toast({
        title: "Error",
        description: "Please enter an app idea",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Check backend health first
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        throw new Error("Backend not available");
      }

      // Make the API request
      const apiResponse = await fetch(`${API_BASE_URL}/generate_app`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        throw new Error(`API Error: ${apiResponse.status} - ${errorData}`);
      }

      const data: GenerateAppResponse = await apiResponse.json();
      setResponse(data);
      
      // Save to localStorage for dashboard
      const savedApps = localStorage.getItem("zulu_generated_apps");
      const existingApps = savedApps ? JSON.parse(savedApps) : [];
      const newApp = {
        id: Date.now().toString(),
        idea: data.idea,
        slug: data.slug,
        files_created: data.files_created,
        created_at: new Date().toISOString()
      };
      existingApps.unshift(newApp);
      localStorage.setItem("zulu_generated_apps", JSON.stringify(existingApps));
      
      toast({
        title: "Success!",
        description: "App generated successfully",
      });
    } catch (error: any) {
      console.error("Generate app error:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      generateApp();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Zulu AI App Generator
            </h1>
            <p className="text-muted-foreground mt-2">
              Transform your ideas into complete applications
            </p>
          </div>
          <Button variant="outline" onClick={onBack}>
            ← Back to Home
          </Button>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Describe Your App Idea
            </CardTitle>
            <CardDescription>
              Enter a detailed description of the app you want to create
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="e.g. A task management app with real-time collaboration..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={generateApp} 
                disabled={isLoading || !idea.trim()}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate App"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Response */}
        {response && (
          <Card className="border-success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                App Generated Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* App Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">App Idea</h3>
                  <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {response.idea}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">App Slug</h3>
                  <p className="text-primary font-mono bg-muted/50 p-3 rounded-lg">
                    {response.slug}
                  </p>
                </div>
              </div>

              {/* Files Created */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Files Created ({response.files_created.length})
                </h3>
                <Card>
                  <ScrollArea className="h-64 p-4">
                    <div className="space-y-2">
                      {response.files_created.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono text-sm break-all">{file}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};