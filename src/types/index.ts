// ============================================================
// BarrierFree Map · 핵심 데이터 타입
// "시설이 있다는 것보다 중요한 건, 지금 실제로 이동할 수 있는지입니다."
// ============================================================

/** 사용자 이동 모드 (교통약자 유형) */
export type UserMode =
  | 'wheelchair'
  | 'stroller'
  | 'elderly'
  | 'visually_impaired'
  | 'pregnant'
  | 'all';

/** 제보가 영향을 주는 대상자 */
export type AffectedUser =
  | 'wheelchair'
  | 'stroller'
  | 'elderly'
  | 'visually_impaired'
  | 'pregnant'
  | 'all';

/** 경로/리뷰에서 사용하는 모드 (전체 제외) */
export type TravelMode = Exclude<UserMode, 'all'>;

// ------------------------------------------------------------
// 공공 API 기반 정적 시설 정보
// ------------------------------------------------------------
export type FacilityCategory =
  | 'elevator'
  | 'accessible_toilet'
  | 'ramp'
  | 'subway'
  | 'bus_stop'
  | 'public_building'
  | 'restaurant'
  | 'cafe'
  | 'hospital'
  | 'culture';

export type PublicFacility = {
  id: string;
  source: 'public_api' | 'mock';
  name: string;
  category: FacilityCategory;
  lat: number;
  lng: number;
  address: string;
  wheelchairAccessible: boolean;
  strollerAccessible: boolean;
  elderlyFriendly: boolean;
  visuallyImpairedFriendly: boolean;
  guideDogAllowed: boolean | null;
  hasAccessibleToilet: boolean;
  hasRamp: boolean;
  hasElevator: boolean;
  hasAutomaticDoor: boolean;
  lastUpdated: string;
  /** 0~100 */
  accessibilityScore: number;
  reviewCount?: number;
};

// ------------------------------------------------------------
// 사용자 제보 (실시간 이동 가능성 정보)
// ------------------------------------------------------------
export type ReportCategory =
  | 'elevator_outage'
  | 'construction'
  | 'curb_step'
  | 'steep_slope'
  | 'tactile_block'
  | 'obstacle'
  | 'toilet_issue'
  | 'guide_dog_issue'
  | 'ramp_issue'
  | 'slippery'
  | 'etc';

export type Severity = 'low' | 'medium' | 'high';

/** 내부 이동 로직용 제보 상태 (지도/점수 계산) */
export type ReportStatus = 'active' | 'resolved' | 'needs_check';

// ------------------------------------------------------------
// 제보 신뢰도 시스템
// 같은 위치를 여러 사람이 확인할수록 신뢰도가 올라가고,
// 시간이 지나면 만료 예정/확인 필요로 내려가 "지금도 유효한지"를 드러낸다.
// ------------------------------------------------------------
/** 제보 신뢰도 등급 */
export type ReportConfidence = '높음' | '보통' | '낮음';

/** 신뢰도 기반 제보 상태 (사용자 노출용 한글 라벨) */
export type ReportTrustStatus =
  | '활성'
  | '확인 필요'
  | '만료 예정'
  | '해결됨'
  | '반박 있음';

export type UserReport = {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  lat: number;
  lng: number;
  locationName: string;
  severity: Severity;
  affectedUsers: AffectedUser[];
  status: ReportStatus;
  createdAt: string;
  confirmations: number;
  helpfulCount: number;
  anonymous: boolean;
  /** UI 데모용 - 사진 첨부 placeholder 표시 여부 */
  hasPhoto: boolean;
  authorNickname?: string;

  // ---- 신뢰도 시스템 필드 ----
  /** 신뢰도 등급 */
  confidence: ReportConfidence;
  /** 다른 사용자가 "아직 불편해요"로 재확인한 횟수 */
  verifiedCount: number;
  /** 신뢰도 기반 노출 상태 */
  trustStatus: ReportTrustStatus;
  /** 마지막으로 확인/갱신된 시각 (ISO) */
  lastUpdated: string;
  /** 만료까지 남은 시간(시간 단위) — 있으면 "만료 예정" 안내에 사용 */
  expiresInHours?: number;
};

// ------------------------------------------------------------
// 시설 접근성 리뷰 (사용자 실이용 후기)
// ------------------------------------------------------------
export type AccessibilityReview = {
  id: string;
  facilityId: string;
  userMode: TravelMode;
  /** 1~5 */
  rating: number;
  content: string;
  tags: string[];
  createdAt: string;
  helpfulCount: number;
  authorNickname?: string;
};

// ------------------------------------------------------------
// 경로 추천
// ------------------------------------------------------------
export type RoutePriority =
  | 'shortest'
  | 'avoid_stairs'
  | 'elevator_first'
  | 'gentle_slope'
  | 'tactile_first'
  | 'avoid_construction'
  | 'minimize_indoor';

