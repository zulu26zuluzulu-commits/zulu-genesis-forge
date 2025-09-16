import React, { useEffect, useRef, useState } from 'react';
import { AIMessage } from '@/types';

export default function AIChat({ messages, sendMessage, isStreaming }: { messages: AIMessage[]; sendMessage: (text: string) => void; isStreaming: boolean; }) {
  const [input, setInput] = useState('');
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      // smooth scroll to bottom
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // ignore
    }
  };

  const quickPrompts = [
    'Summarize this file',
    'Find potential bugs',
    'Suggest performance improvements',
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b">
        <div className="flex gap-2">
          {quickPrompts.map((q) => (
            <button key={q} className="px-2 py-1 text-sm border rounded bg-slate-50" onClick={() => sendMessage(q)}>{q}</button>
          ))}
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-3 bg-gradient-to-b from-transparent to-transparent">
        {messages.map(m => (
          <div key={m.id} className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${m.role === 'assistant' ? 'bg-purple-600 text-white' : 'bg-gray-300 text-black'}`}>
                {m.role === 'assistant' ? 'Z' : 'Y'}
              </div>
            </div>
            <div className="flex-1">
              <div className={`p-3 rounded-lg ${m.role === 'assistant' ? 'bg-slate-800 text-white' : 'bg-white text-black'} shadow-sm`}> 
                <div className="text-xs text-muted mb-1 flex items-center justify-between">
                  <div>{m.role} • {new Date(m.createdAt).toLocaleTimeString()}</div>
                  <div className="flex gap-2">
                    <button title="Copy" className="text-xs opacity-70" onClick={() => copy(m.text)}>Copy</button>
                    <button title="Pin" className="text-xs opacity-70" onClick={() => setPinned((p) => ({ ...p, [m.id]: !p[m.id] }))}>{pinned[m.id] ? 'Unpin' : 'Pin'}</button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              {pinned[m.id] && <div className="mt-1 text-xs text-yellow-600">📌 Pinned</div>}
            </div>
          </div>
        ))}

        {isStreaming && <div className="text-sm text-muted">● streaming...</div>}
      </div>

      <div className="p-2 border-t">
        <div className="flex gap-2">
          <input aria-label="AI message" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 border rounded px-2 py-2" placeholder="Ask Zulu AI..." onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              sendMessage(input.trim());
              setInput('');
            }
          }} />
          <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => {
            if (!input.trim()) return;
            sendMessage(input.trim());
            setInput('');
          }}>Send</button>
        </div>
      </div>
    </div>
  );
}
