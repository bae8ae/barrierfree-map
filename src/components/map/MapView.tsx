import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import type {
  PublicFacility,
  RouteOption,
  UserReport,
  CommunityPost,
  SmokingZone,
} from '@/types';
import { useStore } from '@/store/useStore';
import { CURRENT_LOCATION } from '@/data/region';
import { MOCK_SMOKING_ZONES } from '@/data/mockSmokingZones';
import { clusterByPixels } from '@/utils/geo';
import {
  facilityToMapFilter,
  reportToMapFilter,
  communityToMapFilter,
  FACILITY_META,
  REPORT_META,
  COMMUNITY_STATUS_META,
  SMOKING_VISIBLE_MODES,
} from '@/utils/meta';
import { Icon } from '@/components/common/Icon';
import { FacilityMarker } from '@/components/map/FacilityMarker';
import { ReportMarker } from '@/components/map/ReportMarker';
import { CommunityMarker } from '@/components/map/CommunityMarker';
import { SmokingMarker } from '@/components/map/SmokingMarker';
import { ClusterMarker } from '@/components/map/ClusterMarker';
import { CurrentLocationMarker } from '@/components/map/CurrentLocationMarker';

// ============================================================
// 실제 지도 (Leaflet + OpenStreetMap 타일)
// 고려대 건물·고대안암병원·안암역 등 실제 지물이 배경에 표시되고,
// 그 위에 공공시설/제보/커뮤니티 마커를 React 오버레이로 얹는다.
//
// 지도 이동·줌은 Leaflet 이 담당하고, 마커는 매 이동 이벤트마다
// latLngToContainerPoint 로 화면 좌표를 다시 계산해 따라붙는다.
// 겹치는 마커는 픽셀 거리 기반 군집(복합핀)으로 묶인다.
// ============================================================

const ANAM_CENTER: L.LatLngTuple = [CURRENT_LOCATION.lat, CURRENT_LOCATION.lng];
const INITIAL_ZOOM = 16;
const MIN_ZOOM = 14;
const MAX_ZOOM = 19;
// 마커 지름(약 32px)보다 가까우면 겹친다고 보고 군집화
const CLUSTER_PX = 34;

