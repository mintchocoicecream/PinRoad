import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, Users, Globe } from 'lucide-react';

export const TravelMap: React.FC = () => {
  const { isLoggedIn, login } = useAuthStore();
  const [isFriendView, setIsFriendView] = useState(false); // '내 지도만' / '친구 지도 함께 보기' 토글 상태

  // 테스트용 로그인 핸들러
  const handleTestLogin = () => {
    login({
      id: 'usr_123',
      email: 'angela.seo@example.com',
      name: 'Angela Seo',
    });
  };

  // 1. 로그인하지 않은 경우의 메인 화면 ("My Journey")
  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-primary/5 to-slate-100 p-6">
        <div className="text-center max-w-lg space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl shadow-xl shadow-primary/30 text-white mb-2">
            <Globe className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            My Journey
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            세상에 단 하나뿐인 나만의 세계 여행 기록소.<br />
            기억하고 싶은 순간들을 지도 위에 핀으로 남겨보세요.
          </p>
          <div className="pt-4">
            <button
              onClick={handleTestLogin}
              className="px-8 py-4 bg-primary hover:opacity-90 text-white font-semibold rounded-2xl shadow-lg shadow-primary/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              구글 계정으로 로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. 로그인한 경우의 메인 지도 화면
  return (
    <div className="flex-1 relative h-screen bg-slate-100 overflow-hidden">
      {/* 세계지도 영역 (추후 react-leaflet 지도로 대체될 자리) */}
      <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
        <div className="text-center text-slate-500 space-y-2">
          <Globe className="w-12 h-12 mx-auto text-primary animate-spin-slow" />
          <p className="font-medium">세계지도(Leaflet Map) 렌더링 영역</p>
          <p className="text-xs text-slate-400">여행 장소 핀과 클러스터링이 이곳에 표시됩니다.</p>
        </div>
      </div>

      {/* 우측 상단: '내 지도만 표기 / 친구지도 함께 보기' 토글 버튼 */}
      <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-1">
        <button
          onClick={() => setIsFriendView(false)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            !isFriendView ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          내 지도만 표기
        </button>
        <button
          onClick={() => setIsFriendView(true)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isFriendView ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          친구 지도 함께 보기
        </button>
      </div>

      {/* 우측 하단: '장소 등록하기' 버튼 */}
      <div className="absolute bottom-8 right-8 z-10">
        <button
          onClick={() => alert('장소 등록 모달 오픈')}
          className="flex items-center gap-3 px-6 py-4 bg-primary hover:opacity-90 text-white font-bold rounded-2xl cursor-pointer shadow-xl shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus className="w-6 h-6" />
          장소 등록하기
        </button>
      </div>
    </div>
  );
};