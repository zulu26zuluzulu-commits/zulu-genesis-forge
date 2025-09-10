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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const newUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split("@")[0],
        };
        setUser(newUser);
        localStorage.setItem("zulu_auth_token", session.access_token);
        localStorage.setItem("zulu_user_data", JSON.stringify(newUser));
      } else {
        // fallback to localStorage (dev mode)
        const token = localStorage.getItem("zulu_auth_token");
        const userData = localStorage.getItem("zulu_user_data");
        if (token && userData) {
          try {
            setUser(JSON.parse(userData));
          } catch {
            localStorage.removeItem("zulu_auth_token");
            localStorage.removeItem("zulu_user_data");
          }
        }
      }
      setIsLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const newUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split("@")[0],
        };
        setUser(newUser);
        localStorage.setItem("zulu_auth_token", session.access_token);
        localStorage.setItem("zulu_user_data", JSON.stringify(newUser));
      } else {
        setUser(null);
        localStorage.removeItem("zulu_auth_token");
        localStorage.removeItem("zulu_user_data");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.warn("Supabase login error:", error.message);

        // fallback dev mode
        if (email && password) {
          const devUser = { id: "dev_" + Date.now(), email, name: email.split("@")[0] };
          const devToken = "dev_token_" + Date.now();
          localStorage.setItem("zulu_auth_token", devToken);
          localStorage.setItem("zulu_user_data", JSON.stringify(devUser));
          setUser(devUser);

          toast({ title: "Dev Login", description: "Logged in (Development Mode)." });
          return { success: true };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        const newUser = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.email!.split("@")[0],
        };
        localStorage.setItem("zulu_auth_token", data.session?.access_token || "");
        localStorage.setItem("zulu_user_data", JSON.stringify(newUser));
        setUser(newUser);

        toast({ title: "Welcome back!", description: "Login successful." });
        return { success: true };
      }

      return { success: false, error: "Authentication failed" };
    } catch (err: any) {
      console.error("Login error:", err);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split("@")[0] } },
      });

      if (error) {
        console.warn("Supabase register error:", error.message);

        // fallback dev mode
        if (email && password) {
          const devUser = { id: "dev_" + Date.now(), email, name: name || email.split("@")[0] };
          const devToken = "dev_token_" + Date.now();
          localStorage.setItem("zulu_auth_token", devToken);
          localStorage.setItem("zulu_user_data", JSON.stringify(devUser));
          setUser(devUser);

          toast({ title: "Dev Account", description: "Account created (Development Mode)." });
          return { success: true };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        const newUser = {
          id: data.user.id,
          email: data.user.email!,
          name: name || data.user.email!.split("@")[0],
        };
        localStorage.setItem("zulu_auth_token", data.session?.access_token || "");
        localStorage.setItem("zulu_user_data", JSON.stringify(newUser));
        setUser(newUser);

        toast({ title: "Account created!", description: "Check your email to verify." });
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (err: any) {
      console.error("Register error:", err);
      return { success: false, error: "Registration failed. Please try again." };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("zulu_auth_token");
    localStorage.removeItem("zulu_user_data");
    setUser(null);

    toast({ title: "Logged out", description: "You have been logged out." });
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
