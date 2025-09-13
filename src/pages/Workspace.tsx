// src/pages/Workspace.tsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HealthCheck } from "@/components/HealthCheck";
import CodingWorkspace from "@/components/CodingWorkspace";
import { useAuth } from "@/hooks/useAuth";

/**
 * Workspace page - main post-login landing page.
 * It mounts the CodingWorkspace component and keeps small summary cards.
 */

const Workspace: React.FC = () => {
  const { user } = useAuth?.() ?? { user: null };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90"
    >
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name || user?.email || "Builder"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Jump straight into your workspace — build something awesome.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <HealthCheck />
            <Button asChild>
              <Link to="/generator">Generate New App</Link>
            </Button>
          </div>
        </div>

        {/* Compact top summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-card">
            <div className="text-sm text-muted-foreground">Total Apps</div>
            <div className="text-xl font-bold">—</div>
          </div>
          <div className="p-3 rounded-lg bg-card">
            <div className="text-sm text-muted-foreground">Recent Activity</div>
            <div className="text-xl font-bold">—</div>
          </div>
          <div className="p-3 rounded-lg bg-card">
            <div className="text-sm text-muted-foreground">Files Created</div>
            <div className="text-xl font-bold">—</div>
          </div>
        </div>

        {/* Main workspace area */}
        <div className="h-[72vh] bg-transparent rounded-lg border border-border overflow-hidden">
          <CodingWorkspace />
        </div>
      </div>
    </motion.div>
  );
};

export default Workspace;
