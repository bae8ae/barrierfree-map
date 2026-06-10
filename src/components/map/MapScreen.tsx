import { useEffect, useState } from 'react';
import type { CommunityPost } from '@/types';
import { useStore } from '@/store/useStore';
import { MapView } from '@/components/map/MapView';
import { MapBottomSheet } from '@/components/map/MapBottomSheet';
import { ModeSelector } from '@/components/map/ModeSelector';
import { CategoryFilter } from '@/components/map/CategoryFilter';
import { ReportTrustLine, ReportReverify } from '@/components/report/ReportTrust';
import { CommentSheet } from '@/components/community/CommentSheet';
import { Modal } from '@/components/common/Modal';
import { Icon } from '@/components/common/Icon';
import { MVP_TEST_BADGE } from '@/data/region';
import { MOCK_SMOKING_ZONES } from '@/data/mockSmokingZones';
import {
  REPORT_META,
  SEVERITY_META,
  STATUS_META,
  COMMUNITY_TYPE_META,
  COMMUNITY_STATUS_META,
  MODE_META,
  MODE_FOCUS_SUMMARY,
  SMOKING_FILTER_HINT,
  timeAgo,
} from '@/utils/meta';

// ============================================================
// 지도 화면 (앱 첫 화면)
// 상단: 모드 필터 + 카테고리 필터 / 중앙: 지도 / 하단: 바텀시트
// ============================================================

