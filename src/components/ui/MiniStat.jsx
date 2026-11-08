const tones = {
  ink: "text-ink-900",
  brand: "text-brand-600",
  ok: "text-ok",
  warn: "text-warn",
  err: "text-err",
};

export default function MiniStat({ value, label, tone = "ink" }) {
  return (
    <div className="shadow-soft rounded-2xl border border-line bg-surface py-3 text-center">
      <div className={`text-lg font-extrabold ${tones[tone]}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-400">{label}</div>
    </div>
  );
}
