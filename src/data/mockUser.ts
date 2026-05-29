import type { User } from '@/types';

// ============================================================
// 현재 로그인 사용자 (데모용)
// ============================================================

export const MOCK_USER: User = {
  id: 'user-me',
  nickname: '바퀴달린하루',
  mode: 'wheelchair',
  avatar: {
    characterType: 'wheelchair',
    outfitColor: '#0e9e8b',
    expression: 'smile',
    accessory: 'none',
  },
  contributionScore: 1240,
  reportsCount: 8,
  reviewsCount: 5,
  helpfulReceived: 47,
  badges: ['first_report', 'observer', 'elevator_guardian', 'reporter'],
};

// ---- 뱃지 정의 ----
export type BadgeDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

export const BADGE_DEFS: Record<string, BadgeDef> = {
  first_report: {
    id: 'first_report',
    label: '첫 제보',
    emoji: '🌱',
    description: '첫 불편 제보를 등록했어요',
  },
  observer: {
    id: 'observer',
    label: '길 위의 관찰자',
    emoji: '👀',
    description: '제보 10건 이상 확인에 참여했어요',
  },
  reporter: {
    id: 'reporter',
    label: '접근성 리포터',
    emoji: '📝',
    description: '제보 5건 이상을 등록했어요',
  },
  elevator_guardian: {
    id: 'elevator_guardian',
    label: '엘리베이터 지킴이',
    emoji: '🛗',
    description: '엘리베이터 관련 제보로 도움을 주었어요',
  },
  tactile_guardian: {
    id: 'tactile_guardian',
    label: '점자블록 수호자',
    emoji: '🦯',
    description: '점자블록 문제를 제보해 시각장애인을 도왔어요',
  },
  stroller_guide: {
    id: 'stroller_guide',
    label: '유아차 길잡이',
    emoji: '👶',
    description: '유아차 이동 정보를 활발히 공유했어요',
  },
  barrierfree_maker: {
    id: 'barrierfree_maker',
    label: '배리어프리 메이커',
    emoji: '🏅',
    description: '기여 점수 1000점을 돌파했어요',
  },
};

export const ALL_BADGE_IDS = Object.keys(BADGE_DEFS);
