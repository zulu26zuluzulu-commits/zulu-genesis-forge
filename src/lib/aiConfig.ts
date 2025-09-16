export function isClaudeEnabled(): boolean {
  // runtime flag may be populated by fetchRuntimeConfig()
  if ((window as any).__ZULU_RUNTIME_AI_CONFIG && (window as any).__ZULU_RUNTIME_AI_CONFIG.enableClaude) {
    return true;
  }

  try {
    // Vite env variable (set in .env as VITE_ENABLE_CLAUDE_SONNET=true)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const v = (import.meta as any).env.VITE_ENABLE_CLAUDE_SONNET;
      if (v === 'true' || v === '1') return true;
    }
  } catch (e) {
    // ignore
  }

  try {
    const local = localStorage.getItem('enableClaudeSonnet');
    if (local === 'true') return true;
  } catch (e) {
    // ignore
  }

  return false;
}

export function setLocalClaudeEnabled(enabled: boolean) {
  try {
    localStorage.setItem('enableClaudeSonnet', enabled ? 'true' : 'false');
  } catch (e) {
    // ignore
  }
}

/**
 * Placeholder function that attempts to call an admin API to enable Claude Sonnet
 * for all clients. Real deployments should secure this endpoint behind auth and
 * only allow admins to call it. This function will return the fetch response
 * so callers can inspect success/failure.
 */
export async function requestEnableClaudeForAll(): Promise<Response> {
  // This is a best-effort placeholder. Replace with your backend admin API.
  return fetch('/api/admin/enable-claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enable: true }) });
}

export async function fetchRuntimeConfig(): Promise<any> {
  try {
    const resp = await fetch('/api/config');
    if (!resp.ok) return null;
    const j = await resp.json();
    // cache on window so client functions can read it synchronously
    (window as any).__ZULU_RUNTIME_AI_CONFIG = j;
    return j;
  } catch (e) {
    return null;
  }
}
