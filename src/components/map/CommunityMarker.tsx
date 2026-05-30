import type { CommunityPost } from '@/types';
import { COMMUNITY_TYPE_META, COMMUNITY_STATUS_META } from '@/utils/meta';
import { projectToPercent } from '@/utils/geo';

// ============================================================
// 커뮤니티 게시글 마커 (실시간 이용 가능성)
// 색 = 상태, 이모지 = 유형. 확인 필요/이용 어려움은 펄스로 강조
// ============================================================

export function CommunityMarker({
  post,
  selected,
  onClick,
  x,
  y,
}: {
  post: CommunityPost;
  selected?: boolean;
  onClick?: () => void;
  /** 화면 백분율 좌표 override (지도 확대/이동 반영). 없으면 기본 투영 */
  x?: number;
  y?: number;
}) {
  const type = COMMUNITY_TYPE_META[post.type];
  const status = COMMUNITY_STATUS_META[post.status];
  const pos = projectToPercent(post.lat, post.lng);
  const left = x ?? pos.x;
  const top = y ?? pos.y;
  const isAlert = post.status === 'needs_check' || post.status === 'unavailable';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`커뮤니티 ${type.label}: ${post.title}, ${status.label}`}
      className="absolute -translate-x-1/2 -translate-y-1/2 focus-visible:z-30"
      style={{ left: `${left}%`, top: `${top}%`, zIndex: selected ? 27 : 16 }}
    >
      <span className="relative flex items-center justify-center">
        {isAlert && (
          <span
            className="absolute inset-0 m-auto h-9 w-9 rounded-full animate-pulseRing"
            style={{ background: status.color }}
            aria-hidden
          />
        )}
        <span
          className="relative flex items-center justify-center rounded-full border-2 border-white text-base shadow-card"
          style={{
            width: selected ? 38 : 32,
            height: selected ? 38 : 32,
            background: status.color,
            transform: selected ? 'scale(1.05)' : undefined,
          }}
        >
          <span aria-hidden>{type.emoji}</span>
        </span>
      </span>
    </button>
  );
}
