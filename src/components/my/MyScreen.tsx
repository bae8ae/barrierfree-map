import { useState } from 'react';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SegmentedControl } from '@/components/common/ui';
import { UserProfile } from '@/components/profile/UserProfile';
import { AccessibilityDashboard } from '@/components/dashboard/AccessibilityDashboard';
import { GuardianScreen } from '@/components/guardian/GuardianScreen';
import { Icon } from '@/components/common/Icon';

// ============================================================
// 마이 탭 — 내 정보 / 안심 공유 두 섹션을 세그먼트로 전환
// 내 정보: 사용자 프로필 + (관리자/지자체용) 접근성 리포트
// 안심 공유: 보호자 위치 공유 모드
// 섹션 상태는 App 이 들고 있어 다른 화면(커뮤니티 보호자 질문 등)에서
// "안심 공유 열기"로 바로 진입할 수 있다.
// ============================================================

export type MySection = 'profile' | 'guardian';

const SUBTITLE: Record<MySection, string> = {
  profile: '나의 기여와 동네 접근성 리포트',
  guardian: '보호자와 함께 안전하게 이동해요',
};

export function MyScreen({
  section,
  onSectionChange,
}: {
  section: MySection;
  onSectionChange: (s: MySection) => void;
}) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="마이페이지" subtitle={SUBTITLE[section]} />

      <div className="px-4 pt-3">
        <SegmentedControl
          ariaLabel="마이페이지 섹션 전환"
          value={section}
          onChange={onSectionChange}
          options={[
            { key: 'profile', label: '내 정보', icon: 'star' },
            { key: 'guardian', label: '안심 공유', icon: 'shield' },
          ]}
        />
      </div>

      {section === 'profile' ? (
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-4">
          <UserProfile />

          {/* 관리자/지자체용 리포트 카드 (접었다 펴기) */}
          <section className="mt-6">
            <button
              type="button"
              onClick={() => setReportOpen((v) => !v)}
              aria-expanded={reportOpen}
              className="flex w-full items-center gap-3 rounded-2xl bg-ink p-4 text-left text-white shadow-card"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <Icon name="building" size={22} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-extrabold">지역 접근성 리포트</p>
                <p className="text-xs font-medium text-white/85">
                  지자체·시설 운영자용 대시보드 (B2G·B2B)
                </p>
              </div>
              <span className="text-xl font-bold" aria-hidden>
                {reportOpen ? '▾' : '▸'}
              </span>
            </button>

            {reportOpen && (
              <div className="mt-4 animate-fadeIn">
                <AccessibilityDashboard />
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          <GuardianScreen />
        </div>
      )}
    </div>
  );
}
