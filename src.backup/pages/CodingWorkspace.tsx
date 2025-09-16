// src/pages/CodingWorkspace.tsx
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout } from "../layouts/AppLayout";

export default function CodingWorkspace() {
  return (
    <RequireAuth>
      <AppLayout />
    </RequireAuth>
  );
}
