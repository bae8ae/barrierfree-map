import { useState } from 'react';
import type { RouteSearchParams, TravelMode } from '@/types';
import { useStore } from '@/store/useStore';
import { MapView } from '@/components/map/MapView';
import { RouteSearchPanel } from '@/components/route/RouteSearchPanel';
import { RouteOptionCard } from '@/components/route/RouteOptionCard';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { EmptyState } from '@/components/common/ui';

// ============================================================
// 경로 추천 화면
// ============================================================

export function RouteScreen() {
  const mode = useStore((s) => s.mode);
  const routes = useStore((s) => s.routes);
  const routesLoading = useStore((s) => s.routesLoading);
  const searchRoutes = useStore((s) => s.searchRoutes);

  const initialMode: TravelMode = mode === 'all' ? 'wheelchair' : mode;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSearch = async (params: RouteSearchParams) => {
    const result = await searchRoutes(params);
    setSelectedId(result[0]?.id ?? null);
  };

  const selectedRoute = routes.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="배리어프리 경로"
        subtitle="가장 빠른 길보다, 지금 이동 가능한 길"
      />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
        {/* 미니 지도 (경로 표시) */}
        <div className="relative mb-4 h-44 overflow-hidden rounded-2xl shadow-card">
          <MapView
            route={selectedRoute}
            showAvatar={false}
            showCommunity={false}
            dimContext
            interactive={false}
          />
          {!selectedRoute && (
            <div className="absolute inset-0 flex items-center justify-center bg-warmwhite/40">
              <p className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-subtle">
                경로를 검색하면 지도에 표시돼요
              </p>
            </div>
          )}
        </div>

        <RouteSearchPanel
          initialMode={initialMode}
          loading={routesLoading}
          onSearch={handleSearch}
        />

        {/* 결과 */}
        <div className="mt-4 space-y-3">
          {routes.length === 0 && !routesLoading && (
            <EmptyState
              icon="route"
              title="아직 검색한 경로가 없어요"
              desc="출발지·도착지와 이동 모드를 선택하고 경로를 찾아보세요."
            />
          )}
          {routes.map((r) => (
            <RouteOptionCard
              key={r.id}
              route={r}
              selected={selectedId === r.id}
              onSelect={() => setSelectedId(r.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
