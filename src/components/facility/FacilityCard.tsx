import type { PublicFacility } from '@/types';
import { FACILITY_META, timeAgo } from '@/utils/meta';
import { Icon } from '@/components/common/Icon';
import { ScorePill } from '@/components/common/ui';

// ============================================================
// 시설 카드 (공공 API 정적 정보 요약)
// ============================================================

/** 시설의 핵심 접근성 속성 배지 목록 */
export function capabilityList(f: PublicFacility) {
  return [
    { key: 'wheelchair', label: '휠체어', icon: 'ramp' as const, ok: f.wheelchairAccessible },
    { key: 'stroller', label: '유모차', icon: 'step' as const, ok: f.strollerAccessible },
    { key: 'guidedog', label: '안내견', icon: 'dog' as const, ok: f.guideDogAllowed === true },
    { key: 'toilet', label: '장애인화장실', icon: 'toilet' as const, ok: f.hasAccessibleToilet },
    { key: 'ramp', label: '경사로', icon: 'ramp' as const, ok: f.hasRamp },
    { key: 'autodoor', label: '자동문', icon: 'building' as const, ok: f.hasAutomaticDoor },
    { key: 'elevator', label: '엘리베이터', icon: 'elevator' as const, ok: f.hasElevator },
  ];
}

export function FacilityCard({
  facility,
  onClick,
}: {
  facility: PublicFacility;
  onClick: () => void;
}) {
  const meta = FACILITY_META[facility.category];
  const caps = capabilityList(facility).filter((c) => c.ok);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-white p-4 text-left shadow-card transition-transform active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: meta.color }}
        >
          <Icon name={meta.icon as never} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold text-ink">{facility.name}</p>
          <p className="truncate text-xs font-medium text-subtle">
            {meta.label} · {facility.address}
          </p>
        </div>
        <ScorePill score={facility.accessibilityScore} size="sm" />
      </div>

      {/* 가능 속성 배지 */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {caps.length === 0 ? (
          <span className="rounded-full bg-[#eef0ee] px-2 py-0.5 text-[11px] font-bold text-subtle">
            접근성 정보 부족
          </span>
        ) : (
          caps.map((c) => (
            <span
              key={c.key}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700"
            >
              <Icon name={c.icon} size={12} />
              {c.label}
            </span>
          ))
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-subtle">
        <span>리뷰 {facility.reviewCount ?? 0}개</span>
        <span>최근 확인 {timeAgo(facility.lastUpdated)}</span>
      </div>
    </button>
  );
}
