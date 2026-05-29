import type { ReactNode, CSSProperties } from 'react';
import { Icon, type IconKey } from '@/components/common/Icon';
import { scoreGrade } from '@/utils/score';

// ============================================================
// 공통 UI 프리미티브
// 색상 + 아이콘 + 텍스트를 항상 병행해 접근성 확보
// ============================================================

/** 작은 라운드 칩(필터/태그). selected 시 강조 */
export function Chip({
  label,
  icon,
  selected = false,
  onClick,
  color,
  ariaPressed,
}: {
  label: string;
  icon?: IconKey;
  selected?: boolean;
  onClick?: () => void;
  color?: string;
  ariaPressed?: boolean;
}) {
  const accent = color ?? '#0e9e8b';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed ?? selected}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors"
      style={{
        borderColor: selected ? accent : '#e3ded3',
        background: selected ? accent : '#fff',
        color: selected ? '#fff' : '#3a4452',
      }}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      {label}
    </button>
  );
}

/** 정적 태그 (클릭 불가) */
export function Tag({
  children,
  color,
  bg,
}: {
  children: ReactNode;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color: color ?? '#3a4452', background: bg ?? '#f1ede4' }}
    >
      {children}
    </span>
  );
}

/** 점수 배지 (등급 라벨 + 색) */
export function ScorePill({
  score,
  size = 'md',
}: {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const g = scoreGrade(score);
  const pad =
    size === 'lg' ? 'px-3.5 py-2 text-base' : size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${pad}`}
      style={{ color: g.color, background: g.bg }}
      aria-label={`접근성 점수 ${score}점, ${g.label}`}
    >
      <span aria-hidden>●</span>
      {score}점 · {g.label}
    </span>
  );
}

/** 큰 통계 숫자 박스 */
export function Stat({
  value,
  label,
  icon,
  tone = 'default',
}: {
  value: ReactNode;
  label: string;
  icon?: IconKey;
  tone?: 'default' | 'danger' | 'success' | 'caution' | 'blue';
}) {
  const toneColor: Record<string, string> = {
    default: '#0a8174',
    danger: '#c83a22',
    success: '#16a35e',
    caution: '#d99708',
    blue: '#2563eb',
  };
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-center gap-1.5" style={{ color: toneColor[tone] }}>
        {icon ? <Icon name={icon} size={18} /> : null}
        <span className="text-2xl font-extrabold leading-none">{value}</span>
      </div>
      <span className="text-xs font-medium text-subtle">{label}</span>
    </div>
  );
}

/** 도메인 마커/아이콘을 색 원 안에 표시 */
export function IconBadge({
  icon,
  color,
  size = 40,
  emoji,
}: {
  icon?: IconKey;
  color: string;
  size?: number;
  emoji?: string;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.5 }}
      aria-hidden
    >
      {emoji ? emoji : icon ? <Icon name={icon} size={size * 0.55} /> : null}
    </span>
  );
}

/** 섹션 제목 */
export function SectionTitle({
  children,
  hint,
  style,
}: {
  children: ReactNode;
  hint?: string;
  style?: CSSProperties;
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between" style={style}>
      <h2 className="text-lg font-extrabold text-ink">{children}</h2>
      {hint ? <span className="text-xs font-medium text-subtle">{hint}</span> : null}
    </div>
  );
}

/** 빈 상태 */
export function EmptyState({ icon, title, desc }: { icon: IconKey; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 px-6 py-10 text-center">
      <span className="text-primary-400">
        <Icon name={icon} size={36} />
      </span>
      <p className="font-bold text-ink">{title}</p>
      {desc ? <p className="text-sm text-subtle">{desc}</p> : null}
    </div>
  );
}

/** 큰 기본 버튼 (접근성: 넓은 터치 영역) */
export function PrimaryButton({
  children,
  onClick,
  icon,
  variant = 'primary',
  type = 'button',
  disabled,
  full = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: IconKey;
  variant?: 'primary' | 'coral' | 'outline';
  type?: 'button' | 'submit';
  disabled?: boolean;
  full?: boolean;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-bold transition-all active:scale-[0.98] disabled:opacity-40';
  const styles: Record<string, string> = {
    primary: 'bg-primary-500 text-white shadow-float hover:bg-primary-600',
    coral: 'bg-coral-600 text-white hover:bg-coral-700',
    outline: 'border-2 border-primary-300 bg-white text-primary-600',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${full ? 'w-full' : ''}`}
    >
      {icon ? <Icon name={icon} size={20} /> : null}
      {children}
    </button>
  );
}
