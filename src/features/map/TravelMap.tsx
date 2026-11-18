import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { LogIn, MapPin } from 'lucide-react';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { AlertModal } from '../../components/common/AlertModal';
import { AddPlaceModal, type NewPlaceData } from '../../components/map/AddPlaceModal';
import { PlaceDetailModal } from '../../components/map/PlaceDetailModal';
import { reverseGeocode } from '../../utils/geocoding';
import { placeService } from '../../services/placeService';
import type { Place } from '../../types/place';

interface ClickedLocation {
  lat: number;
  lng: number;
  city: string;
  cityInfo: string;
  address: string;
}

export const TravelMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);
  const placesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hasInitializedRef = useRef<boolean>(false);

  const [activeTab, setActiveTab] = useState<'my' | 'friends'>('my');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<string | null>(null);

  const [clickedLoc, setClickedLoc] = useState<ClickedLocation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingCity, setIsLoadingCity] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const [places, setPlaces] = useState<Place[]>([]);

  const { user, signInWithGoogle } = useAuthStore();
  const { themeColor } = useSettingsStore();

  const themeMap: Record<
    string,
    {
      activeBg: string;
      text: string;
      buttonBg: string;
      buttonHover: string;
      iconBg: string;
      hex: string;
    }
  > = {
    grape: { activeBg: 'bg-indigo-600', text: 'text-indigo-600', buttonBg: 'bg-indigo-600', buttonHover: 'hover:bg-indigo-700', iconBg: 'bg-indigo-50 text-indigo-600', hex: '#4f46e5' },
    melon: { activeBg: 'bg-emerald-600', text: 'text-emerald-600', buttonBg: 'bg-emerald-600', buttonHover: 'hover:bg-emerald-700', iconBg: 'bg-emerald-50 text-emerald-600', hex: '#059669' },
    banana: { activeBg: 'bg-yellow-500', text: 'text-yellow-500', buttonBg: 'bg-yellow-500', buttonHover: 'hover:bg-yellow-600', iconBg: 'bg-yellow-50 text-yellow-500', hex: '#e7d724' },
    orange: { activeBg: 'bg-amber-600', text: 'text-amber-600', buttonBg: 'bg-amber-600', buttonHover: 'hover:bg-amber-700', iconBg: 'bg-amber-50 text-amber-600', hex: '#d97706' },
    strawberry: { activeBg: 'bg-rose-600', text: 'text-rose-600', buttonBg: 'bg-rose-600', buttonHover: 'hover:bg-rose-700', iconBg: 'bg-rose-50 text-rose-600', hex: '#e11d48' },
  };

  const currentTheme = themeMap[themeColor] || themeMap.grape;

  const createCustomPlaceIcon = (hexColor: string, rating: number) => {
    return L.divIcon({
      className: 'custom-place-pin',
      html: `
        <div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <div style="
            width: 34px;
            height: 34px;
            background-color: ${hexColor};
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: #ffffff;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: -0.5px;
            ">★${rating}</span>
          </div>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
      popupAnchor: [0, -40],
    });
  };

  
  const renderPlaceMarkers = (placeList: Place[], hexColor: string) => {
    if (!mapInstanceRef.current) return;

    if (placesLayerGroupRef.current) {
      placesLayerGroupRef.current.clearLayers();
    } else {
      placesLayerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    placeList.forEach((place) => {
      if (!placesLayerGroupRef.current) return;

      const customIcon = createCustomPlaceIcon(hexColor, place.rating);
      const marker = L.marker([place.lat, place.lng], { icon: customIcon });

      const images = place.image_urls ?? [];
      const thumbnailUrl = images.length > 0 
        ? (typeof images[0] === 'string' ? images[0] : null) 
        : null;
      const photoCount = images.length;

      // 대표 사진과 우측 하단 사진 개수 배지(photoCount > 0 인 경우)를 포함하는 HTML
      const thumbnailHtml = thumbnailUrl
        ? `
          <div class="relative w-full h-24 mb-2 overflow-hidden rounded-xl bg-slate-100">
            <img src="${thumbnailUrl}" alt="thumbnail" class="w-full h-full object-cover" />
            ${photoCount > 1 ? `
              <span class="absolute bottom-1.5 right-1.5 flex items-center justify-center rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white backdrop-blur-xs">
                ${photoCount}
              </span>
            ` : ''}
          </div>
        `
        : '';

      const tooltipContent = `
        <div class="p-1 w-40 text-left">
          ${thumbnailHtml}
          <h4 class="font-bold text-slate-800 text-xs truncate">${place.name}</h4>
          <p class="text-[11px] text-slate-500 truncate">${place.country}, ${place.city}</p>
          <div class="text-[11px] font-semibold text-amber-500 mt-0.5">⭐ ${place.rating} / 5</div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -40],
        className: 'custom-map-tooltip',
      });

      marker.on('click', () => {
        setSelectedPlace(place);
        setIsDetailModalOpen(true);
      });

      placesLayerGroupRef.current.addLayer(marker);
    });
  };

  const fetchPlaces = async () => {
    const data = await placeService.getPlaces();
    setPlaces(data);
    renderPlaceMarkers(data, currentTheme.hex);
  };

  useEffect(() => {
    if (places.length > 0) {
      renderPlaceMarkers(places, currentTheme.hex);
    }
  }, [themeColor, places]);

  // 로그아웃 시 초기화면으로 완벽하게 되돌리기
  useEffect(() => {
    if (!user) {
      if (placesLayerGroupRef.current && mapInstanceRef.current) {
        placesLayerGroupRef.current.clearLayers();
      }
      if (clickMarkerRef.current && mapInstanceRef.current) {
        clickMarkerRef.current.remove();
        clickMarkerRef.current = null;
      }
      if (markerRef.current && mapInstanceRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([37.5665, 126.9780], 5);
      }

      hasInitializedRef.current = false;
      setClickedLoc(null);
      setIsModalOpen(false);
      setIsDetailModalOpen(false);
      setPlaces([]);
    } else {
      fetchPlaces();
    }
  }, [user]);

  const handleSavePlace = async (newPlace: NewPlaceData) => {
    if (!user) {
      setAlertModal({ isOpen: true, message: '로그인이 필요합니다.' });
      return;
    }

    setIsSaving(true);
    const result = await placeService.createPlace(user.id, newPlace);
    setIsSaving(false);

    if (result.success) {
      setIsModalOpen(false);
      setClickedLoc(null);
      if (clickMarkerRef.current && mapInstanceRef.current) {
        clickMarkerRef.current.remove();
        clickMarkerRef.current = null;
      }

      await fetchPlaces();

      setAlertModal({
        isOpen: true,
        message: '장소등록이 완료되었습니다.',
      });
    } else {
      setAlertModal({
        isOpen: true,
        message: `등록 실패: ${result.error}`,
      });
    }
  };

  const handleDeletePlace = async (placeId: string) => {
    if (!confirm('정말 이 장소를 삭제하시겠습니까?')) return;
    
    const result = await placeService.deletePlace(placeId);
    if (result.success) {
      setIsDetailModalOpen(false);
      await fetchPlaces();
      setAlertModal({ isOpen: true, message: '장소가 삭제되었습니다.' });
    } else {
      setAlertModal({ isOpen: true, message: `삭제 실패: ${result.error}` });
    }
  };

  const handleUpdatePlace = async (placeId: string, updatedData: Partial<Place>) => {
    const result = await placeService.updatePlace(placeId, updatedData);
    if (result.success) {
      setIsDetailModalOpen(false);
      await fetchPlaces();
      setAlertModal({ isOpen: true, message: '장소 정보가 수정되었습니다.' });
    } else {
      setAlertModal({ isOpen: true, message: `수정 실패: ${result.error}` });
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

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

      map.on('click', async (e) => {
        // 로그인 상태가 아니면 지도 클릭 기능 차단
        if (!user) return;

        const { lat, lng } = e.latlng;
        setIsLoadingCity(true);

        const geoData = await reverseGeocode(lat, lng);
        setIsLoadingCity(false);

        const newLoc: ClickedLocation = {
          lat,
          lng,
          city: geoData.city,
          cityInfo: geoData.formattedCity,
          address: geoData.fullAddress,
        };

        setClickedLoc(newLoc);

        if (clickMarkerRef.current) {
          clickMarkerRef.current.remove();
        }

        const clickMarker = L.marker([lat, lng]).addTo(map);
        clickMarker.bindPopup(`<b>${geoData.formattedCity}</b>`).openPopup();
        clickMarkerRef.current = clickMarker;
      });

      mapInstanceRef.current = map;
      fetchPlaces();
    }

    if (user && navigator.geolocation && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setIsLocating(false);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 10);

            if (markerRef.current) {
              markerRef.current.remove();
            }

            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=ko`
              );
              const data = await response.json();
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.county || data.address.municipality || '';
                const country = data.address.country || '';
                setCurrentCity(`📍${country} ${city}`);
              }
            } catch (err) {
              console.error('지역명 조회 실패:', err);
            }
            /*
            const newMarker = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
            newMarker.bindPopup(`<b>${regionName}</b>`).openPopup();
            markerRef.current = newMarker;
            */
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
      {/* 우측 상단 토글 */}
      {user && (
        <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'my' ? `${currentTheme.activeBg} text-white shadow-md` : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              내 지도
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'friends' ? `${currentTheme.activeBg} text-white shadow-md` : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              친구 지도
            </button>
          </div>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {isLocating && (
        <LoadingOverlay isLoading={isLocating} message="현재 위치를 불러오는 중입니다..." />
      )}

      {isSaving && (
        <div className="absolute inset-0 z-[5000]">
          <LoadingOverlay isLoading={isSaving} message="장소를 등록 중입니다..." />
        </div>
      )}

      {isLoadingCity && (
        <div className="absolute bottom-8 left-1/2 z-[2000] -translate-x-1/2 rounded-full bg-slate-900/80 px-5 py-2.5 text-xs font-medium text-white shadow-lg backdrop-blur-xs">
          선택한 위치의 도시 정보를 불러오는 중...
        </div>
      )}

      {/* 클릭 시 하단 플로팅 배너 */}
      {user && clickedLoc && !isLoadingCity && (
        <div className="absolute bottom-8 left-1/2 z-[2000] flex w-[92%] max-w-lg -translate-x-1/2 items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentTheme.iconBg}`}>
              <MapPin className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-800 leading-snug">
              <span className={`font-bold ${currentTheme.text}`}>{clickedLoc.city}</span>에 장소를 등록하시겠습니까?
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => {
                setClickedLoc(null);
                if (clickMarkerRef.current) {
                  clickMarkerRef.current.remove();
                  clickMarkerRef.current = null;
                }
              }}
              className="rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={() => {
                setIsModalOpen(true);
                setClickedLoc(null);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm cursor-pointer whitespace-nowrap ${currentTheme.buttonBg} ${currentTheme.buttonHover}`}
            >
              등록하기
            </button>
          </div>
        </div>
      )}

      {/* 💡 로그인 전 안내 및 구글 로그인 버튼 오버레이 복원 */}
      {!user && (
        <div className="absolute inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 flex flex-col items-center text-center">
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

      {/* 지도 컨테이너 */}
      <div ref={mapRef} className="flex-1 w-full h-full z-10" />

      {/* 장소 등록 모달 */}
      <AddPlaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialLocation={clickedLoc}
        onSubmit={handleSavePlace}
        themeColorClass={`${currentTheme.buttonBg} ${currentTheme.buttonHover}`}
        themeColor={themeColor}
      />

      {/* 장소 상세 보기 모달 */}
      <PlaceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        place={selectedPlace}
        currentUserId={user?.id}
        onDelete={handleDeletePlace}
        onUpdate={handleUpdatePlace}
        themeColorClass={`${currentTheme.buttonBg} ${currentTheme.buttonHover}`}
        themeColor={themeColor}
      />

      {/* 완료 알림 커스텀 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        themeColorClass={`${currentTheme.buttonBg} ${currentTheme.buttonHover}`}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />
    {currentCity!==null && 
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none flex items-center gap-1.5 rounded-lg bg-white/85 px-3 py-1.5 shadow-md backdrop-blur-md border border-slate-200/60 text-slate-700 text-xs font-medium">
        <span>{currentCity}</span>
      </div>
    }
    
    </div>
  );
};