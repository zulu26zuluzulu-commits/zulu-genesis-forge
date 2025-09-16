import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  FileText, 
  Calendar, 
  ExternalLink, 
  Sparkles,
  FolderOpen,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { HealthCheck } from "@/components/HealthCheck";
import { motion } from "framer-motion";

interface GeneratedApp {
  id: string;
  idea: string;
  slug: string;
  files_created: string[];
  created_at: Date;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [generatedApps, setGeneratedApps] = useState<GeneratedApp[]>([]);

  useEffect(() => {
    const savedApps = localStorage.getItem("zulu_generated_apps");
    if (savedApps) {
      try {
        const apps = JSON.parse(savedApps);
        setGeneratedApps(apps.map((app: Record<string, unknown>) => ({
          ...app,
          created_at: new Date(app.created_at as string)
        })));
      } catch (error) {
        console.error("Error loading generated apps:", error);
      }
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90"
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div className="flex-1">
            <motion.h1 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent mb-1"
            >
              Dashboard
            </motion.h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="font-medium">{user?.name || user?.email}</span>! Manage your generated applications.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="lg" className="shadow-lg">
              <Link to="/generator" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Generate New App
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Cards + Health Check */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generatedApps.length}</div>
              <p className="text-xs text-muted-foreground">
                Applications generated
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {generatedApps.reduce((total, app) => total + (app.files_created?.length || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Files created across all apps
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {generatedApps.length > 0 ? "Active" : "None"}
              </div>
              <p className="text-xs text-muted-foreground">
                {generatedApps.length > 0 
                  ? `Last app: ${formatDate(generatedApps[0]?.created_at)}`
                  : "No apps generated yet"
                }
              </p>
            </CardContent>
          </Card>

          <div className="lg:col-span-1">
            <HealthCheck />
          </div>
        </div>

        {/* Generated Apps List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Generated Applications
            </CardTitle>
            <CardDescription>
              All the applications you've created with Zulu AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedApps.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No apps generated yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by generating your first application with Zulu AI
                </p>
                <Button asChild>
                  <Link to="/generator">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Your First App
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {generatedApps.map((app) => (
                  <Card key={app.id} className="transition-all hover:shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{app.slug}</h3>
                            <Badge variant="secondary">
                              {app.files_created?.length || 0} files
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {app.idea}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(app.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {app.files_created?.length || 0} files
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/workspace?id=${app.id}`}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Files Preview */}
                      {app.files_created && app.files_created.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <ScrollArea className="h-20">
                            <div className="flex flex-wrap gap-1">
                              {app.files_created?.slice(0, 10).map((file, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {file.split("/").pop()}
                                </Badge>
                              ))}
                              {app.files_created.length > 10 && (
                                <Badge variant="outline" className="text-xs">
                                  +{app.files_created.length - 10} more
                                </Badge>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Dashboard;
