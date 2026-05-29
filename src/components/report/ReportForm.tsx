import { useState } from 'react';
import type {
  ReportCategory,
  Severity,
  ReportStatus,
  AffectedUser,
} from '@/types';
import { useStore } from '@/store/useStore';
import { QUICK_PLACES, REGION_CENTER } from '@/data/region';
import {
  REPORT_META,
  REPORT_CATEGORY_ORDER,
  SEVERITY_META,
  STATUS_META,
  AFFECTED_META,
} from '@/utils/meta';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/ui';

// ============================================================
// 불편 제보 폼 (매우 쉬운 입력)
// ============================================================

const AFFECTED_ORDER: AffectedUser[] = [
  'wheelchair',
  'stroller',
  'elderly',
  'visually_impaired',
  'all',
];

const STATUS_ORDER: ReportStatus[] = ['active', 'resolved', 'needs_check'];

export function ReportForm({ onDone }: { onDone: () => void }) {
  const submitReport = useStore((s) => s.submitReport);

  const [category, setCategory] = useState<ReportCategory>('elevator_outage');
  const [locationName, setLocationName] = useState(QUICK_PLACES[0].name);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [affected, setAffected] = useState<AffectedUser[]>(['wheelchair']);
  const [status, setStatus] = useState<ReportStatus>('active');
  const [anonymous, setAnonymous] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleAffected = (a: AffectedUser) =>
    setAffected((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );

  const canSubmit = title.trim().length > 0 && affected.length > 0;

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const place = QUICK_PLACES.find((p) => p.name === locationName);
    const point = place ?? REGION_CENTER;
    // 위치를 살짝 흩뿌려 마커가 겹치지 않게
    const jitter = () => (Math.random() - 0.5) * 0.0014;
    await submitReport({
      category,
      title: title.trim(),
      description: description.trim() || REPORT_META[category].label,
      lat: point.lat + jitter(),
      lng: point.lng + jitter(),
      locationName,
      severity,
      affectedUsers: affected,
      status,
      anonymous,
      hasPhoto,
      authorNickname: anonymous ? undefined : '바퀴달린하루',
    });
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="space-y-5 pb-2">
      <Field label="어떤 불편인가요?" required>
        <div className="grid grid-cols-2 gap-2">
          {REPORT_CATEGORY_ORDER.map((c) => {
            const meta = REPORT_META[c];
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c)}
                className="flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-bold transition-colors"
                style={{
                  borderColor: active ? meta.color : '#e3ded3',
                  background: active ? `${meta.color}14` : '#fff',
                  color: active ? meta.color : '#3a4452',
                }}
              >
                <Icon name={meta.icon as never} size={18} />
                <span className="leading-tight">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="위치">
        <select
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          aria-label="위치 선택"
          className="w-full rounded-xl border border-black/10 bg-cream px-3 py-3 text-sm font-semibold text-ink outline-none"
        >
          {QUICK_PLACES.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="제목" required>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 엘리베이터가 멈춰 있어요"
          aria-label="제목"
          className="w-full rounded-xl border border-black/10 bg-cream px-3 py-3 text-sm font-semibold text-ink outline-none placeholder:text-subtle/60"
        />
      </Field>

      <Field label="설명">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="상황을 자세히 적어주시면 다른 분들에게 큰 도움이 돼요."
          aria-label="설명"
          className="w-full resize-none rounded-xl border border-black/10 bg-cream px-3 py-3 text-sm font-medium text-ink outline-none placeholder:text-subtle/60"
        />
      </Field>

      <Field label="위험·불편 정도">
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as Severity[]).map((s) => {
            const meta = SEVERITY_META[s];
            const active = severity === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setSeverity(s)}
                className="rounded-xl border-2 py-2.5 text-sm font-bold transition-colors"
                style={{
                  borderColor: active ? meta.color : '#e3ded3',
                  background: active ? meta.bg : '#fff',
                  color: active ? meta.color : '#5b6675',
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="해당 대상 (복수 선택)" required>
        <div className="flex flex-wrap gap-2">
          {AFFECTED_ORDER.map((a) => {
            const meta = AFFECTED_META[a];
            const active = affected.includes(a);
            return (
              <button
                key={a}
                type="button"
                aria-pressed={active}
                onClick={() => toggleAffected(a)}
                className="flex items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-sm font-bold transition-colors"
                style={{
                  borderColor: active ? '#0e9e8b' : '#e3ded3',
                  background: active ? '#e6f7f4' : '#fff',
                  color: active ? '#0a8174' : '#5b6675',
                }}
              >
                <span aria-hidden>{meta.emoji}</span>
                {meta.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="현재 상태">
        <div className="grid grid-cols-3 gap-2">
          {STATUS_ORDER.map((s) => {
            const meta = STATUS_META[s];
            const active = status === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(s)}
                className="rounded-xl border-2 py-2.5 text-sm font-bold transition-colors"
                style={{
                  borderColor: active ? meta.color : '#e3ded3',
                  background: active ? meta.bg : '#fff',
                  color: active ? meta.color : '#5b6675',
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </Field>

      {/* 사진 첨부 (UI) */}
      <Field label="사진 첨부">
        <button
          type="button"
          onClick={() => setHasPhoto((v) => !v)}
          aria-pressed={hasPhoto}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-sm font-bold transition-colors"
          style={{
            borderColor: hasPhoto ? '#0e9e8b' : '#cfc9bb',
            background: hasPhoto ? '#e6f7f4' : '#fbf9f4',
            color: hasPhoto ? '#0a8174' : '#8a93a0',
          }}
        >
          <Icon name="building" size={20} />
          {hasPhoto ? '사진 1장 첨부됨 (데모)' : '사진 추가하기'}
        </button>
      </Field>

      {/* 익명 토글 */}
      <label className="flex items-center justify-between rounded-xl bg-cream px-3 py-3">
        <span className="text-sm font-bold text-ink">익명으로 제보하기</span>
        <button
          type="button"
          role="switch"
          aria-checked={anonymous}
          onClick={() => setAnonymous((v) => !v)}
          className="relative h-7 w-12 rounded-full transition-colors"
          style={{ background: anonymous ? '#0e9e8b' : '#cfc9bb' }}
        >
          <span
            className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
            style={{ left: anonymous ? '26px' : '4px' }}
          />
        </button>
      </label>

      <PrimaryButton icon="warning" variant="coral" onClick={submit} disabled={!canSubmit || submitting}>
        {submitting ? '등록 중…' : '제보 등록하기'}
      </PrimaryButton>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-bold text-ink">
        {label}
        {required && <span className="ml-1 text-coral-600">*</span>}
      </p>
      {children}
    </div>
  );
}
