import type {
  FacilityCategory,
  ReportCategory,
  Severity,
  ReportStatus,
  ReportConfidence,
  ReportTrustStatus,
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
//
// 색 사용 원칙 (깔끔한 팔레트):
// - 틸(primary)  : 브랜드 · 이용 가능 · 해결됨 · 활성 UI
// - 슬레이트 중립 : 카테고리/유형 구분 (아이콘·라벨이 의미를 전달)
// - 빨강(머티드)  : 위험 · 불편 제보 · 이용 어려움에만
// - 앰버(머티드)  : 확인 필요 · 주의에만
// ============================================================

// 공통 팔레트 토큰
const C = {
  teal: '#0a8174',
  tealBg: '#e3f2ef',
  slate: '#4a5563',
  slateBg: '#f0ede5',
  gray: '#5b6675',
  grayBg: '#eef0ee',
  grayLight: '#8a93a0',
  red: '#c0452f',
  redBg: '#fbe9e5',
  redMarker: '#d9573f',
  amber: '#a16207',
  amberBg: '#f7eed7',
  facility: '#5c708a', // 공공시설 마커 (차분한 블루 슬레이트)
  aux: '#7c8aa0', // 보조 정보
};

// ---- 사용자 모드 ----
export const MODE_META: Record<
  UserMode,
  { label: string; icon: string; short: string }
> = {
  wheelchair: { label: '휠체어 이용', icon: 'wheelchair', short: '휠체어' },
  stroller: { label: '유모차 동반', icon: 'stroller', short: '유모차' },
  elderly: { label: '노약자', icon: 'elderly', short: '노약자' },
  visually_impaired: { label: '시각장애', icon: 'blind', short: '시각장애' },
  pregnant: { label: '임산부', icon: 'pregnant', short: '임산부' },
  all: { label: '전체 보기', icon: 'compass', short: '전체' },
};

export const MODE_ORDER: UserMode[] = [
  'all',
  'wheelchair',
  'stroller',
  'elderly',
  'visually_impaired',
  'pregnant',
];

export const TRAVEL_MODE_ORDER: TravelMode[] = [
  'wheelchair',
  'stroller',
  'elderly',
  'visually_impaired',
  'pregnant',
];

/**
 * 모드별로 지도에서 강조되는 카테고리 (우선순위 순).
 * 모드를 바꾸면 필터 칩 순서와 강조 표시가 이 정의에 따라 달라진다.
 * 실제 알고리즘은 단순히 category/tags 기준 필터링이며,
 * "지금 이 사용자에게 중요한 정보"를 앞쪽에 노출하는 것이 목적이다.
 */
export const MODE_EMPHASIS: Record<UserMode, MapCategoryFilter[]> = {
  // 계단·턱, 엘리베이터 고장, 경사로, 휠체어 진입
  wheelchair: ['step', 'elevator', 'ramp', 'obstacle'],
  // 엘리베이터, 유모차 진입, 보도(경사로), 간접흡연 주의 구역
  stroller: ['elevator', 'ramp', 'smoking', 'obstacle'],
  // 급경사, 긴 보행 거리, 휴식, 안전한 횡단보도
  elderly: ['step', 'ramp', 'elevator', 'construction'],
  // 점자블록, 음향신호기, 보행 장애물, 안내견 동반
  visually_impaired: ['tactile', 'guide_dog', 'obstacle', 'construction'],
  // 엘리베이터, 휴식, 급경사, 혼잡, 간접흡연 주의 구역
  pregnant: ['elevator', 'smoking', 'step', 'ramp'],
  all: [],
};

/** 간접흡연 주의 구역(보조 정보)이 노출되는 모드 */
export const SMOKING_VISIBLE_MODES: UserMode[] = ['stroller', 'pregnant'];

/** 모드별로 강조하는 정보 요약 (UI 안내 문구용) */
export const MODE_FOCUS_SUMMARY: Record<UserMode, string> = {
  wheelchair: '계단·턱, 엘리베이터 고장, 경사로, 휠체어 진입 가능 여부를 강조해요.',
  stroller:
    '엘리베이터, 유모차 진입, 보도 폭, 간접흡연 주의 구역(보조)을 강조해요.',
  elderly: '급경사, 긴 보행 거리, 휴식 공간, 안전한 횡단보도를 강조해요.',
  visually_impaired: '점자블록, 음향신호기, 보행 장애물, 안내견 동반을 강조해요.',
  pregnant:
    '엘리베이터, 휴식 공간, 급경사, 혼잡 구간, 간접흡연 주의 구역(보조)을 강조해요.',
  all: '모든 접근성 정보를 한 번에 살펴봐요.',
};

// ---- 공공시설 카테고리 ----
export const FACILITY_META: Record<
  FacilityCategory,
  { label: string; icon: string; color: string }
> = {
  // 공공시설(정적 데이터)은 모두 하나의 차분한 색 — 종류는 아이콘으로 구분
  elevator: { label: '엘리베이터', icon: 'elevator', color: C.facility },
  accessible_toilet: { label: '장애인 화장실', icon: 'toilet', color: C.facility },
  ramp: { label: '경사로', icon: 'ramp', color: C.facility },
  subway: { label: '지하철역', icon: 'subway', color: C.facility },
  bus_stop: { label: '저상버스 정류장', icon: 'bus', color: C.facility },
  public_building: { label: '공공시설', icon: 'building', color: C.facility },
  restaurant: { label: '음식점', icon: 'restaurant', color: C.facility },
  cafe: { label: '카페', icon: 'cafe', color: C.facility },
  hospital: { label: '병원', icon: 'hospital', color: C.facility },
  culture: { label: '문화시설', icon: 'culture', color: C.facility },
};

// ---- 제보 카테고리 ----
export const REPORT_META: Record<
  ReportCategory,
  { label: string; icon: string; color: string }
> = {
  // 불편 제보(동적)는 모두 머티드 레드 — 종류는 아이콘으로, 심각도는 배지로 구분
  elevator_outage: { label: '엘리베이터 고장', icon: 'elevator', color: C.redMarker },
  construction: { label: '공사/보도 차단', icon: 'construction', color: C.redMarker },
  curb_step: { label: '턱/계단', icon: 'step', color: C.redMarker },
  steep_slope: { label: '급경사', icon: 'slope', color: C.redMarker },
  tactile_block: { label: '점자블록 문제', icon: 'tactile', color: C.redMarker },
  obstacle: { label: '장애물/적치물', icon: 'warning', color: C.redMarker },
  toilet_issue: { label: '장애인 화장실 문제', icon: 'toilet', color: C.redMarker },
  guide_dog_issue: { label: '안내견 출입 문제', icon: 'dog', color: C.redMarker },
  ramp_issue: { label: '경사로 이용 어려움', icon: 'ramp', color: C.redMarker },
  slippery: { label: '길 미끄러움', icon: 'water', color: C.redMarker },
  etc: { label: '기타 이동 불편', icon: 'warning', color: C.gray },
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
  // 필터 칩은 켜졌을 때 모두 틸 — 종류는 아이콘+라벨로 구분
  elevator: { label: '엘리베이터', icon: 'elevator', color: '#0e9e8b' },
  toilet: { label: '화장실', icon: 'toilet', color: '#0e9e8b' },
  ramp: { label: '경사로', icon: 'ramp', color: '#0e9e8b' },
  construction: { label: '공사', icon: 'construction', color: '#0e9e8b' },
  step: { label: '턱/계단', icon: 'step', color: '#0e9e8b' },
  tactile: { label: '점자블록', icon: 'tactile', color: '#0e9e8b' },
  obstacle: { label: '장애물', icon: 'warning', color: '#0e9e8b' },
  guide_dog: { label: '안내견', icon: 'dog', color: '#0e9e8b' },
  smoking: { label: '보조 정보: 간접흡연 주의 구역', icon: 'smoking', color: C.aux },
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
  'smoking',
];

/** 간접흡연 주의 구역 안내 문구 (보조 정보임을 명확히) */
export const SMOKING_FILTER_HINT =
  '간접흡연 주의 구역은 임산부·유모차 사용자의 이동 선택을 돕기 위한 보조 정보입니다.';

/** 임산부/유모차 모드가 아닐 때 간접흡연 필터 비활성 안내 */
export const SMOKING_DISABLED_HINT =
  '이 정보는 임산부 모드와 유모차 모드에서 제공됩니다.';

// ---- 심각도 ----
export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; bg: string }
> = {
  low: { label: '낮음', color: C.gray, bg: C.grayBg },
  medium: { label: '보통', color: C.amber, bg: C.amberBg },
  high: { label: '높음', color: C.red, bg: C.redBg },
};

