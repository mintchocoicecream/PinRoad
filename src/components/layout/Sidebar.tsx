import React from 'react';
import { 
  MapPin, 
  Users, 
  Folder, 
  User, 
  Settings, 
  Pin, 
  LogOut,
  LogIn 
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { isSidebarPinned, toggleSidebarPin, themeColor } = useSettingsStore();
  const { user, profile, signInWithGoogle, signOut } = useAuthStore(); // 💡 profile 추가

  const themeClasses: Record<string, { active: string; icon: string }> = {
    grape: { active: 'bg-indigo-50 text-indigo-600', icon: 'text-indigo-600 bg-indigo-50' },
    melon: { active: 'bg-emerald-50 text-emerald-600', icon: 'text-emerald-600 bg-emerald-50' },
    banana: { active: 'bg-yellow-50 text-yellow-600', icon: 'text-yellow-600 bg-yellow-50' },
    orange: { active: 'bg-amber-50 text-amber-600', icon: 'text-amber-600 bg-amber-50' },
    strawberry: { active: 'bg-rose-50 text-rose-600', icon: 'text-rose-600 bg-rose-50' },
  };

  const currentTheme = themeClasses[themeColor] || themeClasses.grape;

  const allMenuItems = [
    { id: 'map', label: '여행 지도', icon: MapPin },
    { id: 'places', label: '장소 관리', icon: Folder },
    { id: 'friends', label: '친구 목록', icon: Users },
    { id: 'profile', label: '프로필 관리', icon: User },
    { id: 'settings', label: '환경설정', icon: Settings },
  ];

  const menuItems = user 
    ? allMenuItems 
    : allMenuItems.filter((item) => item.id === 'map');

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200/80 flex flex-col select-none relative z-20 shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner transition-colors ${currentTheme.icon}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">PinRoad</h1>
            <p className="text-xs text-slate-400">나만의 여행 발자취</p>
          </div>
        </div>

        <button
          onClick={toggleSidebarPin}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isSidebarPinned
              ? currentTheme.active
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
          title={isSidebarPinned ? '사이드바 고정 해제' : '사이드바 고정'}
        >
          <Pin className={`w-4 h-4 transition-transform ${isSidebarPinned ? 'rotate-45' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? `${currentTheme.active} shadow-sm`
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <IconComponent className="w-5 h-5 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/40">
        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-2 py-1">
              {/* 💡 profiles 테이블의 avatar_url 우선 표시 */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm overflow-hidden ring-1 ring-slate-200 shrink-0 ${currentTheme.icon}`}>
                {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                  <img
                    src={profile?.avatar_url || user.user_metadata?.avatar_url}
                    alt="프로필 아바타"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (profile?.user_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                {/* 💡 profiles 테이블의 user_name 우선 표시 */}
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {profile?.user_name || user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={async () => {
                await signOut();
                setCurrentTab('map'); // 💡 로그아웃 시 무조건 여행 지도(메인) 탭으로 강제 이동
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200/80 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => signInWithGoogle()}
            className={`w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${currentTheme.active} hover:brightness-95`}
          >
            <LogIn className="w-4 h-4 shrink-0" />
            로그인하기
          </button>
        )}
      </div>
    </aside>
  );
};