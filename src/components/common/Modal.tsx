import { useEffect, type ReactNode } from 'react';

// ============================================================
// 바텀시트형 모달 (모바일 우선)
// ESC 닫기, 배경 클릭 닫기, 스크롤 잠금, aria-modal
// ============================================================

export function Modal({
  open,
  onClose,
  title,
  children,
  labelledById = 'modal-title',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  labelledById?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledById}
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fadeIn"
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col rounded-t-3xl bg-warmwhite shadow-sheet animate-sheetUp sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 id={labelledById} className="text-lg font-extrabold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-xl font-bold text-subtle hover:bg-black/10"
          >
            ✕
          </button>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
