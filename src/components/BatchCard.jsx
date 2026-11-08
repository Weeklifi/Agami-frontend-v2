import { batchGradient, avatarColor, initials } from "../lib/colors";

export default function BatchCard({ batch, onClick, meta, footer }) {
  return (
    <button
      onClick={onClick}
      className="group shadow-soft overflow-hidden rounded-2xl border border-line
        bg-surface text-left transition-all hover:-translate-y-0.5 hover:shadow-brand"
    >
      <div className={`relative h-[88px] overflow-hidden bg-gradient-to-br px-4 pt-3.5 ${batchGradient(batch.id)}`}>
        <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 right-12 h-20 w-20 rounded-full bg-white/10" />

        {batch.payment_lock?.locked && (
          <span className="absolute right-3 top-3 rounded-full bg-err px-2 py-0.5 text-[10px] font-bold text-white">বকেয়া</span>
        )}
        <h3 className="relative line-clamp-2 pr-8 text-base font-bold leading-snug text-white">{batch.name}</h3>
        {batch.subject && <p className="relative mt-0.5 truncate pr-8 text-xs text-white/80">{batch.subject}</p>}

        <div
          className={`absolute -bottom-5 right-4 grid h-11 w-11 shrink-0 place-items-center
            rounded-full text-sm font-bold text-white ring-4 ring-surface ${avatarColor(batch.teacher_name || batch.name)}`}
        >
          {initials(batch.teacher_name || batch.name)}
        </div>
      </div>

      <div className="px-4 pb-3 pt-6">{meta}</div>

      {footer && <div className="flex items-center gap-1 border-t border-line px-2 py-1">{footer}</div>}
    </button>
  );
}