export function MapScreen({
  onRoute,
  onReport,
}: {
  onRoute: () => void;
  onReport: () => void;
}) {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const mapFilters = useStore((s) => s.mapFilters);
  const toggleMapFilter = useStore((s) => s.toggleMapFilter);
  const setAllFilters = useStore((s) => s.setAllFilters);
  const selectFacility = useStore((s) => s.selectFacility);
  const reports = useStore((s) => s.reports);
  const communityPosts = useStore((s) => s.communityPosts);
  const mapFocusPostId = useStore((s) => s.mapFocusPostId);
  const clearMapFocus = useStore((s) => s.clearMapFocus);

  const [modeModal, setModeModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedSmokingId, setSelectedSmokingId] = useState<string | null>(null);
  const [commentsPost, setCommentsPost] = useState<CommunityPost | null>(null);
  const selectedReport = reports.find((r) => r.id === selectedReportId) ?? null;
  const selectedPost = communityPosts.find((p) => p.id === selectedPostId) ?? null;
  const selectedSmoking =
    MOCK_SMOKING_ZONES.find((z) => z.id === selectedSmokingId) ?? null;

  // "지도에서 보기" 진입 시 해당 게시글에 포커스
  useEffect(() => {
    if (mapFocusPostId) {
      setSelectedReportId(null);
      setSelectedPostId(mapFocusPostId);
      clearMapFocus();
    }
  }, [mapFocusPostId, clearMapFocus]);

  return (
    <div className="relative h-full">
      <MapView
        onSelectFacility={(id) => {
          setSelectedReportId(null);
          setSelectedPostId(null);
          setSelectedSmokingId(null);
          selectFacility(id);
        }}
        onSelectReport={(id) => {
          setSelectedPostId(null);
          setSelectedSmokingId(null);
          setSelectedReportId(id);
        }}
        onSelectPost={(id) => {
          setSelectedReportId(null);
          setSelectedSmokingId(null);
          setSelectedPostId(id);
        }}
        onSelectSmoking={(id) => {
          setSelectedReportId(null);
          setSelectedPostId(null);
          setSelectedSmokingId(id);
        }}
        onLocationClick={() => setModeModal(true)}
        selectedReportId={selectedReportId}
        selectedPostId={selectedPostId}
        selectedSmokingId={selectedSmokingId}
      />

      {/* 상단 필터 패널 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-2 bg-gradient-to-b from-warmwhite/95 via-warmwhite/80 to-transparent px-3 pb-5 pt-3">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white shadow-float">
            <Icon name="route" size={18} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-ink">BarrierFree Map</p>
            <p className="text-[10px] font-medium text-subtle">지금 이동 가능한 길</p>
          </div>
          <span className="ml-auto rounded-full bg-caution-100 px-2.5 py-1 text-[10px] font-bold text-caution-600 shadow-sm">
            {MVP_TEST_BADGE}
          </span>
        </div>
        <div className="pointer-events-auto">
          <ModeSelector mode={mode} onChange={setMode} />
        </div>
        <div className="pointer-events-auto rounded-xl bg-white/85 px-2.5 py-1 text-[10px] font-semibold leading-snug text-subtle shadow-sm">
          <span className="font-bold text-primary-700">{MODE_META[mode].label} 모드</span>{' '}
          · {MODE_FOCUS_SUMMARY[mode]}
        </div>
        <div className="pointer-events-auto">
          <CategoryFilter filters={mapFilters} onToggle={toggleMapFilter} onAll={setAllFilters} />
        </div>
      </div>

      {/* 선택된 제보 플로팅 카드 */}
      {selectedReport && (
        <div className="pointer-events-auto absolute inset-x-3 bottom-[280px] z-40">
          <ReportPeek
            reportId={selectedReport.id}
            onClose={() => setSelectedReportId(null)}
          />
        </div>
      )}

      {/* 선택된 커뮤니티 글 플로팅 카드 */}
      {selectedPost && (
        <div className="pointer-events-auto absolute inset-x-3 bottom-[280px] z-40">
          <CommunityPeek
            postId={selectedPost.id}
            onClose={() => setSelectedPostId(null)}
            onComments={() => setCommentsPost(selectedPost)}
          />
        </div>
      )}

      {/* 선택된 간접흡연 주의 구역(보조 정보) 카드 */}
      {selectedSmoking && (
        <div className="pointer-events-auto absolute inset-x-3 bottom-[280px] z-40">
          <div className="animate-popIn rounded-2xl border border-dashed border-[#b8c0cc] bg-white p-3.5 shadow-sheet">
            <div className="flex items-start gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#7c8aa0] text-[#5b6675]">
                <Icon name="smoking" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="rounded-full bg-[#eef0ee] px-2 py-0.5 text-[11px] font-bold text-[#5b6675]">
                  보조 정보 · 간접흡연 주의 구역
                </span>
                <p className="mt-1 truncate text-sm font-extrabold text-ink">
                  {selectedSmoking.name}
                </p>
                <p className="text-[11px] font-medium text-subtle">
                  노출 정도 {selectedSmoking.intensity === 'high' ? '높음' : selectedSmoking.intensity === 'medium' ? '보통' : '약함'} · {timeAgo(selectedSmoking.lastUpdated)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSmokingId(null)}
                aria-label="닫기"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-subtle"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-[13px] leading-snug text-ink/80">{selectedSmoking.note}</p>
            <p className="mt-2 rounded-lg bg-[#f3f1ec] px-2.5 py-1.5 text-[11px] font-medium leading-snug text-subtle">
              {SMOKING_FILTER_HINT}
            </p>
          </div>
        </div>
      )}

      <MapBottomSheet onRoute={onRoute} onReport={onReport} />

      {/* 모드 변경 모달 */}
      <Modal open={modeModal} onClose={() => setModeModal(false)} title="이동 모드 선택">
        <p className="mb-3 text-sm text-subtle">
          선택한 모드에 맞춰 지도 마커와 경로 추천이 조정돼요.
        </p>
        <ModeSelector
          mode={mode}
          onChange={(m) => {
            setMode(m);
            setModeModal(false);
          }}
          variant="grid"
        />
      </Modal>

      {/* 댓글 시트 */}
      <CommentSheet post={commentsPost} onClose={() => setCommentsPost(null)} />
    </div>
  );
}

