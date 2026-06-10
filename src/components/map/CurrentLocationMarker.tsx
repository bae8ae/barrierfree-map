import { projectToPercent } from '@/utils/geo';

// ============================================================
// 현재 위치 표시 마커
// "여기 있어요" 수준의 깔끔한 위치 점 + pulse + 라벨.
// 클릭 시 이동 모드 변경 모달을 연다.
// ============================================================

export function CurrentLocationMarker({
  lat,
  lng,
  onClick,
  x,
  y,
}: {
  lat: number;
  lng: number;
  onClick?: () => void;
  /** 화면 백분율 좌표 override (지도 확대/이동 반영). 없으면 기본 투영 */
  x?: number;
  y?: number;
}) {
  const pos = projectToPercent(lat, lng);
  const left = x ?? pos.x;
  const top = y ?? pos.y;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${left}%`, top: `${top}%`, zIndex: 30 }}
    >
      {/* 위치 pulse */}
      <span
        className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400/30 animate-pulseRing"
        aria-hidden
      />
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          onClick={onClick}
          aria-label="현재 위치. 눌러서 이동 모드 변경"
          className="h-4 w-4 rounded-full border-[3px] border-white bg-primary-500 shadow-float"
        />
        <span className="mt-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-bold text-white">
          현재 위치
        </span>
      </div>
    </div>
  );
}
