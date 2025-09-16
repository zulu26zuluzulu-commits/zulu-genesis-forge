import React from 'react';

export function MobileTopBar({ onOpenSidebar, onOpenRight, onOpenPalette }: { onOpenSidebar: () => void; onOpenRight: () => void; onOpenPalette: () => void; }) {
  return (
    <div className="flex items-center justify-between p-2 border-b lg:hidden">
      <button aria-label="Open sidebar" className="p-2" onClick={onOpenSidebar}>
        ☰
      </button>
      <div className="flex-1 text-center font-semibold">Zulu Workspace</div>
      <div className="flex items-center gap-2">
        <button aria-label="Command palette" className="p-2" onClick={onOpenPalette}>⌘</button>
        <button aria-label="Open right panel" className="p-2" onClick={onOpenRight}>⋯</button>
      </div>
    </div>
  );
}