// 지도 위 선택 커뮤니티 글 미니 카드
function CommunityPeek({
  postId,
  onClose,
  onComments,
}: {
  postId: string;
  onClose: () => void;
  onComments: () => void;
}) {
  const post = useStore((s) => s.communityPosts.find((p) => p.id === postId));
  const markPostHelpfulAction = useStore((s) => s.markPostHelpfulAction);
  const confirmPostAction = useStore((s) => s.confirmPostAction);
  if (!post) return null;

  const type = COMMUNITY_TYPE_META[post.type];
  const status = COMMUNITY_STATUS_META[post.status];

  return (
    <div className="animate-popIn rounded-2xl border border-black/5 bg-white p-3.5 shadow-sheet">
      <div className="flex items-start gap-2.5">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: status.color }}
        >
          <Icon name={type.icon as never} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ color: type.color, background: type.bg }}
            >
              {type.label}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ color: status.color, background: status.bg }}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-1 truncate text-sm font-extrabold text-ink">{post.title}</p>
          <p className="flex items-center gap-1 text-[11px] font-medium text-subtle">
            <Icon name="location" size={11} />
            {post.locationName} · {timeAgo(post.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-subtle"
        >
          ✕
        </button>
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-ink/80">{post.content}</p>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        <PeekAction
          label={`도움 ${post.helpfulCount}`}
          onClick={() => markPostHelpfulAction(post.id)}
        />
        <PeekAction
          label={`확인 ${post.confirmations}`}
          onClick={() => confirmPostAction(post.id)}
        />
        <PeekAction label={`댓글 ${post.commentsCount}`} tone="mint" onClick={onComments} />
      </div>
    </div>
  );
}

// 지도 위 선택 제보 미니 카드 (확인/도움돼요/해결 액션 포함)
function ReportPeek({ reportId, onClose }: { reportId: string; onClose: () => void }) {
  const report = useStore((s) => s.reports.find((r) => r.id === reportId));
  const confirmReportAction = useStore((s) => s.confirmReportAction);
  const markHelpfulAction = useStore((s) => s.markHelpfulAction);
  const setReportStatusAction = useStore((s) => s.setReportStatusAction);
  if (!report) return null;

  const meta = REPORT_META[report.category];
  const sev = SEVERITY_META[report.severity];
  const status = STATUS_META[report.status];

  return (
    <div className="animate-popIn rounded-2xl border border-black/5 bg-white p-3.5 shadow-sheet">
      <div className="flex items-start gap-2.5">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: meta.color }}
        >
          <Icon name={meta.icon as never} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ color: sev.color, background: sev.bg }}
            >
              위험 {sev.label}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ color: status.color, background: status.bg }}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-1 truncate text-sm font-extrabold text-ink">{report.title}</p>
          <p className="flex items-center gap-1 text-[11px] font-medium text-subtle">
            <Icon name="location" size={11} />
            {report.locationName} · {timeAgo(report.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-subtle"
        >
          ✕
        </button>
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-ink/80">
        {report.description}
      </p>

      {/* 신뢰도 요약 (신뢰도·확인 수·사진·최신성) */}
      <ReportTrustLine report={report} />

      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        <PeekAction
          label={`확인 ${report.confirmations}`}
          onClick={() => confirmReportAction(report.id)}
        />
        <PeekAction
          label={`도움 ${report.helpfulCount}`}
          onClick={() => markHelpfulAction(report.id)}
        />
        <PeekAction
          label="해결됨"
          tone="mint"
          disabled={report.status === 'resolved'}
          onClick={() => setReportStatusAction(report.id, 'resolved')}
        />
      </div>

      {/* 오래된/확인 필요 제보 재확인 UX */}
      <ReportReverify report={report} />
    </div>
  );
}

function PeekAction({
  label,
  onClick,
  tone = 'default',
  disabled,
}: {
  label: string;
  onClick: () => void;
  tone?: 'default' | 'mint';
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl px-2 py-2 text-xs font-bold transition-colors disabled:opacity-40"
      style={
        tone === 'mint'
          ? { background: '#dcfce9', color: '#16a35e' }
          : { background: '#f1ede4', color: '#3a4452' }
      }
    >
      {label}
    </button>
  );
}
