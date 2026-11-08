export function List({ children, className = "" }) {
  return (
    <div className={`shadow-soft divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function ListRow({ left, title, desc, right, onClick, className = "" }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3.5 py-3 text-left
        ${onClick ? "transition-colors hover:bg-page/60 active:bg-page" : ""} ${className}`}
    >
      {left}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">{title}</p>
        {desc && <p className="mt-0.5 truncate text-xs text-ink-400">{desc}</p>}
      </div>
      {right}
    </Tag>
  );
}

export default List;
