import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface BackendHealth {
  status: string;
  app_name: string;
  ai_mode: string;
  gemini_configured: boolean;
  timestamp?: string;
}

interface StatusCheckProps {
  apiBaseUrl?: string;
}

export const BackendStatusDetailed = ({ 
  apiBaseUrl = "https://zulu-ai-api.onrender.com" 
}: StatusCheckProps) => {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        setHealth(data);
        setLastChecked(new Date());
      } else {
        setHealth(null);
      }
    } catch (error) {
      console.error("Backend health check failed:", error);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!health) return "destructive";
    if (health.ai_mode === "live" && health.gemini_configured) return "default";
    if (health.ai_mode === "mock") return "secondary";
    return "destructive";
  };

  const getStatusIcon = () => {
    if (!health) return <XCircle className="w-4 h-4" />;
    if (health.ai_mode === "live" && health.gemini_configured) return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getStatusMessage = () => {
    if (!health) return "Backend Offline";
    if (health.ai_mode === "live" && health.gemini_configured) return "🚀 Live Gemini AI Ready!";
    if (health.ai_mode === "mock") return "⚠️ Running in Mock Mode";
    return "⚠️ Configuration Issue";
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Backend Status Monitor
        </CardTitle>
        <CardDescription>
          Real-time status of Zulu AI backend and Gemini configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <Badge variant={getStatusColor()} className="gap-1">
            {getStatusIcon()}
            {getStatusMessage()}
          </Badge>
        </div>

        {health && (
          <>
            {/* App Info */}
            <div className="flex items-center justify-between">
              <span className="font-medium">App Name:</span>
              <span className="text-sm">{health.app_name}</span>
            </div>

            {/* AI Mode */}
            <div className="flex items-center justify-between">
              <span className="font-medium">AI Mode:</span>
              <Badge variant={health.ai_mode === "live" ? "default" : "secondary"}>
                {health.ai_mode.toUpperCase()}
              </Badge>
            </div>

            {/* Gemini Configuration */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Gemini AI:</span>
              <Badge variant={health.gemini_configured ? "default" : "destructive"}>
                {health.gemini_configured ? "✅ Configured" : "❌ Not Configured"}
              </Badge>
            </div>

            {/* Configuration Issues */}
            {(health.ai_mode === "mock" || !health.gemini_configured) && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                  Configuration Required:
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {!health.gemini_configured && (
                    <li>• Add GEMINI_API_KEY to backend environment</li>
                  )}
                  {health.ai_mode === "mock" && (
                    <li>• Switch backend AI_MODE from "mock" to "live"</li>
                  )}
                  <li>• Restart the backend service</li>
                </ul>
              </div>
            )}
          </>
        )}

        {/* Last Checked */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Last checked:</span>
          <span>{lastChecked ? lastChecked.toLocaleTimeString() : "Never"}</span>
        </div>

        {/* Refresh Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkStatus}
          disabled={loading}
          className="w-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Checking..." : "Refresh Status"}
        </Button>
      </CardContent>
    </Card>
  );
};