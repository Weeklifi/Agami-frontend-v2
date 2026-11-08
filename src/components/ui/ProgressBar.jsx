const tones = {
  brand: "bg-brand-600",
  ok: "bg-ok",
  warn: "bg-warn",
  err: "bg-err",
};

export default function ProgressBar({ percentage = 0, tone = "brand", className = "" }) {
  const pct = Math.max(0, Math.min(100, percentage));
  return (
    <div className={`h-2 w-full rounded-full bg-page ${className}`}>
      <div className={`h-2 rounded-full transition-all ${tones[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
