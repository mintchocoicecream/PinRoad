import React, { useState, useEffect } from 'react';
import { X, Search, Star, Upload, MapPin, Trash2 } from 'lucide-react';
import { searchPlaces, type PlaceSearchResult } from '../../utils/geocoding';

export interface NewPlaceData {
  name: string;
  cityInfo: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  review: string;
  photos: File[];
}

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation: {
    lat: number;
    lng: number;
    cityInfo: string;
    address: string;
  } | null;
  onSubmit: (data: NewPlaceData) => void;
  themeColorClass?: string;
  focusColorClass?: string;
  themeColor?: string; // 스크롤바 색상 연동용
}

export const AddPlaceModal: React.FC<AddPlaceModalProps> = ({
  isOpen,
  onClose,
  initialLocation,
  onSubmit,
  themeColorClass = 'bg-indigo-600 hover:bg-indigo-700',
  focusColorClass = 'focus:border-indigo-500',
  themeColor = 'indigo',
}) => {
  const [name, setName] = useState('');
  const [cityInfo, setCityInfo] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // 테마별 스크롤바 색상 매핑
  const scrollbarColorMap: Record<string, string> = {
    indigo: 'scrollbar-thumb-indigo-300 hover:scrollbar-thumb-indigo-400',
    emerald: 'scrollbar-thumb-emerald-300 hover:scrollbar-thumb-emerald-400',
    amber: 'scrollbar-thumb-amber-300 hover:scrollbar-thumb-amber-400',
    rose: 'scrollbar-thumb-rose-300 hover:scrollbar-thumb-rose-400',
  };
  const scrollbarThumbClass = scrollbarColorMap[themeColor] || scrollbarColorMap.indigo;

  useEffect(() => {
    if (initialLocation) {
      setCityInfo(initialLocation.cityInfo);
      setAddress(initialLocation.address);
      setCoords({ lat: initialLocation.lat, lng: initialLocation.lng });
      setName('');
      setRating(5);
      setReview('');
      setPhotos([]);
      setPreviewUrls([]);
    }
  }, [initialLocation, isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (name.trim().length >= 2 && showDropdown) {
        setIsSearching(true);
        const results = await searchPlaces(name, coords.lat, coords.lng);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name, showDropdown, coords.lat, coords.lng]);

  const handleSelectSearchResult = (item: PlaceSearchResult) => {
    const placeName = item.name || item.display_name.split(',')[0];
    setName(placeName);
    setAddress(item.display_name);
    setCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });

    if (item.address) {
      const country = item.address.country || '';
      const city =
        item.address.city ||
        item.address.town ||
        item.address.village ||
        item.address.state ||
        '';
      if (country && city) {
        setCityInfo(`${country}, ${city}`);
      }
    }
    setShowDropdown(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const remainingSlots = 5 - photos.length;

    if (remainingSlots <= 0) {
      alert('사진은 최대 5장까지 등록할 수 있습니다.');
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    setPhotos((prev) => [...prev, ...filesToAdd]);

    const newUrls = filesToAdd.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cityInfo.trim() || !address.trim()) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    onSubmit({
      name: name.trim(),
      cityInfo: cityInfo.trim(),
      address: address.trim(),
      lat: coords.lat,
      lng: coords.lng,
      rating,
      review: review.trim(),
      photos,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      {/* 💡 세로 길이를 압축하고 커스텀 얇은 스크롤바 적용 */}
      <div className={`w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-rounded-full ${scrollbarThumbClass} scrollbar-track-transparent`}>
        
        {/* 헤더 (타이틀 축소) */}
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-base font-bold text-slate-800">장소 등록</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              장소 이름 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="장소명 검색 또는 직접 입력"
                className={`w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs focus:outline-none ${focusColorClass}`}
                required
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            </div>

            {showDropdown && (isSearching || searchResults.length > 0) && (
              <div className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                {isSearching ? (
                  <div className="p-2 text-center text-[11px] text-slate-500">검색 중...</div>
                ) : (
                  searchResults.map((item) => (
                    <button
                      type="button"
                      key={item.place_id}
                      onClick={() => handleSelectSearchResult(item)}
                      className="flex w-full flex-col border-b border-slate-100 px-3 py-2 text-left last:border-none hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-medium text-slate-800">
                        {item.name || item.display_name.split(',')[0]}
                      </span>
                      <span className="truncate text-[10px] text-slate-400">
                        {item.display_name}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              도시 이름 (국가명, 도시이름) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cityInfo}
              onChange={(e) => setCityInfo(e.target.value)}
              placeholder="예: 대한민국, 서울"
              className={`w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none ${focusColorClass}`}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              장소 좌표 / 주소 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-xs">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-transparent text-slate-700 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">별점</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const currentVal = hoverRating ?? rating;
                
                // 각 별이 채워진 상태 판단 (0: 빈 별, 0.5: 반쪽, 1: 꽉 찬 별)
                const fillStatus = currentVal >= star ? 1 : currentVal >= star - 0.5 ? 0.5 : 0;

                return (
                  <div key={star} className="relative p-0.5 flex items-center cursor-pointer">
                    {/* 1. 배경 (빈 별) */}
                    <Star className="h-5 w-5 text-slate-200" />

                    {/* 2. 채워진 별 (0.5 또는 1.0에 따라 클리핑 처리) */}
                    {fillStatus > 0 && (
                      <div 
                        className="absolute top-0.5 left-0.5 overflow-hidden pointer-events-none"
                        style={{ width: fillStatus === 0.5 ? '50%' : '100%' }}
                      >
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      </div>
                    )}

                    {/* 3. 왼쪽 반 영역 (X.5점) 클릭 및 호버 */}
                    <div
                      className="absolute top-0 left-0 w-1/2 h-full z-10"
                      onClick={() => setRating(star - 0.5)}
                      onMouseEnter={() => setHoverRating(star - 0.5)}
                      onMouseLeave={() => setHoverRating(null)}
                    />

                    {/* 4. 오른쪽 반 영역 (X.0점) 클릭 및 호버 */}
                    <div
                      className="absolute top-0 right-0 w-1/2 h-full z-10"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                    />
                  </div>
                );
              })}
              <span className="ml-2 text-xs font-semibold text-slate-600">
                {rating.toFixed(1)} / 5.0점
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              사진 등록 ({photos.length}/5)
            </label>
            <div className="flex flex-wrap gap-2">
              {previewUrls.map((url, idx) => (
                <div
                  key={url}
                  className="group relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 shadow-sm"
                >
                  <img src={url} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}

              {photos.length < 5 && (
                <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-600">
                  <Upload className="h-4 w-4" />
                  <span className="mt-1 text-[10px] font-medium">추가</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">리뷰</label>
            <textarea
              rows={2}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="이 장소에서의 추억이나 팁을 남겨보세요."
              className={`w-full resize-none rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none ${focusColorClass}`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className={`rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-md transition-all cursor-pointer ${themeColorClass}`}
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};