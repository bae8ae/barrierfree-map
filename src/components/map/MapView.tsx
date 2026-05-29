import { useMemo } from 'react';
import type { RouteOption } from '@/types';
import { useStore } from '@/store/useStore';
import { LANDMARKS, CURRENT_LOCATION } from '@/data/region';
import { projectToPercent, pathToPoints } from '@/utils/geo';
import { facilityToMapFilter, reportToMapFilter, communityToMapFilter } from '@/utils/meta';
import { FacilityMarker } from '@/components/map/FacilityMarker';
import { ReportMarker } from '@/components/map/ReportMarker';
import { CommunityMarker } from '@/components/map/CommunityMarker';
import { CurrentModeAvatar } from '@/components/map/CurrentModeAvatar';

// ============================================================
// 커스텀 지도 캔버스
// 공공시설 마커(정적) + 사용자 제보 마커(실시간) + 현재위치 아바타
// 외부 지도 SDK 없이 위경도를 컨테이너 백분율로 투영해 표현
// ============================================================

const LANDMARK_STYLE: Record<
  string,
  { w: number; h: number; fill: string; label: string }
> = {
  campus: { w: 30, h: 22, fill: '#dfeee0', label: '🏫' },
  hospital: { w: 16, h: 14, fill: '#fde4e0', label: '🏥' },
  park: { w: 22, h: 20, fill: '#d7ecd2', label: '🌳' },
  station: { w: 10, h: 10, fill: '#dce7fb', label: '🚇' },
  street: { w: 18, h: 9, fill: '#f3ead9', label: '☕' },
  residential: { w: 16, h: 12, fill: '#ece7dc', label: '🏘️' },
  bus: { w: 9, h: 9, fill: '#dce7fb', label: '🚌' },
};

export function MapView({
  route,
  selectedReportId,
  selectedPostId,
  onSelectFacility,
  onSelectReport,
  onSelectPost,
  onAvatarClick,
  avatarMessage,
  showAvatar = true,
  showCommunity = true,
  dimContext = false,
}: {
  route?: RouteOption | null;
  selectedReportId?: string | null;
  selectedPostId?: string | null;
  onSelectFacility?: (id: string) => void;
  onSelectReport?: (id: string) => void;
  onSelectPost?: (id: string) => void;
  onAvatarClick?: () => void;
  avatarMessage?: string;
  showAvatar?: boolean;
  showCommunity?: boolean;
  dimContext?: boolean;
}) {
  const facilities = useStore((s) => s.facilities);
  const reports = useStore((s) => s.reports);
  const communityPosts = useStore((s) => s.communityPosts);
  const mode = useStore((s) => s.mode);
  const mapFilters = useStore((s) => s.mapFilters);
  const selectedFacilityId = useStore((s) => s.selectedFacilityId);
  const avatar = useStore((s) => s.user.avatar);

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

  // 아바타 위치 = 안암역 근처(데모 고정)
  const avatarPos = CURRENT_LOCATION;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#eef0e8]">
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
                className="flex items-center justify-center rounded-2xl"
                style={{
                  width: `${st.w * 3}px`,
                  height: `${st.h * 3}px`,
                  background: st.fill,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)',
                }}
              >
                <span className="text-lg opacity-70">{st.label}</span>
              </div>
              <span className="mt-0.5 block whitespace-nowrap text-center text-[10px] font-bold text-subtle">
                {lm.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* 경로 출발/도착 포인트 */}
      {route && <RouteEndpoints route={route} />}

      {/* 공공시설 마커 */}
      {visibleFacilities.map((f) => (
        <FacilityMarker
          key={f.id}
          facility={f}
          mode={mode}
          selected={selectedFacilityId === f.id}
          onClick={() => onSelectFacility?.(f.id)}
        />
      ))}

      {/* 제보 마커 */}
      {visibleReports.map((r) => (
        <ReportMarker
          key={r.id}
          report={r}
          selected={selectedReportId === r.id}
          onClick={() => onSelectReport?.(r.id)}
        />
      ))}

      {/* 커뮤니티 게시글 마커 */}
      {showCommunity &&
        visiblePosts.map((p) => (
          <CommunityMarker
            key={p.id}
            post={p}
            selected={selectedPostId === p.id}
            onClick={() => onSelectPost?.(p.id)}
          />
        ))}

      {/* 현재 위치 아바타 */}
      {showAvatar && (
        <CurrentModeAvatar
          mode={mode}
          lat={avatarPos.lat}
          lng={avatarPos.lng}
          outfitColor={avatar.outfitColor}
          message={avatarMessage}
          onClick={onAvatarClick}
        />
      )}
    </div>
  );
}

function RouteEndpoints({ route }: { route: RouteOption }) {
  const start = route.path[0];
  const end = route.path[route.path.length - 1];
  const s = projectToPercent(start.lat, start.lng);
  const e = projectToPercent(end.lat, end.lng);
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
