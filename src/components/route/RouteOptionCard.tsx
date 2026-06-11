import type { RouteOption } from '@/types';
import { ScorePill, Tag } from '@/components/common/ui';
import { Icon } from '@/components/common/Icon';

// ============================================================
// 경로 후보 카드
// ============================================================

const BADGE_META: Record<
  RouteOption['badge'],
  { label: string; color: string; bg: string }
> = {
  // 추천만 틸로 강조, 나머지 성격 배지는 중립색 (라벨이 의미를 전달)
  recommended: { label: '추천', color: '#0a8174', bg: '#e3f2ef' },
  fast: { label: '빠름', color: '#4a5563', bg: '#f0ede5' },
  safe: { label: '안전·완만', color: '#4a5563', bg: '#f0ede5' },
  tactile: { label: '점자블록', color: '#4a5563', bg: '#f0ede5' },
  rest: { label: '휴식 우선', color: '#4a5563', bg: '#f0ede5' },
  clean: { label: '쾌적', color: '#4a5563', bg: '#f0ede5' },
};

export function RouteOptionCard({
  route,
  selected,
  onSelect,
}: {
  route: RouteOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const badge = BADGE_META[route.badge];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="w-full rounded-2xl border-2 bg-white p-4 text-left shadow-card transition-all"
      style={{ borderColor: selected ? '#0e9e8b' : 'transparent' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-extrabold"
            style={{ color: badge.color, background: badge.bg }}
          >
            {badge.label}
          </span>
          <span className="text-base font-extrabold text-ink">{route.name}</span>
        </div>
        <ScorePill score={route.accessibilityScore} size="sm" />
      </div>

      {/* 시간 / 거리 */}
      <div className="mt-2.5 flex items-baseline gap-3">
        <span className="text-2xl font-extrabold text-primary-600">
          {route.estimatedMinutes}
          <span className="text-sm font-bold text-subtle">분</span>
        </span>
        <span className="text-sm font-semibold text-subtle">
          {route.distanceMeters >= 1000
            ? `${(route.distanceMeters / 1000).toFixed(1)}km`
            : `${route.distanceMeters}m`}
        </span>
      </div>

      {/* 속성 태그 */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Tag color={route.avoidsStairs ? '#0a8174' : '#c0452f'} bg={route.avoidsStairs ? '#e3f2ef' : '#fbe9e5'}>
          <Icon name="step" size={13} />
          {route.avoidsStairs ? '계단·턱 회피' : '계단 포함'}
        </Tag>
        <Tag>
          <Icon name="elevator" size={13} />
          엘리베이터 {route.elevatorCount}회
        </Tag>
        <Tag>
          <Icon name="slope" size={13} />
          경사 {route.slopeSections}구간
        </Tag>
        {route.avoidedReports > 0 && (
          <Tag color="#0a8174" bg="#e3f2ef">
            <Icon name="warning" size={13} />
            제보 {route.avoidedReports}곳 회피
          </Tag>
        )}
      </div>

      {/* 모드별 강조 포인트 (불편요소 해소) */}
      {route.highlights.length > 0 && (
        <ul className="mt-2.5 space-y-1">
          {route.highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[13px] font-semibold text-ink/80">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
      )}

      {/* 추천 이유 */}
      <p className="mt-2.5 rounded-xl bg-primary-50 px-3 py-2 text-[13px] font-medium leading-snug text-primary-700">
        {route.reason}
      </p>

      {/* 경고 */}
      {route.warnings.length > 0 && (
        <ul className="mt-2 space-y-1">
          {route.warnings.map((w, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[13px] font-semibold text-coral-700">
              <Icon name="warning" size={14} />
              {w}
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}
