import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    // Check for existing Supabase session first
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split("@")[0],
        };
        setUser(user);
        localStorage.setItem("zulu_auth_token", session.access_token);
        localStorage.setItem("zulu_user_data", JSON.stringify(user));
      } else {
        // Fallback to localStorage check for development auth
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
      }
      
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const user = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split("@")[0],
          };
          setUser(user);
          localStorage.setItem("zulu_auth_token", session.access_token);
          localStorage.setItem("zulu_user_data", JSON.stringify(user));
        } else {
          setUser(null);
          localStorage.removeItem("zulu_auth_token");
          localStorage.removeItem("zulu_user_data");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Try Supabase auth first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback to development auth for testing
        if (email && password) {
          const devUser = {
            id: "dev_user_" + Date.now(),
            email,
            name: email.split("@")[0],
          };
          
          const devToken = "dev_jwt_token_" + Date.now();
          
          localStorage.setItem("zulu_auth_token", devToken);
          localStorage.setItem("zulu_user_data", JSON.stringify(devUser));
          setUser(devUser);
          
          toast({
            title: "Welcome back!",
            description: "You have been logged in successfully (Development Mode).",
          });
          
          return { success: true };
        } else {
          return { success: false, error: "Invalid credentials" };
        }
      }

      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.email!.split("@")[0],
        };
        
        localStorage.setItem("zulu_auth_token", data.session?.access_token || "");
        localStorage.setItem("zulu_user_data", JSON.stringify(user));
        setUser(user);
        
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        
        return { success: true };
      }

      return { success: false, error: "Authentication failed" };
    } catch (error) {
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      // Try Supabase auth first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
          }
        }
      });

      if (error) {
        // Fallback to development auth for testing
        if (email && password) {
          const devUser = {
            id: "dev_user_" + Date.now(),
            email,
            name: name || email.split("@")[0],
          };
          
          const devToken = "dev_jwt_token_" + Date.now();
          
          localStorage.setItem("zulu_auth_token", devToken);
          localStorage.setItem("zulu_user_data", JSON.stringify(devUser));
          setUser(devUser);
          
          toast({
            title: "Account created!",
            description: "Welcome to Zulu AI! You can now start generating apps (Development Mode).",
          });
          
          return { success: true };
        } else {
          return { success: false, error: "Please provide valid email and password" };
        }
      }

      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email!,
          name: name || data.user.email!.split("@")[0],
        };
        
        localStorage.setItem("zulu_auth_token", data.session?.access_token || "");
        localStorage.setItem("zulu_user_data", JSON.stringify(user));
        setUser(user);
        
        toast({
          title: "Account created!",
          description: "Welcome to Zulu AI! Please check your email to verify your account.",
        });
        
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (error) {
      return { success: false, error: "Registration failed. Please try again." };
    }
  };

  const logout = async () => {
    // Try Supabase logout first
    await supabase.auth.signOut();
    
    // Always clean up local storage
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