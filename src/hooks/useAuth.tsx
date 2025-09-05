import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem("zulu_auth_token");
    const userData = localStorage.getItem("zulu_user_data");
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("zulu_auth_token");
        localStorage.removeItem("zulu_user_data");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // For now, simulate login since backend auth is not implemented
      // In production, this would call your auth API endpoint
      if (email && password) {
        const mockUser = {
          id: "user_" + Date.now(),
          email,
          name: email.split("@")[0],
        };
        
        const mockToken = "mock_jwt_token_" + Date.now();
        
        localStorage.setItem("zulu_auth_token", mockToken);
        localStorage.setItem("zulu_user_data", JSON.stringify(mockUser));
        setUser(mockUser);
        
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        
        return { success: true };
      } else {
        return { success: false, error: "Invalid credentials" };
      }
    } catch (error) {
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      // For now, simulate registration since backend auth is not implemented
      // In production, this would call your auth API endpoint
      if (email && password) {
        const mockUser = {
          id: "user_" + Date.now(),
          email,
          name: name || email.split("@")[0],
        };
        
        const mockToken = "mock_jwt_token_" + Date.now();
        
        localStorage.setItem("zulu_auth_token", mockToken);
        localStorage.setItem("zulu_user_data", JSON.stringify(mockUser));
        setUser(mockUser);
        
        toast({
          title: "Account created!",
          description: "Welcome to Zulu AI! You can now start generating apps.",
        });
        
        return { success: true };
      } else {
        return { success: false, error: "Please provide valid email and password" };
      }
    } catch (error) {
      return { success: false, error: "Registration failed. Please try again." };
    }
  };

  const logout = () => {
    localStorage.removeItem("zulu_auth_token");
    localStorage.removeItem("zulu_user_data");
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};