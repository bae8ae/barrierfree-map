import type { SmokingZone } from '@/types';
import { Icon } from '@/components/common/Icon';
import { projectToPercent } from '@/utils/geo';

// ============================================================
// 보조 정보: 간접흡연 주의 구역 마커
// 핵심 제보 마커와 구분되도록 점선 테두리의 보조 스타일을 사용한다.
// 임산부 모드 / 유모차 모드에서만 노출된다.
// ============================================================

const INTENSITY_LABEL: Record<SmokingZone['intensity'], string> = {
  low: '약함',
  medium: '보통',
  high: '높음',
};

export function SmokingMarker({
  zone,
  selected,
  onClick,
  x,
  y,
}: {
  zone: SmokingZone;
  selected?: boolean;
  onClick?: () => void;
  x?: number;
  y?: number;
}) {
  const pos = projectToPercent(zone.lat, zone.lng);
  const left = x ?? pos.x;
  const top = y ?? pos.y;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`보조 정보, 간접흡연 주의 구역: ${zone.name}, 노출 ${INTENSITY_LABEL[zone.intensity]}`}
      className="absolute -translate-x-1/2 -translate-y-1/2 focus-visible:z-30"
      style={{ left: `${left}%`, top: `${top}%`, zIndex: selected ? 28 : 6 }}
    >
      <span
        className="flex items-center justify-center rounded-full border-2 border-dashed bg-white/90 shadow-card"
        style={{
          width: selected ? 34 : 28,
          height: selected ? 34 : 28,
          borderColor: '#7c8aa0',
          color: '#5b6675',
        }}
      >
        <Icon name="smoking" size={selected ? 18 : 15} />
      </span>
    </button>
  );
}
