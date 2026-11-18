import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type ThemeColor = 'indigo' | 'emerald' | 'amber' | 'rose';

interface SettingsState {
  themeColor: ThemeColor;
  isMapShared: boolean;
  isSidebarPinned: boolean; // 사이드바 고정 여부는 로컬 UI 상태이므로 로컬스토리지 유지 권장
  
  // 초기 데이터 로드 함수 (로그인 직후 호출 권장)
  initializeSettings: (userId: string) => Promise<void>;
  
  setThemeColor: (color: ThemeColor, userId?: string) => Promise<void>;
  toggleMapShare: (userId?: string) => Promise<void>;
  toggleSidebarPin: () => void;
}

const themeMap: Record<ThemeColor, { primary: string; hover: string }> = {
  indigo: { primary: '#4f46e5', hover: '#4338ca' },
  emerald: { primary: '#059669', hover: '#047857' },
  amber: { primary: '#d97706', hover: '#b45309' },
  rose: { primary: '#e11d48', hover: '#be123c' },
};

// 💡 DOM에 직접 CSS 변수를 주입하는 헬퍼 함수
const applyThemeToDOM = (color: ThemeColor) => {
  const selected = themeMap[color] || themeMap.indigo;
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--theme-primary', selected.primary);
    document.documentElement.style.setProperty('--theme-primary-hover', selected.hover);
  }
};

// 사이드바 고정 여부만 기존대로 로컬스토리지 활용 (개인 UI 편의성 영역)
const getStoredSidebarPin = (): boolean => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('pinroad_sidebar_pinned');
  return saved !== null ? JSON.parse(saved) : true;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  themeColor: 'indigo',
  isMapShared: false,
  isSidebarPinned: getStoredSidebarPin(),

  // 1. Supabase에서 사용자 설정 불러오기 (로그인 후 앱 진입 시 실행)
  initializeSettings: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('theme_color, is_map_shared')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('설정 불러오기 실패:', error.message);
        return;
      }

      if (data) {
        const loadedTheme = (data.theme_color as ThemeColor) || 'indigo';
        const loadedMapShare = data.is_map_shared ?? false;

        applyThemeToDOM(loadedTheme);
        set({
          themeColor: loadedTheme,
          isMapShared: loadedMapShare,
        });
      }
    } catch (err) {
      console.error('설정 초기화 중 예외 발생:', err);
    }
  },

// 2. 테마 색상 변경 및 Supabase 저장
  setThemeColor: async (color: ThemeColor, userId?: string) => {
    // UI 즉시 반영 (낙관적 업데이트)
    applyThemeToDOM(color);
    set({ themeColor: color });

    if (!userId) return;

    const { error } = await supabase
      .from('profiles')
      .update({ theme_color: color })
      .eq('id', userId);

    if (error) {
      console.error('테마 변경 Supabase 저장 실패:', error.message);
    }
  },

  // 3. 지도 공유 토글 및 Supabase 저장
  toggleMapShare: async (userId?: string) => {
    const nextState = !get().isMapShared;
    
    // UI 즉시 반영
    set({ isMapShared: nextState });

    if (!userId) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_map_shared: nextState })
      .eq('id', userId);

    if (error) {
      console.error('지도 공유 상태 Supabase 저장 실패:', error.message);
      // 실패 시 롤백 필요하다면 여기서 다시 반전 처리 가능
    }
  },

  // 4. 사이드바 고정 토글 (UI 전용이므로 기존대로 로컬스토리지 유지)
  toggleSidebarPin: () => set((state) => {
    const nextState = !state.isSidebarPinned;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pinroad_sidebar_pinned', JSON.stringify(nextState));
    }
    return { isSidebarPinned: nextState };
  }),
}));