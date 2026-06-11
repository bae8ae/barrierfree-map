import type { UserReport } from '@/types';
import { REPORT_META, SEVERITY_META } from '@/utils/meta';
import { Icon } from '@/components/common/Icon';
import { projectToPercent } from '@/utils/geo';

// ============================================================
// 사용자 제보 마커 (실시간 정보)
// active 제보는 펄스 애니메이션으로 "지금 일어나는 일"임을 강조
// ============================================================

export function ReportMarker({
  report,
  selected,
  onClick,
  x,
  y,
}: {
  report: UserReport;
  selected?: boolean;
  onClick?: () => void;
  /** 화면 백분율 좌표 override (지도 확대/이동 반영). 없으면 기본 투영 */
  x?: number;
  y?: number;
}) {
  const meta = REPORT_META[report.category];
  const sev = SEVERITY_META[report.severity];
  const pos = projectToPercent(report.lat, report.lng);
  const left = x ?? pos.x;
  const top = y ?? pos.y;
  const isActive = report.status === 'active';
  const resolved = report.status === 'resolved';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`제보: ${meta.label}, ${report.locationName}, 위험도 ${sev.label}${
        resolved ? ', 해결됨' : ''
      }`}
      className="absolute -translate-x-1/2 -translate-y-1/2 focus-visible:z-30"
      style={{ left: `${left}%`, top: `${top}%`, zIndex: selected ? 26 : 15 }}
    >
      <span className="relative flex items-center justify-center">
        {isActive && (
          <span
            className="absolute inset-0 m-auto h-9 w-9 rounded-full animate-pulseRing"
            style={{ background: meta.color }}
            aria-hidden
          />
        )}
        <span
          className="relative flex items-center justify-center rounded-xl border-2 border-white text-white shadow-card"
          style={{
            width: selected ? 38 : 32,
            height: selected ? 38 : 32,
            background: resolved ? '#9aa6b2' : meta.color,
            transform: selected ? 'scale(1.05)' : undefined,
          }}
        >
          <Icon name={meta.icon as never} size={selected ? 20 : 17} />
        </span>
        {report.severity === 'high' && isActive && (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-coral-700 shadow"
            aria-hidden
          >
            !
          </span>
        )}
        {resolved && (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white"
            aria-hidden
          >
            ✓
          </span>
        )}
      </span>
    </button>
  );
}
