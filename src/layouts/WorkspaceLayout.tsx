import React from 'react';
import { useProject } from '@/hooks/useProject';
import { useAI } from '@/hooks/useAI';
import { isClaudeEnabled, setLocalClaudeEnabled, requestEnableClaudeForAll } from '@/lib/aiConfig';
import { FileExplorer } from '@/components/FileExplorer';
import { PagesView } from '@/components/PagesView';
import { ComponentsView } from '@/components/ComponentsView';
import { CodeEditor } from '@/components/Editor';
import { CommandPalette } from '@/components/CommandPalette';
import { MobileTopBar } from '@/components/MobileTopBar';
import { MobileSidebarDrawer } from '@/components/MobileSidebarDrawer';
import { MobileRightSheet } from '@/components/MobileRightSheet';
import AIChat from '@/components/AIChat';

export function WorkspaceLayout() {
  const project = useProject();
  const ai = useAI();
  const [isPaletteOpen, setIsPaletteOpen] = React.useState(false);
  const [rightTab, setRightTab] = React.useState<'preview' | 'ai' | 'terminal' | 'deploy'>('preview');
  const [leftTab, setLeftTab] = React.useState<'explorer' | 'pages' | 'components' | 'settings'>('explorer');
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [mobileRightOpen, setMobileRightOpen] = React.useState(false);
  const [aiUnread, setAiUnread] = React.useState(0);

  // When AI messages change, increase unread counter and optionally switch to AI view
  React.useEffect(() => {
    if (!ai.messages || ai.messages.length === 0) return;
    // If last message is from assistant, mark unread and switch if streaming
    const last = ai.messages[ai.messages.length - 1];
    if (last.role === 'assistant') {
      setAiUnread((n) => n + 1);
      if (rightTab !== 'ai') {
        setRightTab('ai');
      }
    }
  }, [ai.messages]);

  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Mobile top bar */}
      <MobileTopBar onOpenSidebar={() => setMobileSidebarOpen(true)} onOpenRight={() => setMobileRightOpen(true)} onOpenPalette={() => setIsPaletteOpen(true)} />
      <MobileSidebarDrawer open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
        <div className="mb-2 font-semibold">Project</div>
        <div className="space-y-1">
          <button className="w-full text-left" onClick={() => setLeftTab('explorer')}>Explorer</button>
          <button className="w-full text-left" onClick={() => setLeftTab('pages')}>Pages</button>
          <button className="w-full text-left" onClick={() => setLeftTab('components')}>Components</button>
          <button className="w-full text-left" onClick={() => setLeftTab('settings')}>Settings</button>
        </div>
      </MobileSidebarDrawer>
      <MobileRightSheet open={mobileRightOpen} onClose={() => setMobileRightOpen(false)}>
        <div className="p-2">
          <div className="flex gap-2 mb-2">
            <button onClick={() => { setRightTab('preview'); setAiUnread(0); setMobileRightOpen(true); }} className={rightTab === 'preview' ? 'font-bold' : ''}>Preview</button>
            <button onClick={() => { setRightTab('ai'); setAiUnread(0); setMobileRightOpen(true); }} className={rightTab === 'ai' ? 'font-bold' : ''}>Zulu AI</button>
          </div>
          {rightTab === 'preview' && <div><iframe title="preview-mobile" className="w-full h-64 border-0" srcDoc={project.activeFile?.content || '<h1>Preview</h1>'} /></div>}
          {rightTab === 'ai' && <div>Zulu AI (mobile)</div>}
        </div>
      </MobileRightSheet>
      <aside className="w-64 border-r p-2">
        <div className="mb-2 font-semibold">Project</div>
        <div className="space-y-1">
          <button className="w-full text-left" onClick={() => {}}>
            Explorer
          </button>
          <button className="w-full text-left" onClick={() => {}}>
            Pages
          </button>
          <button className="w-full text-left" onClick={() => {}}>
            Components
          </button>
          <button className="w-full text-left" onClick={() => {}}>
            Settings
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          <div className="w-80 border-r overflow-auto">
            {leftTab === 'explorer' && (
              <FileExplorer files={project.files} onOpen={(p) => {
                const f = project.files.find(x => x.path === p);
                if (f) project.openFile(f.id);
              }} />
            )}
            {leftTab === 'pages' && (
              <PagesView files={project.files} onOpen={(path) => {
                const f = project.files.find(x => x.path === path);
                if (f) {
                  project.openFile(f.id);
                  setRightTab('preview');
                }
              }} />
            )}
            {leftTab === 'components' && (
              <ComponentsView files={project.files} onOpen={(path) => {
                const f = project.files.find(x => x.path === path);
                if (f) project.openFile(f.id);
              }} />
            )}
            {leftTab === 'settings' && (
              <div className="p-2">Project Settings (coming soon)</div>
            )}
          </div>

          <div className="flex-1">
            <div className="h-full">
              <CodeEditor
                value={project.activeFile?.content || ''}
                onChange={(v) => { if (project.activeFile) project.updateFile(project.activeFile.id, { content: v || '' }); }}
              />
            </div>
          </div>

          <aside className="w-96 border-l flex flex-col">
            <div className="p-2 border-b">
              <div className="flex items-center gap-2">
                <button onClick={() => { setRightTab('preview'); setAiUnread(0); }} className={rightTab === 'preview' ? 'font-bold' : ''}>Preview</button>
                <button onClick={() => { setRightTab('ai'); setAiUnread(0); }} className={rightTab === 'ai' ? 'font-bold' : ''}>
                  Zulu AI {aiUnread > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-2 text-xs">{aiUnread}</span>}
                </button>
                <div className="ml-auto flex gap-1">
                  <button onClick={() => setRightTab('terminal')} className={rightTab === 'terminal' ? 'font-bold' : ''}>Terminal</button>
                  <button onClick={() => setRightTab('deploy')} className={rightTab === 'deploy' ? 'font-bold' : ''}>Deploy</button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {rightTab === 'preview' && (
                <iframe title="preview" className="w-full h-full border-0" srcDoc={project.activeFile?.content || '<h1>Preview</h1>'} />
              )}
              {rightTab === 'ai' && (
                <div className="h-full flex flex-col">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm">Model: {isClaudeEnabled() ? 'Claude Sonnet 3.5 (enabled)' : 'Zulu Simulated'}</div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded text-sm" onClick={() => {
                        const next = !isClaudeEnabled();
                        setLocalClaudeEnabled(next);
                        window.location.reload();
                      }}>{isClaudeEnabled() ? 'Disable' : 'Enable'} (local)</button>
                      <button className="px-2 py-1 border rounded text-sm" onClick={async () => {
                        try {
                          const r = await requestEnableClaudeForAll();
                          if (r.ok) {
                            alert('Requested enabling Claude for all clients. Backend must apply the change.');
                          } else {
                            alert('Request failed: ' + r.statusText);
                          }
                        } catch (e) {
                          alert('Request failed: ' + String(e));
                        }
                      }}>Enable for all (admin)</button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <AIChat messages={ai.messages} sendMessage={(t) => { ai.sendMessage(t); setAiUnread(0); }} isStreaming={ai.isStreaming} />
                  </div>
                </div>
              )}
              {rightTab === 'terminal' && (
                <div>Terminal (placeholder)</div>
              )}
              {rightTab === 'deploy' && (
                <div>Deployments (placeholder)</div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <CommandPalette open={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} files={project.files.map(f => ({ path: f.path, title: f.title }))} onOpenFile={(p) => {
        const f = project.files.find(x => x.path === p);
        if (f) project.openFile(f.id);
      }} onCreateFile={(name) => project.createFile(name)} />
    </div>
  );
}
