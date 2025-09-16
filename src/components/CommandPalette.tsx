import React from 'react';
import Fuse from 'fuse.js';

export function CommandPalette({
  open,
  onClose,
  onOpenFile,
  onCreateFile,
  files = [],
}: {
  open: boolean;
  onClose: () => void;
  onOpenFile?: (path: string) => void;
  onCreateFile?: (name: string) => void;
  files?: { path: string; title?: string }[];
}) {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);


  const filtered = React.useMemo(() => {
    const q = query.trim();
    if (!q) return files;
    const fuse = new Fuse(files, { keys: ['title', 'path'], threshold: 0.4 });
    const res = fuse.search(q);
    return res.map(r => r.item);
  }, [files, query]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query, files]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, Math.max(0, filtered.length)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // If selectedIndex points at a file
        if (selectedIndex < filtered.length) {
          const f = filtered[selectedIndex];
          onClose();
          if (onOpenFile) onOpenFile(f.path);
        } else {
          // Create action
          onClose();
          if (onCreateFile) onCreateFile(query || 'NewFile');
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, selectedIndex, query, onClose, onOpenFile, onCreateFile]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="w-full max-w-2xl bg-popover border rounded shadow-lg">
        <div className="p-4 border-b">Command Palette — press Esc to close</div>
        <div className="p-4">
          <input
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="Type to search files or commands (e.g. 'open App')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="max-h-64 overflow-auto">
            {filtered.map((f, idx) => (
              <button
                key={f.path}
                className={`w-full text-left py-2 px-3 rounded ${selectedIndex === idx ? 'bg-muted/20' : 'hover:bg-muted/20'}`}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  onClose();
                  if (onOpenFile) onOpenFile(f.path);
                }}
              >
                {f.title ?? f.path}
              </button>
            ))}
            <div className="mt-2 border-t pt-2">
              <button
                className={`w-full text-left py-2 px-3 rounded ${selectedIndex === filtered.length ? 'bg-muted/20' : 'hover:bg-muted/20'}`}
                onClick={() => {
                  onClose();
                  if (onCreateFile) onCreateFile(query || 'NewFile');
                }}
                onMouseEnter={() => setSelectedIndex(filtered.length)}
              >
                Create new file "{query || 'NewFile'}"
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
