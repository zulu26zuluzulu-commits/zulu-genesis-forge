import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://zulu-ai-api.onrender.com/api/v1";

interface BackendStatus {
  isHealthy: boolean | null;
  isChecking: boolean;
  lastChecked: Date | null;
  appName?: string;
  aiMode?: string;
}

export const BackendStatusIndicator = () => {
  const [status, setStatus] = useState<BackendStatus>({
    isHealthy: null,
    isChecking: false,
    lastChecked: null,
  });

  const checkHealth = async () => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          isHealthy: true,
          isChecking: false,
          lastChecked: new Date(),
          appName: data.app_name,
          aiMode: data.ai_mode,
        });
      } else {
        setStatus({
          isHealthy: false,
          isChecking: false,
          lastChecked: new Date(),
        });
      }
    } catch (error) {
      setStatus({
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (status.isChecking) return "secondary";
    if (status.isHealthy === null) return "secondary";
    return status.isHealthy ? "default" : "destructive";
  };

  const getStatusText = () => {
    if (status.isChecking) return "Checking Backend...";
    if (status.isHealthy === null) return "Backend Status Unknown";
    return status.isHealthy ? "Backend Online" : "Backend Offline";
  };

  const getIcon = () => {
    if (status.isChecking) {
      return <Loader2 className="w-3 h-3 animate-spin" />;
    }
    return status.isHealthy ? (
      <Wifi className="w-3 h-3" />
    ) : (
      <WifiOff className="w-3 h-3" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2"
    >
      <Badge 
        variant={getStatusColor()}
        className="flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={checkHealth}
        title={status.lastChecked ? `Last checked: ${status.lastChecked.toLocaleTimeString()}` : "Click to check status"}
      >
        {getIcon()}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </Badge>
      
      {status.isHealthy && status.aiMode && (
        <Badge variant={status.aiMode === 'live' ? 'default' : 'secondary'} className="text-xs">
          {status.aiMode === 'live' ? '🟢 Live AI' : '🔴 Mock Mode'}
        </Badge>
      )}
    </motion.div>
  );
};