import type { UserReport } from '@/types';
import { useStore } from '@/store/useStore';
import { CONFIDENCE_META, TRUST_STATUS_META, timeAgo } from '@/utils/meta';

// ============================================================
// 제보 신뢰도 표시 + 재확인 UX
// "신뢰도 높음 · 12명 확인 · 사진 있음 · 15분 전" 형태로 노출하고,
// 오래되었거나 확인이 필요한 제보에는 재확인 버튼을 제공한다.
// ============================================================

/** 재확인 버튼을 노출해야 하는 제보인지 (오래됨 / 확인 필요 / 만료 예정 / 반박 있음) */
export function needsReverify(report: UserReport): boolean {
  if (report.status === 'resolved') return false;
  return (
    report.status === 'needs_check' ||
    report.trustStatus === '확인 필요' ||
    report.trustStatus === '만료 예정' ||
    report.trustStatus === '반박 있음'
  );
}

/** 신뢰도 한 줄 요약 */
export function ReportTrustLine({ report }: { report: UserReport }) {
  const conf = CONFIDENCE_META[report.confidence];
  const trust = TRUST_STATUS_META[report.trustStatus];
  const stale = report.trustStatus === '만료 예정' || needsReverify(report);

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{ color: conf.color, background: conf.bg }}
        >
          {conf.label}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{ color: trust.color, background: trust.bg }}
        >
          {trust.label}
        </span>
        <span className="text-[11px] font-medium text-subtle">
          {report.verifiedCount}명 확인 · {report.hasPhoto ? '사진 있음' : '사진 없음'} ·{' '}
          {timeAgo(report.lastUpdated)}
        </span>
      </div>
      {stale && (
        <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold leading-snug text-amber-700">
          오래된 제보입니다. 현재 상태를 확인해주세요.
          {report.expiresInHours != null && ` (약 ${report.expiresInHours}시간 내 만료 예정)`}
        </p>
      )}
    </div>
  );
}

/** 재확인 3버튼: 아직 불편해요 / 해결됐어요 / 잘 모르겠어요 */
export function ReportReverify({ report }: { report: UserReport }) {
  const reaffirmReportAction = useStore((s) => s.reaffirmReportAction);
  const setReportStatusAction = useStore((s) => s.setReportStatusAction);
  const showToast = useStore((s) => s.showToast);

  if (!needsReverify(report)) return null;

  return (
    <div className="mt-2.5">
      <p className="mb-1.5 text-[11px] font-bold text-subtle">
        이 제보, 지금도 유효한가요?
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        <ReverifyButton
          label="아직 불편해요"
          tone="coral"
          onClick={() => reaffirmReportAction(report.id)}
        />
        <ReverifyButton
          label="해결됐어요"
          tone="mint"
          onClick={() => setReportStatusAction(report.id, 'resolved')}
        />
        <ReverifyButton
          label="잘 모르겠어요"
          tone="default"
          onClick={() =>
            showToast('알려주셔서 고마워요. 다른 사용자의 확인을 기다릴게요.', 'info')
          }
        />
      </div>
    </div>
  );
}

function ReverifyButton({
  label,
  onClick,
  tone,
}: {
  label: string;
  onClick: () => void;
  tone: 'default' | 'mint' | 'coral';
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
      className="rounded-xl px-1 py-2 text-[11px] font-bold leading-tight transition-colors"
      style={{ background: s.bg, color: s.color }}
    >
      {label}
    </button>
  );
}
