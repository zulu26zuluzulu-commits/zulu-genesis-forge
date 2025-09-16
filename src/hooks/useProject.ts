import { useEffect, useState } from 'react';
import { ProjectFile } from '@/types';

const STORAGE_KEY = 'zulu.project.files';

export function useProject() {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ProjectFile[] = JSON.parse(raw);
        setFiles(parsed);
        if (parsed.length) setActiveFileId(parsed[0].id);
      } else {
        // seed with welcome
        const welcome: ProjectFile = {
          id: 'welcome',
          path: 'welcome.md',
          title: 'Welcome',
          content: '# Welcome to Zulu\n\nStart by creating a new page or opening the command palette (Cmd/Ctrl+K).',
        };
        setFiles([welcome]);
        setActiveFileId(welcome.id);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (e) {}
  }, [files]);

  function createFile(title: string, content = '') {
    const id = `${Date.now()}`;
    const file: ProjectFile = { id, path: `src/${title.replace(/\s+/g, '')}.tsx`, title: `${title}.tsx`, content };
    setFiles((f) => [...f, file]);
    setActiveFileId(id);
    return file;
  }

  function openFile(id: string) {
    const exists = files.find((f) => f.id === id);
    if (exists) setActiveFileId(id);
  }

  function updateFile(id: string, patch: Partial<ProjectFile>) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f)));
  }

  function deleteFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeFileId === id) setActiveFileId(null);
  }

  return {
    files,
    activeFile: files.find((f) => f.id === activeFileId) ?? null,
    createFile,
    openFile,
    updateFile,
    deleteFile,
  };
}
