import type { UserMode } from '@/types';
import { MODE_META } from '@/utils/meta';
import { projectToPercent } from '@/utils/geo';

// ============================================================
// 현재 위치 아바타 (모드별 캐릭터)
// pulse 효과 + idle bob + 말풍선 + "현재 위치" 라벨
// 클릭 시 모드 변경 (onClick)
// ============================================================

export function CurrentModeAvatar({
  mode,
  lat,
  lng,
  outfitColor,
  message,
  onClick,
}: {
  mode: UserMode;
  lat: number;
  lng: number;
  outfitColor: string;
  message?: string;
  onClick?: () => void;
}) {
  const meta = MODE_META[mode];
  const { x, y } = projectToPercent(lat, lng);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: 30 }}
    >
      {/* 위치 pulse */}
      <span
        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400/40 animate-pulseRing"
        aria-hidden
      />
      <div className="relative flex flex-col items-center">
        {message && (
          <div className="mb-1 max-w-[160px] animate-popIn rounded-2xl rounded-bl-sm bg-white px-3 py-1.5 text-center text-xs font-semibold text-ink shadow-card">
            {message}
          </div>
        )}
        <button
          type="button"
          onClick={onClick}
          aria-label={`현재 위치, ${meta.label} 모드. 눌러서 이동 모드 변경`}
          className="group relative flex h-12 w-12 animate-idleBob items-center justify-center rounded-full border-[3px] border-white shadow-float"
          style={{ background: outfitColor }}
        >
          <span className="text-2xl" aria-hidden>
            {meta.emoji}
          </span>
          <span
            className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-white"
            style={{ background: outfitColor }}
            aria-hidden
          />
        </button>
        <span className="mt-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-bold text-white">
          현재 위치
        </span>
      </div>
    </div>
  );
}
