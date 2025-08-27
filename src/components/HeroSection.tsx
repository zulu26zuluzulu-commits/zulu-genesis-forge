import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import { AfricaIcon } from "@/components/AfricaIcon";

const typingPhrases = [
  "a social media dashboard",
  "an e-commerce platform", 
  "a project management tool",
  "a booking system",
  "your dream application"
];

export const HeroSection = ({ onStartBuilding, onWatchDemo }: { 
  onStartBuilding: () => void;
  onWatchDemo: () => void;
}) => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const phrase = typingPhrases[currentPhrase];
    let index = 0;
    
    if (isTyping) {
      const typingInterval = setInterval(() => {
        if (index <= phrase.length) {
          setDisplayText(phrase.slice(0, index));
          index++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }
      }, 80);
      
      return () => clearInterval(typingInterval);
    } else {
      const deletingInterval = setInterval(() => {
        if (index >= 0) {
          setDisplayText(phrase.slice(0, index));
          index--;
        } else {
          clearInterval(deletingInterval);
          setCurrentPhrase((prev) => (prev + 1) % typingPhrases.length);
          setIsTyping(true);
        }
      }, 40);
      
      return () => clearInterval(deletingInterval);
    }
  }, [currentPhrase, isTyping]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 600);
    
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center zulu-pattern">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 zulu-hero-gradient opacity-5"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo/Brand with Africa Map */}
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 mb-6">
            <AfricaIcon className="w-12 h-12 text-primary opacity-80 zulu-transition hover:opacity-100" />
            <h1 className="text-5xl font-futuristic font-bold tracking-tight bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
              Zulu AI
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="h-px w-8 bg-border"></div>
            <span className="text-xs font-light tracking-widest opacity-70">AFRICA'S INTELLIGENT APP BUILDER</span>
            <div className="h-px w-8 bg-border"></div>
          </div>
        </div>

        {/* Main Headlines */}
        <div className="mb-14 space-y-8 animate-fade-in-up [animation-delay:200ms]">
          <h2 className="text-6xl md:text-8xl font-futuristic font-bold tracking-tight leading-tight">
            Type your idea.
            <br />
            <span className="bg-gradient-to-r from-primary via-zulu-dark-grey to-primary bg-clip-text text-transparent">
              Watch it come alive.
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground/80 font-interface max-w-2xl mx-auto leading-relaxed">
            Built for the world, powered by Africa.
          </p>
        </div>

        {/* Interactive Input Demonstration */}
        <div className="mb-14 animate-fade-in-up [animation-delay:400ms]">
          <div className="relative max-w-2xl mx-auto">
            <div 
              className="relative bg-background/80 backdrop-blur-sm border border-border rounded-xl p-6 zulu-interface-shadow hover:border-primary/30 hover:bg-background/90 zulu-transition cursor-pointer group"
              onClick={onStartBuilding}
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary/60 group-hover:bg-primary group-hover:scale-110 zulu-transition"></div>
                <div className="flex-1 text-left">
                  <span className="text-muted-foreground font-interface">
                    I want to build{" "}
                  </span>
                  <span className="text-foreground font-medium">
                    {displayText}
                  </span>
                  <span className={`inline-block w-0.5 h-5 bg-primary ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}></span>
                </div>
                <div className="text-muted-foreground/50 text-sm font-interface group-hover:text-muted-foreground/70 zulu-transition">
                  Press to start →
                </div>
              </div>
            </div>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-xl -z-10 group-hover:via-primary/10 zulu-transition"></div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up [animation-delay:600ms]">
          <Button 
            variant="zulu-primary" 
            size="lg"
            onClick={onStartBuilding}
            className="w-full sm:w-auto rounded-xl hover:scale-[1.02] hover:shadow-lg zulu-transition"
          >
            <Sparkles className="w-5 h-5" />
            Start Building
          </Button>
          
          <Button 
            variant="zulu-secondary" 
            size="lg"
            onClick={onWatchDemo}
            className="w-full sm:w-auto rounded-xl hover:scale-[1.02] hover:shadow-md hover:bg-primary/10 zulu-transition"
          >
            <Play className="w-5 h-5" />
            Watch Demo
          </Button>
        </div>

        {/* Trusted by indicator */}
        <div className="mt-20 animate-fade-in-up [animation-delay:800ms]">
          <p className="text-sm text-muted-foreground/70 font-interface mb-6">
            Trusted by innovators across Africa
          </p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            <div className="w-16 h-8 bg-gradient-to-r from-zulu-silver to-zulu-glow rounded-lg opacity-50 hover:opacity-70 zulu-transition"></div>
            <div className="w-20 h-8 bg-gradient-to-r from-zulu-glow to-zulu-silver rounded-lg opacity-50 hover:opacity-70 zulu-transition"></div>
            <div className="w-14 h-8 bg-gradient-to-r from-zulu-silver to-zulu-glow rounded-lg opacity-50 hover:opacity-70 zulu-transition"></div>
          </div>
        </div>
      </div>
    </section>
  );
};