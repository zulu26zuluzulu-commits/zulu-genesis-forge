import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AuthOverlay } from "@/components/AuthOverlay";
import { AppBuilder } from "@/components/AppBuilder";
import { AppGenerator } from "@/components/AppGenerator";

type AppState = 'landing' | 'building' | 'generating';

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
