const TONES = {
  neutral: "bg-page text-ink-600 border-line",
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  ok: "bg-ok-bg text-ok border-ok/20",
  warn: "bg-warn-bg text-warn border-warn/20",
  err: "bg-err-bg text-err border-err/20",
  info: "bg-info-bg text-info border-info/20",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5
        text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
