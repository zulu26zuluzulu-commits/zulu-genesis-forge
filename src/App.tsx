import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
import { RequireAuth } from "@/components/RequireAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Status from "./pages/Status";
<<<<<<< Updated upstream
import AppGenerator from "@/components/AppGenerator";
import AppBuilder from "@/components/AppBuilder";
=======
import { AppGenerator } from "@/components/AppGenerator";
>>>>>>> Stashed changes
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background transition-colors duration-300">
                <Navigation />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/generator" element={
                    <AppGenerator onBack={() => window.history.back()} />
                  } />
                  <Route path="/dashboard" element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  } />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/status" element={<Status />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
