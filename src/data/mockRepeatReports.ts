// ============================================================
// 반복 제보 기반 관리자 리포트 — 가상 데이터
// 같은 구역에서 반복되는 제보를 모아 개선 우선순위를 제시합니다.
// 실제 민원 시스템 연동은 없고 "개선 요청 후보 / 행정 연계 후보"로만 표시합니다.
// ============================================================

export type RepeatReportZone = {
  id: string;
  location: string;
  issue: string;
  count: number;
  lastReportedAt: string; // 상대 시간 라벨용
  priority: '높음' | '중간' | '낮음';
  /** 행정 연계 후보 여부 (실제 연동 없음) */
  adminCandidate: boolean;
};

export const MOCK_REPEAT_REPORT_ZONES: RepeatReportZone[] = [
  {
    id: 'rz-1',
    location: '안암역 2번 출구',
    issue: '엘리베이터 고장',
    count: 14,
    lastReportedAt: '2026-05-29T13:10:00+09:00',
    priority: '높음',
    adminCandidate: true,
  },
  {
    id: 'rz-2',
    location: '고대안암병원 후문',
    issue: '보도 턱',
    count: 9,
    lastReportedAt: '2026-05-29T10:40:00+09:00',
    priority: '높음',
    adminCandidate: true,
  },
  {
    id: 'rz-3',
    location: '고려대 정문 앞',
    issue: '점자블록 장애물',
    count: 7,
    lastReportedAt: '2026-05-28T18:20:00+09:00',
    priority: '중간',
    adminCandidate: false,
  },
];
