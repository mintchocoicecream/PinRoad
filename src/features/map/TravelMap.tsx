import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { LogIn, Loader2 } from 'lucide-react';

export const TravelMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const hasInitializedRef = useRef<boolean>(false); // 💡 최초 1회만 위치를 찾도록 제어하는 플래그
  
  const [activeTab, setActiveTab] = useState<'my' | 'friends'>('my');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const { user, signInWithGoogle } = useAuthStore();
  const { themeColor } = useSettingsStore();

  const themeMap: Record<string, { activeBg: string; text: string; buttonBg: string; buttonHover: string; iconBg: string }> = {
    indigo: { activeBg: 'bg-indigo-600', text: 'text-indigo-600', buttonBg: 'bg-indigo-600', buttonHover: 'hover:bg-indigo-700', iconBg: 'bg-indigo-50 text-indigo-600' },
    emerald: { activeBg: 'bg-emerald-600', text: 'text-emerald-600', buttonBg: 'bg-emerald-600', buttonHover: 'hover:bg-emerald-700', iconBg: 'bg-emerald-50 text-emerald-600' },
    amber: { activeBg: 'bg-amber-600', text: 'text-amber-600', buttonBg: 'bg-amber-600', buttonHover: 'hover:bg-amber-700', iconBg: 'bg-amber-50 text-amber-600' },
    rose: { activeBg: 'bg-rose-600', text: 'text-rose-600', buttonBg: 'bg-rose-600', buttonHover: 'hover:bg-rose-700', iconBg: 'bg-rose-50 text-rose-600' },
  };

  const currentTheme = themeMap[themeColor] || themeMap.indigo;

  useEffect(() => {
    if (!mapRef.current) return;

    // 지도 인스턴스가 없을 때만 최초 1회 생성
    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = [37.5665, 126.9780]; 
      const defaultZoom = 5;

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView(defaultCenter, defaultZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    // 💡 로그인이 되어 있고, 아직 위치를 찾은 적이 없을 때만 딱 한 번 실행
    if (user && navigator.geolocation && !hasInitializedRef.current) {
      hasInitializedRef.current = true; // 중복 실행 방지 플래그 잠금
      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setIsLocating(false);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 5);

            if (markerRef.current) {
              markerRef.current.remove();
            }

            let regionName = '내 위치';
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=ko`
              );
              const data = await response.json();
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.county || data.address.municipality || '';
                const country = data.address.country || '';
                regionName = `📍${country} ${city}`.trim() || '📍내 위치';
              }
            } catch (err) {
              console.error('지역명 조회 실패:', err);
            }

            const newMarker = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
            newMarker.bindPopup(`<b>${regionName}</b>`).openPopup();
            markerRef.current = newMarker;
          }
        },
        (error) => {
          console.warn('위치 정보를 가져올 수 없습니다:', error.message);
          setIsLocating(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, [user]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-100 overflow-hidden">
      {/* 🗺️ 우측 상단 '내 지도 / 친구 지도' 토글 버튼 */}
      {user && (
        <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'my'
                  ? `${currentTheme.activeBg} text-white shadow-md`
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              내 지도
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'friends'
                  ? `${currentTheme.activeBg} text-white shadow-md`
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              친구 지도
            </button>
          </div>
        </div>
      )}

      {/* ⏳ 위치 찾는 중 로딩 오버레이 (최초 1회 진입 시에만 잠깐 노출) */}
      {isLocating && (
        <div className="absolute inset-0 z-[1500] bg-slate-900/20 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-3">
            <Loader2 className={`w-5 h-5 animate-spin ${currentTheme.text}`} />
            <span className="text-xs font-semibold text-slate-700">현재 위치를 찾는 중입니다...</span>
          </div>
        </div>
      )}

      {/* 🛑 로그인 안 했을 때 오버레이 */}
      {!user && (
        <div className="absolute inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner mb-5 ${currentTheme.iconBg}`}>
              📍
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">PinRoad</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              나만의 여행 발자취를 기록하고, 친구들과 함께 지도를 공유하는 특별한 공간입니다. 시작하려면 아래 버튼을 눌러주세요!
            </p>
            <button
              onClick={() => signInWithGoogle()}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-white font-semibold text-sm shadow-md transition-all cursor-pointer active:scale-[0.98] ${currentTheme.buttonBg} ${currentTheme.buttonHover}`}
            >
              <LogIn className="w-5 h-5" />
              구글로 로그인하기
            </button>
          </div>
        </div>
      )}

      {/* 지도 렌더링 컨테이너 */}
      <div ref={mapRef} className="flex-1 w-full h-full z-10" />
    </div>
  );
};