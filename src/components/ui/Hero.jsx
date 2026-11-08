const grads = {
  brand: "grad-brand shadow-brand",
  violet: "grad-violet",
  emerald: "grad-emerald",
};

export default function Hero({ label, value, meta, children, icon: Icon, tone = "brand", className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 text-white ${grads[tone]} ${className}`}>
      <div className="relative z-10">
        {label && <p className="text-xs font-medium opacity-90">{label}</p>}
        {value && <p className="mt-0.5 text-2xl font-extrabold tracking-tight">{value}</p>}
        {meta && <div className="mt-2 flex items-center gap-1.5 text-xs opacity-90">{meta}</div>}
        {children}
      </div>
      {Icon && <Icon className="absolute bottom-3 right-4 h-14 w-14 opacity-20" strokeWidth={1.5} />}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
    </div>
  );
}
