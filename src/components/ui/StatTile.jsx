import IconTile from "./IconTile";

export default function StatTile({ icon, label, value, hint, tone = "brand" }) {
  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          {label}
        </span>
        {icon && <IconTile icon={icon} tone={tone} size="sm" />}
      </div>
      <div className="text-2xl font-bold text-ink-900">{value}</div>
      {hint && <div className="text-xs text-ink-500">{hint}</div>}
    </div>
  );
}
