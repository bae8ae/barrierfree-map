import type { RouteOption, RouteSearchParams, TravelMode } from '@/types';
import { QUICK_PLACES, REGION_CENTER } from '@/data/region';
import { distanceMeters } from '@/utils/geo';
import { getReports } from '@/services/reportService';
import { reportAffectsMode } from '@/utils/score';

// ============================================================
// 경로 서비스 (가상 길찾기)
// 실제 길찾기 API 가 없어도, 출발/도착 좌표 사이에 교통약자 맞춤
// 경로 후보 2~3개를 생성한다. 활성 제보를 회피한 것처럼 점수에 반영.
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
};

/** 직선 사이에 중간 경유점을 만들어 살짝 휘어진 경로 path 생성 */
function buildPath(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  bend: number,
): Array<{ lat: number; lng: number }> {
  const mid = {
    lat: (from.lat + to.lat) / 2,
    lng: (from.lng + to.lng) / 2,
  };
  // 경로가 직선과 겹치지 않도록 수직 방향으로 살짝 이동
  const dx = to.lng - from.lng;
  const dy = to.lat - from.lat;
  const bent = {
    lat: mid.lat + dx * bend,
    lng: mid.lng - dy * bend,
  };
  const q1 = {
    lat: (from.lat + bent.lat) / 2,
    lng: (from.lng + bent.lng) / 2,
  };
  const q3 = {
    lat: (bent.lat + to.lat) / 2,
    lng: (bent.lng + to.lng) / 2,
  };
  return [from, q1, bent, q3, to];
}

function pathLength(path: Array<{ lat: number; lng: number }>): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += distanceMeters(path[i - 1], path[i]);
  return total;
}

export async function getAccessibleRoutes(
  params: RouteSearchParams,
): Promise<RouteOption[]> {
  const from = resolvePoint(params.origin, params.originPoint);
  const to = resolvePoint(params.destination, params.destinationPoint);

  const allReports = await getReports({ status: 'active' });
  const relevant = allReports.filter((r) => reportAffectsMode(r, params.mode));

  const wantsElevator =
    params.priorities.includes('elevator_first') ||
    params.priorities.includes('avoid_stairs');
  const wantsGentle = params.priorities.includes('gentle_slope');
  const wantsTactile = params.priorities.includes('tactile_first');

  // --- 후보 1: 추천 경로 (제보 회피 + 접근성 우선) ---
  const recPath = buildPath(from, to, 0.55);
  const recDist = Math.round(pathLength(recPath));
  const recommended: RouteOption = {
    id: 'route-recommended',
    name: '추천 경로',
    mode: params.mode,
    estimatedMinutes: Math.max(3, Math.round(recDist / SPEED[params.mode]) + 2),
    distanceMeters: recDist,
    accessibilityScore: 88,
    elevatorCount: wantsElevator ? 2 : 1,
    slopeSections: wantsGentle ? 0 : 1,
    avoidedReports: relevant.length,
    avoidsStairs: true,
    warnings: [],
    reason: buildReason(params, relevant.length, 'recommended', wantsTactile),
    path: recPath,
    badge: 'recommended',
  };

  // --- 후보 2: 빠른 경로 (최단, 회피 미반영) ---
  const fastPath = buildPath(from, to, 0.12);
  const fastDist = Math.round(pathLength(fastPath));
  const fastWarnings: string[] = [];
  if (relevant.length > 0) {
    fastWarnings.push(`이동 주의 구간 ${relevant.length}곳을 지나요`);
  }
  if (params.mode === 'wheelchair') fastWarnings.push('계단/턱 구간이 포함될 수 있어요');
  const fast: RouteOption = {
    id: 'route-fast',
    name: '빠른 경로',
    mode: params.mode,
    estimatedMinutes: Math.max(2, Math.round(fastDist / (SPEED[params.mode] + 8))),
    distanceMeters: fastDist,
    accessibilityScore: Math.max(40, 70 - relevant.length * 6),
    elevatorCount: 0,
    slopeSections: 2,
    avoidedReports: 0,
    avoidsStairs: false,
    warnings: fastWarnings,
    reason:
      '거리상 가장 짧지만 최근 제보나 계단 구간이 포함될 수 있어요. 시설이 있다는 것보다 지금 이동 가능한지가 중요해요.',
    path: fastPath,
    badge: 'fast',
  };

  // --- 후보 3: 안전/완만 경로 (경사 완만, 실내 우선) ---
  const safePath = buildPath(from, to, -0.6);
  const safeDist = Math.round(pathLength(safePath) * 1.08);
  const safe: RouteOption = {
    id: 'route-safe',
    name: '안전·완만 경로',
    mode: params.mode,
    estimatedMinutes: Math.max(4, Math.round(safeDist / (SPEED[params.mode] - 6)) + 3),
    distanceMeters: safeDist,
    accessibilityScore: 92,
    elevatorCount: 2,
    slopeSections: 0,
    avoidedReports: relevant.length,
    avoidsStairs: true,
    warnings: [],
    reason: buildReason(params, relevant.length, 'safe', wantsTactile),
    path: safePath,
    badge: 'safe',
  };

  return delay([recommended, fast, safe]);
}

function buildReason(
  params: RouteSearchParams,
  avoided: number,
  kind: 'recommended' | 'safe',
  wantsTactile: boolean,
): string {
  const parts: string[] = [];
  if (avoided > 0) {
    parts.push(`최근 제보가 있는 구간 ${avoided}곳을 우회`);
  }
  if (params.priorities.includes('elevator_first')) {
    parts.push('엘리베이터 이용 가능한 출입구를 우선 반영');
  }
  if (params.priorities.includes('avoid_stairs')) {
    parts.push('계단·턱이 없는 경로를 선택');
  }
  if (kind === 'safe' || params.priorities.includes('gentle_slope')) {
    parts.push('경사가 완만한 길로 안내');
  }
  if (wantsTactile) {
    parts.push('점자블록이 이어지는 구간을 우선');
  }
  if (parts.length === 0) {
    parts.push('접근성이 검증된 보행로를 우선 반영');
  }
  return `이 경로는 ${parts.join('하고, ')}했어요.`;
}
