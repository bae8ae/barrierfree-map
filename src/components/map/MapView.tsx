import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type {
  PublicFacility,
  RouteOption,
  UserReport,
  CommunityPost,
  SmokingZone,
} from '@/types';
import { useStore } from '@/store/useStore';
import { LANDMARKS, CURRENT_LOCATION } from '@/data/region';
import { MOCK_SMOKING_ZONES } from '@/data/mockSmokingZones';
import { projectToPercent, pathToPoints, clamp, clusterByPixels } from '@/utils/geo';
import {
  facilityToMapFilter,
  reportToMapFilter,
  communityToMapFilter,
  FACILITY_META,
  REPORT_META,
  COMMUNITY_STATUS_META,
  SMOKING_VISIBLE_MODES,
} from '@/utils/meta';
import { FacilityMarker } from '@/components/map/FacilityMarker';
import { ReportMarker } from '@/components/map/ReportMarker';
import { CommunityMarker } from '@/components/map/CommunityMarker';
import { SmokingMarker } from '@/components/map/SmokingMarker';
import { ClusterMarker } from '@/components/map/ClusterMarker';
import { CurrentLocationMarker } from '@/components/map/CurrentLocationMarker';

// ============================================================
// 커스텀 지도 캔버스
// 공공시설 마커(정적) + 사용자 제보 마커(실시간) + 현재위치 아바타
// 외부 지도 SDK 없이 위경도를 컨테이너 백분율로 투영해 표현
//
// 확대/이동(zoom·pan) 지원 + 화면에서 겹치는 마커를 복합핀으로 군집화.
// 확대 정도에 따라 핀이 구분되면 자동으로 개별 마커로 나뉜다.
// ============================================================

const LANDMARK_STYLE: Record<
  string,
  { w: number; h: number; fill: string }
