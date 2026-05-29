import { useState } from 'react';
import type { TravelMode, PublicFacility } from '@/types';
import { useStore, reviewsForFacility, postsForFacility } from '@/store/useStore';
import {
  FACILITY_META,
  COMMUNITY_TYPE_META,
  COMMUNITY_STATUS_META,
  timeAgo,
} from '@/utils/meta';
import { Modal } from '@/components/common/Modal';
import { Icon } from '@/components/common/Icon';
import { ScorePill, PrimaryButton, SectionTitle } from '@/components/common/ui';
import { ReviewCard } from '@/components/facility/ReviewCard';
import { capabilityList } from '@/components/facility/FacilityCard';

// ============================================================
// 시설 상세 (공공 데이터 + 사용자 리뷰 + 최근 커뮤니티 글 + 액션)
// ============================================================

export function FacilityDetailModal({
  onReportProblem,
  onShareStatus,
}: {
  onReportProblem?: () => void;
  onShareStatus?: (facility: PublicFacility) => void;
}) {
  const selectedId = useStore((s) => s.selectedFacilityId);
  const facility = useStore((s) => s.facilities.find((f) => f.id === s.selectedFacilityId));
  const reviews = useStore((s) => s.reviews);
  const communityPosts = useStore((s) => s.communityPosts);
  const selectFacility = useStore((s) => s.selectFacility);
  const confirmFacility = useStore((s) => s.confirmFacility);
  const showToast = useStore((s) => s.showToast);
  const addReview = useStore((s) => s.addReview);
  const mode = useStore((s) => s.mode);

  const [writing, setWriting] = useState(false);

  const open = !!selectedId && !!facility;
  const close = () => {
    selectFacility(null);
    setWriting(false);
  };

  if (!facility) {
    return <Modal open={false} onClose={close} title="시설 정보">{null}</Modal>;
  }

  const meta = FACILITY_META[facility.category];
  const caps = capabilityList(facility);
  const facReviews = reviewsForFacility(reviews, facility.id);
  const facPosts = postsForFacility(communityPosts, facility.id).slice(0, 4);

  return (
    <Modal open={open} onClose={close} title={facility.name}>
      {/* 헤더 요약 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ background: meta.color }}
          >
            <Icon name={meta.icon as never} size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{meta.label}</p>
            <p className="text-xs text-subtle">{facility.address}</p>
          </div>
        </div>
        <ScorePill score={facility.accessibilityScore} />
      </div>

      <p className="mt-3 rounded-xl bg-primary-50 px-3 py-2 text-[13px] font-semibold text-primary-700">
        시설이 있다는 것보다 중요한 건, 지금 실제로 이동할 수 있는지입니다.
      </p>

      {/* 공공 데이터 출처 */}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-publicblue-100 px-2.5 py-1 font-bold text-publicblue-700">
          공공 API 기반 정보
        </span>
        <span className="text-subtle">최근 확인 {timeAgo(facility.lastUpdated)}</span>
      </div>

      {/* 접근성 속성 그리드 */}
      <SectionTitle style={{ marginTop: 16 }}>접근성 정보</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {caps.map((c) => (
          <div
            key={c.key}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: c.ok ? '#e9f7f1' : '#f3f0ea' }}
          >
            <Icon name={c.icon} size={16} />
            <span className="flex-1 text-[13px] font-semibold text-ink">{c.label}</span>
            <span
              className="text-xs font-extrabold"
              style={{ color: c.ok ? '#16a35e' : '#9aa6b2' }}
            >
              {c.ok ? '가능 ✓' : '없음'}
            </span>
          </div>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <SmallAction icon="building" label="정보 수정 제안" onClick={() => showToast('정보 수정 제안이 접수됐어요. 검토 후 반영됩니다.', 'info')} />
        <SmallAction icon="ramp" label="이용 가능 확인" tone="mint" onClick={() => confirmFacility(facility.id)} />
        <SmallAction
          icon="warning"
          label="문제 제보"
          tone="coral"
          onClick={() => {
            close();
            onReportProblem?.();
          }}
        />
      </div>

      {/* 최근 커뮤니티 글 */}
      <SectionTitle style={{ marginTop: 20 }} hint={`${facPosts.length}건`}>
        최근 커뮤니티 글
      </SectionTitle>
      <p className="mb-2 text-[12px] font-medium text-subtle">
        공공데이터는 시설의 존재를, 커뮤니티는 실제 이용 가능 여부를 알려줍니다.
      </p>
      <div className="space-y-2">
        {facPosts.length === 0 ? (
          <p className="rounded-xl bg-cream px-3 py-4 text-center text-sm text-subtle">
            이 시설의 커뮤니티 글이 아직 없어요.
          </p>
        ) : (
          facPosts.map((p) => {
            const t = COMMUNITY_TYPE_META[p.type];
            const st = COMMUNITY_STATUS_META[p.status];
            return (
              <div key={p.id} className="rounded-xl bg-cream p-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{ color: t.color, background: t.bg }}
                  >
                    {t.emoji} {t.label}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{ color: st.color, background: st.bg }}
                  >
                    {st.label}
                  </span>
                  <span className="ml-auto text-[11px] text-subtle">{timeAgo(p.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-ink">{p.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-ink/75">
                  {p.content}
                </p>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-3">
        <PrimaryButton
          icon="route"
          onClick={() => {
            close();
            onShareStatus?.(facility);
          }}
        >
          이 시설 상태 공유하기
        </PrimaryButton>
      </div>

      {/* 리뷰 */}
      <SectionTitle style={{ marginTop: 20 }} hint={`${facReviews.length}개`}>
        실이용 후기
      </SectionTitle>

      {!writing && (
        <div className="mb-3">
          <PrimaryButton variant="outline" onClick={() => setWriting(true)} icon="route">
            내 이용 후기 남기기
          </PrimaryButton>
        </div>
      )}
      {writing && (
        <ReviewForm
          mode={mode === 'all' ? 'wheelchair' : mode}
          onSubmit={(rating, content, tags) => {
            addReview({
              facilityId: facility.id,
              userMode: mode === 'all' ? 'wheelchair' : (mode as TravelMode),
              rating,
              content,
              tags,
              authorNickname: '바퀴달린하루',
            });
            setWriting(false);
          }}
          onCancel={() => setWriting(false)}
        />
      )}

      <div className="mt-2 space-y-2.5">
        {facReviews.length === 0 ? (
          <p className="rounded-xl bg-cream px-3 py-4 text-center text-sm text-subtle">
            아직 후기가 없어요. 첫 후기를 남겨보세요!
          </p>
        ) : (
          facReviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </div>
    </Modal>
  );
}

function SmallAction({
  icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: 'building' | 'ramp' | 'warning';
  label: string;
  onClick: () => void;
  tone?: 'default' | 'mint' | 'coral';
}) {
  const styles: Record<string, { bg: string; color: string }> = {
    default: { bg: '#f1ede4', color: '#3a4452' },
    mint: { bg: '#dcfce9', color: '#16a35e' },
    coral: { bg: '#ffe6e2', color: '#c83a22' },
  };
  const s = styles[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl px-1 py-3 text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      <Icon name={icon} size={18} />
      {label}
    </button>
  );
}

function ReviewForm({
  mode,
  onSubmit,
  onCancel,
}: {
  mode: TravelMode;
  onSubmit: (rating: number, content: string, tags: string[]) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(4);
  const [content, setContent] = useState('');
  const TAG_OPTIONS = ['경사로 완만', '경사 가파름', '입구 턱', '내부 통로 좁음', '자동문', '직원 친절'];
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <div className="mb-3 space-y-3 rounded-2xl border border-primary-200 bg-white p-3.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-ink">별점</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n}점`}
            onClick={() => setRating(n)}
            className="text-xl"
            style={{ color: n <= rating ? '#f5b921' : '#d6d0c4' }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        placeholder={`${mode === 'wheelchair' ? '휠체어' : '내'} 이용 경험을 적어주세요`}
        className="w-full resize-none rounded-xl border border-black/10 bg-cream px-3 py-2.5 text-sm outline-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {TAG_OPTIONS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tags.includes(t)}
            onClick={() => toggleTag(t)}
            className="rounded-full border px-2.5 py-1 text-xs font-semibold"
            style={{
              borderColor: tags.includes(t) ? '#0e9e8b' : '#e3ded3',
              background: tags.includes(t) ? '#e6f7f4' : '#fff',
              color: tags.includes(t) ? '#0a8174' : '#5b6675',
            }}
          >
            #{t}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-black/5 py-2.5 text-sm font-bold text-subtle"
        >
          취소
        </button>
        <button
          type="button"
          disabled={content.trim().length === 0}
          onClick={() => onSubmit(rating, content.trim(), tags)}
          className="flex-1 rounded-xl bg-primary-500 py-2.5 text-sm font-bold text-white disabled:opacity-40"
        >
          후기 등록
        </button>
      </div>
    </div>
  );
}
