const TONES = {
  brand: "bg-brand-50 text-brand-600",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-ok-bg text-ok",
  amber: "bg-warn-bg text-warn",
  rose: "bg-err-bg text-err",
  dark: "bg-sidebar text-white",
};

export default function IconTile({ icon: Icon, tone = "brand", size = "md", className = "" }) {
  const sizeCls = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconCls = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <div className={`flex ${sizeCls} shrink-0 items-center justify-center rounded-xl ${TONES[tone]} ${className}`}>
      <Icon className={iconCls} />
    </div>
  );
}
