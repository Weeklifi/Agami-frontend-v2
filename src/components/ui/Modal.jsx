import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, wide = false, size, children }) {
  const maxWidth = size === "xl" ? "sm:max-w-5xl" : wide ? "sm:max-w-2xl" : "sm:max-w-md";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-900/50" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[88dvh] w-full flex-col rounded-t-2xl bg-surface sm:max-h-[85dvh] sm:rounded-2xl ${maxWidth}`}
      >
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-line" />
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
          <h2 className="truncate text-base font-semibold text-ink-900">{title}</h2>
          <button onClick={onClose} className="-mr-1 rounded-lg p-2 text-ink-400 active:bg-page" aria-label="Close">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
