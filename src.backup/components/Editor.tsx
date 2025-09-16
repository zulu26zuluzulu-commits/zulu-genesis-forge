import Editor from "@monaco-editor/react";

export function CodeEditor({ value = "", onChange = (v: any) => {} }) {
  return (
    <Editor
      height="100%"
      language="typescript"
      theme="vs-dark"
      value={value}
      onChange={onChange}
      options={{ fontSize: 16, minimap: { enabled: false }, automaticLayout: true }}
    />
  );
}
