// src/hooks/useCollaboration.tsx
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCollaboration({ projectId, onRemoteChange }) {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!projectId) return;
    // Subscribe to Supabase Realtime channel for this project
    channelRef.current = supabase.channel(`project:${projectId}`);
    channelRef.current.on(
      "broadcast",
      { event: "file_update" },
      (payload) => {
        if (payload?.data) {
          onRemoteChange(payload.data);
        }
      }
    );
    channelRef.current.subscribe();
    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [projectId, onRemoteChange]);

  // Broadcast local changes
  const broadcastChange = (data: any) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: "broadcast",
      event: "file_update",
      payload: { data },
    });
  };

  return { broadcastChange };
}
