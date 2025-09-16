import React from 'react';
import { ProjectFile } from '@/types';

function extractComponentNames(content: string) {
  // Lightweight heuristic: match function/class components and exported default components
  const names = new Set<string>();
  try {
    // function components: function Name( or const Name = ( or const Name: React.FC
    const fnRegex = /(?:function|const)\s+([A-Z][A-Za-z0-9_]*)\s*(?:=|\()/g;
    let m: RegExpExecArray | null;
    while ((m = fnRegex.exec(content))) names.add(m[1]);

    // class components: class Name extends React.Component
    const classRegex = /class\s+([A-Z][A-Za-z0-9_]*)\s+/g;
    while ((m = classRegex.exec(content))) names.add(m[1]);

    // export default function Name() {} or export default class Name
    const exportRegex = /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/g;
    while ((m = exportRegex.exec(content))) names.add(m[1]);
  } catch (e) {
    // fallback: empty
  }
  return Array.from(names);
}

export function ComponentsView({ files, onOpen }: { files: ProjectFile[]; onOpen: (path: string) => void }) {
  const list = React.useMemo(() => {
    return files.map((f) => ({ file: f, components: extractComponentNames(f.content || '') }));
  }, [files]);

  return (
    <div className="p-2">
      <div className="mb-2 font-semibold">Components</div>
      {list.map(({ file, components }) => (
        <div key={file.id} className="mb-3">
          <div className="text-sm font-medium">{file.title}</div>
          {components.length ? (
            <ul className="text-sm mt-1 space-y-1">
              {components.map((c) => (
                <li key={c}>
                  <button className="text-left text-xs text-sky-600 hover:underline" onClick={() => onOpen(file.path)}>{c}</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-muted-foreground">No components detected</div>
          )}
        </div>
      ))}
    </div>
  );
}