// 군집 대상 점 (화면 픽셀 px/py + 화면 백분율 vx/vy)
type MapPoint = {
  key: string;
  px: number;
  py: number;
  vx: number;
  vy: number;
  lat: number;
  lng: number;
  color: string;
  alert: boolean;
  selected: boolean;
} & (
  | { kind: 'facility'; data: PublicFacility }
  | { kind: 'report'; data: UserReport }
  | { kind: 'community'; data: CommunityPost }
  | { kind: 'smoking'; data: SmokingZone }
);

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
  /** 타일을 흐리게 (경로 미리보기용) */
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

  // 복합핀 클릭 시 멤버 목록 선택 패널 (바로 줌인하지 않고 항목을 보여준다)
  const [chooser, setChooser] = useState<MapPoint[] | null>(null);

  // ---- Leaflet 지도 초기화 ----
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  // 지도 이동/줌마다 증가시켜 마커 위치 재계산을 트리거
  const [viewTick, setViewTick] = useState(0);

  useEffect(() => {
    const el = mapElRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: ANAM_CENTER,
      zoom: INITIAL_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      zoomControl: false,
      // 마커 오버레이가 지도에 붙어 따라오도록 줌 애니메이션은 끔
      zoomAnimation: false,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    });
    map.attributionControl.setPrefix(false);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: MAX_ZOOM,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    const onView = () => {
      setZoom(map.getZoom());
      setViewTick((t) => t + 1);
    };
    map.on('move zoom moveend zoomend resize', onView);

    // 탭 전환(display 변경)·리사이즈 시 지도 크기 재계산
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
      setSize({ w: el.clientWidth, h: el.clientHeight });
      setViewTick((t) => t + 1);
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });

    return () => {
      ro.disconnect();
      map.off('move zoom moveend zoomend resize', onView);
      map.remove();
      mapRef.current = null;
    };
  }, [interactive]);

  // ---- 경로 폴리라인 (Leaflet 레이어로 직접 그림) ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;
    const latlngs: L.LatLngTuple[] = route.path.map((p) => [p.lat, p.lng]);
    const casing = L.polyline(latlngs, {
      color: '#0e9e8b',
      weight: 7,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    const core = L.polyline(latlngs, {
      color: '#52c5b3',
      weight: 2.5,
      opacity: 1,
      lineCap: 'round',
    }).addTo(map);
    map.fitBounds(casing.getBounds().pad(0.25));
    return () => {
      casing.remove();
      core.remove();
    };
  }, [route]);

  // 위경도 → 컨테이너 화면 좌표 (viewTick 변경 시 재계산)
  const project = useCallback(
    (lat: number, lng: number) => {
      const map = mapRef.current;
      if (!map || size.w === 0) return { x: 50, y: 50, px: 0, py: 0 };
      const pt = map.latLngToContainerPoint([lat, lng]);
      return { x: (pt.x / size.w) * 100, y: (pt.y / size.h) * 100, px: pt.x, py: pt.y };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size, viewTick],
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

    for (const f of visibleFacilities) {
      const v = project(f.lat, f.lng);
      list.push({
        kind: 'facility',
        key: `f-${f.id}`,
        data: f,
        lat: f.lat,
        lng: f.lng,
        vx: v.x,
        vy: v.y,
        px: v.px,
        py: v.py,
        color: FACILITY_META[f.category].color,
        alert: false,
        selected: selectedFacilityId === f.id,
      });
    }
    for (const r of visibleReports) {
      const v = project(r.lat, r.lng);
      const resolved = r.status === 'resolved';
      list.push({
        kind: 'report',
        key: `r-${r.id}`,
        data: r,
        lat: r.lat,
        lng: r.lng,
        vx: v.x,
        vy: v.y,
        px: v.px,
        py: v.py,
        color: resolved ? '#9aa6b2' : REPORT_META[r.category].color,
        alert: r.status === 'active' && r.severity === 'high',
        selected: selectedReportId === r.id,
      });
    }
    if (showCommunity) {
      for (const p of visiblePosts) {
        const v = project(p.lat, p.lng);
        list.push({
          kind: 'community',
          key: `c-${p.id}`,
          data: p,
          lat: p.lat,
          lng: p.lng,
          vx: v.x,
          vy: v.y,
          px: v.px,
          py: v.py,
          color: COMMUNITY_STATUS_META[p.status].color,
          alert: p.status === 'unavailable' || p.status === 'needs_check',
          selected: selectedPostId === p.id,
        });
      }
    }
    for (const z of visibleSmokingZones) {
      const v = project(z.lat, z.lng);
      list.push({
        kind: 'smoking',
        key: `s-${z.id}`,
        data: z,
        lat: z.lat,
        lng: z.lng,
        vx: v.x,
        vy: v.y,
        px: v.px,
        py: v.py,
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
    project,
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

  // 군집의 구성원이 모두 보이도록 확대
  const expandCluster = useCallback((members: MapPoint[]) => {
    const map = mapRef.current;
    if (!map || members.length === 0) return;
    const bounds = L.latLngBounds(members.map((m) => [m.lat, m.lng] as L.LatLngTuple));
    map.fitBounds(bounds.pad(0.4), { maxZoom: MAX_ZOOM });
  }, []);

  const resetView = useCallback(() => {
    mapRef.current?.setView(ANAM_CENTER, INITIAL_ZOOM);
  }, []);

  // 현재 위치 = 안암역 근처(데모 고정)
  const locationV = project(CURRENT_LOCATION.lat, CURRENT_LOCATION.lng);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#eef0e8]">
      {/* Leaflet 지도 (z-0 스태킹 컨텍스트로 가둬 오버레이 아래에 둠) */}
      <div
        ref={mapElRef}
        className={`absolute inset-0 z-0 ${dimContext ? '[&_.leaflet-tile-pane]:opacity-60' : ''}`}
      />

      {/* 마커 오버레이: 지도 드래그를 막지 않도록 컨테이너는 통과, 버튼만 클릭 */}
      <div className="pointer-events-none absolute inset-0 z-10 [&_button]:pointer-events-auto">
        {/* 경로 출발/도착 라벨 */}
        {route && <RouteEndpoints route={route} project={project} />}

        {/* 군집/개별 마커 */}
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
              onClick={() => setChooser(cl.members)}
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
      </div>

      {/* 확대/축소 컨트롤 (바텀시트 높이를 따라 이동) */}
      {interactive && (
        <div
          className="pointer-events-auto absolute right-3 z-30 flex flex-col gap-1.5 transition-[bottom] duration-200"
          style={{ bottom: controlsBottom }}
        >
          <ZoomButton
            label="확대"
            onClick={() => mapRef.current?.zoomIn()}
            disabled={zoom >= MAX_ZOOM}
          >
            +
          </ZoomButton>
          <ZoomButton
            label="축소"
            onClick={() => mapRef.current?.zoomOut()}
            disabled={zoom <= MIN_ZOOM}
          >
            −
          </ZoomButton>
          <ZoomButton label="처음 위치로" onClick={resetView}>
            <span className="text-[15px]">⌖</span>
          </ZoomButton>
        </div>
      )}

      {/* 복합핀 항목 선택 패널: 묶인 정보를 목록으로 보여주고 골라서 연다 */}
      {chooser && (
        <div
          data-map-chooser
          className="absolute inset-x-3 z-40"
          style={{ bottom: controlsBottom }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="animate-popIn rounded-2xl border border-black/5 bg-white p-3 shadow-sheet">
            <div className="flex items-center gap-2 pb-1.5">
              <p className="flex-1 text-sm font-extrabold text-ink">
                이 위치의 정보 {chooser.length}건
              </p>
              <button
                type="button"
                onClick={() => {
                  expandCluster(chooser);
                  setChooser(null);
                }}
                className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700"
              >
                확대해서 보기
              </button>
              <button
                type="button"
                onClick={() => setChooser(null)}
                aria-label="닫기"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-subtle"
              >
                ✕
              </button>
            </div>
            <ul className="no-scrollbar max-h-52 space-y-1 overflow-y-auto">
              {chooser.map((p) => {
                const it = pointInfo(p);
                return (
                  <li key={p.key}>
                    <button
                      type="button"
                      onClick={() => {
                        setChooser(null);
                        pickPoint(p);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-black/5"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                        style={{ background: p.color }}
                      >
                        <Icon name={it.icon as never} size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-ink">
                          {it.title}
                        </span>
                        <span className="block text-[11px] font-medium text-subtle">
                          {it.sub}
                        </span>
                      </span>
                      {p.alert && (
                        <span className="shrink-0 rounded-full bg-[#fbe9e5] px-2 py-0.5 text-[10px] font-bold text-[#c0452f]">
                          주의
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // 군집 멤버의 목록 표기용 제목/부제/아이콘
  function pointInfo(p: MapPoint): { title: string; sub: string; icon: string } {
    if (p.kind === 'facility') {
      return {
        title: p.data.name,
        sub: `시설 · ${FACILITY_META[p.data.category].label}`,
        icon: FACILITY_META[p.data.category].icon,
      };
    }
    if (p.kind === 'report') {
      return {
        title: p.data.title,
        sub: `불편 제보 · ${REPORT_META[p.data.category].label}`,
        icon: REPORT_META[p.data.category].icon,
      };
    }
    if (p.kind === 'smoking') {
      return { title: p.data.name, sub: '보조 정보 · 간접흡연 주의 구역', icon: 'smoking' };
    }
    return {
      title: p.data.title,
      sub: `커뮤니티 · ${COMMUNITY_STATUS_META[p.data.status].label}`,
      icon: COMMUNITY_STATUS_META[p.data.status].icon,
    };
  }

  // 목록에서 항목을 고르면 개별 마커 클릭과 동일하게 동작
  function pickPoint(p: MapPoint) {
    if (p.kind === 'facility') onSelectFacility?.(p.data.id);
    else if (p.kind === 'report') onSelectReport?.(p.data.id);
    else if (p.kind === 'smoking') onSelectSmoking?.(p.data.id);
    else onSelectPost?.(p.data.id);
  }

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
  project,
}: {
  route: RouteOption;
  project: (lat: number, lng: number) => { x: number; y: number };
}) {
  const start = route.path[0];
  const end = route.path[route.path.length - 1];
  const s = project(start.lat, start.lng);
  const e = project(end.lat, end.lng);
  return (
    <>
      <Endpoint x={s.x} y={s.y} label="출발" color="#0a8174" />
      <Endpoint x={e.x} y={e.y} label="도착" color="#c0452f" />
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
