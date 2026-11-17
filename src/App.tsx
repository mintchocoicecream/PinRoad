import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TravelMap } from './features/map/TravelMap';
import { useSettingsStore } from './store/useSettingsStore';
import { SettingsView } from './features/settings/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState('map');
  const { isSidebarPinned } = useSettingsStore();
  const [isHovered, setIsHovered] = useState(false);

  // 마우스가 화면 좌측 끝(0~30px)에 도달했을 때 감지
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 30) {
        setIsHovered(true);
      } else if (e.clientX > 280) {
        // 사이드바 너비(w-64 = 256px) 바깥으로 나가면 호버 해제
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 사이드바가 보여야 하는 조건: 1) 고정되어 있거나 OR 2) 고정 안 되었지만 좌측에 마우스를 올렸을 때
  const showSidebar = isSidebarPinned || isHovered;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 relative">
      {/* 💡 고정 해제 시 좌측 끝 감지용 투명 센서 영역 */}
      {!isSidebarPinned && !isHovered && (
        <div className="absolute top-0 left-0 w-3 h-full z-30" />
      )}

      {/* 💡 슬라이드 애니메이션이 적용되는 사이드바 */}
      <div
        className={`absolute top-0 left-0 h-full z-20 transition-transform duration-300 ease-in-out ${
          showSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>

      {/* 우측 메인 콘텐츠 영역 (사이드바 고정 여부에 따라 여백 조절) */}
      <main
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
          isSidebarPinned ? 'ml-64' : 'ml-0'
        }`}
      >
        {currentTab === 'map' && <TravelMap />}
        {currentTab === 'settings' && <SettingsView />}
        {currentTab !== 'map' && currentTab !== 'settings' && (
          <div className="flex-1 flex items-center justify-center bg-white p-8">
            <h2 className="text-2xl font-bold text-slate-700">
              [준비중] {currentTab} 화면입니다.
            </h2>
          </div>
        )}
      </main>
    </div>
  );
}