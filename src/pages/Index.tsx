import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import AuthOverlay from "@/components/AuthOverlay";
import AppGenerator from "@/components/AppGenerator";
import AppBuilder from "@/components/AppBuilder";

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
    // Redirect to dedicated generator route for better UX
    window.location.href = '/generator';
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
