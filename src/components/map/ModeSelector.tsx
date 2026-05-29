import type { UserMode } from '@/types';
import { MODE_META, MODE_ORDER } from '@/utils/meta';

// ============================================================
// 사용자 이동 모드 선택기
// 가로 스크롤 칩. variant: bar(지도 상단) / grid(모달)
// ============================================================

export function ModeSelector({
  mode,
  onChange,
  variant = 'bar',
}: {
  mode: UserMode;
  onChange: (m: UserMode) => void;
  variant?: 'bar' | 'grid';
}) {
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="이동 모드">
        {MODE_ORDER.map((m) => {
          const meta = MODE_META[m];
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(m)}
              className="flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors"
              style={{
                borderColor: active ? '#0e9e8b' : '#e3ded3',
                background: active ? '#e6f7f4' : '#fff',
              }}
            >
              <span className="text-2xl" aria-hidden>
                {meta.emoji}
              </span>
              <span className="flex-1">
                <span className="block font-bold text-ink">{meta.label}</span>
              </span>
              {active && <span className="font-bold text-primary-600" aria-hidden>✓</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="no-scrollbar flex gap-2 overflow-x-auto"
      role="radiogroup"
      aria-label="이동 모드 필터"
    >
      {MODE_ORDER.map((m) => {
        const meta = MODE_META[m];
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold shadow-sm transition-colors"
            style={{
              borderColor: active ? '#0e9e8b' : 'transparent',
              background: active ? '#0e9e8b' : '#fff',
              color: active ? '#fff' : '#3a4452',
            }}
          >
            <span aria-hidden>{meta.emoji}</span>
            {meta.short}
          </button>
        );
      })}
    </div>
  );
}
