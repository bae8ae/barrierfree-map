import type {
  FacilityCategory,
  ReportCategory,
  Severity,
  ReportStatus,
  UserMode,
  AffectedUser,
  TravelMode,
  RoutePriority,
  MapCategoryFilter,
  CommunityPostType,
  CommunityPostStatus,
} from '@/types';

// ============================================================
// 라벨 / 색상 / 아이콘 메타데이터
// 색상만으로 정보를 구분하지 않도록 항상 라벨/아이콘과 병행
// ============================================================

// ---- 사용자 모드 ----
export const MODE_META: Record<
  UserMode,
  { label: string; emoji: string; short: string }
> = {
  wheelchair: { label: '휠체어 이용', emoji: '♿', short: '휠체어' },
  stroller: { label: '유모차 동반', emoji: '👶', short: '유모차' },
  elderly: { label: '노약자', emoji: '🧓', short: '노약자' },
  visually_impaired: { label: '시각장애', emoji: '🦮', short: '시각장애' },
  all: { label: '전체 보기', emoji: '🧭', short: '전체' },
};

export const MODE_ORDER: UserMode[] = [
  'all',
  'wheelchair',
  'stroller',
  'elderly',
  'visually_impaired',
];

export const TRAVEL_MODE_ORDER: TravelMode[] = [
  'wheelchair',
  'stroller',
  'elderly',
  'visually_impaired',
];

// ---- 공공시설 카테고리 ----
export const FACILITY_META: Record<
  FacilityCategory,
  { label: string; icon: string; color: string }
> = {
  elevator: { label: '엘리베이터', icon: 'elevator', color: '#3b82f6' },
  accessible_toilet: { label: '장애인 화장실', icon: 'toilet', color: '#0e9e8b' },
  ramp: { label: '경사로', icon: 'ramp', color: '#8f6ae6' },
  subway: { label: '지하철역', icon: 'subway', color: '#2563eb' },
  bus_stop: { label: '저상버스 정류장', icon: 'bus', color: '#2563eb' },
  public_building: { label: '공공시설', icon: 'building', color: '#3b82f6' },
  restaurant: { label: '음식점', icon: 'restaurant', color: '#16a35e' },
  cafe: { label: '카페', icon: 'cafe', color: '#16a35e' },
  hospital: { label: '병원', icon: 'hospital', color: '#ed4f34' },
  culture: { label: '문화시설', icon: 'culture', color: '#8f6ae6' },
};

// ---- 제보 카테고리 ----
export const REPORT_META: Record<
  ReportCategory,
  { label: string; icon: string; color: string }
> = {
  elevator_outage: { label: '엘리베이터 고장', icon: 'elevator', color: '#ed4f34' },
  construction: { label: '공사/보도 차단', icon: 'construction', color: '#f5b921' },
  curb_step: { label: '턱/계단', icon: 'step', color: '#ff6b52' },
  steep_slope: { label: '급경사', icon: 'slope', color: '#ff6b52' },
  tactile_block: { label: '점자블록 문제', icon: 'tactile', color: '#27408b' },
  obstacle: { label: '장애물/적치물', icon: 'warning', color: '#ed4f34' },
  toilet_issue: { label: '장애인 화장실 문제', icon: 'toilet', color: '#ff6b52' },
  guide_dog_issue: { label: '안내견 출입 문제', icon: 'dog', color: '#8f6ae6' },
  ramp_issue: { label: '경사로 이용 어려움', icon: 'ramp', color: '#ff6b52' },
  slippery: { label: '길 미끄러움', icon: 'water', color: '#3b82f6' },
  etc: { label: '기타 이동 불편', icon: 'warning', color: '#5b6675' },
};

export const REPORT_CATEGORY_ORDER: ReportCategory[] = [
  'elevator_outage',
  'construction',
  'curb_step',
  'steep_slope',
  'tactile_block',
  'obstacle',
  'toilet_issue',
  'guide_dog_issue',
  'ramp_issue',
  'slippery',
  'etc',
];

// ---- 지도 카테고리 필터 ----
export const MAP_FILTER_META: Record<
  MapCategoryFilter,
  { label: string; icon: string; color: string }
> = {
  elevator: { label: '엘리베이터', icon: 'elevator', color: '#3b82f6' },
  toilet: { label: '화장실', icon: 'toilet', color: '#0e9e8b' },
  ramp: { label: '경사로', icon: 'ramp', color: '#8f6ae6' },
  construction: { label: '공사', icon: 'construction', color: '#f5b921' },
  step: { label: '턱/계단', icon: 'step', color: '#ff6b52' },
  tactile: { label: '점자블록', icon: 'tactile', color: '#27408b' },
  obstacle: { label: '장애물', icon: 'warning', color: '#ed4f34' },
  guide_dog: { label: '안내견', icon: 'dog', color: '#8f6ae6' },
};

export const MAP_FILTER_ORDER: MapCategoryFilter[] = [
  'elevator',
  'toilet',
  'ramp',
  'construction',
  'step',
  'tactile',
  'obstacle',
  'guide_dog',
];

// ---- 심각도 ----
export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; bg: string }
> = {
  low: { label: '낮음', color: '#16a35e', bg: '#dcfce9' },
  medium: { label: '보통', color: '#d99708', bg: '#fef6d8' },
  high: { label: '높음', color: '#c83a22', bg: '#ffe6e2' },
};

