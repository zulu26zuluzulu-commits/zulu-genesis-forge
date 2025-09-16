export function SettingsToggleItem({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-primary" />
      <span>{label}</span>
    </label>
  );
}
