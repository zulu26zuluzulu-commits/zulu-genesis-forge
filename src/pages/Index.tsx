import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { AuthOverlay } from "@/components/AuthOverlay";
import { AppBuilder } from "@/components/AppBuilder";
import { AppGenerator } from "@/components/AppGenerator";

type AppState = 'landing' | 'building';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

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
    // Navigate to dedicated generator route
    navigate("/generator");
  };

  const handleBackToLanding = () => {
    setAppState('landing');
    navigate("/");
  };

  return (
    <Routes>
      {/* Landing Page */}
      <Route
        path="/"
        element={
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
        }
      />

      {/* Generator Page */}
      <Route
        path="/generator"
        element={<AppGenerator onBack={handleBackToLanding} />}
      />
    </Routes>
  );
};

export default Index;
