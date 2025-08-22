export const AfricaIcon = ({ className }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="currentColor"
    >
      {/* Africa continent - proper silhouette */}
      <path d="M45 10 
        C48 8 52 8 55 10
        C58 12 60 15 62 18
        C64 21 65 25 67 28
        C68 32 69 36 70 40
        C71 44 72 48 73 52
        L74 58
        C75 62 76 66 76 70
        C76 74 75 78 74 82
        C73 85 71 88 68 90
        C65 92 61 93 57 94
        C53 95 49 95 45 94
        C41 93 37 91 34 88
        C31 85 29 81 27 77
        C25 73 24 69 23 65
        C22 60 21 55 21 50
        C21 45 22 40 23 35
        C24 30 26 26 28 22
        C30 18 33 15 36 12
        C39 10 42 9 45 10 Z"/>
      {/* Madagascar island */}
      <ellipse cx="77" cy="70" rx="1.5" ry="5" />
      {/* Small notch for West Africa coastline */}
      <path d="M32 65 C30 67 30 70 32 72 L34 70 C33 68 32 66 32 65 Z"/>
    </svg>
  );
};