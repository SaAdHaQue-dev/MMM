import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, FamilySide } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  familySide: FamilySide;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole, familySide?: FamilySide) => Promise<void>;
  signup: (email: string, password?: string, fullName?: string, role?: UserRole, familySide?: FamilySide) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('wedding_admin');
  const [familySide, setFamilySide] = useState<FamilySide>('groom');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const profile = await authService.getProfile(session.user.id);
            setUser({
              id: session.user.id,
              fullName: profile?.full_name || session.user.user_metadata?.full_name || session.user.email || 'Wedding Member',
              phone: profile?.phone || session.user.user_metadata?.phone,
              avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
              createdAt: profile?.created_at || session.user.created_at,
            });
            const savedRole = localStorage.getItem('mmm_user_role') as UserRole;
            const savedSide = localStorage.getItem('mmm_family_side') as FamilySide;
            if (savedRole) setRole(savedRole);
            if (savedSide) setFamilySide(savedSide);
            return;
          }
        }

        // Restore demo user if previously logged in via demo mode
        const demoUser = localStorage.getItem('mmm_demo_user');
        if (demoUser && isMounted) {
          try {
            setUser(JSON.parse(demoUser));
            const savedRole = localStorage.getItem('mmm_user_role') as UserRole;
            const savedSide = localStorage.getItem('mmm_family_side') as FamilySide;
            if (savedRole) setRole(savedRole);
            if (savedSide) setFamilySide(savedSide);
          } catch {
            localStorage.removeItem('mmm_demo_user');
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializeSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          setUser({
            id: session.user.id,
            fullName: profile?.full_name || session.user.user_metadata?.full_name || session.user.email || 'Wedding Member',
            phone: profile?.phone || session.user.user_metadata?.phone,
            avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
            createdAt: profile?.created_at || session.user.created_at,
          });
        } else {
          // If no active supabase session and no demo user, log out
          if (!localStorage.getItem('mmm_demo_user')) {
            setUser(null);
          }
        }
        setIsLoading(false);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    email: string,
    password?: string,
    customRole: UserRole = 'wedding_admin',
    customSide: FamilySide = 'groom'
  ) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && password && password.length >= 6) {
        try {
          const res = await authService.signIn(email, password);
          if (res.user) {
            const profile = await authService.getProfile(res.user.id);
            setUser({
              id: res.user.id,
              fullName: profile?.full_name || res.user.user_metadata?.full_name || email.split('@')[0],
              phone: profile?.phone || res.user.user_metadata?.phone,
              avatarUrl: profile?.avatar_url || res.user.user_metadata?.avatar_url,
              createdAt: profile?.created_at || res.user.created_at,
            });
            setRole(customRole);
            setFamilySide(customSide);
            localStorage.setItem('mmm_user_role', customRole);
            localStorage.setItem('mmm_family_side', customSide);
            localStorage.removeItem('mmm_demo_user');
            return;
          }
        } catch (e: any) {
          // If email is not confirmed in Supabase Auth, allow developer preview session
          if (e?.message?.toLowerCase().includes('email not confirmed')) {
            console.warn('Supabase email not confirmed, allowing dev preview access');
          } else {
            throw e;
          }
        }
      }

      // Demo login
      const demoUser: Profile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        fullName: email.split('@')[0].toUpperCase(),
        createdAt: new Date().toISOString(),
      };
      setUser(demoUser);
      setRole(customRole);
      setFamilySide(customSide);
      localStorage.setItem('mmm_demo_user', JSON.stringify(demoUser));
      localStorage.setItem('mmm_user_role', customRole);
      localStorage.setItem('mmm_family_side', customSide);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password?: string,
    fullName?: string,
    customRole: UserRole = 'wedding_admin',
    customSide: FamilySide = 'groom'
  ) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && password && password.length >= 6) {
        const res = await authService.signUp(email, password, fullName || email.split('@')[0]);
        if (res.user) {
          setUser({
            id: res.user.id,
            fullName: fullName || email.split('@')[0],
            createdAt: res.user.created_at,
          });
          setRole(customRole);
          setFamilySide(customSide);
          localStorage.setItem('mmm_user_role', customRole);
          localStorage.setItem('mmm_family_side', customSide);
          localStorage.removeItem('mmm_demo_user');
          return;
        }
      }

      // Demo signup
      const demoUser: Profile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        fullName: fullName || email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      setUser(demoUser);
      setRole(customRole);
      setFamilySide(customSide);
      localStorage.setItem('mmm_demo_user', JSON.stringify(demoUser));
      localStorage.setItem('mmm_user_role', customRole);
      localStorage.setItem('mmm_family_side', customSide);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        try {
          await authService.signOut();
        } catch (e) {
          console.warn('Sign out warning:', e);
        }
      }
      setUser(null);
      localStorage.removeItem('mmm_demo_user');
      localStorage.removeItem('mmm_user_role');
      localStorage.removeItem('mmm_family_side');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        familySide,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
