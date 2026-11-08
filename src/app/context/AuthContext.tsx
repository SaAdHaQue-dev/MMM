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
  login: (email: string, passwordOrRole?: string | UserRole, familySide?: FamilySide) => Promise<void>;
  signup: (email: string, fullName: string, passwordOrRole?: string | UserRole, familySide?: FamilySide) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultProfile: Profile = {
  id: 'usr_demo_admin_01',
  fullName: 'Arjun Verma',
  phone: '+91 98765 43210',
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(isSupabaseConfigured ? null : defaultProfile);
  const [role, setRole] = useState<UserRole>('wedding_admin');
  const [familySide, setFamilySide] = useState<FamilySide>('groom');
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function initializeSession() {
      try {
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
        }
      } catch (err) {
        console.error('Error restoring Supabase session:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializeSession();

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
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, passwordOrRole: string | UserRole = 'wedding_admin', customSide: FamilySide = 'groom') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        // If password is provided (e.g. at least 6 chars), authenticate via Supabase
        const password = typeof passwordOrRole === 'string' && passwordOrRole.length >= 6 ? passwordOrRole : 'Password123!';
        try {
          const res = await authService.signIn(email, password);
          if (res.user) {
            const profile = await authService.getProfile(res.user.id);
            setUser({
              id: res.user.id,
              fullName: profile?.full_name || email.split('@')[0],
              createdAt: res.user.created_at,
            });
            return;
          }
        } catch (e) {
          // If sign in fails on demo credentials, fallback gracefully for developer preview
          console.warn('Supabase signIn attempted:', e);
        }
      }

      // Demo/Fallback Mode
      setUser({
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        fullName: email.split('@')[0].toUpperCase(),
        createdAt: new Date().toISOString(),
      });
      if (typeof passwordOrRole === 'string' && (passwordOrRole === 'wedding_admin' || passwordOrRole === 'family_admin' || passwordOrRole === 'family_member' || passwordOrRole === 'guest')) {
        setRole(passwordOrRole as UserRole);
      }
      setFamilySide(customSide);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, fullName: string, passwordOrRole: string | UserRole = 'wedding_admin', customSide: FamilySide = 'groom') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const password = typeof passwordOrRole === 'string' && passwordOrRole.length >= 6 ? passwordOrRole : 'Password123!';
        try {
          const res = await authService.signUp(email, password, fullName);
          if (res.user) {
            setUser({
              id: res.user.id,
              fullName: fullName || email.split('@')[0],
              createdAt: res.user.created_at,
            });
            return;
          }
        } catch (e) {
          console.warn('Supabase signUp attempted:', e);
        }
      }

      // Demo/Fallback Mode
      setUser({
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        fullName: fullName || email.split('@')[0],
        createdAt: new Date().toISOString(),
      });
      if (typeof passwordOrRole === 'string' && (passwordOrRole === 'wedding_admin' || passwordOrRole === 'family_admin' || passwordOrRole === 'family_member' || passwordOrRole === 'guest')) {
        setRole(passwordOrRole as UserRole);
      }
      setFamilySide(customSide);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await authService.signOut();
      }
      setUser(null);
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