// ---- 제보 상태 ----
export const STATUS_META: Record<
  ReportStatus,
  { label: string; color: string; bg: string }
> = {
  active: { label: '진행 중', color: C.red, bg: C.redBg },
  resolved: { label: '해결됨', color: C.teal, bg: C.tealBg },
  needs_check: { label: '확인 필요', color: C.amber, bg: C.amberBg },
};

// ---- 제보 신뢰도 등급 ----
export const CONFIDENCE_META: Record<
  ReportConfidence,
  { label: string; color: string; bg: string }
> = {
  높음: { label: '신뢰도 높음', color: C.teal, bg: C.tealBg },
  보통: { label: '신뢰도 보통', color: C.gray, bg: C.grayBg },
  낮음: { label: '신뢰도 낮음', color: C.grayLight, bg: C.grayBg },
};

// ---- 신뢰도 기반 제보 상태 ----
export const TRUST_STATUS_META: Record<
  ReportTrustStatus,
  { label: string; color: string; bg: string }
> = {
  활성: { label: '활성', color: C.red, bg: C.redBg },
  '확인 필요': { label: '확인 필요', color: C.amber, bg: C.amberBg },
  '만료 예정': { label: '만료 예정', color: C.gray, bg: C.grayBg },
  해결됨: { label: '해결됨', color: C.teal, bg: C.tealBg },
  '반박 있음': { label: '반박 있음', color: C.slate, bg: C.slateBg },
};

