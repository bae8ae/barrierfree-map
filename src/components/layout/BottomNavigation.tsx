import { Map, Route, Users, Building2, UserRound, type LucideIcon } from 'lucide-react';

// ============================================================
// 하단 네비게이션 (5탭)
// 큰 터치 영역 + 아이콘 + 라벨 병행, 현재 탭 aria-current
// ============================================================

export type TabKey = 'map' | 'route' | 'community' | 'facility' | 'my';

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'map', label: '지도', icon: Map },
  { key: 'route', label: '경로', icon: Route },
  { key: 'community', label: '커뮤니티', icon: Users },
  { key: 'facility', label: '시설', icon: Building2 },
  { key: 'my', label: '마이', icon: UserRound },
];

export function BottomNavigation({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="relative z-30 grid grid-cols-5 border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      {TABS.map((t) => {
        const isActive = active === t.key;
        const I = t.icon;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors"
            style={{ color: isActive ? '#0a8174' : '#8a93a0' }}
          >
            <span
              className="flex h-9 w-12 items-center justify-center rounded-full transition-colors"
              style={{ background: isActive ? '#dcf3ee' : 'transparent' }}
            >
              <I size={22} />
            </span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
