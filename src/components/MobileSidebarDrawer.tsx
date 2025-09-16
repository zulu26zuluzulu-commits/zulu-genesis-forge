import React from 'react';

export function MobileSidebarDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;

  let startX = 0;
  let currentX = 0;
  const threshold = 80; // px to trigger close

  const onTouchStart = (e: React.TouchEvent) => {
    startX = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    currentX = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    if (currentX - startX > threshold) {
      onClose();
    }
    startX = 0;
    currentX = 0;
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute left-0 top-0 bottom-0 w-80 bg-background p-3 shadow" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <button onClick={onClose} className="mb-2">Close</button>
        <div className="overflow-auto h-full">{children}</div>
      </aside>
    </div>
  );
}
