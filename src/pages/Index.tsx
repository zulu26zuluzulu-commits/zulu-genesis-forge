import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { AuthOverlay } from "@/components/AuthOverlay";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartBuilding = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      navigate("/builder");
    }
  };

  const handleAuthSuccess = () => {
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
        onAuth={handleAuthSuccess}
      />
    </>
  );
};

export default Index;
