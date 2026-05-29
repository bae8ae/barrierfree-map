import type { ReactNode } from 'react';
import { BottomNavigation, type TabKey } from '@/components/layout/BottomNavigation';
import { Toast } from '@/components/common/Toast';

// ============================================================
// 앱 셸: 모바일 우선, 중앙 정렬된 폰 프레임
// ============================================================

export function AppLayout({
  active,
  onChange,
  children,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full justify-center bg-[#e7e2d7]">
      <div className="relative flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-warmwhite shadow-2xl">
        <main className="relative flex-1 overflow-hidden">{children}</main>
        <Toast />
        <BottomNavigation active={active} onChange={onChange} />
      </div>
    </div>
  );
}
