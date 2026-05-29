import type { ReactNode } from 'react';

// ============================================================
// 화면 상단 헤더 (지도 외 화면 공통)
// ============================================================

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-black/5 bg-warmwhite/95 px-4 py-3 backdrop-blur">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-extrabold text-ink">{title}</h1>
        {subtitle && <p className="truncate text-xs font-medium text-subtle">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
