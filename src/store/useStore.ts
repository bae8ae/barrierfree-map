import { create } from 'zustand';
import type {
  PublicFacility,
  UserReport,
  AccessibilityReview,
  RouteOption,
  RouteSearchParams,
  User,
  UserMode,
  MapCategoryFilter,
  ReportStatus,
  CommunityPost,
  CommunityComment,
} from '@/types';
import { MAP_FILTER_ORDER } from '@/utils/meta';
import { MOCK_REVIEWS } from '@/data/mockReviews';
import { MOCK_USER, BADGE_DEFS } from '@/data/mockUser';
import { fetchAllPublicFacilities } from '@/services/publicAccessibilityApi';
import {
  getReports,
  createReport,
  confirmReport,
  markReportHelpful,
  updateReportStatus,
} from '@/services/reportService';
import { getAccessibleRoutes } from '@/services/routeService';
import {
  getCommunityPosts,
  createCommunityPost,
  markPostHelpful,
  confirmPost,
  getComments,
  addComment,
} from '@/services/communityService';

type Toast = { id: number; message: string; tone: 'success' | 'info' | 'warn' };

function allFiltersOn(): Record<MapCategoryFilter, boolean> {
  return MAP_FILTER_ORDER.reduce(
    (acc, k) => {
      acc[k] = true;
      return acc;
    },
    {} as Record<MapCategoryFilter, boolean>,
  );
}

type NewReport = Omit<
  UserReport,
  'id' | 'createdAt' | 'confirmations' | 'helpfulCount'
>;

type NewReview = Omit<AccessibilityReview, 'id' | 'createdAt' | 'helpfulCount'>;

type NewCommunityPost = Omit<
  CommunityPost,
  'id' | 'createdAt' | 'helpfulCount' | 'confirmations' | 'commentsCount'
>;

type NewComment = Omit<CommunityComment, 'id' | 'createdAt' | 'helpfulCount'>;

type StoreState = {
  // 데이터
  facilities: PublicFacility[];
  reports: UserReport[];
  reviews: AccessibilityReview[];
  communityPosts: CommunityPost[];
  comments: CommunityComment[];
  user: User;

  // UI 상태
  loaded: boolean;
  loading: boolean;
  mode: UserMode;
  mapFilters: Record<MapCategoryFilter, boolean>;
  selectedFacilityId: string | null;
  routes: RouteOption[];
  routesLoading: boolean;
  lastRouteParams: RouteSearchParams | null;
  toast: Toast | null;
  /** "지도에서 보기" 로 포커스할 커뮤니티 게시글 */
  mapFocusPostId: string | null;

  // 액션
  init: () => Promise<void>;
  setMode: (mode: UserMode) => void;
  toggleMapFilter: (key: MapCategoryFilter) => void;
  setAllFilters: (on: boolean) => void;
  selectFacility: (id: string | null) => void;
  submitReport: (input: NewReport) => Promise<UserReport>;
  confirmReportAction: (id: string) => Promise<void>;
  markHelpfulAction: (id: string) => Promise<void>;
  setReportStatusAction: (id: string, status: ReportStatus) => Promise<void>;
  searchRoutes: (params: RouteSearchParams) => Promise<RouteOption[]>;
  addReview: (input: NewReview) => void;
  confirmFacility: (facilityId: string) => void;
  updateAvatar: (partial: Partial<User['avatar']>) => void;
  showToast: (message: string, tone?: Toast['tone']) => void;
  clearToast: () => void;

  // 커뮤니티 액션
  submitCommunityPost: (input: NewCommunityPost) => Promise<CommunityPost>;
  markPostHelpfulAction: (id: string) => Promise<void>;
  confirmPostAction: (id: string) => Promise<void>;
  loadComments: (postId: string) => Promise<CommunityComment[]>;
  addCommentAction: (postId: string, input: NewComment) => Promise<void>;
  focusPostOnMap: (id: string) => void;
  clearMapFocus: () => void;
};

let toastSeq = 0;

