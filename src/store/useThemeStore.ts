import { create } from 'zustand';

type ThemeColor = 'indigo' | 'emerald' | 'amber' | 'rose';

interface ThemeState {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const themeMap = {
  indigo: { primary: '#4f46e5', hover: '#4338ca' },
  emerald: { primary: '#059669', hover: '#047857' },
  amber: { primary: '#d97706', hover: '#b45309' },
  rose: { primary: '#e11d48', hover: '#be123c' },
};

export const useThemeStore = create<ThemeState>((set) => ({
  themeColor: 'indigo',
  setThemeColor: (color) => {
    const selected = themeMap[color];
    // HTML 최상단(:root)의 CSS 변수 값을 동적으로 변경합니다
    document.documentElement.style.setProperty('--theme-primary', selected.primary);
    document.documentElement.style.setProperty('--theme-primary-hover', selected.hover);
    set({ themeColor: color });
  },
}));