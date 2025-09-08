import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, XCircle, FileText, Lightbulb, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://zulu-ai-api.onrender.com/api/v1";

interface GenerateAppResponse {
  message: string;
  generated_files?: {
    backend?: string;
    frontend?: string;
    [key: string]: string | undefined;
  };
  mode: string;
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
      
      // Support both new format (generated_files object) and legacy format (files_created array)
      let files_created: string[] = [];
      
      if (data.generated_files && typeof data.generated_files === 'object') {
        // New format: extract file paths from generated_files object
        files_created = Object.values(data.generated_files).filter(Boolean) as string[];
      } else if ((data as any).files_created && Array.isArray((data as any).files_created)) {
        // Legacy format: use files_created array directly
        files_created = (data as any).files_created;
      }
      
      const newApp = {
        id: Date.now().toString(),
        idea: idea.trim(),
        slug: idea.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        files_created: files_created,
        message: data.message || "App generated successfully",
        mode: data.mode || "unknown",
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90"
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div className="flex-1">
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent mb-2"
            >
              Zulu AI App Generator
            </motion.h1>
            <p className="text-muted-foreground text-base">
              Transform your ideas into complete applications with AI
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </motion.div>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="mb-8 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Lightbulb className="h-5 w-5 text-primary" />
                </motion.div>
                Describe Your App Idea
              </CardTitle>
              <CardDescription className="text-base">
                Enter a detailed description of the app you want to create
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="e.g. A task management app with real-time collaboration and drag-drop interface..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 h-12 text-base bg-background/50"
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={generateApp} 
                    disabled={isLoading || !idea.trim()}
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 font-semibold shadow-lg"
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
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-8 border-destructive/50 bg-destructive/5 shadow-lg">
                <CardContent className="pt-6">
                  <motion.div 
                    initial={{ x: -10 }}
                    animate={{ x: 0 }}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">{error}</span>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Success Response */}
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            >
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <CardTitle className="flex items-center gap-2 text-success text-xl">
                      <CheckCircle className="h-6 w-6" />
                      App Generated Successfully!
                    </CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* App Details */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="grid sm:grid-cols-2 gap-6"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="space-y-3"
                     >
                       <h3 className="font-semibold text-lg flex items-center gap-2">
                         💡 Generated Message
                       </h3>
                       <p className="text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/50 leading-relaxed">
                         {response.message}
                       </p>
                     </motion.div>
                     <motion.div
                       whileHover={{ scale: 1.02 }}
                       className="space-y-3"
                     >
                       <h3 className="font-semibold text-lg flex items-center gap-2">
                         🔧 Mode
                       </h3>
                       <p className="text-primary font-mono bg-primary/10 p-4 rounded-xl border border-primary/20 text-lg font-semibold">
                         {response.mode}
                       </p>
                     </motion.div>
                  </motion.div>

                   {/* Files Created */}
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.5, duration: 0.5 }}
                   >
                     <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                       <FileText className="h-5 w-5 text-primary" />
                       Generated Files ({response.generated_files ? Object.keys(response.generated_files).length : 0})
                     </h3>
                     <Card className="border-0 bg-muted/20 shadow-inner">
                       <ScrollArea className="h-80 p-6">
                         {response.generated_files && Object.keys(response.generated_files).length > 0 ? (
                           <motion.div className="space-y-3">
                             {Object.entries(response.generated_files)
                               .filter(([_, path]) => path) // Filter out undefined values
                               .map(([type, path], index) => (
                                 <motion.div
                                   key={index}
                                   initial={{ opacity: 0, x: -20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                                   whileHover={{ scale: 1.02, x: 5 }}
                                   className="flex items-center gap-3 p-3 rounded-lg bg-background/80 hover:bg-background border border-border/30 transition-all duration-200 cursor-pointer group"
                                 >
                                   <FileText className="h-4 w-4 text-primary flex-shrink-0 group-hover:text-primary/80 transition-colors" />
                                   <div className="flex-1 min-w-0">
                                     <div className="font-mono text-sm text-primary capitalize font-semibold">{type}</div>
                                     <div className="font-mono text-xs text-muted-foreground break-all group-hover:text-foreground/90 transition-colors">{path}</div>
                                   </div>
                                 </motion.div>
                               ))}
                           </motion.div>
                         ) : (
                           <motion.div
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             className="flex flex-col items-center justify-center py-12 text-center"
                           >
                             <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                             <p className="text-muted-foreground text-sm">No files generated yet</p>
                             <p className="text-muted-foreground/60 text-xs mt-1">Files will appear here once generation is complete</p>
                           </motion.div>
                         )}
                       </ScrollArea>
                     </Card>
                   </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};