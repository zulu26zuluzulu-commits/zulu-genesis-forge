import { SettingsToggleItem } from "../components/SettingsToggleItem";
import React from "react";

const sections = [
  { label: "Project", options: [
    { label: "Project Settings", checked: true },
    { label: "Domains", checked: false },
    { label: "Analytics", checked: false },
  ]},
  { label: "Workspace", options: [] },
  { label: "Account", options: [] },
  { label: "Connections", options: [] },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = React.useState("Project");
  return (
    <div className="flex h-full">
      <aside className="w-64 border-r bg-muted/10 p-6">
        <nav>
          {sections.map(s => (
            <div
              key={s.label}
              className={`cursor-pointer py-2 px-4 rounded ${activeSection === s.label ? 'bg-primary/10 font-bold' : ''}`}
              onClick={() => setActiveSection(s.label)}
            >
              {s.label}
            </div>
          ))}
        </nav>
      </aside>
      <section className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">{activeSection}</h2>
        <ul>
          {sections.find(s => s.label === activeSection)?.options.map(opt => (
            <li key={opt.label} className="mb-2">
              <SettingsToggleItem label={opt.label} checked={opt.checked} onChange={() => {}} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
