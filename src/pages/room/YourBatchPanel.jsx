import { Radio, Users } from "lucide-react";
import Card from "../../components/ui/Card";

const CHANNEL_GUIDE = [
  { key: "general", title: "# general", desc: "প্রশ্ন করুন, আলোচনা করুন, ব্যাচের সবাইকে সাহায্য করুন।" },
  { key: "announcements", title: "# announcements", desc: "শিক্ষকের গুরুত্বপূর্ণ আপডেট — শুধু পড়ার জন্য।" },
];

export default function YourBatchPanel({ batch, onlineCount }) {
  return (
    <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
      <Card className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">আপনার ব্যাচ</p>
        <p className="text-lg font-bold leading-snug text-ink-900">
          প্রতিদিন একটু একটু এগিয়ে যাওয়া।
        </p>
        <div className="pt-1">
          <p className="text-sm font-semibold text-ink-700">{batch?.name}</p>
          {batch?.subject && <p className="text-xs text-ink-400">{batch.subject}</p>}
        </div>
        <div className="flex items-center gap-3 pt-2 text-sm text-ink-600">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-ink-400" /> {batch?.student_count ?? 0} জন শিক্ষার্থী
          </span>
          {typeof onlineCount === "number" && (
            <span className="inline-flex items-center gap-1.5 text-ok">
              <span className="h-2 w-2 rounded-full bg-ok" /> {onlineCount} অনলাইন
            </span>
          )}
        </div>
      </Card>

      <Card className="space-y-2.5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          <Radio className="h-3.5 w-3.5" /> চ্যানেল গাইড
        </p>
        {CHANNEL_GUIDE.map((c) => (
          <div key={c.key}>
            <p className="text-sm font-semibold text-ink-800">{c.title}</p>
            <p className="text-xs text-ink-500">{c.desc}</p>
          </div>
        ))}
      </Card>

      <Card className="bg-brand-50/60 border-brand-100">
        <p className="text-xs font-semibold text-brand-700">সদয় classroom-ই ভালো classroom।</p>
        <p className="mt-1 text-xs text-ink-500">সহায়ক হোন। সম্মান বজায় রাখুন।</p>
      </Card>
    </div>
  );
}
