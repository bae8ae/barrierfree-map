import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { REGION_NAME, MVP_TEST_REGION_NOTICE } from '@/data/region';
import { computeAreaScore, isFacilityUsableForMode, scoreGrade } from '@/utils/score';
import { PrimaryButton } from '@/components/common/ui';
import { Icon } from '@/components/common/Icon';

// ============================================================
// 지도 하단 바텀시트
// 지역 접근성 점수 / 이용 가능 시설 수 / 활성 제보 수 / 주의 구간 수
// + 경로 추천 / 불편 제보 진입 버튼
// ============================================================

export function MapBottomSheet({
  onRoute,
  onReport,
}: {
  onRoute: () => void;
  onReport: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const facilities = useStore((s) => s.facilities);
  const reports = useStore((s) => s.reports);
  const mode = useStore((s) => s.mode);

  const stats = useMemo(() => {
    const areaScore = computeAreaScore(facilities, reports);
    const usable = facilities.filter((f) => isFacilityUsableForMode(f, mode)).length;
    const active = reports.filter((r) => r.status === 'active').length;
    const caution = reports.filter(
      (r) => r.status === 'active' && (r.severity === 'high' || r.severity === 'medium'),
    ).length;
    return { areaScore, usable, active, caution };
  }, [facilities, reports, mode]);

  const grade = scoreGrade(stats.areaScore);

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40">
      <div className="mx-auto w-full rounded-t-3xl bg-warmwhite/95 px-4 pb-4 pt-2 shadow-sheet backdrop-blur">
        {/* 핸들 */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? '요약 접기' : '요약 펼치기'}
          className="mx-auto mb-2 block h-1.5 w-12 rounded-full bg-black/15"
        />

        {/* 헤더: 지역 + 점수 */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-subtle">{REGION_NAME}</p>
            <p className="text-base font-extrabold text-ink">우리 동네 이동 가능성</p>
          </div>
          <div
            className="flex flex-col items-center rounded-2xl px-3 py-1.5"
            style={{ background: grade.bg }}
          >
            <span className="text-2xl font-extrabold leading-none" style={{ color: grade.color }}>
              {stats.areaScore}
            </span>
            <span className="text-[11px] font-bold" style={{ color: grade.color }}>
              {grade.label}
            </span>
          </div>
        </div>

        {expanded && (
          <>
            {/* 핵심 메시지 */}
            <p className="mt-2.5 rounded-2xl bg-primary-50 px-3 py-2 text-[13px] font-semibold leading-snug text-primary-700">
              “시설이 있다는 것보다 중요한 건, 지금 실제로 이동할 수 있는지입니다.”
            </p>

            {/* MVP 테스트 지역 안내 */}
            <p className="mt-1.5 text-[11px] font-medium leading-snug text-subtle">
              {MVP_TEST_REGION_NOTICE}
            </p>

            {/* 통계 3분할 */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <MiniStat
                icon="building"
                color="#2563eb"
                value={stats.usable}
                label="이용 가능 시설"
              />
              <MiniStat
                icon="warning"
                color="#c83a22"
                value={stats.active}
                label="활성 제보"
              />
              <MiniStat
                icon="construction"
                color="#d99708"
                value={stats.caution}
                label="이동 주의 구간"
              />
            </div>
          </>
        )}

        {/* 액션 버튼 */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <PrimaryButton icon="route" onClick={onRoute}>
            경로 추천 받기
          </PrimaryButton>
          <PrimaryButton icon="warning" variant="coral" onClick={onReport}>
            불편 제보하기
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  color,
  value,
  label,
}: {
  icon: 'building' | 'warning' | 'construction';
  color: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-2.5 shadow-card">
      <span style={{ color }}>
        <Icon name={icon} size={18} />
      </span>
      <span className="text-xl font-extrabold text-ink">{value}</span>
      <span className="text-center text-[11px] font-medium leading-tight text-subtle">
        {label}
      </span>
    </div>
  );
}
