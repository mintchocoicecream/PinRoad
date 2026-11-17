import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types/profile';
import { useAuthStore } from '../../store/useAuthStore'; // 💡 auth store 임포트
import { Mail, Calendar, Edit3, Check } from 'lucide-react';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { fetchProfile } = useAuthStore();

  // 날짜 포맷팅: YYYY년 MM월 DD일
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  };

  // 1. Supabase 'profiles' 테이블에서 현재 로그인한 사용자 정보 조회
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          throw new Error('로그인 정보를 확인할 수 없습니다.');
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('email, user_name, avatar_url, created_at, updated_at')
          .eq('email', authUser.email)
          .single();

        if (error) throw error;

        setProfile(data);
        setUserName(data.user_name ?? '');
      } catch (err) {
        console.error('프로필 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. 수정하기 버튼 클릭 시 profiles 테이블 업데이트 및 전역 스토어(useAuthStore) 동기화
  const handleUpdate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!profile) return;

  const trimmedName = userName.trim();
  if (!trimmedName) {
    alert('사용자 이름을 입력해주세요.');
    return;
  }

  setSaving(true);
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update({
        user_name: trimmedName,
        updated_at: now,
      })
      .eq('email', profile.email)
      .select('email, user_name, avatar_url, created_at, updated_at')
      .single();

    if (error) throw error;

    if (data) {
      setProfile(data);
      setUserName(data.user_name ?? trimmedName);

      // 💡 전역 스토어 프로필 정보 즉시 갱신 (사이드바 반영)
      await fetchProfile();
    }

    alert('프로필이 성공적으로 수정되었습니다.');
  } catch (err) {
    console.error('프로필 수정 실패:', err);
    alert('프로필 수정 중 오류가 발생했습니다.');
  } finally {
    setSaving(false);
  }
};

  if (!loading && !profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-500">
        프로필 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const isUnchanged = userName.trim() === (profile?.user_name ?? '');

  return (
    <div className="relative flex-1 bg-slate-50 overflow-y-auto">
      <LoadingOverlay
        isLoading={loading}
        message="프로필 정보 불러오는 중입니다..."
      />

      <div
        className={`p-8 transition-opacity duration-300 ${
          loading ? 'pointer-events-none select-none opacity-60' : 'opacity-100'
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">프로필 설정</h1>
            <p className="text-slate-500 mt-1">계정 정보 및 사용자 이름을 관리하세요.</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="프로필 이미지"
                    className="w-11 h-11 rounded-full border border-slate-200 object-cover shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Edit3 className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-slate-800">회원 정보</h2>
                  <p className="text-sm text-slate-500">
                    사용자 ID, 이름 및 가입일 정보를 확인하고 수정합니다.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    사용자 ID
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="select-all">{profile?.email ?? 'user@example.com'}</span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    사용자 이름
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="사용자 이름을 입력하세요"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    가입날짜
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{formatDate(profile?.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving || isUnchanged || loading}
                className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:opacity-100 disabled:shadow-none"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {saving ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}