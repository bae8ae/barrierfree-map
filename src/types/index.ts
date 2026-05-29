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
  | 'all';

/** 제보가 영향을 주는 대상자 */
export type AffectedUser =
  | 'wheelchair'
  | 'stroller'
  | 'elderly'
  | 'visually_impaired'
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
export type ReportStatus = 'active' | 'resolved' | 'needs_check';

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
  hasPhoto?: boolean;
  authorNickname?: string;
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
  /** UI 라벨링: 추천/빠른/안전 */
  badge: 'recommended' | 'fast' | 'safe';
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
  avatar: {
    characterType: string;
    outfitColor: string;
    expression: string;
    accessory: string;
  };
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
  | 'guide_dog';

// ------------------------------------------------------------
// 커뮤니티 (장소 기반 이동 경험 공유 피드)
// 공공데이터는 시설의 존재를, 커뮤니티는 실제 이용 가능 여부를 알려준다.
// ------------------------------------------------------------
export type CommunityPostType =
  | 'report' // 실시간 제보
  | 'facility_status' // 시설 상태 공유
  | 'review' // 이용 후기
  | 'question' // 질문
  | 'resolved'; // 해결/복구 알림

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
