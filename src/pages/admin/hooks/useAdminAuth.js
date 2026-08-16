import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../../utils/supabaseClient';

export function useAdminAuth() {
  const [session, setSession] = useState(null);
  const [initLoading, setInitLoading] = useState(true);

  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);
  const [authError, setAuthError] = useState(null);

  const verifyAdminAccess = async (currentSession) => {
    if (!currentSession) return;
    
    const { data, error } = await supabase
      .from('allowed_admins')
      .select('*')
      .eq('email', currentSession.user.email)
      .maybeSingle();

    if (error || !data) {
      await supabase.auth.signOut();
      setSession(null);
      setAuthError("This account is not authorized for admin access.");
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setInitLoading(false);
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitLoading(false);
      verifyAdminAccess(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      verifyAdminAccess(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuth(e) {
    e.preventDefault();
    if (!email || !password) return;

    setAuthLoading(true);
    setAuthMessage(null);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    setAuthMessage(null);
    setAuthError(null);

    try {
      const { data, error: checkError } = await supabase
        .from('allowed_admins')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (checkError || !data) {
        throw new Error('This email is not authorized. Contact an existing admin to be whitelisted first.');
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      setAuthMessage('Signup successful! If email confirmation is enabled, please check your inbox to confirm your email before logging in.');
    } catch (err) {
      setAuthError(err.message || 'Signup failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return {
    session,
    initLoading,
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    authLoading,
    authMessage,
    authError,
    handleAuth,
    handleSignUp,
    handleLogout
  };
}
