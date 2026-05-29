import type { AccessibilityReview } from '@/types';
import { MODE_META, timeAgo } from '@/utils/meta';

// ============================================================
// 시설 접근성 리뷰 카드 (실이용 후기)
// ============================================================

export function ReviewCard({ review }: { review: AccessibilityReview }) {
  const meta = MODE_META[review.userMode];
  return (
    <article className="rounded-2xl bg-cream p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            {meta.emoji}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-ink">
              {review.authorNickname ?? '익명'}
            </p>
            <p className="text-[11px] font-medium text-subtle">
              {meta.short} · {timeAgo(review.createdAt)}
            </p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="mt-2 text-[13px] leading-snug text-ink/85">{review.content}</p>
      {review.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {review.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-subtle"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sm font-bold text-caution-600" aria-label={`별점 ${rating}점 / 5점`}>
      {'★'.repeat(Math.round(rating))}
      <span className="text-black/15">{'★'.repeat(5 - Math.round(rating))}</span>
    </span>
  );
}
