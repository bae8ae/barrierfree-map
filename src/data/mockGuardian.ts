import type { GuardianContact, GuardianAlertKey } from '@/types';

// ============================================================
// 보호자 안심 공유 — 가상 데이터
// 실제 GPS·문자 발송은 하지 않으며, Mock 흐름으로
// "공유 전 → 이동 중 → 목적지 도착 → 공유 종료"를 보여줍니다.
// ============================================================

/** 현재 사용자(피보호자) Mock */
export const MOCK_PROTECTED_USER = {
  name: '김민수',
  mode: '휠체어 이용',
  origin: '안암역 3번 출구',
  destination: '고대안암병원 정문',
  etaMinutes: 12,
};

/** 등록된 보호자 (Mock) */
export const MOCK_GUARDIANS: GuardianContact[] = [
  {
    id: 'grd-1',
    name: '김영희',
    relation: '어머니',
    phoneMasked: '010-1234-****',
  },
  {
    id: 'grd-2',
    name: '김상우',
    relation: '형',
    phoneMasked: '010-5678-****',
  },
];

/** 알림 설정 정의 */
export const GUARDIAN_ALERTS: {
  key: GuardianAlertKey;
  label: string;
  desc: string;
  icon: 'location' | 'route' | 'warning' | 'bell';
  defaultOn: boolean;
}[] = [
  {
    key: 'arrival',
    label: '목적지 도착 알림',
    desc: '목적지에 도착하면 보호자에게 알려요.',
    icon: 'location',
    defaultOn: true,
  },
  {
    key: 'offRoute',
    label: '경로 이탈 알림',
    desc: '추천 경로에서 크게 벗어나면 알려요.',
    icon: 'route',
    defaultOn: true,
  },
  {
    key: 'longStop',
    label: '장시간 정지 알림',
    desc: '같은 자리에 오래 머물면 알려요.',
    icon: 'bell',
    defaultOn: false,
  },
  {
    key: 'riskZone',
    label: '위험 구간 진입 알림',
    desc: '제보가 많은 위험 구간에 들어서면 알려요.',
    icon: 'warning',
    defaultOn: true,
  },
];

/** 향후 고도화(선택형) 예정 기능 */
export const GUARDIAN_FUTURE_FEATURES: string[] = [
  '복수 보호자 등록',
  '장시간 정지 자동 감지',
  '이동 기록 리포트',
  '응급 연락처 자동 알림',
  '병원·복지관 이동 기록 관리',
];
