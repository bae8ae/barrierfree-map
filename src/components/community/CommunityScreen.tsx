import { useMemo, useState } from 'react';
import type { CommunityPost } from '@/types';
import { useStore } from '@/store/useStore';
import { Modal } from '@/components/common/Modal';
import { Icon } from '@/components/common/Icon';
import { EmptyState } from '@/components/common/ui';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { CommentSheet } from '@/components/community/CommentSheet';
import { CommunityComposer } from '@/components/community/CommunityComposer';

// ============================================================
// 커뮤니티 화면 — 장소 기반 이동 경험 공유 피드
// (커뮤니티·시설 통합 탭 안에서 렌더되어 헤더는 CommunityHub 가 담당)
// ============================================================

type FilterDef =
  | { key: string; label: string; kind: 'all' }
  | { key: string; label: string; kind: 'type'; value: CommunityPost['type'] }
  | { key: string; label: string; kind: 'status'; value: CommunityPost['status'] }
  | { key: string; label: string; kind: 'tag'; value: string }
  | { key: string; label: string; kind: 'affected'; value: 'wheelchair' | 'stroller' };

const FILTERS: FilterDef[] = [
  { key: 'all', label: '전체', kind: 'all' },
  { key: 'report', label: '실시간 제보', kind: 'type', value: 'report' },
  { key: 'facility_status', label: '시설 상태', kind: 'type', value: 'facility_status' },
  { key: 'question', label: '질문', kind: 'type', value: 'question' },
  { key: 'review', label: '후기', kind: 'type', value: 'review' },
  { key: 'resolved', label: '해결됨', kind: 'status', value: 'resolved' },
  // ---- 보호자 관련 카테고리 ----
  { key: 'guardian_question', label: '보호자 질문', kind: 'type', value: 'guardian_question' },
  { key: 'hospital_companion', label: '병원 동행 후기', kind: 'type', value: 'hospital_companion' },
  { key: 'parent_route', label: '부모님 이동 경로', kind: 'type', value: 'parent_route' },
  { key: 'stroller_tip', label: '유모차 동행 팁', kind: 'type', value: 'stroller_tip' },
  { key: 'elevator', label: '엘리베이터', kind: 'tag', value: 'elevator' },
  { key: 'toilet', label: '화장실', kind: 'tag', value: 'toilet' },
  { key: 'tactile', label: '점자블록', kind: 'tag', value: 'tactile' },
  { key: 'guide_dog', label: '안내견', kind: 'tag', value: 'guide_dog' },
  { key: 'stroller', label: '유모차', kind: 'affected', value: 'stroller' },
  { key: 'wheelchair', label: '휠체어', kind: 'affected', value: 'wheelchair' },
];

export function CommunityScreen({
  composerOpen,
  setComposerOpen,
  onViewOnMap,
}: {
  composerOpen: boolean;
  setComposerOpen: (v: boolean) => void;
  onViewOnMap: (post: CommunityPost) => void;
}) {
  const posts = useStore((s) => s.communityPosts);
  const [filterKey, setFilterKey] = useState('all');
  const [query, setQuery] = useState('');
  const [commentsPost, setCommentsPost] = useState<CommunityPost | null>(null);

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filterKey)!;
    let list = [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (f.kind === 'type') list = list.filter((p) => p.type === f.value);
    else if (f.kind === 'status') list = list.filter((p) => p.status === f.value);
    else if (f.kind === 'tag') list = list.filter((p) => p.tags.includes(f.value));
    else if (f.kind === 'affected')
      list = list.filter(
        (p) => p.affectedUsers.includes(f.value) || p.affectedUsers.includes('all'),
      );

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.locationName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [posts, filterKey, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28 pt-3">
        {/* 검색창 */}
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 shadow-sm">
          <span className="text-subtle">
            <Icon name="route" size={18} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="장소, 시설, 불편사항을 검색해보세요"
            aria-label="커뮤니티 검색"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-subtle/60"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기" className="text-subtle">
              ✕
            </button>
          )}
        </div>

        {/* 필터 칩 */}
        <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map((f) => {
            const active = filterKey === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilterKey(f.key)}
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
          {filtered.length}건의 이동 경험이 공유됐어요
        </p>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              icon="warning"
              title="해당 조건의 글이 없어요"
              desc="첫 번째로 정보를 공유해보세요."
            />
          ) : (
            filtered.map((p) => (
              <CommunityPostCard
                key={p.id}
                post={p}
                onOpenComments={setCommentsPost}
                onViewOnMap={onViewOnMap}
              />
            ))
          )}
        </div>
      </div>

      {/* 플로팅 작성 버튼 */}
      <button
        type="button"
        onClick={() => setComposerOpen(true)}
        aria-label="커뮤니티 글 작성"
        className="absolute bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-3xl text-white shadow-sheet active:scale-95"
      >
        +
      </button>

      {/* 작성 모달 */}
      <Modal open={composerOpen} onClose={() => setComposerOpen(false)} title="정보 공유하기">
        <CommunityComposer onDone={() => setComposerOpen(false)} />
      </Modal>

      {/* 댓글 시트 */}
      <CommentSheet post={commentsPost} onClose={() => setCommentsPost(null)} />
    </div>
  );
}
