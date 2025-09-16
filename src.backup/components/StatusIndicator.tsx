import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface StatusIndicatorProps {
  apiBaseUrl: string;
}

export const StatusIndicator = ({ apiBaseUrl }: StatusIndicatorProps) => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace('/api/v1', '')}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      setIsHealthy(response.ok);
    } catch (error) {
      setIsHealthy(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  const getStatusColor = () => {
    if (isChecking) return "default";
    if (isHealthy === null) return "secondary";
    return isHealthy ? "default" : "destructive";
  };

  const getStatusText = () => {
    if (isChecking) return "Checking...";
    if (isHealthy === null) return "Unknown";
    return isHealthy ? "Backend Healthy" : "Backend Unavailable";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Badge 
        variant={getStatusColor()}
        className="flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={checkHealth}
      >
        <motion.div
          animate={isChecking ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: isChecking ? Infinity : 0 }}
        >
          {isHealthy ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
        </motion.div>
        <span className="text-xs font-medium">{getStatusText()}</span>
      </Badge>
    </motion.div>
  );
};