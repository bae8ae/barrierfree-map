import { useMemo, useState } from 'react';
import type { FacilityCategory } from '@/types';
import { useStore } from '@/store/useStore';
import { FACILITY_META } from '@/utils/meta';
import { FacilityCard } from '@/components/facility/FacilityCard';
import { EmptyState } from '@/components/common/ui';

// ============================================================
// 시설 정보 화면 (공공 데이터 + 사용자 리뷰)
// ============================================================

const FILTERS: { key: FacilityCategory | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'accessible_toilet', label: '장애인화장실' },
  { key: 'elevator', label: '엘리베이터' },
  { key: 'ramp', label: '경사로' },
  { key: 'subway', label: '지하철역' },
  { key: 'bus_stop', label: '버스정류장' },
  { key: 'hospital', label: '병원' },
  { key: 'cafe', label: '카페' },
  { key: 'restaurant', label: '음식점' },
  { key: 'public_building', label: '공공시설' },
  { key: 'culture', label: '문화시설' },
];

export function FacilityScreen() {
  const facilities = useStore((s) => s.facilities);
  const selectFacility = useStore((s) => s.selectFacility);
  const mode = useStore((s) => s.mode);
  const [filter, setFilter] = useState<FacilityCategory | 'all'>('all');

  const list = useMemo(() => {
    const filtered = filter === 'all' ? facilities : facilities.filter((f) => f.category === filter);
    return [...filtered].sort((a, b) => b.accessibilityScore - a.accessibilityScore);
  }, [facilities, filter]);

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-3">
        {/* 카테고리 필터 */}
        <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const color = f.key === 'all' ? '#0e9e8b' : FACILITY_META[f.key as FacilityCategory].color;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.key)}
                className="shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors"
                style={{
                  borderColor: active ? color : '#e3ded3',
                  background: active ? color : '#fff',
                  color: active ? '#fff' : '#5b6675',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <p className="mb-2 text-xs font-semibold text-subtle">
          {list.length}개 시설 · 접근성 점수 높은 순 · {mode === 'all' ? '전체' : '현재 모드'} 기준
        </p>

        <div className="space-y-3">
          {list.length === 0 ? (
            <EmptyState icon="building" title="해당 시설이 없어요" />
          ) : (
            list.map((f) => (
              <FacilityCard key={f.id} facility={f} onClick={() => selectFacility(f.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
