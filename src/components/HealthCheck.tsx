import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface HealthCheckProps {
  apiBaseUrl?: string;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking';
  app_name?: string;
  ai_mode?: string;
  gemini_configured?: boolean;
  lastChecked: Date;
}

export const HealthCheck = ({ apiBaseUrl = "https://zulu-ai-api.onrender.com" }: HealthCheckProps) => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    lastChecked: new Date()
  });

  const checkHealth = async () => {
    setHealth(prev => ({ ...prev, status: 'checking' }));
    
    try {
      const response = await fetch(`${apiBaseUrl}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        setHealth({
          status: 'healthy',
          app_name: data.app_name,
          ai_mode: data.ai_mode,
          gemini_configured: data.gemini_configured,
          lastChecked: new Date()
        });
      } else {
        setHealth({
          status: 'unhealthy',
          lastChecked: new Date()
        });
      }
    } catch (error) {
      console.error("Health check failed:", error);
      setHealth({
        status: 'unhealthy',
        lastChecked: new Date()
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'checking':
        return <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />;
    }
  };

  const getStatusBadge = () => {
    switch (health.status) {
      case 'healthy':
        return <Badge variant="default" className="bg-success text-success-foreground">Healthy</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Backend Health Status
        </CardTitle>
        <CardDescription>
          Real-time status of the Zulu AI backend services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Status</span>
          {getStatusBadge()}
        </div>

        {health.app_name && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">App Name</span>
            <span className="text-sm text-muted-foreground">{health.app_name}</span>
          </div>
        )}

        {health.ai_mode && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI Mode</span>
            <Badge variant={health.ai_mode === 'live' ? 'default' : 'secondary'}>
              {health.ai_mode}
            </Badge>
          </div>
        )}

        {health.gemini_configured !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Gemini AI</span>
            <Badge variant={health.gemini_configured ? 'default' : 'secondary'}>
              {health.gemini_configured ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Checked</span>
          <span className="text-sm text-muted-foreground">
            {health.lastChecked.toLocaleTimeString()}
          </span>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkHealth}
          disabled={health.status === 'checking'}
          className="w-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${health.status === 'checking' ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
};