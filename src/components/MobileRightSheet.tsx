import React from 'react';

export function MobileRightSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;

  let startY = 0;
  let currentY = 0;
  const threshold = 80; // px to trigger close

  const onTouchStart = (e: React.TouchEvent) => {
    startY = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    currentY = e.touches[0].clientY;
  };
  const onTouchEnd = () => {
    if (startY - currentY > threshold) {
      // swipe up - ignore
    } else if (currentY - startY > threshold) {
      onClose();
    }
    startY = 0;
    currentY = 0;
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-lg p-3 max-h-[80%] overflow-auto touch-manipulation" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold">Panel</div>
          <button onClick={onClose} className="px-3 py-2">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
