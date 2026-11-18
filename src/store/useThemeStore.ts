import { create } from 'zustand';

type ThemeColor = 'grape' | 'melon' | 'banana' | 'orange' | 'strawberry';

interface ThemeState {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const themeMap = {
  grape: { primary: '#4f46e5', hover: '#4338ca' },
  melon: { primary: '#059669', hover: '#047857' },
  banana: { primary: '#e7d724', hover: '#dbc818' },
  orange: { primary: '#d97706', hover: '#b45309' },
  strawberry: { primary: '#e11d48', hover: '#be123c' },
};

export const useThemeStore = create<ThemeState>((set) => ({
  themeColor: 'grape',
  setThemeColor: (color) => {
    const selected = themeMap[color];
    // HTML 최상단(:root)의 CSS 변수 값을 동적으로 변경합니다
    document.documentElement.style.setProperty('--theme-primary', selected.primary);
    document.documentElement.style.setProperty('--theme-primary-hover', selected.hover);
    set({ themeColor: color });
  },
}));