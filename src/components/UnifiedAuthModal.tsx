import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { GitHub, Google } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export function UnifiedAuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const { login, signup, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to go after login. Prefer location.state.from, then localStorage fallback.
  const getReturnPath = () => {
    // react-router v6 stores the origin path in state.from
    const stateAny = location.state as any;
    if (stateAny && stateAny.from) return stateAny.from.pathname || stateAny.from;
    const fallback = localStorage.getItem('returnPath');
    return fallback || '/workspace';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      // persist remember preference (frontend flag)
      try {
        if (rememberMe) localStorage.setItem('zulu_remember', '1');
        else localStorage.removeItem('zulu_remember');
      } catch {}

      onClose();
      const returnPath = getReturnPath();
      // Clear stored path once used
      localStorage.removeItem('returnPath');
      navigate(returnPath, { replace: true });
    } catch (err) {
      // Error handling is managed by useAuth hook
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setEmail('');
    setPassword('');
  };

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setMode('login');
    }
  }, [isOpen]);

  const [providerLoading, setProviderLoading] = useState<'github' | 'google' | null>(null);
  const [providerError, setProviderError] = useState<string | null>(null);

  const signInWithProvider = async (provider: 'github' | 'google') => {
    setProviderError(null);
    try {
      // Persist returnPath so the OAuth callback can navigate back
      try {
        const rp = getReturnPath();
        localStorage.setItem('returnPath', rp);
      } catch {}

      setProviderLoading(provider);

      // Start OAuth flow; Supabase may return a redirect URL
      const { data, error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) {
        console.error('OAuth sign-in error', error);
        setProviderError(error.message || 'OAuth sign-in failed');
        setProviderLoading(null);
        return;
      }

      // If a redirect URL is provided, go there.
      // Supabase may handle redirect automatically depending on configuration.
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('OAuth error', err);
      setProviderError(err instanceof Error ? err.message : String(err));
      setProviderLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-[425px] px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? 'Sign in to continue your development journey'
              : 'Join Zulu and start building amazing applications'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 py-3"
              onClick={() => signInWithProvider('github')}
              aria-label="Continue with GitHub"
              disabled={!!providerLoading}
            >
              {providerLoading === 'github' ? (
                <LoadingSpinner className="mr-2 h-4 w-4 inline-block" />
              ) : (
                <GitHub className="mr-2" />
              )}
              <span className="align-middle">Continue with GitHub</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 py-3"
              onClick={() => signInWithProvider('google')}
              aria-label="Continue with Google"
              disabled={!!providerLoading}
            >
              {providerLoading === 'google' ? (
                <LoadingSpinner className="mr-2 h-4 w-4 inline-block" />
              ) : (
                <Google className="mr-2" />
              )}
              <span className="align-middle">Continue with Google</span>
            </Button>
          </div>
          {providerError && (
            <div className="text-sm text-red-500">{providerError}</div>
          )}
          <div className="flex items-center justify-center text-sm text-muted-foreground">or use your email</div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="flex items-center gap-2">
            <input id="remember" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <Label htmlFor="remember">Remember me on this device</Label>
          </div>
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full py-3" disabled={isLoading || !!providerLoading}>
            {isLoading ? (
              <LoadingSpinner className="mr-2 h-4 w-4" />
            ) : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
          <div className="text-center text-sm">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
