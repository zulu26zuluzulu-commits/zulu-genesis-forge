import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AuthOverlay } from "@/components/AuthOverlay";
import { AppBuilder } from "@/components/AppBuilder";
import { AppGenerator } from "@/components/AppGenerator";

type AppState = 'landing' | 'building' | 'generating';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleStartBuilding = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
    } else {
      setAppState('building');
    }
  };

  const handleAuth = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    setAppState('building');
  };

  const handleWatchDemo = () => {
    setAppState('generating');
  };

  const handleBackToLanding = () => {
    setAppState('landing');
  };

  if (appState === 'building') {
    return <AppBuilder onBack={handleBackToLanding} />;
  }

  if (appState === 'generating') {
    return <AppGenerator onBack={handleBackToLanding} />;
  }

  return (
    <>
      <HeroSection 
        onStartBuilding={handleStartBuilding}
        onWatchDemo={handleWatchDemo}
      />
      <AuthOverlay 
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuth={handleAuth}
      />
    </>
  );
};

export default Index;
