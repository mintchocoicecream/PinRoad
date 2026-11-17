import { create } from 'zustand';

export type ThemeColor = 'indigo' | 'emerald' | 'amber' | 'rose';

interface SettingsState {
  themeColor: ThemeColor;
  isMapShared: boolean;
  setThemeColor: (color: ThemeColor) => void;
  toggleMapShare: () => void;
  isSidebarPinned: boolean;
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
  const selected = themeMap[color];
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--theme-primary', selected.primary);
    document.documentElement.style.setProperty('--theme-primary-hover', selected.hover);
  }
};

// 초기값 로드 및 즉시 DOM 적용
const getStoredTheme = (): ThemeColor => {
  const saved = (localStorage.getItem('pinroad_theme') as ThemeColor) || 'indigo';
  applyThemeToDOM(saved); // 앱 로드 시점 즉시 적용
  return saved;
};

const getStoredMapShare = (): boolean => {
  const saved = localStorage.getItem('pinroad_map_shared');
  return saved !== null ? JSON.parse(saved) : true;
};

const getStoredSidebarPin = (): boolean => {
  const saved = localStorage.getItem('pinroad_sidebar_pinned');
  return saved !== null ? JSON.parse(saved) : true; // 기본값은 고정됨(true)
};

export const useSettingsStore = create<SettingsState>((set) => ({
  themeColor: getStoredTheme(),
  isMapShared: getStoredMapShare(),
  isSidebarPinned: getStoredSidebarPin(),

  setThemeColor: (color) => {
    applyThemeToDOM(color);
    localStorage.setItem('pinroad_theme', color);
    set({ themeColor: color });
  },

  toggleMapShare: () => set((state) => {
    const nextState = !state.isMapShared;
    localStorage.setItem('pinroad_map_shared', JSON.stringify(nextState));
    return { isMapShared: nextState };
  }),

  toggleSidebarPin: () => set((state) => {
    const nextState = !state.isSidebarPinned;
    localStorage.setItem('pinroad_sidebar_pinned', JSON.stringify(nextState));
    return { isSidebarPinned: nextState };
  }),
}));