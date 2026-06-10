import type { PublicFacility, UserReport, TravelMode, UserMode } from '@/types';
import { clamp } from '@/utils/geo';

// ============================================================
// 접근성 점수 계산
// 핵심 철학: 정적 시설 점수(있음) − 실시간 제보 패널티(지금 막힘)
// = "지금 실제로 이동 가능한지" 점수
// ============================================================

const SEVERITY_PENALTY: Record<UserReport['severity'], number> = {
  low: 2,
  medium: 5,
  high: 9,
};

/**
 * 지역 접근성 점수 (0~100)
 * 시설 평균 점수에서 활성 제보의 심각도 합산 패널티를 차감
 */
export function computeAreaScore(
  facilities: PublicFacility[],
  reports: UserReport[],
): number {
  if (facilities.length === 0) return 0;
  const base =
    facilities.reduce((s, f) => s + f.accessibilityScore, 0) / facilities.length;
  const penalty = reports
    .filter((r) => r.status === 'active')
    .reduce((s, r) => s + SEVERITY_PENALTY[r.severity], 0);
  return Math.round(clamp(base - penalty, 0, 100));
}

/** 모드별로 시설이 실제 이용 가능한지 */
export function isFacilityUsableForMode(
  f: PublicFacility,
  mode: UserMode,
): boolean {
  switch (mode) {
    case 'wheelchair':
      return f.wheelchairAccessible;
    case 'stroller':
      return f.strollerAccessible;
    case 'elderly':
      return f.elderlyFriendly;
    case 'visually_impaired':
      return f.visuallyImpairedFriendly;
    case 'pregnant':
      // 임산부는 유모차·노약자와 유사한 이동 특성(엘리베이터·완경사·휴식 필요)
      return f.strollerAccessible || f.elderlyFriendly;
    case 'all':
    default:
      return true;
  }
}

/** 점수 → 등급 라벨/색상 */
export function scoreGrade(score: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (score >= 80) return { label: '이동 원활', color: '#0a8174', bg: '#dcfce9' };
  if (score >= 60) return { label: '대체로 양호', color: '#16a35e', bg: '#e6f7f4' };
  if (score >= 40) return { label: '주의 필요', color: '#d99708', bg: '#fef6d8' };
  return { label: '이동 어려움', color: '#c83a22', bg: '#ffe6e2' };
}

/** 제보가 특정 모드에 영향을 주는지 */
export function reportAffectsMode(r: UserReport, mode: TravelMode): boolean {
  return r.affectedUsers.includes('all') || r.affectedUsers.includes(mode);
}
