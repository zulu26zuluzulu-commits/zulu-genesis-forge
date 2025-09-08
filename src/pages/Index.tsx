import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { AuthOverlay } from "@/components/AuthOverlay";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleStartBuilding = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
    } else {
      navigate("/builder");
    }
  };

  const handleAuth = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    navigate("/builder");
  };

  const handleWatchDemo = () => {
    navigate("/generator");
  };

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
