import { useStore } from '@/store/useStore';
import { MODE_META } from '@/utils/meta';
import { Stat, SectionTitle } from '@/components/common/ui';
import { BadgeList } from '@/components/profile/BadgeList';
import { Icon } from '@/components/common/Icon';

// ============================================================
// 마이페이지 (프로필 + 기여도 + 뱃지)
// ============================================================

export function UserProfile() {
  const user = useStore((s) => s.user);
  const mode = useStore((s) => s.mode);

  return (
    <div className="space-y-5">
      {/* 프로필 헤더 */}
      <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Icon name={MODE_META[mode].icon as never} size={30} />
        </div>
        <div>
          <p className="text-lg font-extrabold text-ink">{user.nickname}</p>
          <p className="text-sm font-medium text-subtle">{MODE_META[mode].label}</p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-bold text-primary-700">
            기여도 {user.contributionScore.toLocaleString()}점
          </p>
        </div>
      </div>

      {/* 기여 통계 */}
      <div className="grid grid-cols-3 gap-2.5">
        <Stat value={user.reportsCount} label="내 제보" icon="warning" tone="caution" />
        <Stat value={user.reviewsCount} label="작성 리뷰" icon="building" tone="blue" />
        <Stat value={user.helpfulReceived} label="받은 도움돼요" icon="route" tone="success" />
      </div>

      {/* 뱃지 */}
      <section>
        <SectionTitle hint={`${user.badges.length}개 획득`}>내 뱃지</SectionTitle>
        <BadgeList earned={user.badges} />
      </section>

      <p className="pb-2 text-center text-xs text-subtle">
        당신의 제보 하나하나가 누군가의 이동을 바꿉니다.
      </p>
    </div>
  );
}
