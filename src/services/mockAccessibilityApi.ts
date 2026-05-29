import type { PublicFacility, FacilityCategory } from '@/types';
import { MOCK_FACILITIES } from '@/data/mockFacilities';

// ============================================================
// Mock 공공 접근성 API
// 실제 공공데이터포털 API를 붙이기 전, 동일한 비동기 인터페이스로
// 더미 데이터를 Promise 로 반환한다. (네트워크 지연도 흉내)
// ============================================================

/** 네트워크 지연 흉내 */
function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** area 파라미터는 데모에서는 무시(전 지역 반환). 실제 API에서는 행정구역 코드 등으로 필터 */
function byCategories(categories: FacilityCategory[]): PublicFacility[] {
  return MOCK_FACILITIES.filter((f) => categories.includes(f.category)).map((f) => ({
    ...f,
    source: 'mock',
  }));
}

export async function mockFetchElevators(_area?: string): Promise<PublicFacility[]> {
  return delay(byCategories(['elevator', 'subway']).filter((f) => f.hasElevator));
}

export async function mockFetchAccessibleToilets(
  _area?: string,
): Promise<PublicFacility[]> {
  return delay(byCategories(['accessible_toilet']).filter((f) => f.hasAccessibleToilet));
}

export async function mockFetchTransitFacilities(
  _area?: string,
): Promise<PublicFacility[]> {
  return delay(byCategories(['subway', 'bus_stop']));
}

export async function mockFetchRamps(_area?: string): Promise<PublicFacility[]> {
  return delay(byCategories(['ramp']));
}

export async function mockFetchAllPublicFacilities(
  _area?: string,
): Promise<PublicFacility[]> {
  return delay(MOCK_FACILITIES.map((f) => ({ ...f, source: 'mock' as const })), 450);
}
