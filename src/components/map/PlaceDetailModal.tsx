import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Trash2, Edit3, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Place } from '../../types/place';

interface PlaceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
  currentUserId?: string;
  onDelete: (placeId: string) => void;
  onUpdate: (placeId: string, updatedData: Partial<Place>) => void;
  themeColorClass?: string;
  focusColorClass?: string;
  themeColor?: string;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  isOpen,
  onClose,
  place,
  currentUserId,
  onDelete,
  onUpdate,
  themeColorClass = 'bg-indigo-600 hover:bg-indigo-700',
  focusColorClass = 'focus:border-indigo-500',
  themeColor = 'indigo',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [cityInfo, setCityInfo] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [review, setReview] = useState('');

  // 💡 사진 확대 보기 및 슬라이드를 위한 상태 (인덱스 관리)
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  const scrollbarColorMap: Record<string, string> = {
    indigo: 'scrollbar-thumb-indigo-300 hover:scrollbar-thumb-indigo-400',
    emerald: 'scrollbar-thumb-emerald-300 hover:scrollbar-thumb-emerald-400',
    amber: 'scrollbar-thumb-amber-300 hover:scrollbar-thumb-amber-400',
    rose: 'scrollbar-thumb-rose-300 hover:scrollbar-thumb-rose-400',
  };
  const scrollbarThumbClass = scrollbarColorMap[themeColor] || scrollbarColorMap.indigo;

  useEffect(() => {
    if (place) {
      setName(place.name);
      setCityInfo(`${place.country}, ${place.city}`);
      setAddress(place.address);
      setRating(place.rating);
      setReview(place.review || '');
      setIsEditing(false);
      setCurrentImageIndex(null);
    }
  }, [place]);

  if (!isOpen || !place) return null;

  const isAuthor = currentUserId === place.user_id;

  const handleSaveEdit = () => {
    const [country, city] = cityInfo.split(',').map((s) => s.trim());
    onUpdate(place.id, {
      name,
      country: country || place.country,
      city: city || place.city,
      address,
      rating,
      review,
    });
    setIsEditing(false);
  };

  // 💡 이전 사진으로 이동
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex !== null && place.image_urls) {
      setCurrentImageIndex((prev) => (prev === 0 ? place.image_urls.length - 1 : (prev as number) - 1));
    }
  };

  // 💡 다음 사진으로 이동
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex !== null && place.image_urls) {
      setCurrentImageIndex((prev) => (prev === place.image_urls.length - 1 ? 0 : (prev as number) + 1));
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className={`w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-rounded-full ${scrollbarThumbClass} scrollbar-track-transparent`}>
        
        {/* 헤더 */}
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-semibold text-slate-400">
            {isEditing ? '장소 정보 수정' : '장소 상세'}
          </span>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">장소 이름</label>
            <input
              type="text"
              value={name}
              disabled={!isEditing}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs focus:outline-none ${
                isEditing ? `bg-white ${focusColorClass}` : 'bg-slate-50 text-slate-700'
              }`}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">도시 이름</label>
            <input
              type="text"
              value={cityInfo}
              disabled={!isEditing}
              onChange={(e) => setCityInfo(e.target.value)}
              className={`w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs focus:outline-none ${
                isEditing ? `bg-white ${focusColorClass}` : 'bg-slate-50 text-slate-700'
              }`}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">장소 좌표 / 주소</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={address}
                disabled={!isEditing}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-transparent text-slate-700 focus:outline-none disabled:cursor-not-allowed"
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
                    onClick={() => isEditing && setRating(star - 0.5)}
                    onMouseEnter={() => isEditing && setHoverRating(star - 0.5)}
                    onMouseLeave={() => isEditing && setHoverRating(null)}
                  />

                  {/* 4. 오른쪽 반 영역 (X.0점) 클릭 및 호버 */}
                  <div
                    className="absolute top-0 right-0 w-1/2 h-full z-10"
                    onClick={() => isEditing && setRating(star)}
                    onMouseEnter={() => isEditing && setHoverRating(star)}
                    onMouseLeave={() => isEditing && setHoverRating(null)}
                  />
                </div>
                )
                })}
              <span className="ml-2 text-xs font-semibold text-slate-600">{rating} / 5점</span>
            </div>
          </div>

          {/* 등록된 사진 목록 */}
          {place.image_urls && place.image_urls.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">등록된 사진</label>
              <div className="flex flex-wrap gap-2">
                {place.image_urls.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className="group relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 shadow-sm cursor-pointer transition-transform hover:scale-105"
                  >
                    <img src={url} alt={`place-${idx}`} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">리뷰</label>
            <textarea
              rows={2}
              value={review}
              disabled={!isEditing}
              onChange={(e) => setReview(e.target.value)}
              className={`w-full resize-none rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none ${
                isEditing ? `bg-white ${focusColorClass}` : 'bg-slate-50 text-slate-700'
              }`}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              {isAuthor && !isEditing && (
                <button
                  type="button"
                  onClick={() => onDelete(place.id)}
                  className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  삭제
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAuthor && (
                isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md cursor-pointer ${themeColorClass}`}
                    >
                      저장
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md cursor-pointer ${themeColorClass}`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    수정
                  </button>
                )
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 💡 사진 슬라이드 및 라이트박스 팝업 */}
      {currentImageIndex !== null && place.image_urls && (
        <div
          onClick={() => setCurrentImageIndex(null)}
          className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            
            {/* 우측 상단 닫기 버튼 */}
            <button
              onClick={() => setCurrentImageIndex(null)}
              className="absolute -top-12 right-0 rounded-xl bg-white/10 p-2 text-white hover:bg-white/25 transition-colors cursor-pointer backdrop-blur-md"
            >
              <X className="h-6 w-6" />
            </button>

            {/* 좌측 이동 화살표 (사진이 2장 이상일 때만 표시) */}
            {place.image_urls.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-[-50px] top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/30 transition-colors cursor-pointer backdrop-blur-md"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* 확대된 이미지 (원본 비율 유지) */}
            <img
              src={place.image_urls[currentImageIndex]}
              alt={`Expanded place photo ${currentImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            {/* 우측 이동 화살표 (사진이 2장 이상일 때만 표시) */}
            {place.image_urls.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-[-50px] top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/30 transition-colors cursor-pointer backdrop-blur-md"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* 하단 중앙 페이지네이션 (현재페이지 / 총갯수) */}
            <div className="absolute -bottom-10 rounded-full bg-black/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md tracking-wider">
              {currentImageIndex + 1} / {place.image_urls.length}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};