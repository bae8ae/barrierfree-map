import type { MapCategoryFilter } from '@/types';
import { MAP_FILTER_META, MAP_FILTER_ORDER } from '@/utils/meta';
import { Icon } from '@/components/common/Icon';

// ============================================================
// 지도 카테고리 필터 (가로 스크롤 칩)
// 색만이 아니라 아이콘+라벨로 구분. 선택 토글.
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
  const allOn = MAP_FILTER_ORDER.every((k) => filters[k]);

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="시설/제보 카테고리 필터">
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
      {MAP_FILTER_ORDER.map((k) => {
        const meta = MAP_FILTER_META[k];
        const on = filters[k];
        return (
          <button
            key={k}
            type="button"
            onClick={() => onToggle(k)}
            aria-pressed={on}
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
            style={{
              borderColor: on ? meta.color : '#e3ded3',
              background: on ? meta.color : '#fff',
              color: on ? '#fff' : '#5b6675',
            }}
          >
            <Icon name={meta.icon as never} size={14} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
