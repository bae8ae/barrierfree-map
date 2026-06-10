import type { UserReport, ReportFilters } from '@/types';
import { MOCK_REPORTS } from '@/data/mockReports';
import { reportAffectsMode } from '@/utils/score';

// ============================================================
// 제보 서비스 (가상 백엔드)
// 인메모리 DB 를 백엔드처럼 다루고, 모든 함수는 Promise 로 동작한다.
// 실제 서버 연동 시 이 파일 내부만 fetch 로 교체하면 된다.
// ============================================================

let db: UserReport[] = MOCK_REPORTS.map((r) => ({ ...r }));

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function genId(): string {
  return `rep-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
}

export async function getReports(filters?: ReportFilters): Promise<UserReport[]> {
  let result = db.slice();
  if (filters) {
    if (filters.category && filters.category !== 'all') {
      result = result.filter((r) => r.category === filters.category);
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters.affectedUser && filters.affectedUser !== 'all') {
      const m = filters.affectedUser;
      result = result.filter((r) => reportAffectsMode(r, m));
    }
  }
  // 최신순
  result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return delay(result);
}

export async function createReport(
  input: Omit<
    UserReport,
    | 'id'
    | 'createdAt'
    | 'confirmations'
    | 'helpfulCount'
    | 'confidence'
    | 'verifiedCount'
    | 'trustStatus'
    | 'lastUpdated'
  >,
): Promise<UserReport> {
  const now = new Date().toISOString();
  const report: UserReport = {
    ...input,
    id: genId(),
    createdAt: now,
    confirmations: 0,
    helpfulCount: 0,
    // 새 제보는 아직 검증 전 — 낮은 신뢰도/확인 필요에서 시작
    confidence: '낮음',
    verifiedCount: 1,
    trustStatus: input.status === 'resolved' ? '해결됨' : '확인 필요',
    lastUpdated: now,
  };
  db = [report, ...db];
  return delay(report, 400);
}

/** verifiedCount 기준으로 신뢰도 등급을 다시 매긴다 */
function gradeConfidence(verifiedCount: number): UserReport['confidence'] {
  if (verifiedCount >= 6) return '높음';
  if (verifiedCount >= 3) return '보통';
  return '낮음';
}

export async function updateReportStatus(
  id: string,
  status: UserReport['status'],
): Promise<UserReport> {
  const idx = db.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`제보를 찾을 수 없습니다: ${id}`);
  const trustStatus: UserReport['trustStatus'] =
    status === 'resolved'
      ? '해결됨'
      : status === 'needs_check'
        ? '확인 필요'
        : '활성';
  db[idx] = {
    ...db[idx],
    status,
    trustStatus,
    lastUpdated: new Date().toISOString(),
  };
  return delay(db[idx]);
}

export async function confirmReport(id: string): Promise<UserReport> {
  const idx = db.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`제보를 찾을 수 없습니다: ${id}`);
  db[idx] = { ...db[idx], confirmations: db[idx].confirmations + 1 };
  return delay(db[idx]);
}

/**
 * "아직 불편해요" 재확인 — verifiedCount 증가 + 최신 확인 시각 갱신,
 * 신뢰도 등급/상태를 다시 활성으로 끌어올린다.
 */
export async function reaffirmReport(id: string): Promise<UserReport> {
  const idx = db.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`제보를 찾을 수 없습니다: ${id}`);
  const verifiedCount = db[idx].verifiedCount + 1;
  db[idx] = {
    ...db[idx],
    verifiedCount,
    confirmations: db[idx].confirmations + 1,
    confidence: gradeConfidence(verifiedCount),
    trustStatus: db[idx].status === 'resolved' ? db[idx].trustStatus : '활성',
    status: db[idx].status === 'resolved' ? db[idx].status : 'active',
    lastUpdated: new Date().toISOString(),
  };
  return delay(db[idx]);
}

export async function markReportHelpful(id: string): Promise<UserReport> {
  const idx = db.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`제보를 찾을 수 없습니다: ${id}`);
  db[idx] = { ...db[idx], helpfulCount: db[idx].helpfulCount + 1 };
  return delay(db[idx]);
}
