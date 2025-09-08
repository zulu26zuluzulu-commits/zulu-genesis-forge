"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface GeneratedAppResponse {
  message: string;
  generated_files?: { [key: string]: string };
  files_created?: string[];
}

export default function AppGenerator() {
  const [appDescription, setAppDescription] = useState("");
  const [response, setResponse] = useState<GeneratedAppResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [dark, setDark] = useState(
    typeof window !== "undefined" && localStorage.getItem("zulu_theme") === "dark"
  );

  const router = useRouter();

  // 🌍 Health check for backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://zulu-ai-api.onrender.com/health");
        setBackendHealthy(res.ok);
      } catch {
        setBackendHealthy(false);
      }
    })();
  }, []);

  // 🌙 Dark mode toggle
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
      localStorage.setItem("zulu_theme", dark ? "dark" : "light");
    }
  }, [dark]);

  const handleGenerate = async () => {
    if (!appDescription.trim()) {
      setError("Please enter a description for your app.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(
        "https://zulu-ai-api.onrender.com/api/generate-app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: appDescription }),
        }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate app");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Zulu AI App Generator
          </h1>
          <p className="text-muted-foreground">
            Transform your ideas into complete applications with AI
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                backendHealthy === null
                  ? "bg-gray-400"
                  : backendHealthy
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
            {backendHealthy === null
              ? "Checking..."
              : backendHealthy
              ? "Online"
              : "Offline"}
          </div>
          <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </Button>
        </div>
      </div>

      {/* Input Card */}
      <Card className="border-2 border-primary/10 shadow-lg mb-8">
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Describe Your App Idea</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a detailed description of the app you want to create
            </p>
            <Textarea
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Build a simple Todo app..."
              className="min-h-[120px] text-base"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate App
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response */}
      {response && (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                App Generated Successfully!
              </h2>
              <p className="text-muted-foreground">{response.message}</p>
            </div>

            <div>
              <h3 className="text-md font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Generated Files
              </h3>

              {/* Unified file handling */}
              {(() => {
                let files: [string, string][] = [];

                if (
                  response.generated_files &&
                  typeof response.generated_files === "object"
                ) {
                  files = Object.entries(response.generated_files).filter(
                    ([_, path]) => path
                  ) as [string, string][];
                } else if (
                  (response as any).files_created &&
                  Array.isArray((response as any).files_created)
                ) {
                  files = (response as any).files_created.map(
                    (p: string, i: number) => [`file_${i + 1}`, p]
                  );
                }

                return files.length > 0 ? (
                  <motion.div className="space-y-3">
                    {files.map(([type, path], index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.6 + index * 0.05,
                          duration: 0.3,
                        }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-background/80 hover:bg-background border border-border/30 transition-all duration-200 cursor-pointer group"
                      >
                        <FileText className="h-4 w-4 text-primary flex-shrink-0 group-hover:text-primary/80 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm text-primary capitalize font-semibold">
                            {type}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground break-all group-hover:text-foreground/90 transition-colors">
                            {path}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">
                      No files generated yet
                    </p>
                    <p className="text-muted-foreground/60 text-xs mt-1">
                      Files will appear here once generation is complete
                    </p>
                  </motion.div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
