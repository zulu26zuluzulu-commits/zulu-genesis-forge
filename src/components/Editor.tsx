import React, { useRef, useState, Suspense } from "react";
import type { OnMount } from "@monaco-editor/react";

// Lazy-load the heavy Monaco editor bundle so mobile fallback stays lightweight
const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

type CodeEditorProps = {
  value?: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  onSave?: (value: string) => void;
  onDirty?: (isDirty: boolean) => void;
  readOnly?: boolean;
  fontSize?: number;
};

export function CodeEditor({
  value = "",
  language = "typescript",
  onChange = () => {},
  onSave,
  onDirty,
  readOnly = false,
  fontSize = 14,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const dirtyRef = useRef(false);
  const saveTimer = useRef<number | null>(null as any);
  const lastValueRef = useRef<string>(value);
  const [useFullEditor, setUseFullEditor] = useState(false);

  const isMobile = typeof window !== 'undefined' ? window.matchMedia && window.matchMedia('(max-width: 640px)').matches : false;

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Better editor defaults
    editor.updateOptions({
      fontSize,
      minimap: { enabled: true },
      automaticLayout: true,
      glyphMargin: true,
      folding: true,
      wordWrap: 'off',
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      formatOnType: true,
      formatOnPaste: true,
      tabSize: 2,
      renderLineHighlight: 'all',
    });

    // Ctrl/Cmd+S => save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave(editor.getValue());
    });
  };

  // Watch for external value changes
  React.useEffect(() => {
    lastValueRef.current = value;
  }, [value]);

  // Debounced autosave when content changes locally
  const handleLocalChange = (v?: string) => {
    if (v === undefined) return;
    if (lastValueRef.current === v) return;
    lastValueRef.current = v;
    // mark dirty
    if (onDirty) onDirty(true);
    dirtyRef.current = true;

    // debounce save
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      if (onSave) onSave(v);
      dirtyRef.current = false;
      if (onDirty) onDirty(false);
      saveTimer.current = null;
    }, 1000);
  };

  // Mobile fallback: lightweight textarea and a button to load full editor lazily
  if (isMobile && !useFullEditor) {
    return (
      <div className="p-2 h-full flex flex-col">
        <textarea
          aria-label="Code editor (mobile)"
          className="flex-1 w-full p-2 border rounded resize-none font-mono"
          value={value}
          onChange={(e) => {
            handleLocalChange(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
        />
        <div className="mt-2 flex gap-2">
          <button className="px-3 py-1 border rounded" onClick={() => setUseFullEditor(true)}>Open full editor</button>
          <button className="px-3 py-1 border rounded" onClick={() => { if (onSave) onSave(value); }}>Save</button>
        </div>
      </div>
    );
  }
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading editor...</div>}>
      <MonacoEditor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(v) => {
          handleLocalChange(v);
          if (onChange) onChange(v);
        }}
        onMount={handleMount as any}
        onValidate={() => {}}
        options={{
          readOnly,
          fontSize,
          minimap: { enabled: true, showSlider: 'mouseover' },
          automaticLayout: true,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
        }}
      />
    </Suspense>
  );
}
