import type { CommunityPost, CommunityComment, CommunityFilters } from '@/types';
import { MOCK_COMMUNITY_POSTS, MOCK_COMMUNITY_COMMENTS } from '@/data/mockCommunity';

// ============================================================
// 커뮤니티 서비스 (가상 백엔드)
// 인메모리 DB 를 백엔드처럼 다루고 모든 함수는 Promise 로 동작한다.
// 실제 서버 연동 시 이 파일 내부만 fetch 로 교체하면 된다.
// ============================================================

let postsDb: CommunityPost[] = MOCK_COMMUNITY_POSTS.map((p) => ({ ...p }));
let commentsDb: CommunityComment[] = MOCK_COMMUNITY_COMMENTS.map((c) => ({ ...c }));

function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
}

export async function getCommunityPosts(
  filters?: CommunityFilters,
): Promise<CommunityPost[]> {
  let result = postsDb.slice();
  if (filters) {
    if (filters.type && filters.type !== 'all') {
      result = result.filter((p) => p.type === filters.type);
    }
    if (filters.status) {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters.tag) {
      result = result.filter((p) => p.tags.includes(filters.tag!));
    }
    if (filters.affectedUser) {
      const a = filters.affectedUser;
      result = result.filter(
        (p) => p.affectedUsers.includes(a) || p.affectedUsers.includes('all'),
      );
    }
    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.locationName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
  }
  result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return delay(result);
}

export async function createCommunityPost(
  input: Omit<
    CommunityPost,
    'id' | 'createdAt' | 'helpfulCount' | 'confirmations' | 'commentsCount'
  >,
): Promise<CommunityPost> {
  const post: CommunityPost = {
    ...input,
    id: genId('cp'),
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
    confirmations: 0,
    commentsCount: 0,
  };
  postsDb = [post, ...postsDb];
  return delay(post, 420);
}

export async function markPostHelpful(id: string): Promise<CommunityPost> {
  const idx = postsDb.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error(`게시글을 찾을 수 없습니다: ${id}`);
  postsDb[idx] = { ...postsDb[idx], helpfulCount: postsDb[idx].helpfulCount + 1 };
  return delay(postsDb[idx]);
}

export async function confirmPost(id: string): Promise<CommunityPost> {
  const idx = postsDb.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error(`게시글을 찾을 수 없습니다: ${id}`);
  postsDb[idx] = { ...postsDb[idx], confirmations: postsDb[idx].confirmations + 1 };
  return delay(postsDb[idx]);
}

export async function getComments(postId: string): Promise<CommunityComment[]> {
  return delay(
    commentsDb
      .filter((c) => c.postId === postId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  );
}

export async function addComment(
  postId: string,
  input: Omit<CommunityComment, 'id' | 'createdAt' | 'helpfulCount'>,
): Promise<CommunityComment> {
  const comment: CommunityComment = {
    ...input,
    postId,
    id: genId('cc'),
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
  };
  commentsDb = [...commentsDb, comment];
  const idx = postsDb.findIndex((p) => p.id === postId);
  if (idx >= 0) {
    postsDb[idx] = { ...postsDb[idx], commentsCount: postsDb[idx].commentsCount + 1 };
  }
  return delay(comment, 300);
}
