import { useState } from 'react';
import type { RoutePriority, TravelMode, RouteSearchParams } from '@/types';
import { QUICK_PLACES } from '@/data/region';
import { MODE_META, TRAVEL_MODE_ORDER, PRIORITY_META, PRIORITY_ORDER } from '@/utils/meta';
import { PrimaryButton, Chip } from '@/components/common/ui';
import { Icon } from '@/components/common/Icon';

// ============================================================
// 경로 검색 입력 패널 (출발/도착/모드/우선순위)
// ============================================================

export function RouteSearchPanel({
  initialMode,
  loading,
  onSearch,
}: {
  initialMode: TravelMode;
  loading: boolean;
  onSearch: (params: RouteSearchParams) => void;
}) {
  const [origin, setOrigin] = useState('안암역 3번 출구');
  const [destination, setDestination] = useState('고대안암병원 정문');
  const [mode, setMode] = useState<TravelMode>(initialMode);
  const [priorities, setPriorities] = useState<RoutePriority[]>([
    'avoid_stairs',
    'elevator_first',
  ]);
  const [picking, setPicking] = useState<'origin' | 'destination' | null>(null);

  const togglePriority = (p: RoutePriority) =>
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  const submit = () =>
    onSearch({
      origin,
      destination,
      mode,
      priorities,
      originPoint: QUICK_PLACES.find((q) => q.name === origin),
      destinationPoint: QUICK_PLACES.find((q) => q.name === destination),
    });

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-card">
      {/* 출발/도착 */}
      <div className="space-y-2">
        <PlaceField
          label="출발"
          dotColor="#0a8174"
          value={origin}
          onFocusPick={() => setPicking(picking === 'origin' ? null : 'origin')}
          onChange={setOrigin}
        />
        <PlaceField
          label="도착"
          dotColor="#c83a22"
          value={destination}
          onFocusPick={() => setPicking(picking === 'destination' ? null : 'destination')}
          onChange={setDestination}
        />
        {picking && (
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-softblue p-2">
            {QUICK_PLACES.map((p) => (
              <Chip
                key={p.name}
                label={p.name}
                onClick={() => {
                  if (picking === 'origin') setOrigin(p.name);
                  else setDestination(p.name);
                  setPicking(null);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 이동 모드 */}
      <div>
        <p className="mb-1.5 text-sm font-bold text-ink">이동 모드</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {TRAVEL_MODE_ORDER.map((m) => {
            const meta = MODE_META[m];
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={active}
                onClick={() => setMode(m)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-sm font-bold"
                style={{
                  borderColor: active ? '#0e9e8b' : '#e3ded3',
                  background: active ? '#e6f7f4' : '#fff',
                  color: active ? '#0a8174' : '#5b6675',
                }}
              >
                <span aria-hidden>{meta.emoji}</span>
                {meta.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* 우선순위 */}
      <div>
        <p className="mb-1.5 text-sm font-bold text-ink">경로 우선순위 (복수 선택)</p>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_ORDER.map((p) => (
            <Chip
              key={p}
              label={PRIORITY_META[p].label}
              icon={PRIORITY_META[p].icon as never}
              selected={priorities.includes(p)}
              onClick={() => togglePriority(p)}
            />
          ))}
        </div>
      </div>

      <PrimaryButton icon="route" onClick={submit} disabled={loading}>
        {loading ? '맞춤 경로 찾는 중…' : '배리어프리 경로 찾기'}
      </PrimaryButton>
    </div>
  );
}

function PlaceField({
  label,
  dotColor,
  value,
  onChange,
  onFocusPick,
}: {
  label: string;
  dotColor: string;
  value: string;
  onChange: (v: string) => void;
  onFocusPick: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-cream px-3 py-2.5">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: dotColor }} aria-hidden />
      <span className="w-9 shrink-0 text-xs font-bold text-subtle">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} 장소`}
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-subtle/60"
        placeholder="장소를 입력하세요"
      />
      <button
        type="button"
        onClick={onFocusPick}
        aria-label="장소 빠른 선택"
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600"
      >
        <Icon name="route" size={15} />
      </button>
    </div>
  );
}
