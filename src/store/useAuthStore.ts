import { create } from 'zustand';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfileData {
  user_name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
}

interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  profile: UserProfileData | null;
  isLoading: boolean;
  initializeAuth: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: SupabaseUser | null) => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,

  initializeAuth: () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      set({
        session,
        user,
        isLoading: false,
      });
      if (user) {
        get().fetchProfile();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      set({
        session,
        user,
        isLoading: false,
      });
      if (user) {
        get().fetchProfile();
      } else {
        set({ profile: null });
      }
    });

    return () => subscription.unsubscribe();
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google 로그인 에러:', error.message);
      throw error;
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 에러:', error.message);
      throw error;
    }
    set({ user: null, session: null, profile: null });
  },

  setUser: (user) => set({ user }),

  fetchProfile: async () => {
    const user = get().user;
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_name, avatar_url, email')
        .eq('email', user.email)
        .single();

      if (!error && data) {
        set({ profile: data });
      }
    } catch (err) {
      console.error('프로필 스토어 동기화 실패:', err);
    }
  },
}));