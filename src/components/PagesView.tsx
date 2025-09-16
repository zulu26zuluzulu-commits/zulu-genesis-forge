import React from 'react';
import { ProjectFile } from '@/types';

export function PagesView({ files, onOpen }: { files: ProjectFile[]; onOpen: (path: string) => void }) {
  const pages = files.filter((f) => f.path.startsWith('src/pages') || f.path.startsWith('src/app'));
  const friendly = pages.map((p) => ({ path: p.path, title: p.title.replace(/\.tsx$/, '').replace(/_/g, ' ') }));

  return (
    <div className="p-2">
      <h4 className="font-semibold mb-2">Pages</h4>
      <div className="space-y-1">
        {friendly.map((p) => (
          <button key={p.path} className="w-full text-left px-2 py-1 hover:bg-muted/20 rounded" onClick={() => onOpen(p.path)}>
            {p.title}
          </button>
        ))}
      </div>
    </div>
  );
}
