import type { RouteOption, RouteSearchParams, TravelMode } from '@/types';
import { QUICK_PLACES, REGION_CENTER } from '@/data/region';
import { distanceMeters } from '@/utils/geo';
import { getReports } from '@/services/reportService';
import { reportAffectsMode } from '@/utils/score';

// ============================================================
// 경로 서비스 (가상 길찾기)
// 실제 길찾기 API 가 없어도, 출발/도착 좌표 사이에 교통약자 맞춤
// 경로 후보를 생성한다.
//
// 핵심: 같은 출발/도착이라도 "이동 모드(휠체어·유모차·시각장애 등)"에 따라
// 신경 쓰는 불편요소가 다르므로, 모드별로 서로 다른 최적 경로 후보를 만든다.
// 또한 우회·접근성 우선 경로는 직선보다 길어지도록 거리/시간을 키운다.
// ============================================================

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function resolvePoint(
  name: string,
  explicit?: { lat: number; lng: number },
): { lat: number; lng: number } {
  if (explicit) return explicit;
  const found = QUICK_PLACES.find((p) => p.name === name || name.includes(p.name));
  return found ? { lat: found.lat, lng: found.lng } : REGION_CENTER;
}

/** 모드별 보행 속도(m/min) — 교통약자 기준으로 느리게 */
const SPEED: Record<TravelMode, number> = {
  wheelchair: 55,
  stroller: 60,
  elderly: 45,
  visually_impaired: 50,
  pregnant: 48,
};

/**
 * 직선 사이에 경유점을 더 많이 만들어 굽이진(=더 긴) 경로 path 생성.
 * bend 가 클수록 더 크게 우회하고, segments 가 많을수록 길이 더 길어진다.
 */
function buildPath(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  bend: number,
): Array<{ lat: number; lng: number }> {
  const dx = to.lng - from.lng;
  const dy = to.lat - from.lat;
  // 수직(법선) 방향 단위 벡터 — 이 방향으로 경유점을 밀어 굽이를 만든다
  const nx = -dy;
  const ny = dx;

  // 출발→도착을 4구간으로 나누고, 가운데 두 점을 좌우로 번갈아 밀어 S 자 경로
  const pts: Array<{ lat: number; lng: number }> = [from];
  const offsets = [0.18, 0.42, 0.62, 0.84];
  const sway = [0.55, 1, 0.75, 0.3];
  const dir = [1, 1, -1, 1];
  offsets.forEach((t, i) => {
    pts.push({
      lat: from.lat + dy * t + ny * bend * sway[i] * dir[i],
      lng: from.lng + dx * t + nx * bend * sway[i] * dir[i],
    });
  });
  pts.push(to);
  return pts;
}

function pathLength(path: Array<{ lat: number; lng: number }>): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += distanceMeters(path[i - 1], path[i]);
  return total;
}

// ============================================================
// 모드별 경로 전략
// 각 전략 = "이 모드가 신경 쓰는 한 가지 불편요소를 우선 해소한 경로"
// ============================================================
type Strategy = {
  id: string;
  name: string;
  badge: RouteOption['badge'];
  /** 굽이 정도 (클수록 우회) */
  bend: number;
  /** 직선 대비 거리 배수 (클수록 길고 안전한 우회) */
  lengthFactor: number;
  /** 속도 보정 (m/min 가감) */
  speedAdj: number;
  accessibilityScore: number;
  elevatorCount: number;
  slopeSections: number;
  avoidsStairs: boolean;
  /** 활성 제보를 우회하는지 */
  avoidsHazards: boolean;
  highlights: string[];
  reasonParts: string[];
  warnings: string[];
};

/** 공통 "빠른 경로" — 모드별 경고만 달라진다 */
function fastStrategy(mode: TravelMode, hazardCount: number): Strategy {
  const warn: string[] = [];
  if (hazardCount > 0) warn.push(`이동 주의 구간 ${hazardCount}곳을 지나요`);
  const modeWarn: Record<TravelMode, string> = {
    wheelchair: '계단·턱 구간이 포함될 수 있어요',
    stroller: '좁은 보도·계단 구간이 포함될 수 있어요',
    elderly: '급경사·긴 보행 구간이 포함될 수 있어요',
    visually_impaired: '점자블록이 끊기거나 공사 구간이 있을 수 있어요',
    pregnant: '혼잡하거나 급경사 구간이 포함될 수 있어요',
  };
  warn.push(modeWarn[mode]);
  return {
    id: 'route-fast',
    name: '빠른 경로',
    badge: 'fast',
    bend: 0.05,
    lengthFactor: 1.02,
    speedAdj: 8,
    accessibilityScore: Math.max(38, 68 - hazardCount * 6),
    elevatorCount: 0,
    slopeSections: 2,
    avoidsStairs: false,
    avoidsHazards: false,
    highlights: ['거리상 최단', '접근성 미확인 구간 포함'],
    reasonParts: [],
    warnings: warn,
  };
}

