import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { LANDMARKS, REGION_NAME, MVP_TEST_REGION_NOTICE } from '@/data/region';
import { REPORT_META, AFFECTED_META, REPORT_CATEGORY_ORDER, timeAgo } from '@/utils/meta';
import { computeAreaScore, scoreGrade } from '@/utils/score';
import { distanceMeters } from '@/utils/geo';
import { Stat, SectionTitle, ScorePill } from '@/components/common/ui';
import { Icon } from '@/components/common/Icon';
import { MOCK_REPEAT_REPORT_ZONES } from '@/data/mockRepeatReports';

// ============================================================
// 리포트 / 대시보드 (B2G · B2B)
// ============================================================

export function AccessibilityDashboard() {
  const reports = useStore((s) => s.reports);
  const facilities = useStore((s) => s.facilities);
  const communityPosts = useStore((s) => s.communityPosts);

  const data = useMemo(() => {
    const areaScore = computeAreaScore(facilities, reports);
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const pending = reports.filter((r) => r.status !== 'resolved').length;

    // 카테고리별 제보 수
    const byCategory = REPORT_CATEGORY_ORDER.map((c) => ({
      key: c,
      label: REPORT_META[c].label.replace(/ .*/, ''),
      color: REPORT_META[c].color,
      count: reports.filter((r) => r.category === c).length,
    }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);

    const top5 = byCategory.slice(0, 5);

    // 시간대별 추이 (3시간 버킷)
    const buckets = [0, 3, 6, 9, 12, 15, 18, 21];
    const byHour = buckets.map((h) => ({
      label: `${h}시`,
      count: reports.filter((r) => {
        const hr = new Date(r.createdAt).getHours();
        return hr >= h && hr < h + 3;
      }).length,
    }));

    // 대상자별 불편 건수
    const byAffected = (
      ['wheelchair', 'stroller', 'elderly', 'visually_impaired', 'pregnant'] as const
    ).map(
      (a) => ({
        label: AFFECTED_META[a].label,
        icon: AFFECTED_META[a].icon,
        count: reports.filter(
          (r) => r.affectedUsers.includes(a) || r.affectedUsers.includes('all'),
        ).length,
      }),
    );

    // 지역(랜드마크)별 접근성 점수 — 가장 가까운 랜드마크에 시설 배정
    const regionScores = LANDMARKS.map((lm) => {
      const near = facilities.filter((f) => {
        const nearest = LANDMARKS.reduce((best, l) =>
          distanceMeters(f, l) < distanceMeters(f, best) ? l : best,
        );
        return nearest.id === lm.id;
      });
      const facScore =
        near.length > 0
          ? Math.round(near.reduce((s, f) => s + f.accessibilityScore, 0) / near.length)
          : 0;
      const activeNearby = reports.filter(
        (r) => r.status === 'active' && distanceMeters(r, lm) < 250,
      ).length;
      return {
        label: lm.name.replace(/ .*/, ''),
        fullName: lm.name,
        score: Math.max(0, facScore - activeNearby * 4),
        facilities: near.length,
      };
    })
      .filter((d) => d.facilities > 0)
      .sort((a, b) => a.score - b.score);

    return { areaScore, resolved, pending, byCategory, top5, byHour, byAffected, regionScores };
  }, [reports, facilities]);

  const thisWeek = reports.length;

  return (
    <div className="space-y-5">
      {/* MVP 테스트 지역 안내 */}
      <div className="flex items-center gap-2 rounded-xl border border-caution-300 bg-caution-100 px-3 py-2">
        <p className="text-[12px] font-semibold leading-snug text-caution-600">
          {MVP_TEST_REGION_NOTICE}
        </p>
      </div>

      {/* 지역 점수 헤더 */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 p-5 text-white shadow-float">
        <p className="text-xs font-semibold text-white/80">{REGION_NAME}</p>
        <p className="text-sm font-bold">지역 접근성 종합 점수</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-5xl font-extrabold leading-none">{data.areaScore}</span>
          <span className="mb-1 text-sm font-bold text-white/85">
            / 100 · {scoreGrade(data.areaScore).label}
          </span>
        </div>
      </div>

      {/* 핵심 통계 */}
      <div className="grid grid-cols-2 gap-2.5">
        <Stat value={thisWeek} label="이번 주 제보 수" icon="warning" tone="caution" />
        <Stat value={data.resolved} label="해결된 제보" icon="ramp" tone="success" />
        <Stat value={data.pending} label="해결 대기 제보" icon="construction" tone="danger" />
        <Stat value={communityPosts.length} label="커뮤니티 공유글" icon="route" tone="default" />
      </div>

      {/* TOP 5 문제 */}
      <section>
        <SectionTitle>가장 많이 제보된 문제 TOP 5</SectionTitle>
        <div className="space-y-2 rounded-2xl bg-white p-3.5 shadow-card">
          {data.top5.map((d, i) => {
            const max = data.top5[0].count || 1;
            return (
              <div key={d.key} className="flex items-center gap-2.5">
                <span className="w-4 text-sm font-extrabold text-subtle">{i + 1}</span>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                  style={{ background: d.color }}
                >
                  <Icon name={REPORT_META[d.key].icon as never} size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-xs font-bold text-ink">
                    <span>{REPORT_META[d.key].label}</span>
                    <span>{d.count}건</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(d.count / max) * 100}%`, background: d.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 카테고리별 제보 수 */}
      <ChartCard title="카테고리별 제보 수">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.byCategory} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#5b6675' }} interval={0} angle={-12} dy={6} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#5b6675' }} />
            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.byCategory.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 시간대별 추이 */}
      <ChartCard title="시간대별 제보 추이">
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={data.byHour} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="g-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0e9e8b" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#0e9e8b" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#5b6675' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#5b6675' }} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#0e9e8b" strokeWidth={2.5} fill="url(#g-trend)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 대상자별 불편 */}
      <section>
        <SectionTitle>대상자별 불편 유형</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {data.byAffected.map((d) => (
            <div key={d.label} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600" aria-hidden>
                <Icon name={d.icon as never} size={22} />
              </span>
              <div>
                <p className="text-xl font-extrabold text-ink">{d.count}건</p>
                <p className="text-xs font-medium text-subtle">{d.label} 관련</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 지역별 접근성 점수 (개선 필요 순) */}
      <section>
        <SectionTitle hint="점수 낮은 순">개선 필요 구역</SectionTitle>
        <div className="space-y-2 rounded-2xl bg-white p-3.5 shadow-card">
          {data.regionScores.map((d) => (
            <div key={d.fullName} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{d.fullName}</p>
                <p className="text-[11px] text-subtle">시설 {d.facilities}곳</p>
              </div>
              <ScorePill score={d.score} size="sm" />
            </div>
          ))}
        </div>
      </section>

      {/* 반복 제보 구역 (개선 우선순위) */}
      <section>
        <SectionTitle hint="제보 수 많은 순">반복 제보 구역</SectionTitle>
        <p className="mb-2 text-[12px] font-medium text-subtle">
          같은 구역에서 반복되는 제보를 모아 개선 우선순위를 제시해요. 실제 민원 연동
          없이 “개선 요청 후보 · 행정 연계 후보”로만 표시합니다.
        </p>
        <div className="space-y-2">
          {MOCK_REPEAT_REPORT_ZONES.map((z) => {
            const pr =
              z.priority === '높음'
                ? { color: '#c83a22', bg: '#ffe6e2' }
                : z.priority === '중간'
                  ? { color: '#d99708', bg: '#fef6d8' }
                  : { color: '#16a35e', bg: '#dcfce9' };
            return (
              <div key={z.id} className="rounded-2xl bg-white p-3.5 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-ink">{z.location}</p>
                    <p className="text-[12px] font-medium text-subtle">
                      {z.issue} · 최근 제보 {timeAgo(z.lastReportedAt)}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                    style={{ color: pr.color, background: pr.bg }}
                  >
                    우선순위 {z.priority}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-coral-100 px-2 py-0.5 text-[11px] font-bold text-coral-700">
                    제보 {z.count}건
                  </span>
                  <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary-700">
                    개선 요청 후보
                  </span>
                  {z.adminCandidate && (
                    <span className="rounded-full bg-publicblue-100 px-2 py-0.5 text-[11px] font-bold text-publicblue-700">
                      행정 연계 후보
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* B2G / B2B 메시지 */}
      <section className="space-y-3">
        <div className="rounded-2xl border border-publicblue-300 bg-publicblue-100 p-4">
          <p className="mb-1 text-sm font-extrabold text-publicblue-700">B2G · 지자체용</p>
          <p className="text-[13px] leading-snug text-publicblue-700/90">
            이 데이터는 지자체가 보도 정비, 경사로 설치, 엘리베이터 관리, 점자블록 개선
            우선순위를 정하는 데 활용될 수 있어요.
          </p>
        </div>
        <div className="rounded-2xl border border-lavender-300 bg-lavender-100 p-4">
          <p className="mb-1 text-sm font-extrabold" style={{ color: '#6b46c1' }}>
            B2B · 시설 운영자용
          </p>
          <p className="text-[13px] leading-snug" style={{ color: '#6b46c1' }}>
            시설 운영자는 실제 사용자 리뷰를 기반으로 접근성을 개선하고, 배리어프리 친화
            시설로 노출될 수 있어요.
          </p>
        </div>
      </section>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="rounded-2xl bg-white p-3 pt-4 shadow-card">{children}</div>
    </section>
  );
}
