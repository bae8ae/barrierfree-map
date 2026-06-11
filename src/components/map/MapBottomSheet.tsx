import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { REGION_NAME, MVP_TEST_REGION_NOTICE } from '@/data/region';
import { computeAreaScore, isFacilityUsableForMode, scoreGrade } from '@/utils/score';
import { clamp } from '@/utils/geo';
import { PrimaryButton } from '@/components/common/ui';
import { Icon } from '@/components/common/Icon';

// ============================================================
// 지도 하단 바텀시트 — "우리 동네 이동 가능성"
// 위아래 드래그로 접기/펼치기 (3단 스냅: 요약 / 기본 / 전체)
// 내려서 접으면 지도가 넓게 보인다.
// ============================================================

// 스냅 높이(px). PEEK: 한 줄 요약, HALF: 액션+통계, FULL: 전체
const SNAP_PEEK = 96;
const SNAP_HALF = 280;
const SNAP_FULL = 452;
const SNAPS = [SNAP_PEEK, SNAP_HALF, SNAP_FULL];

export function MapBottomSheet({
  onRoute,
  onReport,
  onHeightChange,
}: {
  onRoute: () => void;
  onReport: () => void;
  /** 지도 위 플로팅 요소(줌 버튼·선택 카드)가 시트를 피하도록 현재 높이를 알림 */
  onHeightChange?: (h: number) => void;
}) {
  const [height, setHeight] = useState(SNAP_HALF);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startY: number; startH: number; moved: boolean } | null>(null);

  const facilities = useStore((s) => s.facilities);
  const reports = useStore((s) => s.reports);
  const mode = useStore((s) => s.mode);

  useEffect(() => {
    onHeightChange?.(height);
  }, [height, onHeightChange]);

  const stats = useMemo(() => {
    const areaScore = computeAreaScore(facilities, reports);
    const usable = facilities.filter((f) => isFacilityUsableForMode(f, mode)).length;
    const active = reports.filter((r) => r.status === 'active').length;
    const caution = reports.filter(
      (r) => r.status === 'active' && (r.severity === 'high' || r.severity === 'medium'),
    ).length;
    return { areaScore, usable, active, caution };
  }, [facilities, reports, mode]);

  const grade = scoreGrade(stats.areaScore);

  const snapTo = (h: number) => {
    const nearest = SNAPS.reduce((best, s) =>
      Math.abs(s - h) < Math.abs(best - h) ? s : best,
    );
    setHeight(nearest);
  };

  // ---- 드래그 (핸들·헤더 영역) ----
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    dragRef.current = { startY: e.clientY, startH: height, moved: false };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = d.startY - e.clientY;
    if (Math.abs(dy) > 4) d.moved = true;
    setHeight(clamp(d.startH + dy, SNAP_PEEK, SNAP_FULL));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    if (d.moved) {
      snapTo(d.startH + (d.startY - e.clientY));
    } else {
      // 탭: 접혀 있으면 펼치고, 펼쳐져 있으면 접기
      setHeight(height <= SNAP_PEEK ? SNAP_HALF : SNAP_PEEK);
    }
  };

  const expanded = height > SNAP_PEEK + 40;

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40">
      <div
        className="mx-auto flex w-full flex-col overflow-hidden rounded-t-3xl bg-warmwhite/95 shadow-sheet backdrop-blur"
        style={{
          height,
          transition: dragging ? 'none' : 'height 0.26s cubic-bezier(0.32, 0.72, 0.25, 1)',
        }}
      >
        {/* 드래그 핸들 + 헤더 (잡고 위아래로 움직이는 영역) */}
        <div
          role="button"
          tabIndex={0}
          aria-label={expanded ? '시트를 내려 지도를 넓게 보기' : '동네 이동 가능성 요약 펼치기'}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') setHeight(height >= SNAP_HALF ? SNAP_FULL : SNAP_HALF);
            if (e.key === 'ArrowDown') setHeight(height >= SNAP_FULL ? SNAP_HALF : SNAP_PEEK);
          }}
          className="shrink-0 cursor-grab touch-none select-none px-4 pb-1 pt-2 active:cursor-grabbing"
        >
          <span className="mx-auto mb-2 block h-1.5 w-12 rounded-full bg-black/15" />
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-subtle">{REGION_NAME}</p>
              <p className="text-base font-extrabold text-ink">우리 동네 이동 가능성</p>
            </div>
            <div
              className="flex shrink-0 items-baseline gap-1 rounded-2xl px-3 py-1.5"
              style={{ background: grade.bg }}
            >
              <span className="text-2xl font-extrabold leading-none" style={{ color: grade.color }}>
                {stats.areaScore}
              </span>
              <span className="text-[11px] font-bold" style={{ color: grade.color }}>
                {grade.label}
              </span>
            </div>
          </div>
        </div>

        {/* 본문 (FULL 에서 스크롤) */}
        <div
          className="no-scrollbar flex-1 px-4 pb-4"
          style={{ overflowY: height >= SNAP_FULL ? 'auto' : 'hidden' }}
        >
          {/* 액션 버튼: 항상 본문 최상단 (HALF 에서 바로 보이게) */}
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <PrimaryButton icon="route" onClick={onRoute}>
              경로 추천 받기
            </PrimaryButton>
            <PrimaryButton icon="warning" variant="coral" onClick={onReport}>
              불편 제보하기
            </PrimaryButton>
          </div>

          {/* 통계 3분할 — 아이콘은 중립색, 숫자가 정보를 전달 */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniStat icon="building" color="#5c708a" value={stats.usable} label="이용 가능 시설" />
            <MiniStat icon="warning" color="#c0452f" value={stats.active} label="활성 제보" />
            <MiniStat icon="construction" color="#5b6675" value={stats.caution} label="이동 주의 구간" />
          </div>

          {/* 핵심 메시지 + MVP 테스트 지역 안내 (FULL 에서 노출) */}
          <p className="mt-3 rounded-2xl bg-primary-50 px-3 py-2 text-[13px] font-semibold leading-snug text-primary-700">
            “시설이 있다는 것보다 중요한 건, 지금 실제로 이동할 수 있는지입니다.”
          </p>
          <p className="mt-2 text-[11px] font-medium leading-snug text-subtle">
            {MVP_TEST_REGION_NOTICE}
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  color,
  value,
  label,
}: {
  icon: 'building' | 'warning' | 'construction';
  color: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-2.5 shadow-card">
      <span style={{ color }}>
        <Icon name={icon} size={18} />
      </span>
      <span className="text-xl font-extrabold text-ink">{value}</span>
      <span className="text-center text-[11px] font-medium leading-tight text-subtle">
        {label}
      </span>
    </div>
  );
}