export const useStore = create<StoreState>((set, get) => ({
  facilities: [],
  reports: [],
  reviews: MOCK_REVIEWS.map((r) => ({ ...r })),
  communityPosts: [],
  comments: [],
  user: { ...MOCK_USER },

  loaded: false,
  loading: false,
  mode: MOCK_USER.mode,
  mapFilters: allFiltersOn(),
  selectedFacilityId: null,
  routes: [],
  routesLoading: false,
  lastRouteParams: null,
  toast: null,
  mapFocusPostId: null,

  init: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    const [facilities, reports, communityPosts] = await Promise.all([
      fetchAllPublicFacilities(),
      getReports(),
      getCommunityPosts(),
    ]);
    set({ facilities, reports, communityPosts, loaded: true, loading: false });
  },

  setMode: (mode) =>
    set((s) => ({
      mode,
      user: {
        ...s.user,
        mode,
        avatar: {
          ...s.user.avatar,
          characterType: mode === 'all' ? 'explorer' : mode,
        },
      },
    })),

  toggleMapFilter: (key) =>
    set((s) => ({ mapFilters: { ...s.mapFilters, [key]: !s.mapFilters[key] } })),

  setAllFilters: (on) =>
    set(() => ({
      mapFilters: MAP_FILTER_ORDER.reduce(
        (acc, k) => {
          acc[k] = on;
          return acc;
        },
        {} as Record<MapCategoryFilter, boolean>,
      ),
    })),

  selectFacility: (id) => set({ selectedFacilityId: id }),

  submitReport: async (input) => {
    const created = await createReport(input);
    set((s) => ({
      reports: [created, ...s.reports],
      user: {
        ...s.user,
        reportsCount: s.user.reportsCount + 1,
        contributionScore: s.user.contributionScore + 30,
      },
    }));
    get().showToast(
      '제보가 등록되었어요. 누군가의 이동이 조금 더 쉬워질 수 있어요.',
      'success',
    );
    return created;
  },

  confirmReportAction: async (id) => {
    const updated = await confirmReport(id);
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? updated : r)),
    }));
    get().showToast('확인해 주셔서 고마워요. 제보 신뢰도가 올라갔어요.', 'info');
  },

  markHelpfulAction: async (id) => {
    const updated = await markReportHelpful(id);
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? updated : r)),
    }));
  },

  setReportStatusAction: async (id, status) => {
    const updated = await updateReportStatus(id, status);
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? updated : r)),
    }));
    if (status === 'resolved') {
      get().showToast('해결됨으로 표시했어요. 지역 접근성 점수에 반영됩니다.', 'success');
    }
  },

  searchRoutes: async (params) => {
    set({ routesLoading: true, lastRouteParams: params });
    const routes = await getAccessibleRoutes(params);
    set({ routes, routesLoading: false });
    return routes;
  },

  addReview: (input) => {
    const review: AccessibilityReview = {
      ...input,
      id: `rev-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
    };
    set((s) => ({
      reviews: [review, ...s.reviews],
      facilities: s.facilities.map((f) =>
        f.id === input.facilityId
          ? { ...f, reviewCount: (f.reviewCount ?? 0) + 1 }
          : f,
      ),
      user: {
        ...s.user,
        reviewsCount: s.user.reviewsCount + 1,
        contributionScore: s.user.contributionScore + 20,
      },
    }));
    get().showToast('리뷰가 등록되었어요. 다른 사용자에게 큰 도움이 돼요.', 'success');
  },

  confirmFacility: (facilityId) => {
    set((s) => ({
      facilities: s.facilities.map((f) =>
        f.id === facilityId
          ? { ...f, lastUpdated: new Date().toISOString() }
          : f,
      ),
    }));
    get().showToast('이용 가능 확인 고마워요! 최신 확인 시간이 갱신됐어요.', 'success');
  },

  updateAvatar: (partial) =>
    set((s) => ({ user: { ...s.user, avatar: { ...s.user.avatar, ...partial } } })),

  showToast: (message, tone = 'info') =>
    set({ toast: { id: ++toastSeq, message, tone } }),

  clearToast: () => set({ toast: null }),

  // ---- 커뮤니티 ----
  submitCommunityPost: async (input) => {
    const created = await createCommunityPost(input);
    set((s) => ({
      communityPosts: [created, ...s.communityPosts],
      user: {
        ...s.user,
        reportsCount: s.user.reportsCount + 1,
        contributionScore: s.user.contributionScore + 25,
      },
    }));
    get().showToast(
      '공유가 완료되었어요. 누군가의 이동에 큰 도움이 될 수 있어요.',
      'success',
    );
    return created;
  },

  markPostHelpfulAction: async (id) => {
    const updated = await markPostHelpful(id);
    set((s) => ({
      communityPosts: s.communityPosts.map((p) => (p.id === id ? updated : p)),
      user: { ...s.user, helpfulReceived: s.user.helpfulReceived + 1 },
    }));
  },

  confirmPostAction: async (id) => {
    const updated = await confirmPost(id);
    set((s) => ({
      communityPosts: s.communityPosts.map((p) => (p.id === id ? updated : p)),
    }));
    get().showToast('확인해 주셔서 고마워요. 정보 신뢰도가 올라갔어요.', 'info');
  },

  loadComments: async (postId) => {
    const list = await getComments(postId);
    set((s) => {
      const others = s.comments.filter((c) => c.postId !== postId);
      return { comments: [...others, ...list] };
    });
    return list;
  },

  addCommentAction: async (postId, input) => {
    const comment = await addComment(postId, input);
    set((s) => ({
      comments: [...s.comments, comment],
      communityPosts: s.communityPosts.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p,
      ),
    }));
  },

  focusPostOnMap: (id) => set({ mapFocusPostId: id }),
  clearMapFocus: () => set({ mapFocusPostId: null }),
}));

// ---- 파생 셀렉터 (컴포넌트에서 재사용) ----
export function reviewsForFacility(
  reviews: AccessibilityReview[],
  facilityId: string,
): AccessibilityReview[] {
  return reviews.filter((r) => r.facilityId === facilityId);
}

export function postsForFacility(
  posts: CommunityPost[],
  facilityId: string,
): CommunityPost[] {
  return posts
    .filter((p) => p.facilityId === facilityId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function commentsForPost(
  comments: CommunityComment[],
  postId: string,
): CommunityComment[] {
  return comments
    .filter((c) => c.postId === postId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export { BADGE_DEFS };
