import { FileCode2, Search, GitBranch, Settings, MessageSquare } from "lucide-react";

export function Sidebar({ active, onSelect }) {
  const items = [
    { icon: <FileCode2 />, label: "Files" },
    { icon: <Search />, label: "Search" },
    { icon: <GitBranch />, label: "Version Control" },
    { icon: <Settings />, label: "Settings" },
    { icon: <MessageSquare />, label: "AI Chat" },
  ];
  return (
    <nav className="flex flex-col w-[60px] h-full bg-muted/20 border-r">
      {items.map(item => (
        <button
          key={item.label}
          className={`flex flex-col items-center py-4 hover:bg-primary/10 ${active === item.label ? 'bg-primary/10 font-bold' : ''}`}
          onClick={() => onSelect(item.label)}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