export type RouteOption = {
  id: string;
  name: string;
  mode: TravelMode;
  estimatedMinutes: number;
  distanceMeters: number;
  accessibilityScore: number;
  elevatorCount: number;
  slopeSections: number;
  avoidedReports: number;
  /** 계단/턱 회피 여부 */
  avoidsStairs: boolean;
  warnings: string[];
  reason: string;
  path: Array<{ lat: number; lng: number }>;
  /** 이 경로가 해당 모드의 어떤 불편요소를 해소하는지 (모드별로 다르게 강조) */
  highlights: string[];
  /** UI 라벨링: 경로 성격 */
  badge:
    | 'recommended'
    | 'fast'
    | 'safe'
    | 'tactile'
    | 'rest'
    | 'clean';
};

export type RouteSearchParams = {
  origin: string;
  destination: string;
  mode: TravelMode;
  priorities: RoutePriority[];
  originPoint?: { lat: number; lng: number };
  destinationPoint?: { lat: number; lng: number };
};

// ------------------------------------------------------------
// 사용자 프로필
// ------------------------------------------------------------
export type User = {
  id: string;
  nickname: string;
  mode: UserMode;
  contributionScore: number;
  reportsCount: number;
  reviewsCount: number;
  helpfulReceived: number;
  badges: string[];
};

// ------------------------------------------------------------
// 필터 / 서비스 파라미터
// ------------------------------------------------------------
export type ReportFilters = {
  category?: ReportCategory | 'all';
  status?: ReportStatus | 'all';
  affectedUser?: AffectedUser;
};

/** 지도 카테고리 필터 키 */
export type MapCategoryFilter =
  | 'elevator'
  | 'toilet'
  | 'ramp'
  | 'construction'
  | 'step'
  | 'tactile'
  | 'obstacle'
  | 'guide_dog'
  /**
   * 보조 정보: 간접흡연 주의 구역.
   * 핵심 기능이 아니라 임산부·유모차 사용자의 이동 선택을 돕는 보조 레이어로,
   * 임산부 모드/유모차 모드에서만 지도에 노출된다.
   */
  | 'smoking';

// ------------------------------------------------------------
// 보조 정보: 간접흡연 주의 구역
// 임산부·유모차 사용자의 이동 선택을 돕기 위한 보조 데이터.
// 전체 사용자에게 항상 노출하지 않는다.
// ------------------------------------------------------------
export type SmokingZone = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** 혼잡/노출 정도 */
  intensity: 'low' | 'medium' | 'high';
  note: string;
  lastUpdated: string;
};

// ------------------------------------------------------------
// 커뮤니티 (장소 기반 이동 경험 공유 피드)
// 공공데이터는 시설의 존재를, 커뮤니티는 실제 이용 가능 여부를 알려준다.
// ------------------------------------------------------------
export type CommunityPostType =
  | 'report' // 실시간 제보
  | 'facility_status' // 시설 상태 공유
  | 'review' // 이용 후기
  | 'question' // 질문
  | 'resolved' // 해결/복구 알림
  // ---- 보호자 관련 카테고리 ----
  | 'guardian_question' // 보호자 질문
  | 'hospital_companion' // 병원 동행 후기
  | 'parent_route' // 부모님 이동 경로
  | 'stroller_tip'; // 유모차 동행 팁

export type CommunityPostStatus =
  | 'needs_check' // 확인 필요
  | 'available' // 현재 이용 가능
  | 'unavailable' // 이용 어려움
  | 'resolved'; // 해결됨

export type CommunityPost = {
  id: string;
  type: CommunityPostType;
  title: string;
  content: string;
  /** 연결된 공공시설 (있으면 시설 상세에 노출) */
  facilityId?: string;
  locationName: string;
  lat: number;
  lng: number;
  affectedUsers: AffectedUser[];
  status: CommunityPostStatus;
  /** 사진 placeholder 식별자 목록 (데모용) */
  images: string[];
  anonymous: boolean;
  authorNickname: string;
  createdAt: string;
  helpfulCount: number;
  confirmations: number;
  commentsCount: number;
  tags: string[];
};

export type CommunityComment = {
  id: string;
  postId: string;
  content: string;
  authorNickname: string;
  anonymous: boolean;
  createdAt: string;
  helpfulCount: number;
};

export type CommunityFilters = {
  type?: CommunityPostType | 'all';
  status?: CommunityPostStatus;
  tag?: string;
  affectedUser?: Exclude<AffectedUser, 'all'>;
  query?: string;
};

// ------------------------------------------------------------
// 보호자 안심 공유 (Mock)
// 실제 GPS·문자 발송 없이, 사용자가 원할 때 안전한 독립 이동을
// 보호자와 함께 확인하도록 돕는 선택형 기능.
// ------------------------------------------------------------
/** 위치 공유 흐름 단계: 공유 전 → 이동 중 → 목적지 도착 → 공유 종료 */
export type GuardianSharePhase = 'idle' | 'moving' | 'arrived' | 'ended';

/** 등록된 보호자 (Mock) */
export type GuardianContact = {
  id: string;
  name: string;
  relation: string;
  phoneMasked: string;
};

/** 보호자에게 보낼 알림 설정 */
export type GuardianAlertKey =
  | 'arrival' // 목적지 도착 알림
  | 'offRoute' // 경로 이탈 알림
  | 'longStop' // 장시간 정지 알림
  | 'riskZone'; // 위험 구간 진입 알림
