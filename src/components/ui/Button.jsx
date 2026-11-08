import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "grad-brand text-white shadow-brand hover:brightness-105 active:brightness-95",
  secondary:
    "bg-white text-ink-700 border border-line hover:bg-page active:bg-line-soft",
  ghost: "text-ink-600 hover:bg-page active:bg-line-soft",
  danger: "bg-err text-white hover:brightness-105 active:brightness-95",
  dark: "bg-sidebar text-white hover:brightness-110 active:brightness-95",
};

const SIZES = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-[15px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
