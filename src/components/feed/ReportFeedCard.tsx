import type { UserReport } from '@/types';
import { useStore } from '@/store/useStore';
import { REPORT_META, SEVERITY_META, STATUS_META, AFFECTED_META, timeAgo } from '@/utils/meta';
import { Icon } from '@/components/common/Icon';

// ============================================================
// 커뮤니티 피드 카드 (이동 경험 데이터 축적용)
// ============================================================

export function ReportFeedCard({ report }: { report: UserReport }) {
  const confirmReportAction = useStore((s) => s.confirmReportAction);
  const markHelpfulAction = useStore((s) => s.markHelpfulAction);
  const setReportStatusAction = useStore((s) => s.setReportStatusAction);

  const meta = REPORT_META[report.category];
  const sev = SEVERITY_META[report.severity];
  const status = STATUS_META[report.status];
  const resolved = report.status === 'resolved';

  return (
    <article className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: resolved ? '#9aa6b2' : meta.color }}
        >
          <Icon name={meta.icon as never} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-extrabold text-ink">{meta.label}</span>
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
          <p className="mt-0.5 text-[11px] font-medium text-subtle">
            📍 {report.locationName} · {timeAgo(report.createdAt)} ·{' '}
            {report.anonymous ? '익명' : report.authorNickname ?? '익명'}
          </p>
        </div>
      </div>

      <p className="mt-2 text-[15px] font-bold text-ink">{report.title}</p>
      <p className="mt-1 text-[13px] leading-snug text-ink/80">{report.description}</p>

      {/* 대상자 */}
      <div className="mt-2 flex flex-wrap gap-1">
        {report.affectedUsers.map((a) => (
          <span
            key={a}
            className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-semibold text-subtle"
          >
            {AFFECTED_META[a].emoji} {AFFECTED_META[a].label}
          </span>
        ))}
      </div>

      {/* 사진 placeholder */}
      {report.hasPhoto && (
        <div className="mt-2.5 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-softblue text-xs font-semibold text-subtle">
          <Icon name="building" size={20} />
          <span className="ml-1.5">현장 사진</span>
        </div>
      )}

      {/* 액션 */}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <FeedAction
          icon="step"
          label={`나도 확인 ${report.confirmations}`}
          onClick={() => confirmReportAction(report.id)}
        />
        <FeedAction
          icon="ramp"
          label="해결됐어요"
          tone="mint"
          disabled={resolved}
          onClick={() => setReportStatusAction(report.id, 'resolved')}
        />
        <FeedAction
          icon="route"
          label={`도움됐어요 ${report.helpfulCount}`}
          onClick={() => markHelpfulAction(report.id)}
        />
      </div>
    </article>
  );
}

function FeedAction({
  icon,
  label,
  onClick,
  tone = 'default',
  disabled,
}: {
  icon: 'step' | 'ramp' | 'route';
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
      className="flex items-center justify-center gap-1 rounded-xl px-1 py-2 text-[12px] font-bold transition-colors disabled:opacity-40"
      style={
        tone === 'mint'
          ? { background: '#dcfce9', color: '#16a35e' }
          : { background: '#f1ede4', color: '#3a4452' }
      }
    >
      <Icon name={icon} size={14} />
      {label}
    </button>
  );
}