// ---- 제보 상태 ----
export const STATUS_META: Record<
  ReportStatus,
  { label: string; color: string; bg: string }
> = {
  active: { label: '진행 중', color: '#c83a22', bg: '#ffe6e2' },
  resolved: { label: '해결됨', color: '#16a35e', bg: '#dcfce9' },
  needs_check: { label: '확인 필요', color: '#d99708', bg: '#fef6d8' },
};

// ---- 대상자 ----
export const AFFECTED_META: Record<AffectedUser, { label: string; emoji: string }> = {
  wheelchair: { label: '휠체어', emoji: '♿' },
  stroller: { label: '유모차', emoji: '👶' },
  elderly: { label: '노약자', emoji: '🧓' },
  visually_impaired: { label: '시각장애', emoji: '🦮' },
  all: { label: '전체', emoji: '🧭' },
};

// ---- 경로 우선순위 ----
export const PRIORITY_META: Record<RoutePriority, { label: string; icon: string }> = {
  shortest: { label: '최단거리', icon: 'route' },
  avoid_stairs: { label: '계단 회피', icon: 'step' },
  elevator_first: { label: '엘리베이터 우선', icon: 'elevator' },
  gentle_slope: { label: '경사 완만한 길', icon: 'slope' },
  tactile_first: { label: '점자블록 우선', icon: 'tactile' },
  avoid_construction: { label: '공사/장애물 회피', icon: 'construction' },
  minimize_indoor: { label: '실내 이동 최소화', icon: 'building' },
};

export const PRIORITY_ORDER: RoutePriority[] = [
  'shortest',
  'avoid_stairs',
  'elevator_first',
  'gentle_slope',
  'tactile_first',
  'avoid_construction',
  'minimize_indoor',
];

// 제보 카테고리 → 지도 필터 매핑 (제보가 어떤 필터에 속하는지)
export function reportToMapFilter(cat: ReportCategory): MapCategoryFilter | null {
  switch (cat) {
    case 'elevator_outage':
      return 'elevator';
    case 'construction':
      return 'construction';
    case 'curb_step':
    case 'steep_slope':
      return 'step';
    case 'tactile_block':
      return 'tactile';
    case 'obstacle':
    case 'slippery':
      return 'obstacle';
    case 'toilet_issue':
      return 'toilet';
    case 'ramp_issue':
      return 'ramp';
    case 'guide_dog_issue':
      return 'guide_dog';
    default:
      return null;
  }
}

// 시설 카테고리 → 지도 필터 매핑
export function facilityToMapFilter(cat: FacilityCategory): MapCategoryFilter | null {
  switch (cat) {
    case 'elevator':
      return 'elevator';
    case 'accessible_toilet':
      return 'toilet';
    case 'ramp':
      return 'ramp';
    default:
      return null; // 그 외 시설은 필터 카테고리에 미해당 (항상 표시되지 않음)
  }
}

// ============================================================
// 커뮤니티 메타
// ============================================================

// ---- 게시글 유형 ----
export const COMMUNITY_TYPE_META: Record<
  CommunityPostType,
  { label: string; emoji: string; color: string; bg: string }
> = {
  report: { label: '실시간 제보', emoji: '📍', color: '#c83a22', bg: '#ffe6e2' },
  facility_status: { label: '시설 상태', emoji: '🛗', color: '#2563eb', bg: '#dbeafe' },
  review: { label: '이용 후기', emoji: '⭐', color: '#8f6ae6', bg: '#efeafe' },
  question: { label: '질문', emoji: '❓', color: '#d99708', bg: '#fef6d8' },
  resolved: { label: '해결·복구', emoji: '✅', color: '#16a35e', bg: '#dcfce9' },
};

export const COMMUNITY_TYPE_ORDER: CommunityPostType[] = [
  'report',
  'facility_status',
  'review',
  'question',
  'resolved',
];

// ---- 게시글 상태 ----
export const COMMUNITY_STATUS_META: Record<
  CommunityPostStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  needs_check: { label: '확인 필요', color: '#d99708', bg: '#fef6d8', icon: 'warning' },
  available: { label: '현재 이용 가능', color: '#16a35e', bg: '#dcfce9', icon: 'ramp' },
  unavailable: { label: '이용 어려움', color: '#c83a22', bg: '#ffe6e2', icon: 'step' },
  resolved: { label: '해결됨', color: '#0a8174', bg: '#dcf3ee', icon: 'ramp' },
};

export const COMMUNITY_STATUS_ORDER: CommunityPostStatus[] = [
  'needs_check',
  'available',
  'unavailable',
  'resolved',
];

/** 커뮤니티 게시글 → 지도 카테고리 필터 (태그 우선) */
export function communityToMapFilter(tags: string[]): MapCategoryFilter | null {
  const known: MapCategoryFilter[] = MAP_FILTER_ORDER;
  for (const t of tags) {
    if ((known as string[]).includes(t)) return t as MapCategoryFilter;
  }
  return null;
}

/** 상대 시간 문구 (예: "12분 전") - 데모용 고정 기준 시간 사용 */
export function timeAgo(iso: string, now: Date = new Date('2026-05-29T15:00:00+09:00')): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now.getTime() - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return `${Math.floor(day / 7)}주 전`;
}