// ---- 대상자 ----
export const AFFECTED_META: Record<AffectedUser, { label: string; icon: string }> = {
  wheelchair: { label: '휠체어', icon: 'wheelchair' },
  stroller: { label: '유모차', icon: 'stroller' },
  elderly: { label: '노약자', icon: 'elderly' },
  visually_impaired: { label: '시각장애', icon: 'blind' },
  pregnant: { label: '임산부', icon: 'pregnant' },
  all: { label: '전체', icon: 'compass' },
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
  { label: string; icon: string; color: string; bg: string }
> = {
  // 게시글 유형 배지는 모두 중립색 — 의미 색은 상태 배지가 담당
  report: { label: '실시간 제보', icon: 'location', color: C.red, bg: C.redBg },
  facility_status: { label: '시설 상태', icon: 'elevator', color: C.slate, bg: C.slateBg },
  review: { label: '이용 후기', icon: 'star', color: C.slate, bg: C.slateBg },
  question: { label: '질문', icon: 'help', color: C.slate, bg: C.slateBg },
  resolved: { label: '해결·복구', icon: 'check', color: C.teal, bg: C.tealBg },
  // ---- 보호자 관련 카테고리 ----
  guardian_question: { label: '보호자 질문', icon: 'shield', color: C.slate, bg: C.slateBg },
  hospital_companion: { label: '병원 동행 후기', icon: 'hospital', color: C.slate, bg: C.slateBg },
  parent_route: { label: '부모님 이동 경로', icon: 'elderly', color: C.slate, bg: C.slateBg },
  stroller_tip: { label: '유모차 동행 팁', icon: 'stroller', color: C.slate, bg: C.slateBg },
};

export const COMMUNITY_TYPE_ORDER: CommunityPostType[] = [
  'report',
  'facility_status',
  'review',
  'question',
  'resolved',
  'guardian_question',
  'hospital_companion',
  'parent_route',
  'stroller_tip',
];

/** 보호자 관련 커뮤니티 카테고리 (필터/안내용) */
export const GUARDIAN_COMMUNITY_TYPES: CommunityPostType[] = [
  'guardian_question',
  'hospital_companion',
  'parent_route',
  'stroller_tip',
];

// ---- 게시글 상태 ----
export const COMMUNITY_STATUS_META: Record<
  CommunityPostStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  needs_check: { label: '확인 필요', color: C.amber, bg: C.amberBg, icon: 'warning' },
  available: { label: '현재 이용 가능', color: C.teal, bg: C.tealBg, icon: 'ramp' },
  unavailable: { label: '이용 어려움', color: C.red, bg: C.redBg, icon: 'step' },
  resolved: { label: '해결됨', color: C.gray, bg: C.grayBg, icon: 'ramp' },
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
