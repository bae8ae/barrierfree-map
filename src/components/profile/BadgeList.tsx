import { BADGE_DEFS, ALL_BADGE_IDS } from '@/data/mockUser';

// ============================================================
// 뱃지 목록 (획득/미획득)
// ============================================================

export function BadgeList({ earned }: { earned: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {ALL_BADGE_IDS.map((id) => {
        const def = BADGE_DEFS[id];
        const has = earned.includes(id);
        return (
          <div
            key={id}
            className="flex items-center gap-2.5 rounded-2xl p-3"
            style={{
              background: has ? '#fff' : '#f1ede4',
              boxShadow: has ? '0 2px 12px rgba(31,42,55,0.08)' : 'none',
              opacity: has ? 1 : 0.65,
            }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl"
              style={{ background: has ? '#e6f7f4' : '#e3ded3', filter: has ? 'none' : 'grayscale(1)' }}
              aria-hidden
            >
              {def.emoji}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-ink">{def.label}</p>
              <p className="text-[11px] leading-tight text-subtle">
                {has ? def.description : '아직 획득 전'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