/** 모드별 맞춤 전략 목록 (추천 + 불편요소별 대안) */
function modeStrategies(mode: TravelMode): Strategy[] {
  switch (mode) {
    case 'wheelchair':
      return [
        {
          id: 'route-recommended',
          name: '계단 없는 추천 경로',
          badge: 'recommended',
          bend: 0.5,
          lengthFactor: 1.32,
          speedAdj: 0,
          accessibilityScore: 90,
          elevatorCount: 2,
          slopeSections: 1,
          avoidsStairs: true,
          avoidsHazards: true,
          highlights: ['계단·턱 0구간', '엘리베이터 2회', '연석 낮은 출입구'],
          reasonParts: ['계단·턱이 없는 출입구', '엘리베이터로 층 이동'],
          warnings: [],
        },
        {
          id: 'route-gentle',
          name: '경사 최소 경로',
          badge: 'safe',
          bend: 0.78,
          lengthFactor: 1.55,
          speedAdj: -6,
          accessibilityScore: 94,
          elevatorCount: 2,
          slopeSections: 0,
          avoidsStairs: true,
          avoidsHazards: true,
          highlights: ['급경사 구간 회피', '평탄한 보도 위주', '휠체어 진입 검증'],
          reasonParts: ['경사가 완만한 길', '바닥이 고른 보행로'],
          warnings: [],
        },
      ];
    case 'stroller':
      return [
        {
          id: 'route-recommended',
          name: '엘리베이터 우선 경로',
          badge: 'recommended',
          bend: 0.46,
          lengthFactor: 1.3,
          speedAdj: 0,
          accessibilityScore: 89,
          elevatorCount: 2,
          slopeSections: 1,
          avoidsStairs: true,
          avoidsHazards: true,
          highlights: ['엘리베이터·경사로 연결', '넓은 보도', '유모차 진입 쉬운 출입구'],
          reasonParts: ['엘리베이터·경사로로 단차 없이 이동', '보도 폭이 넓은 길'],
          warnings: [],
        },
        {
          id: 'route-clean',
          name: '간접흡연 회피 경로',
          badge: 'clean',
          bend: 0.7,
          lengthFactor: 1.48,
          speedAdj: -3,
          accessibilityScore: 92,
          elevatorCount: 1,
          slopeSections: 1,
          avoidsStairs: true,
          avoidsHazards: true,
          highlights: ['간접흡연 주의 구역 우회', '한적한 보행로', '쉼터 인접'],
          reasonParts: ['간접흡연 주의 구역을 피하는 길', '혼잡이 덜한 보행로'],
          warnings: [],
        },
      ];
    case 'elderly':
      return [
        {
          id: 'route-recommended',
          name: '완만하고 짧은 추천 경로',
          badge: 'recommended',
          bend: 0.44,
          lengthFactor: 1.28,
          speedAdj: 0,
          accessibilityScore: 88,
          elevatorCount: 1,
          slopeSections: 1,
          avoidsStairs: true,
          avoidsHazards: true,
          highlights: ['급경사 회피', '안전한 횡단보도', '중간 휴식 공간 2곳'],
          reasonParts: ['급경사를 피한 완만한 길', '신호 있는 안전한 횡단보도'],
          warnings: [],
        },
        {
          id: 'route-rest',
          name: '휴식 많은 평지 경로',
          badge: 'rest',
          bend: 0.72,
          lengthFactor: 1.5,
          speedAdj: -5,
          accessibilityScore: 91,
          elevatorCount: 1,
          slopeSections: 0,
          avoidsStairs: true,
          avoidsHazards: true,
          highlights: ['벤치·그늘 쉼터 3곳', '평지 위주', '계단 없음'],
          reasonParts: ['중간중간 앉아 쉴 수 있는 길', '평지 위주로 무리가 적은 길'],
          warnings: [],
        },
      ];
    case 'visually_impaired':
      return [
        {
          id: 'route-recommended',
          name: '점자블록 우선 경로',
          badge: 'tactile',
          bend: 0.48,
          lengthFactor: 1.34,
          speedAdj: 0,
          accessibilityScore: 90,
          elevatorCount: 1,
          slopeSections: 1,
          avoidsStairs: true,
          avoidsHazards: true,
          highlights: ['점자블록 연속 구간', '음향신호기 2곳', '공사 구간 회피'],
          reasonParts: ['점자블록이 끊기지 않는 보행로', '음향신호기가 있는 횡단보도'],
          warnings: [],
        },
        {
          id: 'route-clear',
          name: '장애물 적은 경로',
          badge: 'safe',
          bend: 0.74,
          lengthFactor: 1.52,
          speedAdj: -4,
          accessibilityScore: 92,
          elevatorCount: 1,
          slopeSections: 0,
          avoidsStairs: true,
          avoidsHazards: true,
          highlights: ['적치물·공사 구간 회피', '넓고 단순한 동선', '소음 적은 길'],
          reasonParts: ['적치물과 공사 구간을 피한 길', '갈림이 적은 단순한 동선'],
          warnings: [],
        },
      ];
    case 'pregnant':
      return [
        {
          id: 'route-recommended',
          name: '휴식·완만 추천 경로',
          badge: 'recommended',
          bend: 0.45,
          lengthFactor: 1.29,
          speedAdj: 0,
          accessibilityScore: 89,
          elevatorCount: 2,
          slopeSections: 1,
          avoidsStairs: true,
          avoidsHazards: true,
          highlights: ['급경사 회피', '엘리베이터 이용', '휴식 공간 2곳'],
          reasonParts: ['급경사를 피하고 엘리베이터를 이용', '중간에 쉴 수 있는 길'],
          warnings: [],
        },
        {
          id: 'route-clean',
          name: '혼잡·간접흡연 회피 경로',
          badge: 'clean',
          bend: 0.71,
          lengthFactor: 1.49,
          speedAdj: -4,
          accessibilityScore: 92,
          elevatorCount: 1,
          slopeSections: 0,
          avoidsStairs: true,
          avoidsHazards: true,
          highlights: ['혼잡 구간 우회', '간접흡연 주의 구역 우회', '평탄한 보도'],
          reasonParts: ['사람이 몰리는 혼잡 구간을 피한 길', '간접흡연 주의 구역을 우회'],
          warnings: [],
        },
      ];
  }
}

