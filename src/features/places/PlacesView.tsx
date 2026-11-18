import React, { useState } from 'react';
import { 
  FolderBookmark, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Star, 
  MapPin, 
  Image as ImageIcon,
  MoreVertical
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore'; // 💡 테마 상태 스토어 임포트

interface PlaceItem {
  id: string;
  name: string;
  country: string;
  city: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdAt: string;
}

interface Folder {
  id: string;
  name: string;
  isDefault?: boolean;
}

export const PlacesView: React.FC = () => {
  const { user } = useAuthStore();
  const { themeColor } = useSettingsStore(); // 💡 환경설정 테마 색상 가져오기

  // 💡 테마별 동적 클래스 정의
  const themeClasses: Record<string, {
    activeBtn: string;
    defaultBadge: string;
    addHover: string;
    focusBorder: string;
  }> = {
    grape: {
      activeBtn: 'bg-indigo-600 text-white shadow-sm',
      defaultBadge: 'bg-indigo-700 text-white',
      addHover: 'hover:border-indigo-400 hover:text-indigo-600',
      focusBorder: 'focus:border-indigo-500',
    },
    melon: {
      activeBtn: 'bg-emerald-600 text-white shadow-sm',
      defaultBadge: 'bg-emerald-700 text-white',
      addHover: 'hover:border-emerald-400 hover:text-emerald-600',
      focusBorder: 'focus:border-emerald-500',
    },
    banana: {
      activeBtn: 'bg-yellow-500 text-white shadow-sm',
      defaultBadge: 'bg-yellow-700 text-white',
      addHover: 'hover:border-yellow-400 hover:text-yellow-600',
      focusBorder: 'focus:border-yellow-500',
    },
    orange: {
      activeBtn: 'bg-amber-600 text-white shadow-sm',
      defaultBadge: 'bg-amber-700 text-white',
      addHover: 'hover:border-amber-400 hover:text-amber-600',
      focusBorder: 'focus:border-amber-500',
    },
    strawberry: {
      activeBtn: 'bg-rose-600 text-white shadow-sm',
      defaultBadge: 'bg-rose-700 text-white',
      addHover: 'hover:border-rose-400 hover:text-rose-600',
      focusBorder: 'focus:border-rose-500',
    },
  };

  const currentTheme = themeClasses[themeColor] || themeClasses.grape;

  // --- 상태 관리 (추후 Supabase 연동 시 교체) ---
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'my-places', name: '내 장소', isDefault: true },
    { id: 'fav-cafes', name: '분위기 좋은 카페 모음', isDefault: false },
    { id: 'japan-trip', name: '2026 도쿄 여행 발자취', isDefault: false },
  ]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('my-places');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'date'>('name');

  // 예시 장소 목록 데이터
  const [places, setPlaces] = useState<PlaceItem[]>([
    {
      id: '1',
      name: '블루보틀 신사 카페',
      country: '대한민국',
      city: '서울',
      rating: 4.5,
      comment: '통창으로 들어오는 햇살이 너무 예쁘고 라떼가 정말 고소했던 곳. 조용히 책 읽기에도 좋음.',
      imageUrls: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=300'],
      createdAt: '2026-05-12',
    },
    {
      id: '2',
      name: '시부야 스카이 전망대',
      country: '일본',
      city: '도쿄',
      rating: 5.0,
      comment: '도쿄 전경이 360도로 한눈에 들어오는 야경 명소. 노을 질 때 방문하는 것을 강력 추천함!',
      imageUrls: [
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=300'
      ],
      createdAt: '2026-06-01',
    },
    {
      id: '3',
      name: '광안리 해수욕장 산책로',
      country: '대한민국',
      city: '부산',
      rating: 4.8,
      comment: '밤에 광안대교 야경을 보며 걷기 좋은 바닷가 코스. 주변에 예쁜 소품샵과 카페가 많다.',
      imageUrls: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=300'],
      createdAt: '2026-02-15',
    },
  ]);

  // 검색 및 정렬 로직
  const filteredPlaces = places
    .filter((place) => 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.country.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ko');
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 헤더 안내 문구 */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">장소 관리</h1>
          <p className="text-xs text-slate-500 mt-1">
            내 장소부터 친구가 공유한 장소까지 자유롭게 담고, 폴더별로 지도 표시 여부를 선택할 수 있습니다.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* 1. 상단 폴더 목록 (가로 배열 및 폴더 추가 버튼) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {folders.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? currentTheme.activeBtn
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FolderBookmark className="w-4 h-4 shrink-0" />
                  <span>{folder.name}</span>
                  {folder.isDefault && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? currentTheme.defaultBadge : 'bg-slate-100 text-slate-500'}`}>
                      기본
                    </span>
                  )}
                </button>
              );
            })}

            {/* 폴더 추가 버튼 */}
            <button
              onClick={() => alert('새 폴더 생성 모달 오픈 예정')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 bg-white/50 text-slate-600 text-xs font-semibold hover:bg-white transition shrink-0 cursor-pointer ${currentTheme.addHover}`}
            >
              <Plus className="w-4 h-4" />
              <span>폴더 추가</span>
            </button>
          </div>

          {/* 2. 하단 장소 목록 섹션 (검색 및 정렬 바) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">
                  {folders.find(f => f.id === selectedFolderId)?.name || '선택된 폴더'}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  {filteredPlaces.length}개
                </span>
              </div>

              {/* 검색 및 정렬 컨트롤 영역 */}
              <div className="flex items-center gap-2.5">
                {/* 검색 입력창 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="장소 이름 또는 도시 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-52 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition ${currentTheme.focusBorder}`}
                  />
                </div>

                {/* 정렬 옵션 셀렉트 */}
                <div className="relative flex items-center">
                  <SlidersHorizontal className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'date')}
                    className={`pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none appearance-none cursor-pointer transition ${currentTheme.focusBorder}`}
                  >
                    <option value="name">이름순 (ㄱㄴㄷ/ABC)</option>
                    <option value="rating">별점 높은 순</option>
                    <option value="date">최근 등록일 순</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. 장소 리스트 카드들 */}
            <div className="space-y-3">
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map((place, index) => {
                  const photoCount = place.imageUrls.length;
                  const thumbnail = place.imageUrls[0];

                  return (
                    <div 
                      key={place.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition group"
                    >
                      {/* 숫자 카운팅 */}
                      <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                        {index + 1}
                      </span>

                      {/* 대표 사진 및 사진 개수 뱃지 */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        {thumbnail ? (
                          <img src={thumbnail} alt={place.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        {photoCount > 0 && (
                          <span className="absolute bottom-1 right-1 bg-black/65 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                            {photoCount}
                          </span>
                        )}
                      </div>

                      {/* 장소 정보 (이름, 국가/도시, 별점, 코멘트) */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{place.name}</h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-0.5 shrink-0">
                            <MapPin className="w-3 h-3" />
                            {place.country} / {place.city}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="flex items-center text-amber-500 text-xs font-semibold gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {place.rating.toFixed(1)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {place.comment}
                        </p>
                      </div>

                      {/* 우측 액션 버튼 (옵션) */}
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition opacity-0 group-hover:opacity-100 cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs">
                  등록된 장소가 없거나 검색 결과가 없습니다.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};