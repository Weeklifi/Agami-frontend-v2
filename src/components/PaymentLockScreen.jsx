import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const fmtAmount = (n) => `৳${Number(n || 0).toLocaleString("en-US")}`;

export default function PaymentLockScreen({ info, isTeacher, batchId }) {
  const feePath = `${isTeacher ? "/teacher" : "/student"}/batches/${batchId}/fee`;

  return (
    <div className="shadow-soft flex flex-col items-center gap-4 rounded-2xl border border-err/30 bg-err-bg/40 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-err/10">
        <AlertTriangle className="h-7 w-7 text-err" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-ink-900">বকেয়া বেতন পরিশোধ করুন</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-600">
          {info?.month || "চলতি মাসের"} বেতন <span className="font-semibold text-err">{fmtAmount(info?.amount)}</span> এখনো বকেয়া আছে।
          প্রতি মাসের ১৫ তারিখের মধ্যে পরিশোধ না করলে এই batch-এর কনটেন্ট দেখা বন্ধ হয়ে যায়।
          পরিশোধ করার সাথে সাথেই আবার সব কিছু দেখতে পারবেন।
        </p>
      </div>
      <Link
        to={feePath}
        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        এখনই পরিশোধ করুন
      </Link>
    </div>
  );
}
