export function Panel({ dock = "left", width = 250, children }) {
  const style = dock === "left"
    ? { width, minWidth: width, maxWidth: width }
    : { width, minWidth: width, maxWidth: width, marginLeft: "auto" };
  return (
    <aside className="bg-background border" style={style}>
      {children}
    </aside>
  );
}