> = {
  campus: { w: 30, h: 22, fill: '#dfeee0' },
  hospital: { w: 16, h: 14, fill: '#fde4e0' },
  park: { w: 22, h: 20, fill: '#d7ecd2' },
  station: { w: 10, h: 10, fill: '#dce7fb' },
  street: { w: 18, h: 9, fill: '#f3ead9' },
  residential: { w: 16, h: 12, fill: '#ece7dc' },
  bus: { w: 9, h: 9, fill: '#dce7fb' },
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
// 인터랙티브 지도의 시작 배율: 현재 위치 주변이 바로 보이고 드래그 이동이 가능
const INITIAL_ZOOM = 1.8;
// 마커 지름(약 32px)보다 가까우면 겹친다고 보고 군집화
const CLUSTER_PX = 34;

type Center = { x: number; y: number };

// 군집 대상 점 (화면 좌표 px/py + 원본 백분율 bx/by 포함)
type MapPoint = {
  key: string;
  px: number;
  py: number;
  bx: number;
  by: number;
  vx: number;
  vy: number;
  color: string;
  alert: boolean;
  selected: boolean;
} & (
  | { kind: 'facility'; data: PublicFacility }
  | { kind: 'report'; data: UserReport }
  | { kind: 'community'; data: CommunityPost }
  | { kind: 'smoking'; data: SmokingZone }
);

function clampCenter(c: Center, zoom: number): Center {
  const half = 50 / zoom;
  return {
    x: clamp(c.x, half, 100 - half),
    y: clamp(c.y, half, 100 - half),
  };
}

export function MapView({
  route,
  selectedReportId,
  selectedPostId,
  selectedSmokingId,
  onSelectFacility,
  onSelectReport,
  onSelectPost,
  onSelectSmoking,
  onLocationClick,
  showCurrentLocation = true,
  showCommunity = true,
  dimContext = false,
  interactive = true,
  controlsBottom = 16,
}: {
  route?: RouteOption | null;
  selectedReportId?: string | null;
  selectedPostId?: string | null;
  selectedSmokingId?: string | null;
  onSelectFacility?: (id: string) => void;
  onSelectReport?: (id: string) => void;
  onSelectPost?: (id: string) => void;
  onSelectSmoking?: (id: string) => void;
  onLocationClick?: () => void;
  showCurrentLocation?: boolean;
  showCommunity?: boolean;
  dimContext?: boolean;
  /** 확대/이동·줌 컨트롤 사용 여부 (작은 미리보기 지도에선 끔) */
  interactive?: boolean;
  /** 줌 컨트롤의 bottom 오프셋(px). 바텀시트 높이에 맞춰 띄운다 */
  controlsBottom?: number;
}) {
  const facilities = useStore((s) => s.facilities);
  const reports = useStore((s) => s.reports);
  const communityPosts = useStore((s) => s.communityPosts);
  const mode = useStore((s) => s.mode);
  const mapFilters = useStore((s) => s.mapFilters);
  const selectedFacilityId = useStore((s) => s.selectedFacilityId);

  // ---- 확대/이동 상태 ----
  // 인터랙티브 지도는 현재 위치 주변을 확대한 상태로 시작 (드래그 이동 가능)
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(interactive ? INITIAL_ZOOM : MIN_ZOOM);
  const [center, setCenter] = useState<Center>(() =>
    interactive
      ? clampCenter(
          projectToPercent(CURRENT_LOCATION.lat, CURRENT_LOCATION.lng),
          INITIAL_ZOOM,
        )
      : { x: 50, y: 50 },
  );

  // 콜백/리스너에서 최신 값을 읽기 위한 ref 미러
  const zoomRef = useRef(zoom);
  const centerRef = useRef(center);
  zoomRef.current = zoom;
  centerRef.current = center;

  // 컨테이너 크기 측정 (픽셀 거리 기반 군집화에 필요)
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () =>
      setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 원본 백분율 → 현재 확대/이동을 반영한 화면 백분율
  const toViewport = useCallback(
    (lat: number, lng: number) => {
      const { x, y } = projectToPercent(lat, lng);
      return {
        x: 50 + (x - center.x) * zoom,
        y: 50 + (y - center.y) * zoom,
        bx: x,
        by: y,
      };
    },
    [center, zoom],
  );

  const visibleFacilities = useMemo(
    () =>
      facilities.filter((f) => {
        const key = facilityToMapFilter(f.category);
        return key ? mapFilters[key] : true; // 매핑 안 되는 시설은 맥락 표시용 항상 노출
      }),
    [facilities, mapFilters],
  );

  const visibleReports = useMemo(
    () =>
      reports.filter((r) => {
        const key = reportToMapFilter(r.category);
        return key ? mapFilters[key] : true;
      }),
    [reports, mapFilters],
  );

  const visiblePosts = useMemo(
    () =>
      communityPosts.filter((p) => {
        const key = communityToMapFilter(p.tags);
        return key ? mapFilters[key] : true;
      }),
    [communityPosts, mapFilters],
  );

  // 보조 정보(간접흡연 주의 구역)는 임산부/유모차 모드 + 필터 ON 일 때만
  const visibleSmokingZones = useMemo(
    () =>
      SMOKING_VISIBLE_MODES.includes(mode) && mapFilters.smoking
        ? MOCK_SMOKING_ZONES
        : [],
    [mode, mapFilters.smoking],
  );

  // 모든 마커를 화면 좌표로 변환한 통합 점 목록
  const points = useMemo<MapPoint[]>(() => {
    const list: MapPoint[] = [];
    const toPx = (vx: number, vy: number) => ({
      px: (vx / 100) * size.w,
      py: (vy / 100) * size.h,
    });

    for (const f of visibleFacilities) {
      const v = toViewport(f.lat, f.lng);
      list.push({
        kind: 'facility',
        key: `f-${f.id}`,
        data: f,
        vx: v.x,
        vy: v.y,
        bx: v.bx,
        by: v.by,
        ...toPx(v.x, v.y),
        color: FACILITY_META[f.category].color,
        alert: false,
        selected: selectedFacilityId === f.id,
      });
    }
    for (const r of visibleReports) {
      const v = toViewport(r.lat, r.lng);
      const resolved = r.status === 'resolved';
      list.push({
        kind: 'report',
        key: `r-${r.id}`,
        data: r,
        vx: v.x,
        vy: v.y,
        bx: v.bx,
        by: v.by,
        ...toPx(v.x, v.y),
        color: resolved ? '#9aa6b2' : REPORT_META[r.category].color,
        alert: r.status === 'active' && r.severity === 'high',
        selected: selectedReportId === r.id,
      });
    }
    if (showCommunity) {
      for (const p of visiblePosts) {
        const v = toViewport(p.lat, p.lng);
        list.push({
          kind: 'community',
          key: `c-${p.id}`,
          data: p,
          vx: v.x,
          vy: v.y,
          bx: v.bx,
          by: v.by,
          ...toPx(v.x, v.y),
          color: COMMUNITY_STATUS_META[p.status].color,
          alert: p.status === 'unavailable' || p.status === 'needs_check',
          selected: selectedPostId === p.id,
        });
      }
    }
    for (const z of visibleSmokingZones) {
      const v = toViewport(z.lat, z.lng);
      list.push({
        kind: 'smoking',
        key: `s-${z.id}`,
        data: z,
        vx: v.x,
        vy: v.y,
        bx: v.bx,
        by: v.by,
        ...toPx(v.x, v.y),
        color: '#7c8aa0',
        alert: false,
        selected: selectedSmokingId === z.id,
      });
    }
    return list;
  }, [
    visibleFacilities,
    visibleReports,
    visiblePosts,
    visibleSmokingZones,
    showCommunity,
    toViewport,
    size,
    selectedFacilityId,
    selectedReportId,
    selectedPostId,
    selectedSmokingId,
  ]);

  // 선택된 마커는 군집에서 제외하고 항상 개별 표시 (선택 카드 유지)
  const clusters = useMemo(() => {
    if (size.w === 0) return [];
    const clusterable = points.filter((p) => !p.selected);
    return clusterByPixels(clusterable, CLUSTER_PX);
  }, [points, size.w]);

  const selectedPoints = useMemo(
    () => points.filter((p) => p.selected),
    [points],
  );

  // 군집 클릭 → 구성원이 서로 구분될 만큼 확대하며 그 지점으로 이동
  const expandCluster = useCallback(
    (members: MapPoint[]) => {
      const bxAvg = members.reduce((s, m) => s + m.bx, 0) / members.length;
      const byAvg = members.reduce((s, m) => s + m.by, 0) / members.length;

      // 확대 1배 기준 픽셀 좌표로 최소 간격 계산 → 분리에 필요한 배율 추정
      let minDist = Infinity;
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const dx = ((members[i].bx - members[j].bx) / 100) * size.w;
          const dy = ((members[i].by - members[j].by) / 100) * size.h;
          minDist = Math.min(minDist, Math.hypot(dx, dy));
        }
      }
      const needed = minDist > 0 ? (CLUSTER_PX * 1.3) / minDist : MAX_ZOOM;
      const target = clamp(
        Math.max(zoomRef.current * 1.5, needed),
        MIN_ZOOM,
        MAX_ZOOM,
      );
      setZoom(target);
      setCenter(clampCenter({ x: bxAvg, y: byAvg }, target));
    },
    [size.w, size.h],
  );

  const zoomBy = useCallback((factor: number) => {
    const target = clamp(zoomRef.current * factor, MIN_ZOOM, MAX_ZOOM);
    setZoom(target);
    setCenter((c) => clampCenter(c, target));
  }, []);

  const resetView = useCallback(() => {
    setZoom(MIN_ZOOM);
    setCenter({ x: 50, y: 50 });
  }, []);

  // 휠 줌 (커서 위치 고정) — 패시브 아님으로 직접 등록
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !interactive) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cvx = ((e.clientX - rect.left) / rect.width) * 100;
      const cvy = ((e.clientY - rect.top) / rect.height) * 100;
      const z = zoomRef.current;
      const c = centerRef.current;
      const baseX = c.x + (cvx - 50) / z;
      const baseY = c.y + (cvy - 50) / z;
      const target = clamp(z * (e.deltaY < 0 ? 1.18 : 1 / 1.18), MIN_ZOOM, MAX_ZOOM);
      setZoom(target);
      setCenter(
        clampCenter(
          { x: baseX - (cvx - 50) / target, y: baseY - (cvy - 50) / target },
          target,
        ),
      );
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [interactive]);

  // 드래그 패닝 (마커 버튼 위에서 시작한 경우는 제외)
  const drag = useRef<{ x: number; y: number; center: Center } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { x: e.clientX, y: e.clientY, center: centerRef.current };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dvx = ((e.clientX - drag.current.x) / rect.width) * 100;
    const dvy = ((e.clientY - drag.current.y) / rect.height) * 100;
    const z = zoomRef.current;
    setCenter(
      clampCenter(
        {
          x: drag.current.center.x - dvx / z,
          y: drag.current.center.y - dvy / z,
        },
        z,
      ),
    );
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  // 현재 위치 = 안암역 근처(데모 고정)
  const locationV = toViewport(CURRENT_LOCATION.lat, CURRENT_LOCATION.lng);

  // 월드(배경·도로·랜드마크) 변환: 마커와 동일한 좌표계
  const worldTransform = `translate(${50 - center.x * zoom}%, ${
    50 - center.y * zoom
  }%) scale(${zoom})`;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-[#eef0e8]"
      style={{
        cursor: interactive ? 'grab' : 'default',
        touchAction: interactive ? 'none' : undefined,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* 월드 레이어: 확대/이동에 따라 함께 변형되는 배경·도로·랜드마크 */}
      <div
        className="absolute inset-0"
        style={{ transform: worldTransform, transformOrigin: '0 0' }}
      >
        {/* 배경 결: 부드러운 지형 그라데이션 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 30% 10%, #f3f5ee 0%, #e9ece1 45%, #e2e7da 100%)',
          }}
        />

        {/* 도로 SVG 레이어 */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* 큰 도로들 (장식) */}
          <g stroke="#fbfaf6" strokeLinecap="round">
            <path d="M2 70 C 30 64, 55 60, 98 48" strokeWidth="3.4" />
            <path d="M16 98 C 22 70, 30 40, 40 2" strokeWidth="3" />
            <path d="M50 98 C 52 70, 56 40, 62 4" strokeWidth="2.6" />
            <path d="M2 40 C 35 38, 70 34, 98 22" strokeWidth="2.4" />
          </g>
          <g stroke="#e6e3d6" strokeLinecap="round" strokeWidth="0.5">
            <path d="M2 70 C 30 64, 55 60, 98 48" />
            <path d="M16 98 C 22 70, 30 40, 40 2" />
          </g>

          {/* 경로 오버레이 */}
          {route && (
            <>
              <polyline
                points={pathToPoints(route.path)}
                fill="none"
                stroke="#0e9e8b"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              />
              <polyline
                points={pathToPoints(route.path)}
                fill="none"
                stroke="#52c5b3"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>

        {/* 랜드마크 블록 + 라벨 */}
        <div className={dimContext ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
          {LANDMARKS.map((lm) => {
            const { x, y } = projectToPercent(lm.lat, lm.lng);
            const st = LANDMARK_STYLE[lm.kind];
            return (
              <div
                key={lm.id}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%`, zIndex: 4 }}
              >
                <div
                  className="rounded-2xl"
                  style={{
                    width: `${st.w * 3}px`,
                    height: `${st.h * 3}px`,
                    background: st.fill,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)',
                  }}
                />
                <span className="mt-0.5 block whitespace-nowrap text-center text-[10px] font-bold text-subtle">
                  {lm.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 경로 출발/도착 포인트 */}
      {route && <RouteEndpoints route={route} toViewport={toViewport} />}

      {/* 군집/개별 마커 (확대·이동을 반영한 화면 좌표로 렌더) */}
      {clusters.map((cl) => {
        if (cl.members.length === 1) return renderPoint(cl.members[0]);
        const colors = Array.from(new Set(cl.members.map((m) => m.color)));
        const alert = cl.members.some((m) => m.alert);
        const cvx = (cl.cx / size.w) * 100;
        const cvy = (cl.cy / size.h) * 100;
        return (
          <ClusterMarker
            key={cl.members.map((m) => m.key).join('|')}
            x={cvx}
            y={cvy}
            count={cl.members.length}
            colors={colors}
            alert={alert}
            onClick={() => expandCluster(cl.members)}
          />
        );
      })}

      {/* 선택된 마커는 항상 개별 표시 */}
      {selectedPoints.map(renderPoint)}

      {/* 현재 위치 마커 */}
      {showCurrentLocation && (
        <CurrentLocationMarker
          lat={CURRENT_LOCATION.lat}
          lng={CURRENT_LOCATION.lng}
          x={locationV.x}
          y={locationV.y}
          onClick={onLocationClick}
        />
      )}

      {/* 확대/축소 컨트롤 (바텀시트 높이를 따라 이동) */}
      {interactive && (
      <div
        className="pointer-events-auto absolute right-3 z-30 flex flex-col gap-1.5 transition-[bottom] duration-200"
        style={{ bottom: controlsBottom }}
      >
        <ZoomButton label="확대" onClick={() => zoomBy(1.6)} disabled={zoom >= MAX_ZOOM}>
          +
        </ZoomButton>
        <ZoomButton label="축소" onClick={() => zoomBy(1 / 1.6)} disabled={zoom <= MIN_ZOOM}>
          −
        </ZoomButton>
        {zoom > MIN_ZOOM && (
          <ZoomButton label="전체 보기" onClick={resetView}>
            <span className="text-[15px]">⤢</span>
          </ZoomButton>
        )}
      </div>
      )}
    </div>
  );

  // 개별 점을 종류에 맞는 마커로 렌더
  function renderPoint(p: MapPoint) {
    if (p.kind === 'facility') {
      return (
        <FacilityMarker
          key={p.key}
          facility={p.data}
          mode={mode}
          selected={p.selected}
          x={p.vx}
          y={p.vy}
          onClick={() => onSelectFacility?.(p.data.id)}
        />
      );
    }
    if (p.kind === 'report') {
      return (
        <ReportMarker
          key={p.key}
          report={p.data}
          selected={p.selected}
          x={p.vx}
          y={p.vy}
          onClick={() => onSelectReport?.(p.data.id)}
        />
      );
    }
    if (p.kind === 'smoking') {
      return (
        <SmokingMarker
          key={p.key}
          zone={p.data}
          selected={p.selected}
          x={p.vx}
          y={p.vy}
          onClick={() => onSelectSmoking?.(p.data.id)}
        />
      );
    }
    return (
      <CommunityMarker
        key={p.key}
        post={p.data}
        selected={p.selected}
        x={p.vx}
        y={p.vy}
        onClick={() => onSelectPost?.(p.data.id)}
      />
    );
  }
}

function ZoomButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-extrabold text-ink shadow-float transition-colors disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function RouteEndpoints({
  route,
  toViewport,
}: {
  route: RouteOption;
  toViewport: (lat: number, lng: number) => { x: number; y: number };
}) {
  const start = route.path[0];
  const end = route.path[route.path.length - 1];
  const s = toViewport(start.lat, start.lng);
  const e = toViewport(end.lat, end.lng);
  return (
    <>
      <Endpoint x={s.x} y={s.y} label="출발" color="#0a8174" />
      <Endpoint x={e.x} y={e.y} label="도착" color="#c83a22" />
    </>
  );
}

function Endpoint({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-full"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: 22 }}
    >
      <span
        className="block rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-card"
        style={{ background: color }}
      >
        {label}
      </span>
      <span
        className="mx-auto -mt-0.5 block h-2.5 w-2.5 rounded-full border-2 border-white"
        style={{ background: color }}
      />
    </div>
  );
}
