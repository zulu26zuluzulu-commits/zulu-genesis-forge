// src/pages/CodingWorkspace.tsx
import { RequireAuth } from "@/components/RequireAuth";
import { WorkspaceLayout } from "@/layouts/WorkspaceLayout";

export default function CodingWorkspace() {
  return (
    <RequireAuth>
      <WorkspaceLayout />
    </RequireAuth>
  );
}
