import Button from "./Button";

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border-2 border-dashed
        border-line bg-surface/60 px-6 py-14 text-center ${className}`}
    >
      <div className="grad-brand shadow-brand grid h-16 w-16 place-items-center rounded-2xl">
        <Icon className="h-7 w-7 text-white" strokeWidth={2} />
      </div>
      <h3 className="mt-4 text-base font-bold text-ink-900">{title}</h3>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-ink-500">{subtitle}</p>}
      {actionLabel && (
        <Button className="!w-auto mt-5 px-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
