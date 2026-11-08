import { GraduationCap } from "lucide-react";
import Card from "../ui/Card";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center px-4 py-10
      bg-[radial-gradient(1000px_500px_at_50%_-10%,#eef2ff_0%,transparent_60%)]"
    >
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="grad-brand shadow-brand mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl text-white">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-ink-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}
        </div>
        <Card className="p-5">{children}</Card>
        {footer && <div className="mt-5 text-center text-sm text-ink-500">{footer}</div>}
      </div>
    </div>
  );
}
