import { REGION_BOUNDS } from '@/data/region';

/**
 * 위경도를 지도 컨테이너 내부의 백분율 좌표(0~100)로 투영.
 * 커스텀 SVG 지도용 단순 등각 투영 (MVP 영역이 좁아 왜곡 무시 가능).
 */
export function projectToPercent(lat: number, lng: number): { x: number; y: number } {
  const { minLat, maxLat, minLng, maxLng } = REGION_BOUNDS;
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  // 위도는 위로 갈수록 y가 작아짐 (화면 좌표계)
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** 두 좌표 사이 거리(m) - Haversine */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** path 점들을 SVG polyline용 "x,y x,y ..." 문자열로 (백분율 기준) */
export function pathToPoints(path: Array<{ lat: number; lng: number }>): string {
  return path
    .map((p) => {
      const { x, y } = projectToPercent(p.lat, p.lng);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}
