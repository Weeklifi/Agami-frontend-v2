export default function Input({ icon: Icon, error, className = "", ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
      )}
      <input
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink-900
          placeholder:text-ink-400 outline-none transition-colors
          focus:border-brand-500 focus:ring-4 focus:ring-brand-100
          ${Icon ? "pl-10" : ""}
          ${error ? "border-err focus:border-err focus:ring-err-bg" : "border-line"}
          ${className}`}
        {...props}
      />
    </div>
  );
}
