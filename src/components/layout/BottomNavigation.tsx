import {
  Map,
  Route,
  Users,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

// ============================================================
// 하단 네비게이션 (4탭)
// 커뮤니티·시설은 한 탭 안에서 세그먼트로 나뉘고,
// 안심 공유는 마이 탭 안으로 통합되었다.
// 큰 터치 영역 + 아이콘 + 라벨 병행, 현재 탭 aria-current
// ============================================================

export type TabKey = 'map' | 'route' | 'community' | 'my';

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'map', label: '지도', icon: Map },
  { key: 'route', label: '경로', icon: Route },
  { key: 'community', label: '커뮤니티·시설', icon: Users },
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
      className="relative z-30 grid grid-cols-4 border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
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
              <I size={20} />
            </span>
            <span className="whitespace-nowrap">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
