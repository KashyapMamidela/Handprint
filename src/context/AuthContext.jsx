import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('Failed to load profile', error);
      setProfile(null);
      return null;
    }
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      await fetchProfile(initialSession?.user?.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await fetchProfile(nextSession?.user?.id);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Returns the fresh profile row so callers (e.g. AdminLogin checking
  // `.role`) can act on it immediately, without waiting on the
  // onAuthStateChange listener above to catch up.
  const login = useCallback(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      return fetchProfile(data.session.user.id);
    },
    [fetchProfile]
  );

  // Returns the fresh profile on immediate sign-up (email confirmation off),
  // or `null` if Supabase requires email confirmation first (no session yet)
  // -- callers should treat `null` as "check your email", not an error.
  const signup = useCallback(
    async (name, email, password) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      if (!data.session) return null;
      setSession(data.session);
      return fetchProfile(data.session.user.id);
    },
    [fetchProfile]
  );

  // Redirects to Google; the page reloads on return with a session already
  // set, so there's nothing to return here -- onAuthStateChange picks it up.
  const loginWithGoogle = useCallback(() => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    login,
    signup,
    loginWithGoogle,
    signOut,
    refreshProfile: () => fetchProfile(session?.user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
