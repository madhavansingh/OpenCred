import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'student' | 'institution' | 'employer' | 'admin';

export interface UserProfile {
  id: string;
  userId: string;
  walletAddress?: string;
  did?: string;
  displayName?: string;
  avatarUrl?: string;
  roles: UserRole[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      const roles = (rolesData?.map(r => r.role) || ['student']) as UserRole[];

      setProfile({
        id: profileData.id,
        userId: profileData.user_id,
        walletAddress: profileData.wallet_address,
        did: profileData.did,
        displayName: profileData.display_name,
        avatarUrl: profileData.avatar_url,
        roles,
      });
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, displayName?: string) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });

    return { data, error };
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    return { error };
  }

  async function updateProfile(updates: {
    displayName?: string;
    walletAddress?: string;
    avatarUrl?: string;
  }) {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: updates.displayName,
        wallet_address: updates.walletAddress,
        avatar_url: updates.avatarUrl,
        did: updates.walletAddress ? `did:opencred:${updates.walletAddress.toLowerCase()}` : undefined,
      })
      .eq('user_id', user.id);

    if (!error && profile) {
      setProfile({
        ...profile,
        displayName: updates.displayName ?? profile.displayName,
        walletAddress: updates.walletAddress ?? profile.walletAddress,
        avatarUrl: updates.avatarUrl ?? profile.avatarUrl,
        did: updates.walletAddress ? `did:opencred:${updates.walletAddress.toLowerCase()}` : profile.did,
      });
    }

    return { error };
  }

  function hasRole(role: UserRole): boolean {
    return profile?.roles.includes(role) ?? false;
  }

  function isAuthenticated(): boolean {
    return !!user && !!session;
  }

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    hasRole,
    isAuthenticated,
  };
}
