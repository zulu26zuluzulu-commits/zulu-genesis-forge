import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { AuthOverlay } from "@/components/AuthOverlay";
import { AppBuilder } from "@/components/AppBuilder";

type AppState = "landing" | "building";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleStartBuilding = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
    } else {
      setAppState("building");
    }
  };

  const handleAuth = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    setAppState("building");
  };

  const handleWatchDemo = () => {
    // Navigate to dedicated generator page
    navigate("/generator");
  };

  const handleBackToLanding = () => {
    setAppState("landing");
    navigate("/");
  };

  return (
    <>
      {appState === "landing" && (
        <HeroSection
          onStartBuilding={handleStartBuilding}
          onWatchDemo={handleWatchDemo}
        />
      )}
      {appState === "building" && (
        <AppBuilder onBack={handleBackToLanding} />
      )}
      <AuthOverlay
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuth={handleAuth}
      />
    </>
  );
};

export default Index;
