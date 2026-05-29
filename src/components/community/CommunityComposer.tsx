import { useState } from 'react';
import type {
  CommunityPostType,
  CommunityPostStatus,
  AffectedUser,
} from '@/types';
import { useStore } from '@/store/useStore';
import { QUICK_PLACES, CURRENT_LOCATION, REGION_CENTER } from '@/data/region';
import {
  COMMUNITY_TYPE_META,
  COMMUNITY_TYPE_ORDER,
  COMMUNITY_STATUS_META,
  COMMUNITY_STATUS_ORDER,
  AFFECTED_META,
  MAP_FILTER_META,
  MAP_FILTER_ORDER,
} from '@/utils/meta';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/ui';

// ============================================================
// 커뮤니티 게시글 작성
// ============================================================

export type ComposerPrefill = {
  type?: CommunityPostType;
  facilityId?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
};

const AFFECTED_ORDER: AffectedUser[] = [
  'wheelchair',
  'stroller',
  'elderly',
  'visually_impaired',
  'all',
];

export function CommunityComposer({
  prefill,
  onDone,
}: {
  prefill?: ComposerPrefill;
  onDone: () => void;
}) {
  const submitCommunityPost = useStore((s) => s.submitCommunityPost);

  const [type, setType] = useState<CommunityPostType>(prefill?.type ?? 'report');
  const [locationName, setLocationName] = useState(prefill?.locationName ?? QUICK_PLACES[0].name);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    prefill?.lat != null && prefill?.lng != null
      ? { lat: prefill.lat, lng: prefill.lng }
      : QUICK_PLACES[0],
  );
  const [usingCurrent, setUsingCurrent] = useState(false);
  const [affected, setAffected] = useState<AffectedUser[]>(['wheelchair']);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<CommunityPostStatus>('needs_check');
  const [tags, setTags] = useState<string[]>([]);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleAffected = (a: AffectedUser) =>
    setAffected((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));
  const toggleTag = (t: string) =>
    setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const pickPlace = (name: string) => {
    setUsingCurrent(false);
    setLocationName(name);
    const p = QUICK_PLACES.find((q) => q.name === name);
    if (p) setCoords({ lat: p.lat, lng: p.lng });
  };

  const useCurrentLocation = () => {
    setUsingCurrent(true);
    setLocationName('현재 위치 (안암역 인근)');
    setCoords({ ...CURRENT_LOCATION });
  };

  const canSubmit = title.trim().length > 0 && affected.length > 0;

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const jitter = () => (Math.random() - 0.5) * 0.0012;
    await submitCommunityPost({
      type,
      title: title.trim(),
      content: content.trim() || COMMUNITY_TYPE_META[type].label,
      facilityId: prefill?.facilityId,
      locationName,
      lat: (coords.lat || REGION_CENTER.lat) + jitter(),
      lng: (coords.lng || REGION_CENTER.lng) + jitter(),
      affectedUsers: affected,
      status,
      images: hasPhoto ? ['photo'] : [],
      anonymous,
      authorNickname: anonymous ? '익명' : '바퀴달린하루',
      tags,
    });
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="space-y-5 pb-2">
      {/* 안내 */}
      <p className="rounded-xl bg-primary-50 px-3 py-2 text-[13px] font-semibold leading-snug text-primary-700">
        공공데이터는 시설의 존재를, 커뮤니티는 실제 이용 가능 여부를 알려줍니다.
      </p>

      {/* 유형 */}
      <Field label="게시글 유형" required>
        <div className="grid grid-cols-2 gap-2">
          {COMMUNITY_TYPE_ORDER.map((t) => {
            const meta = COMMUNITY_TYPE_META[t];
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => setType(t)}
                className="flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-bold transition-colors"
                style={{
                  borderColor: active ? meta.color : '#e3ded3',
                  background: active ? meta.bg : '#fff',
                  color: active ? meta.color : '#3a4452',
                }}
              >
                <span aria-hidden>{meta.emoji}</span>
                {meta.label}
              </button>
            );
          })}
        </div>
      </Field>

      {/* 위치 */}
      <Field label="장소" required>
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={useCurrentLocation}
              aria-pressed={usingCurrent}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-sm font-bold transition-colors"
              style={{
                borderColor: usingCurrent ? '#0e9e8b' : '#e3ded3',
                background: usingCurrent ? '#e6f7f4' : '#fff',
                color: usingCurrent ? '#0a8174' : '#5b6675',
              }}
            >
              <Icon name="route" size={16} />
              현재 위치 사용
            </button>
            <button
              type="button"
              onClick={() => {
                setUsingCurrent(false);
                setLocationName('지도에서 선택한 위치');
                setCoords({ ...REGION_CENTER });
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-publicblue-300 py-2.5 text-sm font-bold text-publicblue-600"
            >
              <Icon name="building" size={16} />
              지도에서 선택
            </button>
          </div>
          {!usingCurrent && (
            <select
              value={QUICK_PLACES.some((q) => q.name === locationName) ? locationName : ''}
              onChange={(e) => pickPlace(e.target.value)}
              aria-label="장소 선택"
              className="w-full rounded-xl border border-black/10 bg-cream px-3 py-3 text-sm font-semibold text-ink outline-none"
            >
              <option value="" disabled>
                {locationName || '장소를 선택하세요'}
              </option>
              {QUICK_PLACES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <p className="text-[11px] font-medium text-subtle">선택된 위치: {locationName}</p>
        </div>
      </Field>

      {/* 관련 대상 */}
      <Field label="관련 대상 (복수 선택)" required>
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

      {/* 제목 / 내용 */}
      <Field label="제목" required>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 엘리베이터 정상 작동 확인했어요"
          aria-label="제목"
          className="w-full rounded-xl border border-black/10 bg-cream px-3 py-3 text-sm font-semibold text-ink outline-none placeholder:text-subtle/60"
        />
      </Field>
      <Field label="내용">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="이용 경험이나 현재 상태를 적어주세요. 작은 정보도 큰 도움이 돼요."
          aria-label="내용"
          className="w-full resize-none rounded-xl border border-black/10 bg-cream px-3 py-3 text-sm font-medium text-ink outline-none placeholder:text-subtle/60"
        />
      </Field>

      {/* 상태 */}
      <Field label="현재 상태">
        <div className="grid grid-cols-2 gap-2">
          {COMMUNITY_STATUS_ORDER.map((s) => {
            const meta = COMMUNITY_STATUS_META[s];
            const active = status === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(s)}
                className="flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-sm font-bold transition-colors"
                style={{
                  borderColor: active ? meta.color : '#e3ded3',
                  background: active ? meta.bg : '#fff',
                  color: active ? meta.color : '#5b6675',
                }}
              >
                <Icon name={meta.icon as never} size={15} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </Field>

      {/* 관련 카테고리 (지도 필터 연동) */}
      <Field label="관련 시설·카테고리 (선택)">
        <div className="flex flex-wrap gap-2">
          {MAP_FILTER_ORDER.map((k) => {
            const meta = MAP_FILTER_META[k];
            const active = tags.includes(k);
            return (
              <button
                key={k}
                type="button"
                aria-pressed={active}
                onClick={() => toggleTag(k)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                style={{
                  borderColor: active ? meta.color : '#e3ded3',
                  background: active ? meta.color : '#fff',
                  color: active ? '#fff' : '#5b6675',
                }}
              >
                <Icon name={meta.icon as never} size={13} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </Field>

      {/* 사진 */}
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

      {/* 익명 */}
      <label className="flex items-center justify-between rounded-xl bg-cream px-3 py-3">
        <span className="text-sm font-bold text-ink">익명으로 공유하기</span>
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

      <PrimaryButton icon="route" onClick={submit} disabled={!canSubmit || submitting}>
        {submitting ? '공유 중…' : '커뮤니티에 공유하기'}
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
