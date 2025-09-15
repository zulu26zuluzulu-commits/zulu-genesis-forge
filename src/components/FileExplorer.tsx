export function FileExplorer({ files = [], onOpen }) {
  return (
    <div className="p-4">
      <ul>
        {files.map(file => (
          <li key={file.path} className="cursor-pointer hover:bg-muted/20 rounded px-2 py-1" onClick={() => onOpen(file.path)}>
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
