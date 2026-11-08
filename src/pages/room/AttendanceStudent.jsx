import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X, CheckCircle2 } from "lucide-react";
import client from "../../api/client";
import MiniStat from "../../components/ui/MiniStat";

const monthStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export default function AttendanceStudent({ batchId }) {
  const [month, setMonth] = useState(new Date());
  const [data, setData] = useState(null);

  const load = useCallback(() => {
    setData(null);
    client.get(`/api/attendance/my/?batch=${batchId}&month=${monthStr(month)}`).then((res) => setData(res.data));
  }, [batchId, month]);

  useEffect(load, [load]);

  const shiftMonth = (delta) => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + delta);
    setMonth(d);
  };

  const grad = (pct) => (pct >= 80 ? "grad-emerald" : pct >= 60 ? "grad-brand" : "grad-violet");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => shiftMonth(-1)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">{month.toLocaleString("bn-BD", { month: "long", year: "numeric" })}</span>
        <button onClick={() => shiftMonth(1)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {data === null ? (
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      ) : data.total_classes === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">এই মাসে কোনো ক্লাসের হাজিরা নেওয়া হয়নি।</p>
      ) : (
        <>
          <div className={`${grad(data.percentage)} shadow-brand relative overflow-hidden rounded-2xl p-5 text-center text-white`}>
            <p className="text-xs opacity-90">উপস্থিতির হার</p>
            <p className="mt-1 text-4xl font-extrabold">{data.percentage}%</p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs opacity-90">
              <CheckCircle2 className="h-4 w-4" /> {data.present} / {data.total_classes} ক্লাসে উপস্থিত
            </p>
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MiniStat value={data.present} label="উপস্থিত" tone="ok" />
            <MiniStat value={data.absent} label="অনুপস্থিত" tone="err" />
            <MiniStat value={data.total_classes} label="মোট ক্লাস" />
          </div>

          {data.days.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-ink-600">দিনভিত্তিক</p>
              <ul className="shadow-soft divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {data.days.map((d) => {
                  const present = d.status === "PRESENT";
                  return (
                    <li key={d.date} className="flex items-center gap-2.5 px-3 py-2.5">
                      <span className={`grid h-7 w-7 place-items-center rounded-lg ${present ? "bg-ok-bg text-ok" : "bg-err-bg text-err"}`}>
                        {present ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </span>
                      <span className="flex-1 text-sm">
                        {new Date(d.date).toLocaleDateString("bn-BD", { day: "numeric", month: "short", weekday: "short" })}
                      </span>
                      <span className={`text-xs font-semibold ${present ? "text-ok" : "text-err"}`}>{present ? "উপস্থিত" : "অনুপস্থিত"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
