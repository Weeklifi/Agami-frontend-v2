import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function SubscriptionLockScreen({ message }) {
  return (
    <div className="shadow-soft flex flex-col items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/10">
        <Lock className="h-7 w-7 text-brand-600" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-ink-900">Plan Upgrade প্রয়োজন</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-600">
          {message || "আপনার trial/subscription শেষ হয়ে গেছে — এই batch আবার চালু করতে plan upgrade করুন।"}
        </p>
      </div>
      <Link
        to="/teacher/plans"
        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Plan দেখুন
      </Link>
    </div>
  );
}
