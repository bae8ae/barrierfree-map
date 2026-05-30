// ============================================================
// 복합(군집) 마커
// 지도 확대 정도에서 서로 겹치는 마커들을 하나로 묶어 표시.
// 클릭하면 해당 지점으로 확대되어 개별 마커로 나뉜다.
// ============================================================

export function ClusterMarker({
  x,
  y,
  count,
  colors,
  alert,
  onClick,
}: {
  /** 화면 백분율 좌표 */
  x: number;
  y: number;
  count: number;
  /** 묶인 마커들의 대표 색 (최대 3개 미리보기 점) */
  colors: string[];
  /** 긴급(고위험 제보 등) 포함 여부 */
  alert?: boolean;
  onClick?: () => void;
}) {
  // 묶인 개수에 따라 살짝 커지는 원 (38~58px)
  const size = Math.min(58, 38 + count * 2);
  const preview = colors.slice(0, 3);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`이 지점에 ${count}개의 정보가 모여 있어요. 눌러서 확대하면 개별로 볼 수 있어요`}
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105 focus-visible:z-30"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: 18 }}
    >
      <span className="relative grid place-items-center">
        {/* 겹쳐 쌓인 느낌의 그림자 원 */}
        <span
          className="absolute rounded-full bg-white/70 shadow-card"
          style={{ width: size, height: size, transform: 'translate(5px, 5px)' }}
          aria-hidden
        />
        <span
          className="absolute rounded-full bg-white/80 shadow-card"
          style={{ width: size, height: size, transform: 'translate(-4px, 3px)' }}
          aria-hidden
        />
        {/* 메인 원 */}
        <span
          className="relative flex items-center justify-center rounded-full border-[3px] border-white font-extrabold text-white shadow-float"
          style={{
            width: size,
            height: size,
            background: alert
              ? 'radial-gradient(circle at 30% 25%, #ff8a72, #ed4f34)'
              : 'radial-gradient(circle at 30% 25%, #36c2ae, #0a8174)',
            fontSize: count > 9 ? 14 : 16,
          }}
        >
          {count}
        </span>
        {/* 구성 색 미리보기 점 */}
        <span className="absolute -bottom-1 flex gap-0.5" aria-hidden>
          {preview.map((c, i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full border border-white"
              style={{ background: c }}
            />
          ))}
        </span>
      </span>
    </button>
  );
}
