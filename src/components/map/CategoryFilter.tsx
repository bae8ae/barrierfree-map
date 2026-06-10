import { useMemo } from 'react';
import type { MapCategoryFilter } from '@/types';
import {
  MAP_FILTER_META,
  MAP_FILTER_ORDER,
  MODE_EMPHASIS,
  SMOKING_VISIBLE_MODES,
  SMOKING_FILTER_HINT,
  SMOKING_DISABLED_HINT,
} from '@/utils/meta';
import { Icon } from '@/components/common/Icon';
import { useStore } from '@/store/useStore';

// ============================================================
// 지도 카테고리 필터 (가로 스크롤 칩)
// 색만이 아니라 아이콘+라벨로 구분. 선택 토글.
//
// - 현재 모드에서 강조되는 카테고리를 앞쪽에 배치하고 ★로 표시
// - 간접흡연 주의 구역은 "보조 정보"로, 임산부/유모차 모드에서만 활성화
// ============================================================

export function CategoryFilter({
  filters,
  onToggle,
  onAll,
}: {
  filters: Record<MapCategoryFilter, boolean>;
  onToggle: (key: MapCategoryFilter) => void;
  onAll: (on: boolean) => void;
}) {
  const mode = useStore((s) => s.mode);
  const showToast = useStore((s) => s.showToast);

  const emphasis = MODE_EMPHASIS[mode] ?? [];
  const smokingAvailable = SMOKING_VISIBLE_MODES.includes(mode);

  // 강조 카테고리를 앞으로 정렬 (smoking 은 항상 마지막 보조 정보로)
  const ordered = useMemo(() => {
    const rank = (k: MapCategoryFilter) => {
      if (k === 'smoking') return 999;
      const i = emphasis.indexOf(k);
      return i === -1 ? 100 + MAP_FILTER_ORDER.indexOf(k) : i;
    };
    return [...MAP_FILTER_ORDER].sort((a, b) => rank(a) - rank(b));
  }, [emphasis]);

  // "전체 선택/해제" 는 간접흡연(보조) 제외 일반 카테고리 기준으로 판단
  const coreFilters = MAP_FILTER_ORDER.filter((k) => k !== 'smoking');
  const allOn = coreFilters.every((k) => filters[k]);

  return (
    <div>
      <div
        className="no-scrollbar flex gap-2 overflow-x-auto"
        aria-label="시설/제보 카테고리 필터"
      >
        <button
          type="button"
          onClick={() => onAll(!allOn)}
          aria-pressed={allOn}
          className="flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
          style={{
            borderColor: allOn ? '#0e9e8b' : '#e3ded3',
            background: allOn ? '#0e9e8b' : '#fff',
            color: allOn ? '#fff' : '#5b6675',
          }}
        >
          {allOn ? '전체 해제' : '전체 선택'}
        </button>
        {ordered.map((k) => {
          const meta = MAP_FILTER_META[k];
          const on = filters[k];
          const emphasized = emphasis.includes(k);

          // 간접흡연 보조 정보: 임산부/유모차 모드가 아니면 비활성
          if (k === 'smoking') {
            const disabled = !smokingAvailable;
            return (
              <button
                key={k}
                type="button"
                onClick={() =>
                  disabled ? showToast(SMOKING_DISABLED_HINT, 'info') : onToggle(k)
                }
                aria-pressed={!disabled && on}
                aria-disabled={disabled}
                title={disabled ? SMOKING_DISABLED_HINT : SMOKING_FILTER_HINT}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 text-xs font-bold transition-colors"
                style={{
                  borderColor: disabled ? '#d6d0c4' : on ? meta.color : '#b8c0cc',
                  background: disabled ? '#f3f1ec' : on ? meta.color : '#fff',
                  color: disabled ? '#b0b6bf' : on ? '#fff' : '#5b6675',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                <Icon name={meta.icon as never} size={14} />
                {meta.label}
              </button>
            );
          }

          return (
            <button
              key={k}
              type="button"
              onClick={() => onToggle(k)}
              aria-pressed={on}
              className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
              style={{
                borderColor: on ? meta.color : emphasized ? '#0e9e8b' : '#e3ded3',
                background: on ? meta.color : '#fff',
                color: on ? '#fff' : emphasized ? '#0a8174' : '#5b6675',
                boxShadow: emphasized ? '0 0 0 1.5px rgba(14,158,139,0.25)' : undefined,
              }}
            >
              {emphasized && <span aria-hidden>★</span>}
              <Icon name={meta.icon as never} size={14} />
              {meta.label}
            </button>
          );
        })}
      </div>
      {smokingAvailable && (
        <p className="mt-1 px-1 text-[10px] font-medium leading-tight text-subtle">
          {SMOKING_FILTER_HINT}
        </p>
      )}
    </div>
  );
}
