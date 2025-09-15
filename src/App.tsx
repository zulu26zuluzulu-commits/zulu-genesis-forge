// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// ✅ Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Status from "./pages/Status";
import NotFound from "./pages/NotFound";
import CodingWorkspace from "./pages/CodingWorkspace"; // ✅ updated import

// ✅ Standalone components
import AppGenerator from "@/components/AppGenerator";
import AppBuilder from "@/components/AppBuilder";

// ✅ Layout
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

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
              <Routes>
                {/* ---------- PUBLIC ROUTES ---------- */}
                <Route
                  path="/*"
                  element={
                    <div className="min-h-screen bg-background transition-colors duration-300">
                      <Navigation />
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/builder" element={<AppBuilder />} />
                        <Route path="/generator" element={<AppGenerator />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  }
                />

                {/* ---------- DASHBOARD ROUTES ---------- */}
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Dashboard />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/workspace"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <CodingWorkspace /> {/* ✅ now renders coding workspace */}
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/billing"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Billing />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/status"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <Status />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
