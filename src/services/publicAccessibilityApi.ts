import type { PublicFacility } from '@/types';
import {
  mockFetchAccessibleToilets,
  mockFetchAllPublicFacilities,
  mockFetchElevators,
  mockFetchTransitFacilities,
} from '@/services/mockAccessibilityApi';

// ============================================================
// 공공 접근성 API 진입점
// 실제 공공데이터포털(장애인편의시설, 지하철역 엘리베이터, 저상버스 등)을
// 붙일 때 이 파일의 내부 구현만 교체하면 된다.
// 컴포넌트는 항상 이 모듈의 함수를 통해 데이터를 받는다.
// ============================================================

/**
 * 실제 API 사용 여부 스위치.
 * import.meta.env.VITE_USE_REAL_API === 'true' 이면 실 API 호출(미구현),
 * 그 외에는 mock 데이터를 반환한다.
 */
const USE_REAL_API = import.meta.env?.VITE_USE_REAL_API === 'true';

// 실제 API 엔드포인트 예시 (키 발급 후 사용)
// const BASE_URL = 'https://api.odcloud.kr/api';
// const API_KEY = import.meta.env.VITE_PUBLIC_DATA_KEY;

async function notImplemented(): Promise<never> {
  throw new Error(
    '실제 공공 API 연동이 아직 구성되지 않았습니다. VITE_USE_REAL_API 를 끄거나 엔드포인트를 구현하세요.',
  );
}

export async function fetchElevators(area?: string): Promise<PublicFacility[]> {
  if (USE_REAL_API) return notImplemented();
  return mockFetchElevators(area);
}

export async function fetchAccessibleToilets(area?: string): Promise<PublicFacility[]> {
  if (USE_REAL_API) return notImplemented();
  return mockFetchAccessibleToilets(area);
}

export async function fetchTransitFacilities(area?: string): Promise<PublicFacility[]> {
  if (USE_REAL_API) return notImplemented();
  return mockFetchTransitFacilities(area);
}

export async function fetchAllPublicFacilities(
  area?: string,
): Promise<PublicFacility[]> {
  if (USE_REAL_API) return notImplemented();
  return mockFetchAllPublicFacilities(area);
}
