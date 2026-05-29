import type { CommunityPost } from '@/types';
import { useStore } from '@/store/useStore';
import {
  COMMUNITY_TYPE_META,
  COMMUNITY_STATUS_META,
  AFFECTED_META,
  timeAgo,
} from '@/utils/meta';
import { CURRENT_LOCATION } from '@/data/region';
import { distanceMeters } from '@/utils/geo';
import { Icon } from '@/components/common/Icon';

// ============================================================
// 커뮤니티 게시글 카드 (장소 기반 이동 경험 공유)
// 따뜻하고 깔끔한 느낌 · 사용자 간 도움 강조
// ============================================================

function distanceLabel(lat: number, lng: number): string {
  const m = distanceMeters(CURRENT_LOCATION, { lat, lng });
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
}

export function CommunityPostCard({
  post,
  onOpenComments,
  onViewOnMap,
}: {
  post: CommunityPost;
  onOpenComments: (post: CommunityPost) => void;
  onViewOnMap: (post: CommunityPost) => void;
}) {
  const markPostHelpfulAction = useStore((s) => s.markPostHelpfulAction);
  const confirmPostAction = useStore((s) => s.confirmPostAction);

  const type = COMMUNITY_TYPE_META[post.type];
  const status = COMMUNITY_STATUS_META[post.status];

  return (
    <article className="rounded-2xl bg-white p-4 shadow-card">
      {/* 상단 badge 줄 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold"
          style={{ color: type.color, background: type.bg }}
        >
          <span aria-hidden>{type.emoji}</span>
          {type.label}
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
          style={{ color: status.color, background: status.bg }}
        >
          <Icon name={status.icon as never} size={12} />
          {status.label}
        </span>
      </div>

      {/* 대상자 badge */}
      <div className="mt-2 flex flex-wrap gap-1">
        {post.affectedUsers.map((a) => (
          <span
            key={a}
            className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-semibold text-subtle"
          >
            {AFFECTED_META[a].emoji} {AFFECTED_META[a].label}
          </span>
        ))}
      </div>

      {/* 장소 · 거리 · 시간 */}
      <p className="mt-2 text-[11px] font-medium text-subtle">
        📍 {post.locationName} · {distanceLabel(post.lat, post.lng)} ·{' '}
        {timeAgo(post.createdAt)} · {post.anonymous ? '익명' : post.authorNickname}
      </p>

      {/* 제목 / 본문 */}
      <h3 className="mt-1.5 text-[15px] font-extrabold leading-snug text-ink">{post.title}</h3>
      <p className="mt-1 text-[13px] leading-snug text-ink/80">{post.content}</p>

      {/* 사진 placeholder */}
      {post.images.length > 0 && (
        <div className="mt-2.5 flex h-28 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-primary-50 to-softblue text-xs font-semibold text-subtle">
          <Icon name="building" size={20} />
          현장 사진 {post.images.length}장
        </div>
      )}

      {/* 액션 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => markPostHelpfulAction(post.id)}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary-500 px-2 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-600"
        >
          👍 도움돼요 {post.helpfulCount}
        </button>
        <button
          type="button"
          onClick={() => confirmPostAction(post.id)}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-mint-100 px-2 py-2.5 text-sm font-bold text-mint-600 transition-colors hover:brightness-95"
        >
          ✓ 나도 확인 {post.confirmations}
        </button>
      </div>

      {/* 하단 보조 액션 */}
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onOpenComments(post)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-bold text-subtle hover:bg-black/5"
        >
          💬 댓글 {post.commentsCount}
        </button>
        <button
          type="button"
          onClick={() => onViewOnMap(post)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-bold text-publicblue-600 hover:bg-publicblue-100"
        >
          <Icon name="route" size={15} />
          지도에서 보기
        </button>
      </div>
    </article>
  );
}
