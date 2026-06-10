// ============================================================
// MVP 지역: 고려대학교 안암 캠퍼스 주변
// (안암역, 고대안암병원, 참살이길 카페거리, 개운산 공원, 원룸촌, 버스정류장)
// 실제 좌표 기반의 가상 데이터 — 추후 실제 API로 교체 가능
// ============================================================

/** 지도 표시 영역 경계 (위경도) */
export const REGION_BOUNDS = {
  minLat: 37.5805,
  maxLat: 37.5945,
  minLng: 127.0185,
  maxLng: 127.0375,
};

export const REGION_CENTER = {
  lat: (REGION_BOUNDS.minLat + REGION_BOUNDS.maxLat) / 2,
  lng: (REGION_BOUNDS.minLng + REGION_BOUNDS.maxLng) / 2,
};

export const REGION_NAME = '고려대 안암 캠퍼스 일대';

/** MVP 테스트 지역 안내 — 전국 서비스가 아니라 특정 생활권 검증 단계임을 명확히 */
export const MVP_TEST_REGION_NOTICE =
  '현재 MVP 테스트 지역: 고려대학교 안암캠퍼스 · 안암역 · 고대안암병원 주변';

/** 지도 상단 등에 붙이는 짧은 배지 라벨 */
export const MVP_TEST_BADGE = '안암 생활권 테스트';

/** 현재 사용자 위치 (데모 고정 — 안암역 인근) */
export const CURRENT_LOCATION = { lat: 37.5858, lng: 127.0288 };

/** 지도에 라벨로 그릴 주요 장소 (배경 표현용) */
export type Landmark = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: 'campus' | 'hospital' | 'station' | 'park' | 'street' | 'residential' | 'bus';
};

export const LANDMARKS: Landmark[] = [
  { id: 'lm-ku', name: '고려대학교', lat: 37.5895, lng: 127.0327, kind: 'campus' },
  { id: 'lm-hospital', name: '고대안암병원', lat: 37.5868, lng: 127.0262, kind: 'hospital' },
  { id: 'lm-anam', name: '안암역 3번 출구', lat: 37.5863, lng: 127.0294, kind: 'station' },
  { id: 'lm-gouni', name: '고려대역', lat: 37.5904, lng: 127.0364, kind: 'station' },
  { id: 'lm-park', name: '개운산 근린공원', lat: 37.5922, lng: 127.0228, kind: 'park' },
  { id: 'lm-cafe', name: '참살이길 카페거리', lat: 37.5848, lng: 127.0325, kind: 'street' },
  { id: 'lm-oneroom', name: '안암동 원룸촌', lat: 37.5832, lng: 127.0235, kind: 'residential' },
  { id: 'lm-bus', name: '고대정문 버스정류장', lat: 37.5882, lng: 127.0335, kind: 'bus' },
];

/** 출발/도착지 빠른 선택용 장소 */
export const QUICK_PLACES: { name: string; lat: number; lng: number }[] = [
  { name: '안암역 3번 출구', lat: 37.5863, lng: 127.0294 },
  { name: '고대안암병원 정문', lat: 37.5868, lng: 127.0262 },
  { name: '고려대 중앙광장', lat: 37.5895, lng: 127.0327 },
  { name: '참살이길 카페거리', lat: 37.5848, lng: 127.0325 },
  { name: '개운산 근린공원', lat: 37.5922, lng: 127.0228 },
  { name: '안암동 원룸촌', lat: 37.5832, lng: 127.0235 },
  { name: '고대정문 버스정류장', lat: 37.5882, lng: 127.0335 },
];
