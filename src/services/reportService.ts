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
  input: Omit<UserReport, 'id' | 'createdAt' | 'confirmations' | 'helpfulCount'>,
): Promise<UserReport> {
  const report: UserReport = {
    ...input,
    id: genId(),
    createdAt: new Date().toISOString(),
    confirmations: 0,
    helpfulCount: 0,
  };
  db = [report, ...db];
  return delay(report, 400);
}

export async function updateReportStatus(
  id: string,
  status: UserReport['status'],
): Promise<UserReport> {
  const idx = db.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`제보를 찾을 수 없습니다: ${id}`);
  db[idx] = { ...db[idx], status };
  return delay(db[idx]);
}

export async function confirmReport(id: string): Promise<UserReport> {
  const idx = db.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`제보를 찾을 수 없습니다: ${id}`);
  db[idx] = { ...db[idx], confirmations: db[idx].confirmations + 1 };
  return delay(db[idx]);
}

export async function markReportHelpful(id: string): Promise<UserReport> {
  const idx = db.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`제보를 찾을 수 없습니다: ${id}`);
  db[idx] = { ...db[idx], helpfulCount: db[idx].helpfulCount + 1 };
  return delay(db[idx]);
}
