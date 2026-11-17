import React from 'react';
import { MapPin, Users, Folder, User, Settings, LogOut, LogIn, Pin } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { isLoggedIn, login, logout } = useAuthStore();
  const { isSidebarPinned, toggleSidebarPin } = useSettingsStore();

  const menuItems = [
    { id: 'map', label: '메인 화면', icon: MapPin },
    { id: 'friends', label: '친구 목록', icon: Users },
    { id: 'management', label: '장소 관리', icon: Folder },
    { id: 'profile', label: '프로필 관리', icon: User },
    { id: 'settings', label: '환경설정', icon: Settings },
  ];

  const handleTestLogin = () => {
    login({
      id: 'usr_123',
      email: 'angela.seo@example.com',
      name: 'Angela Seo',
    });
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shadow-lg">
      {/* 서비스 로고 & 고정(Pin) 버튼 */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/30">
            P
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
            PinRoad
          </span>
        </div>

        {/* 사이드바 고정 버튼 */}
        <button
          onClick={toggleSidebarPin}
          title={isSidebarPinned ? '사이드바 고정 해제' : '사이드바 고정'}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isSidebarPinned
              ? 'bg-primary text-white shadow-sm shadow-primary/30'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
        >
          <Pin className={`w-4 h-4 ${isSidebarPinned ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 p-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary/10 text-primary shadow-xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* 하단 로그인 / 로그아웃 버튼 */}
      <div className="p-4 border-t border-slate-100">
        {isLoggedIn ? (
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-rose-400" />
            로그아웃
          </button>
        ) : (
          <button
            onClick={handleTestLogin}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <LogIn className="w-5 h-5 text-primary" />
            로그인하기
          </button>
        )}
      </div>
    </aside>
  );
};