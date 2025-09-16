import { useCallback, useState } from 'react';
import { AIMessage } from '@/types';
import { isClaudeEnabled } from '@/lib/aiConfig';

export function useAI() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (text: string, context?: { files?: { path: string; title?: string }[] }) => {
    const id = `${Date.now()}`;
    const userMsg: AIMessage = { id: `${id}-u`, role: 'user', text, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);

    // If Claude Sonnet is enabled via env or local flag, attempt to call the backend
    if (isClaudeEnabled()) {
      setIsStreaming(true);
      try {
        const resp = await fetch('/api/ai/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text, context }),
        });
        if (!resp.ok) throw new Error('Claude API error');
        // assume JSON { text: string }
        const j = await resp.json();
        const assistantId = `${id}-a`;
        setMessages((m) => [...m, { id: assistantId, role: 'assistant', text: j.text || String(j), createdAt: new Date().toISOString() }]);
      } catch (e) {
        // fallback to simulated streaming assistant on error
        const assistantId = `${id}-a`;
        let acc = '';
        const chunk = 'Claude request failed, falling back to simulated Zulu AI. ';
        if (context?.files && context.files.length) {
          acc += `\nProject files: ${context.files.slice(0,5).map(f=>f.path).join(', ')}\n`;
        }
        for (let i = 0; i < 3; i++) {
          await new Promise((r) => setTimeout(r, 200));
          acc += chunk;
          setMessages((m) => {
            const without = m.filter((x) => x.id !== assistantId);
            return [...without, { id: assistantId, role: 'assistant', text: acc, createdAt: new Date().toISOString() }];
          });
        }
      } finally {
        setIsStreaming(false);
      }

      return;
    }

    // Default: Simulate streaming assistant response
    setIsStreaming(true);
    const assistantId = `${id}-a`;
    let acc = '';
    const chunk = 'This is a simulated streaming response from Zulu AI. ';
    // Attach short project context if available
    if (context?.files && context.files.length) {
      acc += `\nProject files: ${context.files.slice(0,5).map(f=>f.path).join(', ')}\n`;
    }
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 200));
      acc += chunk;
      setMessages((m) => {
        const without = m.filter((x) => x.id !== assistantId);
        return [...without, { id: assistantId, role: 'assistant', text: acc, createdAt: new Date().toISOString() }];
      });
    }
    setIsStreaming(false);
  }, []);

  return { messages, sendMessage, isStreaming };
}
