import { useEffect, useState } from 'react';
import type { CommunityPost } from '@/types';
import { useStore, commentsForPost } from '@/store/useStore';
import { COMMUNITY_TYPE_META, timeAgo } from '@/utils/meta';
import { Modal } from '@/components/common/Modal';

// ============================================================
// 댓글 시트 (간단한 댓글 목록 + 작성)
// ============================================================

export function CommentSheet({
  post,
  onClose,
}: {
  post: CommunityPost | null;
  onClose: () => void;
}) {
  const comments = useStore((s) => s.comments);
  const loadComments = useStore((s) => s.loadComments);
  const addCommentAction = useStore((s) => s.addCommentAction);

  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  useEffect(() => {
    if (post) loadComments(post.id);
  }, [post, loadComments]);

  if (!post) return <Modal open={false} onClose={onClose} title="댓글">{null}</Modal>;

  const list = commentsForPost(comments, post.id);
  const type = COMMUNITY_TYPE_META[post.type];

  const submit = async () => {
    if (text.trim().length === 0) return;
    await addCommentAction(post.id, {
      postId: post.id,
      content: text.trim(),
      authorNickname: anonymous ? '익명' : '바퀴달린하루',
      anonymous,
    });
    setText('');
  };

  return (
    <Modal open={!!post} onClose={onClose} title="댓글">
      {/* 원글 요약 */}
      <div className="mb-3 rounded-xl bg-cream p-3">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{ color: type.color, background: type.bg }}
        >
          {type.emoji} {type.label}
        </span>
        <p className="mt-1 text-sm font-bold text-ink">{post.title}</p>
        <p className="text-[11px] text-subtle">📍 {post.locationName}</p>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-2.5">
        {list.length === 0 ? (
          <p className="rounded-xl bg-cream px-3 py-5 text-center text-sm text-subtle">
            첫 댓글을 남겨 도움을 더해주세요.
          </p>
        ) : (
          list.map((c) => (
            <div key={c.id} className="rounded-xl bg-white p-3 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">
                  {c.anonymous ? '익명' : c.authorNickname}
                </span>
                <span className="text-[11px] text-subtle">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-ink/85">{c.content}</p>
            </div>
          ))
        )}
      </div>

      {/* 작성 */}
      <div className="sticky bottom-0 mt-4 space-y-2 bg-warmwhite pt-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-subtle">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4 accent-primary-500"
          />
          익명으로 작성
        </label>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder="따뜻한 한마디를 남겨주세요"
            aria-label="댓글 입력"
            className="min-w-0 flex-1 rounded-xl border border-black/10 bg-cream px-3 py-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={text.trim().length === 0}
            className="shrink-0 rounded-xl bg-primary-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            등록
          </button>
        </div>
      </div>
    </Modal>
  );
}
