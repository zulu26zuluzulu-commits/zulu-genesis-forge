import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import Index from "./pages/Index.tsx";
import AppGenerator from "@/components/AppGenerator";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Default app wrapper */}
        <Route path="/*" element={<App />}>
          {/* Landing page */}
          <Route index element={<Index />} />
          {/* Generator route */}
          <Route path="generator" element={<AppGenerator onBack={() => (window.location.href = "/")} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
