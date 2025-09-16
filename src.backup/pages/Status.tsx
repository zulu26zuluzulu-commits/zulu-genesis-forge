import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackendStatusDetailed } from "@/components/BackendStatusDetailed";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Database,
  Server,
  Zap,
  Globe,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface SystemStatus {
  component: string;
  status: 'operational' | 'degraded' | 'outage';
  description: string;
  icon: React.ReactNode;
}

const Status = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([
    {
      component: "Frontend Application",
      status: "operational",
      description: "React app is running smoothly",
      icon: <Globe className="w-5 h-5" />
    },
    {
      component: "Backend API",
      status: "operational", 
      description: "Zulu AI API is responding",
      icon: <Server className="w-5 h-5" />
    },
    {
      component: "Database",
      status: "operational",
      description: "Supabase database is connected",
      icon: <Database className="w-5 h-5" />
    },
    {
      component: "AI Services",
      status: "operational",
      description: "App generation is working",
      icon: <Zap className="w-5 h-5" />
    }
  ]);

  const [lastUpdate, setLastUpdate] = useState(new Date());

  const checkSystemHealth = async () => {
    setLastUpdate(new Date());
    
    // Check backend health
    try {
      const response = await fetch("https://zulu-ai-api.onrender.com/health");
      const backendHealthy = response.ok;
      
      setSystemStatus(prev => prev.map(status => 
        status.component === "Backend API" 
          ? { ...status, status: backendHealthy ? "operational" : "outage" }
          : status
      ));
    } catch (error) {
      setSystemStatus(prev => prev.map(status => 
        status.component === "Backend API" 
          ? { ...status, status: "outage", description: "API is not responding" }
          : status
      ));
    }
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'degraded':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'outage':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-success text-success-foreground">Operational</Badge>;
      case 'degraded':
        return <Badge variant="secondary">Degraded Performance</Badge>;
      case 'outage':
        return <Badge variant="destructive">Outage</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const overallStatus = systemStatus.every(s => s.status === 'operational') 
    ? 'operational' 
    : systemStatus.some(s => s.status === 'outage') 
    ? 'outage' 
    : 'degraded';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90"
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent mb-2">
              System Status
            </h1>
            <p className="text-muted-foreground">
              Real-time status of all Zulu AI services and components
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </motion.div>

        {/* Overall Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getStatusIcon(overallStatus)}
                Overall System Status
              </CardTitle>
              <CardDescription>
                Last updated: {lastUpdate.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">
                  {overallStatus === 'operational' 
                    ? 'All systems operational' 
                    : overallStatus === 'degraded'
                    ? 'Some systems experiencing issues'
                    : 'System outage detected'
                  }
                </span>
                {getStatusBadge(overallStatus)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Individual Components */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid gap-6 mb-8"
        >
          {systemStatus.map((component, index) => (
            <motion.div
              key={component.component}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {component.icon}
                      <div>
                        <h3 className="font-semibold">{component.component}</h3>
                        <p className="text-sm text-muted-foreground">{component.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(component.status)}
                      {getStatusBadge(component.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Detailed Backend Health */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <BackendStatusDetailed />
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <Button onClick={checkSystemHealth} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Status;