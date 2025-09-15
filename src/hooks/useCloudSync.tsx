// src/hooks/useCloudSync.tsx
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCloudSync({ projectId, files, onVersionSaved }) {
  const lastSavedRef = useRef<string>("");

  // Save project files to Supabase
  const saveProject = async () => {
    const { error } = await supabase
      .from("projects")
      .upsert({ id: projectId, files: JSON.stringify(files), updated_at: new Date().toISOString() });
    if (!error) {
      lastSavedRef.current = new Date().toISOString();
      if (onVersionSaved) onVersionSaved(lastSavedRef.current);
    }
  };

  // Load project files from Supabase
  const loadProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("files")
      .eq("id", projectId)
      .single();
    if (!error && data?.files) {
      return JSON.parse(data.files);
    }
    return null;
  };

  useEffect(() => {
    // Optionally auto-save on file change
    saveProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(files)]);

  return { saveProject, loadProject, lastSaved: lastSavedRef.current };
}
