import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Github, Sparkles } from "lucide-react";

export default function AuthOverlay({ isOpen, onClose, onAuth }: { isOpen: boolean; onClose: () => void; onAuth: () => void }) {
  const [email, setEmail] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleContinue = () => {
    if (email.trim()) {
      onAuth();
    }
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`Authenticating with ${provider}`);
    onAuth();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-background/95 backdrop-blur-xl border border-border/50 zulu-interface-shadow">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-zulu-dark-grey rounded-lg flex items-center justify-center zulu-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          <DialogTitle className="text-center">
            <h2 className="text-2xl font-futuristic font-bold mb-2">
              Join and start building
            </h2>
            <p className="text-muted-foreground font-interface font-normal">
              {isSignUp
                ? "Create a free account to start building your dream application"
                : "Log in or create a free account to start building your dream application"}
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Social Auth Buttons */}
          <div className="space-y-3">
            <Button
              variant="zulu-secondary"
              className="w-full justify-start"
              onClick={() => handleSocialAuth("google")}
            >
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3"></div>
              Continue with Google
              <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                Last used
              </span>
            </Button>

            <Button
              variant="zulu-secondary"
              className="w-full justify-start"
              onClick={() => handleSocialAuth("github")}
            >
              <Github className="w-5 h-5 mr-3" />
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground font-interface">
                OR
              </span>
            </div>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-interface font-medium text-foreground block mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-interface bg-background/50 border-border/50 focus:border-primary/50 h-12"
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              />
            </div>

            <Button
              variant="zulu-primary"
              className="w-full"
              onClick={handleContinue}
              disabled={!email}
            >
              Continue
            </Button>
          </div>

          {/* Toggle Sign Up / Log In */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground font-interface">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
            </span>
            <Button
              variant="link"
              className="text-sm font-interface p-0 h-auto font-medium"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Log in" : "Create your account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
