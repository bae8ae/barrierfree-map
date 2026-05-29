import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

// ============================================================
// 토스트 알림 (제보 등록/확인 등 피드백)
// ============================================================

export function Toast() {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3200);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  const tone: Record<string, { bg: string; mark: string }> = {
    success: { bg: '#0a8174', mark: '✓' },
    info: { bg: '#2563eb', mark: 'ℹ' },
    warn: { bg: '#c83a22', mark: '!' },
  };
  const t = tone[toast.tone];

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        key={toast.id}
        className="pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sheet animate-popIn"
        style={{ background: t.bg }}
      >
        <span
          aria-hidden
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-xs"
        >
          {t.mark}
        </span>
        <span className="leading-snug">{toast.message}</span>
      </div>
    </div>
  );
}