function strategyToRoute(
  s: Strategy,
  params: RouteSearchParams,
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  hazardCount: number,
): RouteOption {
  const path = buildPath(from, to, s.bend);
  // 직선 거리 기반으로 길이를 키워, 우회 경로일수록 더 길게
  const straight = Math.max(distanceMeters(from, to), 200);
  const geom = Math.max(pathLength(path), straight);
  const dist = Math.round(Math.max(geom, straight * s.lengthFactor));
  const speed = Math.max(30, SPEED[params.mode] + s.speedAdj);

  const reason = buildReason(params, s, hazardCount);
  return {
    id: s.id,
    name: s.name,
    mode: params.mode,
    estimatedMinutes: Math.max(3, Math.round(dist / speed) + (s.badge === 'fast' ? 0 : 2)),
    distanceMeters: dist,
    accessibilityScore: s.accessibilityScore,
    elevatorCount: s.elevatorCount,
    slopeSections: s.slopeSections,
    avoidedReports: s.avoidsHazards ? hazardCount : 0,
    avoidsStairs: s.avoidsStairs,
    warnings: s.warnings,
    reason,
    path,
    highlights: s.highlights,
    badge: s.badge,
  };
}

function buildReason(
  params: RouteSearchParams,
  s: Strategy,
  hazardCount: number,
): string {
  if (s.badge === 'fast') {
    return '거리상 가장 짧지만 최근 제보나 단차 구간이 포함될 수 있어요. 시설이 있다는 것보다 지금 이동 가능한지가 중요해요.';
  }
  const parts = [...s.reasonParts];
  if (s.avoidsHazards && hazardCount > 0) {
    parts.unshift(`최근 제보가 있는 구간 ${hazardCount}곳을 우회`);
  }
  // 사용자가 고른 우선순위를 반영
  if (params.priorities.includes('tactile_first') && !parts.some((p) => p.includes('점자블록'))) {
    parts.push('점자블록이 이어지는 구간을 우선');
  }
  if (parts.length === 0) parts.push('접근성이 검증된 보행로를 우선 반영');
  return `이 경로는 ${parts.join('하고, ')}했어요.`;
}

export async function getAccessibleRoutes(
  params: RouteSearchParams,
): Promise<RouteOption[]> {
  const from = resolvePoint(params.origin, params.originPoint);
  const to = resolvePoint(params.destination, params.destinationPoint);

  const allReports = await getReports({ status: 'active' });
  const hazardCount = allReports.filter((r) => reportAffectsMode(r, params.mode)).length;

  // 모드별 맞춤 후보 + 공통 빠른 경로
  const strategies = [
    ...modeStrategies(params.mode),
    fastStrategy(params.mode, hazardCount),
  ];

  const routes = strategies.map((s) =>
    strategyToRoute(s, params, from, to, hazardCount),
  );

  return delay(routes);
}
