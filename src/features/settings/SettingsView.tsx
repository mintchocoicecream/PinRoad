import React from 'react';
import { useSettingsStore, type ThemeColor } from '../../store/useSettingsStore';
import { Palette, Globe, Check } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const SettingsView: React.FC = () => {
  const { user } = useAuthStore();
  const { themeColor, setThemeColor, isMapShared, toggleMapShare } = useSettingsStore();

  const themes: { id: ThemeColor; label: string; bgClass: string }[] = [
    { id: 'indigo', label: '인디고', bgClass: 'bg-indigo-600' },
    { id: 'emerald', label: '에메랄드', bgClass: 'bg-emerald-600' },
    { id: 'amber', label: '앰버', bgClass: 'bg-amber-600' },
    { id: 'rose', label: '로즈', bgClass: 'bg-rose-600' },
  ];

  return (
    <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 페이지 타이틀 */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">환경설정</h1>
          <p className="text-slate-500 mt-1">핀로드 서비스 이용 환경을 맞춤 설정하세요.</p>
        </div>

        <div className="space-y-6">
          {/* 1. 테마 선택 섹션 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">테마 색상 선택</h2>
                <p className="text-sm text-slate-500">웹사이트 전체의 주요 포인트 컬러를 변경합니다.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {themes.map((t) => {
                const isSelected = themeColor === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setThemeColor(t.id, user?.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full ${t.bgClass} flex items-center justify-center text-white`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                    <span className="font-semibold text-sm text-slate-700">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 지도 공유 옵션 섹션 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">지도 공유 옵션</h2>
                <p className="text-sm text-slate-500">내 여행 지도를 다른 친구들에게 공개할지 여부를 설정합니다.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-semibold text-slate-800 block">내 지도 공유하기</span>
                <span className="text-sm text-slate-500">
                  {isMapShared ? '현재 친구들이 내 지도를 볼 수 있습니다.' : '현재 지도가 비공개 상태입니다.'}
                </span>
              </div>

              {/* 스위치 토글 버튼 */} 
              <button
                onClick={() => toggleMapShare(user?.id)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full cursor-pointer transition-colors duration-300 focus:outline-hidden ${
                  isMapShared ? 'bg-primary' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isMapShared ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};