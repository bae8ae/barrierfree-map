import type { PublicFacility, UserMode } from '@/types';
import { FACILITY_META } from '@/utils/meta';
import { Icon } from '@/components/common/Icon';
import { isFacilityUsableForMode } from '@/utils/score';
import { projectToPercent } from '@/utils/geo';

// ============================================================
// 공공시설 마커 (정적 정보) — 카테고리별 색/아이콘
// 현재 모드에서 이용 불가한 시설은 흐리게 + 빗금 표시
// ============================================================

export function FacilityMarker({
  facility,
  mode,
  selected,
  onClick,
  x,
  y,
}: {
  facility: PublicFacility;
  mode: UserMode;
  selected?: boolean;
  onClick?: () => void;
  /** 화면 백분율 좌표 override (지도 확대/이동 반영). 없으면 기본 투영 */
  x?: number;
  y?: number;
}) {
  const meta = FACILITY_META[facility.category];
  const usable = isFacilityUsableForMode(facility, mode);
  const pos = projectToPercent(facility.lat, facility.lng);
  const left = x ?? pos.x;
  const top = y ?? pos.y;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${meta.label} ${facility.name}, 접근성 ${facility.accessibilityScore}점${
        usable ? '' : ', 현재 모드 이용 어려움'
      }`}
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform focus-visible:z-20"
      style={{ left: `${left}%`, top: `${top}%`, zIndex: selected ? 25 : 10 }}
    >
      <span className="relative flex flex-col items-center">
        <span
          className="flex items-center justify-center rounded-full border-2 border-white text-white shadow-card transition-transform"
          style={{
            width: selected ? 38 : 30,
            height: selected ? 38 : 30,
            background: meta.color,
            opacity: usable ? 1 : 0.5,
            transform: selected ? 'scale(1.05)' : undefined,
          }}
        >
          <Icon name={meta.icon as never} size={selected ? 20 : 16} />
        </span>
        {/* 작은 핀 꼬리 */}
        <span
          className="-mt-0.5 h-2 w-2 rotate-45 border-b-2 border-r-2 border-white"
          style={{ background: meta.color, opacity: usable ? 1 : 0.5 }}
          aria-hidden
        />
        {!usable && (
          <span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral-600 text-[9px] font-bold text-white"
            aria-hidden
          >
            !
          </span>
        )}
      </span>
    </button>
  );
}
