import { useMemo, useState } from 'react';
import type { ReportCategory } from '@/types';
import { useStore } from '@/store/useStore';
import { ReportFeedCard } from '@/components/feed/ReportFeedCard';
import { EmptyState } from '@/components/common/ui';

// ============================================================
// 커뮤니티 / 피드
// 단순 커뮤니티가 아니라 이동 경험 데이터 축적 기능
// ============================================================

type FeedFilter =
  | { key: 'all'; label: string }
  | { key: 'resolved'; label: string }
  | { key: ReportCategory; label: string };

const FEED_FILTERS: FeedFilter[] = [
  { key: 'all', label: '전체' },
  { key: 'elevator_outage', label: '엘리베이터' },
  { key: 'construction', label: '공사' },
  { key: 'curb_step', label: '턱/계단' },
  { key: 'tactile_block', label: '점자블록' },
  { key: 'toilet_issue', label: '화장실' },
  { key: 'guide_dog_issue', label: '안내견' },
  { key: 'resolved', label: '해결됨' },
];

export function CommunityFeed() {
  const reports = useStore((s) => s.reports);
  const [filter, setFilter] = useState<FeedFilter['key']>('all');

  const list = useMemo(() => {
    const sorted = [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filter === 'all') return sorted;
    if (filter === 'resolved') return sorted.filter((r) => r.status === 'resolved');
    return sorted.filter((r) => r.category === filter);
  }, [reports, filter]);

  return (
    <div>
      {/* 필터 칩 */}
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        {FEED_FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.key)}
              className="shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors"
              style={{
                borderColor: active ? '#0e9e8b' : '#e3ded3',
                background: active ? '#0e9e8b' : '#fff',
                color: active ? '#fff' : '#5b6675',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <p className="mb-2 text-xs font-semibold text-subtle">
        총 {list.length}건의 이동 경험이 공유됐어요
      </p>

      <div className="space-y-3">
        {list.length === 0 ? (
          <EmptyState icon="warning" title="해당 조건의 제보가 없어요" />
        ) : (
          list.map((r) => <ReportFeedCard key={r.id} report={r} />)
        )}
      </div>
    </div>
  );
}
